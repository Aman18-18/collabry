import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import { githubHref } from "../lib/safeLink";
import { TYPE_LABELS } from "../lib/projectOptions";

function UserProfile() {
    const { id } = useParams();
    const { user: me } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (me?.id === id) return;

        async function load() {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/users/${id}`);
                setData(response.data);
            } catch (error) {
                setError(
                    error.response?.status === 404
                        ? "This person doesn't exist."
                        : "Failed to load this profile."
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id, me?.id]);

    // your own profile lives on the editable page
    if (me?.id === id) return <Navigate to="/profile" replace />;

    if (loading) return <p className="status-msg">Loading profile...</p>;
    if (error) return <p className="status-msg">{error}</p>;

    const { user, projects } = data;

    const details = [
        user.college,
        user.branch,
        user.year ? `Year ${user.year}` : ""
    ].filter(Boolean);

    const github = githubHref(user.github);

    return (
        <main className="page">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Member</div>
                    <h1>{user.name}</h1>
                </div>
            </div>

            <div className="profile-grid">
                <aside className="profile-card">
                    <div className="avatar" aria-hidden="true">{user.name?.[0]}</div>

                    {details.length > 0 && (
                        <div className="eyebrow">{details.join(" · ")}</div>
                    )}

                    {user.bio ? (
                        <p>{user.bio}</p>
                    ) : (
                        <p className="field-hint">No bio yet.</p>
                    )}

                    {user.skills?.length > 0 && (
                        <div className="tags">
                            {user.skills.map((skill) => (
                                <span className="tag" key={skill}>{skill}</span>
                            ))}
                        </div>
                    )}

                    {github && (
                        <a className="link" href={github} target="_blank" rel="noopener noreferrer">
                            {user.github}
                        </a>
                    )}
                </aside>

                <section className="profile-section">
                    <h2>Pinned projects</h2>

                    {projects.length === 0 ? (
                        <p className="status-msg" style={{ textAlign: "left", padding: 0 }}>
                            Nothing pinned yet.
                        </p>
                    ) : (
                        <div>
                            {projects.map((project) => (
                                <div className="list-row" key={project._id}>
                                    <Link to={`/project/${project._id}`} className="title">
                                        {project.title}
                                    </Link>
                                    <span className="eyebrow">
                                        {[TYPE_LABELS[project.projectType], project.status].filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default UserProfile;
