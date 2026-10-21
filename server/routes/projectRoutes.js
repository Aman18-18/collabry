const express = require('express');
const Project = require('../models/project.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

const ROLES = ['frontend', 'backend', 'design', 'ml', 'mobile'];
const PROJECT_TYPES = ['hackathon', 'minor-project', 'startup', 'other'];

router.get('/', async(req,res) =>{

    try{
        const projects = await Project.find()
                         .populate('owner','name email');

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
            projectType
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

        const project = await Project.create({
            title,
            description,
            techStack,
            skillsNeeded,
            teamSize,
            roles: roleList,
            projectType,
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
            'teamSize', 'roles', 'projectType', 'status'
        ];

        const updates = {};

        for (const field of editable) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
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