import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import ProjectForm from "../components/ProjectForm";

function EditProject() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await api.get("/projects");
                const found = response.data.find((item) => item._id === id);

                if (!found) {
                    setError("Project not found");
                    return;
                }

                setProject(found);
            } catch (error) {
                setError(
                    error.response?.data?.message || "Failed to load project"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProject();
    }, [id]);

    async function handleUpdate(payload) {
        await api.put(`/projects/${id}`, payload);

        toast.show("Project updated");
        navigate("/my-projects");
    }

    if (loading) return <p className="status-msg">Loading project...</p>;
    if (error) return <p className="status-msg">{error}</p>;

    if (project.owner?._id !== user.id) {
        return (
            <p className="status-msg">
                You can only edit your own projects.{" "}
                <Link to="/browse" style={{ textDecoration: "underline" }}>Back to the board</Link>
            </p>
        );
    }

    const initial = {
        title: project.title || "",
        description: project.description || "",
        techStack: (project.techStack || []).join(", "),
        skillsNeeded: (project.skillsNeeded || []).join(", "),
        teamSize: project.teamSize,
        roles: project.roles || [],
        projectType: project.projectType || "other",
        status: project.status || "open"
    };

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Your notice</div>
                    <h1>Edit project</h1>
                </div>
            </div>

            <ProjectForm
                initial={initial}
                submitLabel="Save changes"
                showStatus
                minTeamSize={project.currentSize}
                onSubmit={handleUpdate}
            />
        </main>
    );
}

export default EditProject;
