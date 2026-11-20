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
    const techTags = toTags(props.techStack);
    const skillTags = toTags(props.skillsNeeded);

    return (
        <article className={`notice notice-pinned${props.compact ? " notice-compact" : ""}${props.highlight ? " notice-new" : ""}`}>
            <span className="notice-pin" aria-hidden="true" />

            <div className="eyebrow notice-category">
                {[TYPE_LABELS[props.projectType], props.status].filter(Boolean).join(" · ")}
            </div>

            <h2>
                <Link to={`/project/${props.id}`}>{props.title}</Link>
            </h2>

            <p className="notice-desc">{props.description}</p>

            {props.compact && (techTags.length > 0 || skillTags.length > 0) && (
                <div className="notice-tag-groups">
                    {techTags.length > 0 && (
                        <div className="notice-tag-group">
                            <span className="notice-tag-label">Tech</span>
                            <div className="tags">
                                {techTags.slice(0, 2).map((tag, index) => (
                                    <span className="tag" key={`${tag}-${index}`}>{tag}</span>
                                ))}
                                {techTags.length > 2 && (
                                    <span className="tag notice-tag-more">+{techTags.length - 2}</span>
                                )}
                            </div>
                        </div>
                    )}
                    {skillTags.length > 0 && (
                        <div className="notice-tag-group">
                            <span className="notice-tag-label">Looking for</span>
                            <div className="tags">
                                {skillTags.slice(0, 2).map((tag, index) => (
                                    <span className="tag" key={`${tag}-${index}`}>{tag}</span>
                                ))}
                                {skillTags.length > 2 && (
                                    <span className="tag notice-tag-more">+{skillTags.length - 2}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!props.compact && techTags.length > 0 && (
                <div className="tags">
                    {techTags.map((tag, index) => (
                        <span className="tag" key={`${tag}-${index}`}>{tag}</span>
                    ))}
                </div>
            )}

            <div className="notice-meta">
                <span className="notice-spots">
                    {open > 0
                        ? `${open} of ${props.teamSize} spots open`
                        : "Team full"}
                </span>
                {props.compact && props.ownerId ? (
                    <Link className="notice-owner" to={`/user/${props.ownerId}`}>
                        <span className="notice-owner-avatar" aria-hidden="true">
                            {(props.ownerName || props.ownerUsername || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="notice-owner-copy">
                            {props.ownerName && <strong>{props.ownerName}</strong>}
                            {props.ownerUsername && <span>@{props.ownerUsername}</span>}
                        </span>
                    </Link>
                ) : props.ownerUsername && (
                    <Link className="eyebrow" to={`/user/${props.ownerId}`}>
                        @{props.ownerUsername}
                    </Link>
                )}
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
                            disabled={applying || applied || open <= 0 || props.status === "closed"}
                        >
                            {applied ? "Applied" : props.status === "closed" ? "Closed" : open <= 0 ? "Full" : "Apply"}
                        </button>
                    )
                )}
            </div>
        </article>
    );
}

export default ProjectCard;
