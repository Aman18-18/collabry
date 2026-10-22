const express = require('express');
const Application = require('../models/Applications.js');
const Project = require('../models/project.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/:projectId/apply', authMiddleware,async (req,res)=>{
    try{
        const {message} = req.body;

        const project  = await Project.findById(req.params.projectId);

        if(!project){
            return res.status(404).json({
                message : 'Project not found'
            });
        }

        if(project.owner.toString() === req.user.userId){
          return res.status(403).json({
            message :'You cannot apply to your own project'
           });
    }

    if(project.status === 'closed'){
        return res.status(400).json({
            message : 'This project is closed'
        });
    }

    if(project.currentSize >= project.teamSize){
        return res.status(400).json({
            message : 'This team is already full'
        });
    }
    const existingApplication = await Application.findOne({
        project : req.params.projectId,
        applicant : req.user.userId
    });

    if(existingApplication){
        return res.status(400).json({
            message : 'You have already applied to this project'
        });
    }

    const application = await Application.create({
        project : req.params.projectId,
        applicant : req.user.userId,
        message
    });
    res.status(201).json({
        message : 'Application submitted successfully',
        application
    });

    }catch(error){
        console.error(error);
        res.status(500).json({
            message :  'server error'
        })
    }
});

router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const myProjects = await Project.find({
            owner: req.user.userId
        }).select('_id');

        const applications = await Application.find({
            project: { $in: myProjects.map(project => project._id) }
        })
            .populate('project', 'title owner')
            .populate('applicant', 'name email')
            .sort({ createdAt: -1 });

        res.json(applications);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});


// applications I have sent (the /mine route above is for the project owner)
router.get('/sent', authMiddleware, async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user.userId
        })
            .populate({ path: 'project', select: 'title status +teamLink' })
            .sort({ createdAt: -1 });

        // skip applications whose project was deleted, and only
        // accepted applicants get to see the team link
        const result = applications
            .filter(application => application.project)
            .map(application => {
                const plain = application.toObject();

                if (application.status !== 'accepted') {
                    delete plain.project.teamLink;
                }

                return plain;
            });

        res.json(result);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be accepted or rejected'
            });
        }

        const application = await Application.findById(req.params.id)
            .populate('project');

        if (!application || !application.project) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (application.project.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: 'You are not the owner of this project'
            });
        }

        // a decision is final, otherwise the team count could drift
        if (application.status !== 'pending') {
            return res.status(400).json({
                message: `This application was already ${application.status}`
            });
        }

        if (status === 'accepted') {
            // only counts the new member while there is still a free spot
            const updatedProject = await Project.findOneAndUpdate(
                {
                    _id: application.project._id,
                    $expr: { $lt: ['$currentSize', '$teamSize'] }
                },
                { $inc: { currentSize: 1 } },
                { new: true }
            );

            if (!updatedProject) {
                return res.status(400).json({
                    message: 'Your team is already full'
                });
            }
        }

        application.status = status;

        try {
            await application.save();
        } catch (saveError) {
            if (status === 'accepted') {
                await Project.findByIdAndUpdate(
                    application.project._id,
                    { $inc: { currentSize: -1 } }
                );
            }

            throw saveError;
        }

        res.json({
            message: `Application ${status} successfully`,
            application
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;
