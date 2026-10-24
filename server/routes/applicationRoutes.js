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
            .populate('applicant', 'name email college branch year skills bio github')
            .sort({ createdAt: -1 });

        res.json(applications);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});


// numbers for the navbar badges + what to announce after login
router.get('/summary', authMiddleware, async (req, res) => {
    try {
        const myProjects = await Project.find({
            owner: req.user.userId
        }).select('_id');

        const pending = await Application.countDocuments({
            project: { $in: myProjects.map(project => project._id) },
            status: 'pending'
        });

        const unseenFilter = {
            applicant: req.user.userId,
            status: { $in: ['accepted', 'rejected', 'removed'] },
            decisionSeen: false
        };

        const unseenDecisions = await Application.countDocuments(unseenFilter);

        const latest = await Application.find(unseenFilter)
            .populate('project', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            pending,
            unseenDecisions,
            decisions: latest
                .filter(application => application.project)
                .map(application => ({
                    title: application.project.title,
                    status: application.status
                }))
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// called when the applicant opens their profile
router.post('/seen', authMiddleware, async (req, res) => {
    try {
        await Application.updateMany(
            { applicant: req.user.userId, decisionSeen: false },
            { decisionSeen: true }
        );

        res.json({ message: 'Marked as seen' });

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
        application.decisionSeen = false;

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

// an applicant withdraws a pending application, or leaves a team they joined
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                message: 'Application not found'
            });
        }

        if (application.applicant.toString() !== req.user.userId) {
            return res.status(403).json({
                message: 'You can only change your own application'
            });
        }

        if (application.status === 'pending') {
            const deleted = await Application.findOneAndDelete({
                _id: application._id,
                status: 'pending'
            });

            if (!deleted) {
                return res.status(400).json({
                    message: 'This application just changed. Refresh and try again.'
                });
            }

            return res.json({ message: 'Application withdrawn' });
        }

        if (application.status === 'accepted') {
            // claim the removal first, so two quick clicks can't free two spots
            const deleted = await Application.findOneAndDelete({
                _id: application._id,
                status: 'accepted'
            });

            if (!deleted) {
                return res.status(400).json({
                    message: 'This application just changed. Refresh and try again.'
                });
            }

            await Project.findOneAndUpdate(
                { _id: application.project, currentSize: { $gt: 1 } },
                { $inc: { currentSize: -1 } }
            );

            return res.json({ message: 'You left the team' });
        }

        res.status(400).json({
            message: 'There is nothing to withdraw'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// the owner removes an accepted member (they cannot re-apply afterwards)
router.post('/:id/remove', authMiddleware, async (req, res) => {
    try {
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

        if (application.status !== 'accepted') {
            return res.status(400).json({
                message: 'Only accepted members can be removed'
            });
        }

        const claimed = await Application.findOneAndUpdate(
            { _id: application._id, status: 'accepted' },
            { status: 'removed', decisionSeen: false },
            { new: true }
        );

        if (!claimed) {
            return res.status(400).json({
                message: 'This member was already removed'
            });
        }

        await Project.findOneAndUpdate(
            { _id: application.project._id, currentSize: { $gt: 1 } },
            { $inc: { currentSize: -1 } }
        );

        res.json({ message: 'Member removed from the team' });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;
