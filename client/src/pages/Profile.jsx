import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useProjects from "../hooks/useProjects";
import { safeLink } from "../lib/safeLink";

function githubUrl(value) {
    if (!value) return "";
    return value.startsWith("http") ? value : `https://github.com/${value}`;
}

function Profile() {
    const { user } = useAuth();
    const { projects } = useProjects();

    const [profile, setProfile] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [me, sent] = await Promise.all([
                    api.get("/users/me"),
                    api.get("/applications/sent")
                ]);

                setProfile(me.data);
                setApplications(sent.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const pinned = projects.filter(
        (project) => project.owner?._id === user?.id
    );

    function startEdit() {
        setForm({
            name: profile.name || "",
            college: profile.college || "",
            branch: profile.branch || "",
            year: profile.year ?? "",
            skills: (profile.skills || []).join(", "),
            bio: profile.bio || "",
            github: profile.github || ""
        });
        setMessage("");
        setSaveError("");
        setEditing(true);
    }

    function setField(key) {
        return (event) => setForm({ ...form, [key]: event.target.value });
    }

    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        setSaveError("");

        try {
            const response = await api.put("/users/me", form);
            setProfile(response.data.user);
            setMessage(response.data.message);
            setEditing(false);
        } catch (error) {
            setSaveError(
                error.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="status-msg">Loading profile...</p>;
    if (error) return <p className="status-msg">{error}</p>;

    const details = [
        profile.college,
        profile.branch,
        profile.year ? `Year ${profile.year}` : ""
    ].filter(Boolean);

    return (
        <main className="page">
            <div className="page-head">
                <div>
                    <div className="eyebrow">You</div>
                    <h1>Profile</h1>
                </div>
            </div>

            {message && <p className="notice-ok" role="status" style={{ marginBottom: 24 }}>{message}</p>}

            <div className="profile-grid">
                {editing ? (
                    <form className="form-card" onSubmit={handleSave}>
                        <div className="field">
                            <label htmlFor="p-name">Name</label>
                            <input id="p-name" value={form.name} onChange={setField("name")} />
                        </div>

                        <div className="field">
                            <label htmlFor="p-college">College</label>
                            <input id="p-college" value={form.college} onChange={setField("college")} />
                        </div>

                        <div className="form-row">
                            <div className="field">
                                <label htmlFor="p-branch">Branch</label>
                                <input id="p-branch" value={form.branch} onChange={setField("branch")} />
                            </div>
                            <div className="field">
                                <label htmlFor="p-year">Year</label>
                                <input id="p-year" type="number" min="1" max="6" value={form.year} onChange={setField("year")} />
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="p-skills">Skills (comma separated)</label>
                            <input id="p-skills" placeholder="React, Node.js, MongoDB" value={form.skills} onChange={setField("skills")} />
                        </div>

                        <div className="field">
                            <label htmlFor="p-github">GitHub username or link</label>
                            <input id="p-github" value={form.github} onChange={setField("github")} />
                        </div>

                        <div className="field">
                            <label htmlFor="p-bio">Bio</label>
                            <textarea id="p-bio" value={form.bio} onChange={setField("bio")} />
                        </div>

                        {saveError && <p className="notice-error" role="alert">{saveError}</p>}

                        <div className="form-actions">
                            <button className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>
                            <button className="btn" type="button" onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <aside className="profile-card">
                        <div className="avatar" aria-hidden="true">{profile.name?.[0]}</div>
                        <h1>{profile.name}</h1>
                        {details.length > 0 && (
                            <div className="eyebrow">{details.join(" · ")}</div>
                        )}
                        {profile.bio && <p>{profile.bio}</p>}
                        {profile.skills?.length > 0 && (
                            <div className="tags">
                                {profile.skills.map((skill) => (
                                    <span className="tag" key={skill}>{skill}</span>
                                ))}
                            </div>
                        )}
                        {profile.github && (
                            <a className="link" href={githubUrl(profile.github)} target="_blank" rel="noreferrer">
                                {profile.github}
                            </a>
                        )}
                        <button className="btn" onClick={startEdit}>Edit profile</button>
                    </aside>
                )}

                <div>
                    <section className="profile-section">
                        <h2>Pinned by you</h2>
                        {pinned.length === 0 ? (
                            <p className="status-msg" style={{ textAlign: "left", padding: 0 }}>
                                Nothing pinned yet. <Link to="/postproject" style={{ textDecoration: "underline" }}>Pin your first project</Link>
                            </p>
                        ) : (
                            <div>
                                {pinned.map((project) => (
                                    <div className="list-row" key={project._id}>
                                        <Link to={`/project/${project._id}`} className="title">{project.title}</Link>
                                        <span className="eyebrow">
                                            {project.currentSize} of {project.teamSize} joined
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="profile-section">
                        <h2>Your applications</h2>
                        {applications.length === 0 ? (
                            <p className="status-msg" style={{ textAlign: "left", padding: 0 }}>
                                You haven't applied anywhere yet. <Link to="/browse" style={{ textDecoration: "underline" }}>Browse the board</Link>
                            </p>
                        ) : (
                            <div>
                                {applications.map((application) => (
                                    <div className="list-row" key={application._id}>
                                        <Link to={`/project/${application.project._id}`} className="title">
                                            {application.project.title}
                                        </Link>
                                        <div className="row-end">
                                            <span className={`badge badge-${application.status}`}>
                                                {application.status}
                                            </span>
                                            {application.status === "accepted" && (
                                                safeLink(application.project.teamLink) ? (
                                                    <a
                                                        className="btn btn-primary"
                                                        href={safeLink(application.project.teamLink)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Join team chat
                                                    </a>
                                                ) : (
                                                    <span className="eyebrow">No chat link yet</span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Profile;
