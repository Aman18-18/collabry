import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../lib/axios";

// techStack can arrive as an array (API) or a comma string (local data)
function toTags(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : String(value).split(",");
    return list.map((item) => item.trim()).filter(Boolean);
}

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

    const open = props.teamSize - props.currentTeamSize;

    return (
        <article className="notice">
            <div className="eyebrow" style={{ color: "inherit", opacity: 0.8 }}>
                {props.status}
            </div>

            <h2>
                <Link to={`/project/${props.id}`}>{props.title}</Link>
            </h2>

            <p className="notice-desc">{props.description}</p>

            <div className="tags">
                {toTags(props.techStack).map((tag) => (
                    <span className="tag" key={tag}>{tag}</span>
                ))}
            </div>

            <div className="notice-meta">
                <span className="notice-spots">
                    {open > 0
                        ? `${open} of ${props.teamSize} spots open`
                        : "Team full"}
                </span>
            </div>

            <div className="notice-actions">
                <Link to={`/project/${props.id}`} className="btn">Details</Link>
                {user && (
                    <button className="btn btn-primary" onClick={handleApply}>
                        Apply
                    </button>
                )}
            </div>
        </article>
    );
}

export default ProjectCard;
