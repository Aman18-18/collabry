import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

function MyProjects() {

    const { user } = useAuth();
    const toast = useToast();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmId, setConfirmId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {

        async function fetchMyProjects() {
            try {
                const response = await api.get("/projects");

                const myProjects = response.data.filter(
                    project => project.owner._id === user.id
                );

                setProjects(myProjects);

            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to fetch projects"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchMyProjects();

    }, [user]);

    async function handleDelete(id) {
        setDeleting(true);

        try {
            await api.delete(`/projects/${id}`);

            setProjects((current) =>
                current.filter((project) => project._id !== id)
            );
            setConfirmId(null);
            toast.show("Project deleted");
        } catch (error) {
            toast.show(
                error.response?.data?.message || "Failed to delete project",
                "error"
            );
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return <p className="status-msg">Loading your projects...</p>;
    }

    if (error) {
        return <p className="status-msg">{error}</p>;
    }

    return (
        <main className="page">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Your notices</div>
                    <h1>My projects</h1>
                </div>
                <Link to="/postproject" className="btn btn-primary">
                    Pin a project
                </Link>
            </div>

            {projects.length === 0 ? (
                <p className="status-msg">You haven't created any projects yet.</p>
            ) : (
                <div className="board">
                    {projects.map(project => (
                        <article className="notice" key={project._id}>
                            <div className="eyebrow">{project.status}</div>
                            <h2>
                                <Link to={`/project/${project._id}`}>{project.title}</Link>
                            </h2>
                            <p className="notice-desc">{project.description}</p>
                            <div className="notice-meta">
                                <span className="notice-spots">
                                    {project.currentSize} of {project.teamSize} joined
                                </span>
                            </div>
                            {confirmId === project._id ? (
                                <div className="confirm-box" role="alertdialog" aria-label={`Delete ${project.title}?`}>
                                    <p>Delete this project and all its applications? This can't be undone.</p>
                                    <div className="notice-actions">
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDelete(project._id)}
                                            disabled={deleting}
                                        >
                                            {deleting ? "Deleting..." : "Yes, delete"}
                                        </button>
                                        <button
                                            className="btn"
                                            onClick={() => setConfirmId(null)}
                                            disabled={deleting}
                                        >
                                            Keep it
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="notice-actions">
                                    <Link to={`/project/${project._id}`} className="btn">View</Link>
                                    <Link to={`/edit-project/${project._id}`} className="btn btn-primary">Edit</Link>
                                    <button className="btn" onClick={() => setConfirmId(project._id)}>
                                        Delete
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default MyProjects;
