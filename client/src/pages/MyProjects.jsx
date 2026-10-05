import { useEffect, useState } from "react";
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
        return <h2>Loading your projects...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <>
            <h1>My Projects</h1>

            {projects.length === 0 ? (
                <p>You haven't created any projects yet.</p>
            ) : (
                projects.map(project => (
                    <div key={project._id}>
                        <h2>{project.title}</h2>
                        <p>{project.description}</p>
                        <p>
                            Team Size: {project.currentSize}/
                            {project.teamSize}
                        </p>
                        <p>Status: {project.status}</p>
                    </div>
                ))
            )}
        </>
    );
}

export default MyProjects;