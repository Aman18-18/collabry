import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useApply from "../hooks/useApply";
import { TYPE_LABELS } from "../lib/projectOptions";

function ProjectDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { apply, applying, applied } = useApply(id);

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchProject() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/projects");
                const foundProject = response.data.find(
                    (item) => item._id === id
                );

                if (!foundProject) {
                    setError("Project not found");
                    return;
                }

                setProject(foundProject);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load project"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProject();
    }, [id]);

    if (loading) {
        return <p className="status-msg">Loading project...</p>;
    }

    if (error) {
        return <p className="status-msg">{error}</p>;
    }

    const tags = (list) =>
        (list || []).map((item) => (
            <span className="tag" key={item}>{item}</span>
        ));

    const isOwner = user && project.owner?._id === user.id;
    const spotsLeft = project.teamSize - project.currentSize;
    const unavailable = project.status === "closed" || spotsLeft <= 0;

    function handleApply(event) {
        event.preventDefault();
        apply(message);
    }

    return (
        <main className="page page-narrow" style={{ maxWidth: 760 }}>
            <article className="detail">
                <div>
                    <div className="eyebrow">
                        {[TYPE_LABELS[project.projectType], project.status].filter(Boolean).join(" · ")}
                    </div>
                    <h1>{project.title}</h1>
                </div>

                <p>{project.description}</p>

                <dl>
                    <dt>Tech stack</dt>
                    <dd><div className="tags">{tags(project.techStack)}</div></dd>
                    <dt>Skills needed</dt>
                    <dd><div className="tags">{tags(project.skillsNeeded)}</div></dd>
                    <dt>Team</dt>
                    <dd>{project.currentSize} of {project.teamSize} joined</dd>
                    <dt>Posted by</dt>
                    <dd>{project.owner?.name}</dd>
                </dl>

                <div className="apply-box">
                    {isOwner ? (
                        <>
                            <p>This is your project.</p>
                            <Link to={`/edit-project/${project._id}`} className="btn btn-primary">
                                Edit project
                            </Link>
                        </>
                    ) : !user ? (
                        <>
                            <p>Want to join this team?</p>
                            <Link
                                to="/login"
                                state={{ from: `/project/${project._id}` }}
                                className="btn btn-primary"
                            >
                                Log in to apply
                            </Link>
                        </>
                    ) : unavailable ? (
                        <p className="eyebrow">
                            {project.status === "closed" ? "This project is closed" : "This team is full"}
                        </p>
                    ) : (
                        <form onSubmit={handleApply} className="stack" style={{ gap: 14 }}>
                            <div className="field">
                                <label htmlFor="apply-message">Message to the team (optional)</label>
                                <textarea
                                    id="apply-message"
                                    placeholder="What can you bring to the project?"
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    disabled={applied}
                                />
                            </div>

                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={applying || applied}
                            >
                                {applied ? "Applied" : applying ? "Applying..." : "Apply to this project"}
                            </button>
                        </form>
                    )}
                </div>
            </article>
        </main>
    );
}

export default ProjectDetails;
