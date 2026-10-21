import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useApply from "../hooks/useApply";
import { TYPE_LABELS } from "../lib/projectOptions";

// techStack can arrive as an array (API) or a comma string (local data)
function toTags(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : String(value).split(",");
    return list.map((item) => item.trim()).filter(Boolean);
}

function ProjectCard(props) {
    const { user } = useAuth();
    const { apply, applying, applied } = useApply(props.id);

    const open = props.teamSize - props.currentTeamSize;
    const isOwner = user && props.ownerId === user.id;

    return (
        <article className={`notice${props.highlight ? " notice-new" : ""}`}>
            <div className="eyebrow" style={{ color: "inherit", opacity: 0.8 }}>
                {[TYPE_LABELS[props.projectType], props.status].filter(Boolean).join(" · ")}
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

                {isOwner ? (
                    <Link to={`/edit-project/${props.id}`} className="btn btn-primary">
                        Edit
                    </Link>
                ) : (
                    user && (
                        <button
                            className="btn btn-primary"
                            onClick={() => apply()}
                            disabled={applying || applied || open <= 0}
                        >
                            {applied ? "Applied" : "Apply"}
                        </button>
                    )
                )}
            </div>
        </article>
    );
}

export default ProjectCard;
