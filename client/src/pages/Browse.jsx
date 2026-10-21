import { useReducer, useMemo } from "react";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";

function reducer(state, action) {
    switch (action.type) {
        case "SET_SEARCH":
            return {
                ...state,
                search: action.payload,
                currentPage: 1
            };

        case "SET_PAGE":
            return {
                ...state,
                currentPage: action.payload
            };

        default:
            return state;
    }
}

function Browse() {
    const [state, dispatch] = useReducer(reducer, {
    search: "",
    currentPage: 1
});

const { search, currentPage } = state;

    const { projects, loading, error } = useProjects();

    const projectsPerPage = 3;

   const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
        return (
            project.title.toLowerCase().includes(search.toLowerCase()) ||
            project.description.toLowerCase().includes(search.toLowerCase())
        );
    });
}, [projects, search]);

    const totalPages = Math.ceil(
        filteredProjects.length / projectsPerPage
    );

    const startIndex = (currentPage - 1) * projectsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        startIndex + projectsPerPage
    );

   function handleSearch(event) {
    dispatch({
        type: "SET_SEARCH",
        payload: event.target.value
    });
}

    if (loading) return <p className="status-msg">Loading projects...</p>;

    if (error) return <p className="status-msg">{error}</p>;

    return (
        <main className="page">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Open notices</div>
                    <h1>The board</h1>
                </div>

                <div className="field search">
                    <label htmlFor="search">Search</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {currentProjects.length === 0 ? (
                <p className="status-msg">No projects found.</p>
            ) : (
                <div className="board">
                    {currentProjects.map((project) => (
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
                    ))}
                </div>
            )}

            <div className="pager">
                <button
                    className="btn"
                    disabled={currentPage === 1}
                    onClick={() =>
                        dispatch({
                            type: "SET_PAGE",
                            payload: currentPage - 1
                        })
                    }
                >
                    Previous
                </button>

                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>

                <button
                    className="btn"
                    disabled={
                        currentPage === totalPages ||
                        totalPages === 0
                    }
                    onClick={() =>
                        dispatch({
                            type: "SET_PAGE",
                            payload: currentPage + 1
                        })
                    }
                >
                    Next
                </button>
            </div>
        </main>
    );
}

export default Browse;