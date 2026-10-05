import { useState } from "react";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";

function Browse() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { projects, loading, error } = useProjects();

    const projectsPerPage = 3;

    const filteredProjects = projects.filter((project) => {
        return (
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase())
        );
    });

    const totalPages = Math.ceil(
        filteredProjects.length / projectsPerPage
    );

    const startIndex = (currentPage - 1) * projectsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        startIndex + projectsPerPage
    );

    function handleSearch(event) {
        setSearch(event.target.value);
        setCurrentPage(1);
    }

    if (loading) return <h2>Loading projects...</h2>;

    if (error) return <h2>{error}</h2>;

    return (
        <>
            <h1>Browse Page</h1>

            <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={handleSearch}
            />

            {currentProjects.length === 0 ? (
                <p>No projects found.</p>
            ) : (
                currentProjects.map((project) => (
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
                ))
            )}

            <div>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>

                <span>
                    {" "} Page {currentPage} of {totalPages || 1} {" "}
                </span>

                <button
                    disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </>
    );
}

export default Browse;