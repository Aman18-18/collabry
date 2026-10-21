import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";

function MyProjects() {

    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default MyProjects;
