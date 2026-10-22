const express = require('express');
const Project = require('../models/project.js');
const Application = require('../models/Applications.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

const ROLES = ['frontend', 'backend', 'design', 'ml', 'mobile'];
const PROJECT_TYPES = ['hackathon', 'minor-project', 'startup', 'other'];

// returns { value } or { error }; only plain web links are accepted
function cleanTeamLink(raw) {
    if (raw === undefined) return { value: undefined };

    const text = String(raw).trim();

    if (text === '') return { value: '' };

    if (text.length > 300) {
        return { error: 'Team link is too long' };
    }

    try {
        const url = new URL(text);

        if (!['https:', 'http:'].includes(url.protocol)) {
            throw new Error('bad protocol');
        }
    } catch (error) {
        return { error: 'Team link must be a web link starting with https://' };
    }

    return { value: text };
}

router.get('/', async(req,res) =>{

    try{
        const projects = await Project.find()
                         .populate('owner','name');

        res.json(projects);                 

    }catch(error){
        console.error(error);

        res.status(500).json({
            message : 'Server error'
        });
    }
});


router.post('/' , authMiddleware , async(req,res)=>{
    try{
        const{
            title,
            description,
            techStack,
            skillsNeeded,
            teamSize,
            roles,
            projectType,
            teamLink
        } = req.body;
        if(!title || !description || !teamSize){
            return res.status(400).json({
                message : 'Title, description, teamSize are requiredd fields'
            });
        }

        const roleList = Array.isArray(roles) ? roles : [];

        if (roleList.some(role => !ROLES.includes(role))) {
            return res.status(400).json({
                message : 'Invalid role selected'
            });
        }

        if (projectType !== undefined && !PROJECT_TYPES.includes(projectType)) {
            return res.status(400).json({
                message : 'Invalid project type'
            });
        }

        const link = cleanTeamLink(teamLink);

        if (link.error) {
            return res.status(400).json({
                message : link.error
            });
        }

        const project = await Project.create({
            title,
            description,
            techStack,
            skillsNeeded,
            teamSize,
            roles: roleList,
            projectType,
            teamLink: link.value,
            owner :  req.user.userId
        });

        res.status(201).json({
            message : 'project created successfully',
            project
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message :'Server error'
        });
    }
});


// who is on the team: names only, safe to show publicly
router.get('/:id/members', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name');

        if (!project) {
            return res.status(404).json({
                message : 'Project not found'
            });
        }

        const accepted = await Application.find({
            project : req.params.id,
            status : 'accepted'
        })
            .populate('applicant', 'name')
            .sort({ createdAt : 1 });

        res.json({
            owner : { name : project.owner?.name },
            members : accepted
                .filter(application => application.applicant)
                .map(application => ({
                    _id : application._id,
                    name : application.applicant.name
                }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : 'Server error'
        });
    }
});

// the chat link: only the owner and accepted members may read it
router.get('/:id/team-link', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).select('+teamLink owner');

        if (!project) {
            return res.status(404).json({
                message : 'Project not found'
            });
        }

        const isOwner = project.owner.toString() === req.user.userId;

        if (!isOwner) {
            const membership = await Application.findOne({
                project : req.params.id,
                applicant : req.user.userId,
                status : 'accepted'
            });

            if (!membership) {
                return res.status(403).json({
                    message : 'Only team members can see this'
                });
            }
        }

        res.json({ teamLink : project.teamLink || '', isOwner });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message : 'Server error'
        });
    }
});


router.put('/:id', authMiddleware , async(req, res) =>{

    try{
        const project = await Project.findById(req.params.id);
        if(!project){
            return res.status(404).json({
                message : 'Project not found'
            });
        }
        if(project.owner.toString()!== req.user.userId){
            return res.status(403).json({
                message : 'Access denied. You are not the owner of this project'
            });
        }

        // only these fields can be edited (owner, currentSize etc. stay untouchable)
        const editable = [
            'title', 'description', 'techStack', 'skillsNeeded',
            'teamSize', 'roles', 'projectType', 'status', 'teamLink'
        ];

        const updates = {};

        for (const field of editable) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.teamLink !== undefined) {
            const link = cleanTeamLink(updates.teamLink);

            if (link.error) {
                return res.status(400).json({
                    message : link.error
                });
            }

            updates.teamLink = link.value;
        }

        if (updates.roles && (!Array.isArray(updates.roles) ||
            updates.roles.some(role => !ROLES.includes(role)))) {
            return res.status(400).json({
                message : 'Invalid role selected'
            });
        }

        if (updates.projectType !== undefined &&
            !PROJECT_TYPES.includes(updates.projectType)) {
            return res.status(400).json({
                message : 'Invalid project type'
            });
        }

        if (updates.status !== undefined &&
            !['open', 'closed'].includes(updates.status)) {
            return res.status(400).json({
                message : 'Invalid status'
            });
        }

        if (updates.teamSize !== undefined) {
            updates.teamSize = Number(updates.teamSize);

            if (!Number.isInteger(updates.teamSize) ||
                updates.teamSize < project.currentSize) {
                return res.status(400).json({
                    message : 'Team size cannot be smaller than the current team'
                });
            }
        }

        const updateProject = await Project.findByIdAndUpdate(
            req.params.id,
            updates,
            {new : true, runValidators : true}
        );

        res.json({
            message : 'Project Updated Successfully',
            project : updateProject
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message : 'Server error'
        });
    }
})


router.delete('/:id', authMiddleware , async(req,res)=>{
    try{
        const project = await Project.findById(req.params.id);

        if(!project){
            return res.status(404).json({
                message : 'Project Not Found'
            });
        }

        if(project.owner.toString() !== req.user.userId){
            return res.status(403).json({
                message : 'You cannot  delete this project'
            });
        }

        // remove its applications too, so nothing is left pointing at it
        await Application.deleteMany({ project: req.params.id });
        await Project.findByIdAndDelete(req.params.id);

         res.json({
            message: "Project deleted successfully"
        });
    }
    catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
      }  

});

module.exports = router;