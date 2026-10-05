import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";

function Browse() {

    const [search, setSearch] = useState("");

    const { projects, loading, error } = useProjects();

    const filteredProjects = projects.filter((project) => {
        return (
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase())
        );
    });

    if (loading) {
        return <h2>Loading projects...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <>
            <h1>Browse Page</h1>

            <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            {filteredProjects.map((project) => {
                return (
                    <ProjectCard
                        key={project._id}
                        id={project._id}
                        title={project.title}
                        description={project.description}
                        techStack={project.techStack}
                        currentTeamSize={project.currentSize}
                        teamSize={project.teamSize}
                        status={project.status}
                    />
                );
            })}
        </>
    );
}

export default Browse;