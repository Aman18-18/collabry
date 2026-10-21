import { useState } from "react";
import api from "../lib/axios";

function PostProject() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [techStack, setTechStack] = useState("");
    const [skillsNeeded, setSkillsNeeded] = useState("");
    const [teamSize, setTeamSize] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        try {
            const response = await api.post("/projects", {
                title,
                description,
                techStack: techStack
                    .split(",")
                    .map(item => item.trim()),
                skillsNeeded: skillsNeeded
                    .split(",")
                    .map(item => item.trim()),
                teamSize: Number(teamSize)
            });

            setMessage(response.data.message);

            setTitle("");
            setDescription("");
            setTechStack("");
            setSkillsNeeded("");
            setTeamSize("");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to create project"
            );
        }
    }

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">New notice</div>
                    <h1>Pin a project</h1>
                </div>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Project title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        placeholder="Describe your project"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>

                <div className="field">
                    <label htmlFor="techStack">Tech stack (comma separated)</label>
                    <input
                        id="techStack"
                        type="text"
                        placeholder="React, Node.js, MongoDB"
                        value={techStack}
                        onChange={(event) => setTechStack(event.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="skillsNeeded">Skills needed (comma separated)</label>
                    <input
                        id="skillsNeeded"
                        type="text"
                        placeholder="Python, React"
                        value={skillsNeeded}
                        onChange={(event) => setSkillsNeeded(event.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="teamSize">Team size</label>
                    <input
                        id="teamSize"
                        type="number"
                        placeholder="4"
                        value={teamSize}
                        onChange={(event) => setTeamSize(event.target.value)}
                    />
                </div>

                {message && <p className="notice-ok" role="status">{message}</p>}

                {error && <p className="notice-error" role="alert">{error}</p>}

                <button className="btn btn-primary" type="submit">
                    Create project
                </button>
            </form>
        </main>
    );
}

export default PostProject;
