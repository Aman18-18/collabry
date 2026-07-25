import {Link} from "react-router-dom"

function ProjectCard(props){
    return(
        <div><Link to = {`/project/${props.id}`}>
            <button>Show Details</button>
        </Link>
            
            <h1>{props.title}</h1>
            <h2>{props.description}</h2>
            <p>{props.techStack}</p>
            <p>Team Size: {props.currentTeamSize}/{props.teamSize}</p>
            <p>Status: {props.status}</p>
            
        </div>
    )
}

export default ProjectCard;