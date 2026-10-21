import { useReducer, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";
import { ROLES, PROJECT_TYPES, newestFirst } from "../lib/projectOptions";

function toggle(list, value) {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}

function reducer(state, action) {
    switch (action.type) {
        case "SET_SEARCH":
            return { ...state, search: action.payload, currentPage: 1 };

        case "SET_PAGE":
            return { ...state, currentPage: action.payload };

        case "TOGGLE_ROLE":
            return {
                ...state,
                roles: toggle(state.roles, action.payload),
                currentPage: 1
            };

        case "TOGGLE_TYPE":
            return {
                ...state,
                types: toggle(state.types, action.payload),
                currentPage: 1
            };

        case "CLEAR_FILTERS":
            return { ...state, roles: [], types: [], currentPage: 1 };

        default:
            return state;
    }
}

function Browse() {
    const [state, dispatch] = useReducer(reducer, {
        search: "",
        currentPage: 1,
        roles: [],
        types: []
    });

    const { search, currentPage, roles, types } = state;

    const location = useLocation();
    const highlightId = location.state?.highlightId;

    const { projects, loading, error } = useProjects();

    const projectsPerPage = 4;

    const filteredProjects = useMemo(() => {
        const query = search.toLowerCase();

        return newestFirst(projects).filter((project) => {
            const matchesSearch =
                project.title.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query);

            const matchesRole =
                roles.length === 0 ||
                (project.roles || []).some((role) => roles.includes(role));

            const matchesType =
                types.length === 0 || types.includes(project.projectType);

            return matchesSearch && matchesRole && matchesType;
        });
    }, [projects, search, roles, types]);

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const startIndex = (currentPage - 1) * projectsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        startIndex + projectsPerPage
    );

    function handleSearch(event) {
        dispatch({ type: "SET_SEARCH", payload: event.target.value });
    }

    if (loading) return <p className="status-msg">Loading projects...</p>;

    if (error) return <p className="status-msg">{error}</p>;

    const hasFilters = roles.length > 0 || types.length > 0;

    return (
        <div className="browse-layout">
            <aside className="filters" aria-label="Filters">
                <fieldset className="check-group">
                    <legend>Role needed</legend>
                    {ROLES.map((role) => (
                        <label className="check" key={role.value}>
                            <input
                                type="checkbox"
                                checked={roles.includes(role.value)}
                                onChange={() =>
                                    dispatch({ type: "TOGGLE_ROLE", payload: role.value })
                                }
                            />
                            {role.label}
                        </label>
                    ))}
                </fieldset>

                <fieldset className="check-group">
                    <legend>Type</legend>
                    {PROJECT_TYPES.map((type) => (
                        <label className="check" key={type.value}>
                            <input
                                type="checkbox"
                                checked={types.includes(type.value)}
                                onChange={() =>
                                    dispatch({ type: "TOGGLE_TYPE", payload: type.value })
                                }
                            />
                            {type.label}
                        </label>
                    ))}
                </fieldset>

                {hasFilters && (
                    <button
                        className="btn btn-ghost"
                        onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
                    >
                        Clear filters
                    </button>
                )}
            </aside>

            <main className="browse-main">
                <div className="page-head">
                    <div>
                        <div className="eyebrow">
                            {filteredProjects.length} {filteredProjects.length === 1 ? "notice" : "notices"}
                        </div>
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
                    <p className="status-msg">
                        {hasFilters || search
                            ? "Nothing matches those filters."
                            : "No projects found."}
                    </p>
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
                                projectType={project.projectType}
                                ownerId={project.owner?._id}
                                highlight={project._id === highlightId}
                            />
                        ))}
                    </div>
                )}

                <div className="pager">
                    <button
                        className="btn"
                        disabled={currentPage === 1}
                        onClick={() =>
                            dispatch({ type: "SET_PAGE", payload: currentPage - 1 })
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button
                        className="btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() =>
                            dispatch({ type: "SET_PAGE", payload: currentPage + 1 })
                        }
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Browse;
