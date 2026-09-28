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
          return res.status(404).json({
            message :'You cannot apply to your own project'
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
        const applications = await Application.find()
            .populate('project', 'title owner')
            .populate('applicant', 'name email');

        const myApplications = applications.filter(
            application =>
                application.project.owner.toString() === req.user.userId
        );

        res.json(myApplications);

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

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (application.project.owner.toString() !== req.user.userId) {
            return res.status(403).json({
                message: 'You are not the owner of this project'
            });
        }

        application.status = status;

        await application.save();

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