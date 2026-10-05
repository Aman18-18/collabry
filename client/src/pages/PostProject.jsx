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
        <>
            <h1>Post Project</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Title</label>
                    <br />
                    <input
                        type="text"
                        placeholder="Project title"
                        value={title}
                        onChange={(event) =>
                            setTitle(event.target.value)
                        }
                    />
                </div>

                <br />

                <div>
                    <label>Description</label>
                    <br />
                    <textarea
                        placeholder="Describe your project"
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                    />
                </div>

                <br />

                <div>
                    <label>Tech Stack</label>
                    <br />
                    <input
                        type="text"
                        placeholder="React, Node.js, MongoDB"
                        value={techStack}
                        onChange={(event) =>
                            setTechStack(event.target.value)
                        }
                    />
                </div>

                <br />

                <div>
                    <label>Skills Needed</label>
                    <br />
                    <input
                        type="text"
                        placeholder="Python, React"
                        value={skillsNeeded}
                        onChange={(event) =>
                            setSkillsNeeded(event.target.value)
                        }
                    />
                </div>

                <br />

                <div>
                    <label>Team Size</label>
                    <br />
                    <input
                        type="number"
                        placeholder="4"
                        value={teamSize}
                        onChange={(event) =>
                            setTeamSize(event.target.value)
                        }
                    />
                </div>

                <br />

                {message && (
                    <p style={{ color: "green" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p style={{ color: "red" }}>
                        {error}
                    </p>
                )}

                <button type="submit">
                    Create Project
                </button>

            </form>
        </>
    );
}

export default PostProject;