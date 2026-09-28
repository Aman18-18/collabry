const express = require('express');
const Project = require('../models/project.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

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
            teamSize
        } = req.body;
        if(!title || !description || !teamSize){
            return res.status(400).json({
                message : 'Title, description, teamSize are requiredd fields'
            });
        }

        const project = await Project.create({
            title,
            description,
            techStack,
            skillsNeeded,
            teamSize,
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

        const updateProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
             {new : true}
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