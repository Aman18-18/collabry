import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import projects from "../data/projects";

function Browse() {

    const [search, setSearch] = useState("");

    const filteredProjects = projects.filter((project) => {
        return (
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase())
        );
    });

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
                        id={project.id}
                        title={project.title}
                        description={project.description}
                        techStack={project.techStack}
                        currentTeamSize={project.currentTeamSize}
                        teamSize={project.teamSize}
                        status={project.status}
                    />
                );
            })}
        </>
    );
}

export default Browse;