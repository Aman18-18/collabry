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
        return <p className="status-msg">Loading project...</p>;
    }

    if (error) {
        return <p className="status-msg">{error}</p>;
    }

    const tags = (list) =>
        (list || []).map((item) => (
            <span className="tag" key={item}>{item}</span>
        ));

    return (
        <main className="page page-narrow" style={{ maxWidth: 760 }}>
            <article className="detail">
                <div>
                    <div className="eyebrow">{project.status}</div>
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
            </article>
        </main>
    );
}

export default ProjectDetails;
