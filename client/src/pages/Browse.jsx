import ProjectCard from "../components/ProjectCard";
import projects from "../data/projects";
function Browse(){

  
    return(
   <>
   <h1>Browse Page</h1>
  {projects.map((project) => {
    return (<ProjectCard 
        
        id = {project.id}
        title = {project.title} 
                 description = {project.description}
                 techStack = {project.techStack}
                 currentTeamSize = {project.currentTeamSize}
                 teamSize = {project.teamSize}
                 status = {project.status}/>
    )
  })
}
     
   </>
    )
    
}

export default Browse;