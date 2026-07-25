import {useParams} from "react-router-dom";
import projects from "../data/projects";

function ProjectDetails(){
    const {id} = useParams();
    const project = projects.find((project) => project.id === parseInt(id));
    return(
        <>
        <h1>Project Details for {id}</h1>
        <h1>Title : {project.title}</h1>
        <p>Description : {project.description}</p>
        <p>Technology Stack: {project.techStack}</p>
        <p>Team Size: {project.currentTeamSize}/{project.teamSize}</p>
        <p>Status: {project.status}</p>
        </>
    ) 
}

export default ProjectDetails;