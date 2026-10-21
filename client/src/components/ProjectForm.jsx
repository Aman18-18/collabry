import { useState } from "react";
import { ROLES, PROJECT_TYPES } from "../lib/projectOptions";

const toList = (text) =>
    text.split(",").map((item) => item.trim()).filter(Boolean);

function ProjectForm({ initial, submitLabel, showStatus, minTeamSize, onSubmit }) {
    const [title, setTitle] = useState(initial.title);
    const [description, setDescription] = useState(initial.description);
    const [techStack, setTechStack] = useState(initial.techStack);
    const [skillsNeeded, setSkillsNeeded] = useState(initial.skillsNeeded);
    const [teamSize, setTeamSize] = useState(initial.teamSize);
    const [roles, setRoles] = useState(initial.roles);
    const [projectType, setProjectType] = useState(initial.projectType);
    const [status, setStatus] = useState(initial.status);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    function toggleRole(value) {
        setRoles((current) =>
            current.includes(value)
                ? current.filter((role) => role !== value)
                : [...current, value]
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSaving(true);

        try {
            await onSubmit({
                title,
                description,
                techStack: toList(techStack),
                skillsNeeded: toList(skillsNeeded),
                teamSize: Number(teamSize),
                roles,
                projectType,
                ...(showStatus ? { status } : {})
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
            setSaving(false);
        }
    }

    return (
        <form className="form-card" onSubmit={handleSubmit}>
            <div className="field">
                <label htmlFor="title">Title</label>
                <input id="title" type="text" placeholder="Project title"
                    value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" placeholder="Describe your project"
                    value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="field">
                <label htmlFor="techStack">Tech stack (comma separated)</label>
                <input id="techStack" type="text" placeholder="React, Node.js, MongoDB"
                    value={techStack} onChange={(e) => setTechStack(e.target.value)} />
            </div>

            <div className="field">
                <label htmlFor="skillsNeeded">Skills needed (comma separated)</label>
                <input id="skillsNeeded" type="text" placeholder="Python, React"
                    value={skillsNeeded} onChange={(e) => setSkillsNeeded(e.target.value)} />
            </div>

            <div className="form-row">
                <div className="field">
                    <label htmlFor="teamSize">Team size</label>
                    <input id="teamSize" type="number" min={minTeamSize || 1} placeholder="4"
                        value={teamSize} onChange={(e) => setTeamSize(e.target.value)} />
                </div>

                <div className="field">
                    <label htmlFor="projectType">Project type</label>
                    <select id="projectType" value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}>
                        {PROJECT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <fieldset className="check-group">
                <legend>Roles you need</legend>
                {ROLES.map((role) => (
                    <label className="check" key={role.value}>
                        <input type="checkbox" checked={roles.includes(role.value)}
                            onChange={() => toggleRole(role.value)} />
                        {role.label}
                    </label>
                ))}
            </fieldset>

            {showStatus && (
                <div className="field">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="open">Open: taking applications</option>
                        <option value="closed">Closed: team is done</option>
                    </select>
                </div>
            )}

            {error && <p className="notice-error" role="alert">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : submitLabel}
            </button>
        </form>
    );
}

export default ProjectForm;
