import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";

function ProjectDetails() {
    const { id } = useParams();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        return <h2>Loading project...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <>
            <h1>{project.title}</h1>

            <p>Description: {project.description}</p>
            <p>Technology Stack: {project.techStack?.join(", ")}</p>
            <p>Skills Needed: {project.skillsNeeded?.join(", ")}</p>
            <p>
                Team Size: {project.currentSize}/{project.teamSize}
            </p>
            <p>Status: {project.status}</p>
            <p>Project Owner: {project.owner?.name}</p>
        </>
    );
}

export default ProjectDetails;