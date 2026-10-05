import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../lib/axios";

function ProjectCard(props) {

    const { user } = useAuth();

    async function handleApply() {
        try {
            const response = await api.post(
                `/applications/${props.id}/apply`,
                {
                    message: "I would like to contribute to this project."
                }
            );

            alert(response.data.message);

        } catch (error) {
            alert(
                error.response?.data?.message || "Failed to apply"
            );
        }
    }

    return (
        <div>
            <Link to={`/project/${props.id}`}>
                <button>Show Details</button>
            </Link>

            <h1>{props.title}</h1>
            <h2>{props.description}</h2>
            <p>{props.techStack}</p>

            <p>
                Team Size: {props.currentTeamSize}/{props.teamSize}
            </p>

            <p>Status: {props.status}</p>

            {user && (
                <button onClick={handleApply}>
                    Apply
                </button>
            )}
        </div>
    );
}

export default ProjectCard;