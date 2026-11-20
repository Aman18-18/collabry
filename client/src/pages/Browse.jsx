import { useReducer, useMemo, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import useProjects from "../hooks/useProjects";
import useAuth from "../hooks/useAuth";
import api from "../lib/axios";
import { ROLES, PROJECT_TYPES, newestFirst } from "../lib/projectOptions";

function toggle(list, value) {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}

function toTags(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : String(value).split(",");
    return list.map((item) => String(item).trim()).filter(Boolean);
}

function normalizedTag(value) {
    return String(value || "").trim().toLowerCase();
}

function openSpots(project) {
    return Math.max(0, Number(project.teamSize || 0) - Number(project.currentSize ?? 1));
}

const EXAMPLE_PROJECTS = [
    {
        id: "example-campus-food-finder",
        category: "STUDENT APP",
        title: "Campus Food Finder",
        description: "Find affordable, student-reviewed food spots around campus.",
        techStack: ["React", "Firebase"],
        skillsNeeded: ["UI/UX", "Full stack"],
        teamSize: 4,
        currentSize: 2,
        ownerName: "Maya Chen",
        ownerUsername: "maya.builds"
    },
    {
        id: "example-study-group-matcher",
        category: "STARTUP",
        title: "Study Group Matcher",
        description: "Help classmates find study groups for their courses.",
        techStack: ["Node.js", "MongoDB"],
        skillsNeeded: ["Backend", "Product design"],
        teamSize: 3,
        currentSize: 1,
        ownerName: "Lucas Ortiz",
        ownerUsername: "lucas.codes"
    },
    {
        id: "example-green-campus-map",
        category: "HACKATHON",
        title: "Green Campus Map",
        description: "Map refill stations, recycling points, and greener routes.",
        techStack: ["React Native", "Maps API"],
        skillsNeeded: ["Mobile development", "UI/UX"],
        teamSize: 5,
        currentSize: 2,
        ownerName: "Nina Park",
        ownerUsername: "nina.designs"
    },
    {
        id: "example-campus-event-hub",
        category: "STUDENT APP",
        title: "Campus Event Hub",
        description: "Bring club events, workshops, and campus meetups into one place.",
        techStack: ["Next.js", "PostgreSQL"],
        skillsNeeded: ["Frontend", "Backend"],
        teamSize: 5,
        currentSize: 2,
        ownerName: "Aarav Shah",
        ownerUsername: "aarav.codes"
    },
    {
        id: "example-peer-tutoring-exchange",
        category: "COMMUNITY",
        title: "Peer Tutoring Exchange",
        description: "Match students who want to learn with classmates ready to teach.",
        techStack: ["Django", "SQLite"],
        skillsNeeded: ["Python", "UX research"],
        teamSize: 4,
        currentSize: 1,
        ownerName: "Priya Nair",
        ownerUsername: "priya.builds"
    },
    {
        id: "example-club-inventory-tracker",
        category: "MINOR PROJECT",
        title: "Club Inventory Tracker",
        description: "Help student clubs track equipment, lending, and returns.",
        techStack: ["Vue", "Supabase"],
        skillsNeeded: ["Product design", "Frontend"],
        teamSize: 4,
        currentSize: 2,
        ownerName: "Ishan Verma",
        ownerUsername: "ishan.dev"
    }
];

function ExampleProjectCard({ project }) {
    function renderTagGroup(label, tags) {
        return (
            <div className="notice-tag-group">
                <span className="notice-tag-label">{label}</span>
                <div className="tags">
                    {tags.slice(0, 2).map((tag, index) => (
                        <span className="tag" key={`${tag}-${index}`}>{tag}</span>
                    ))}
                    {tags.length > 2 && (
                        <span className="tag notice-tag-more">+{tags.length - 2}</span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <article className="notice notice-pinned notice-compact example-project-card">
            <span className="notice-pin" aria-hidden="true" />
            <div className="eyebrow notice-category">{project.category} · OPEN</div>
            <h2>{project.title}</h2>
            <p className="notice-desc">{project.description}</p>

            <div className="notice-tag-groups">
                {renderTagGroup("Tech", project.techStack)}
                {renderTagGroup("Looking for", project.skillsNeeded)}
            </div>

            <div className="notice-meta">
                <span className="notice-spots">
                    {project.teamSize - project.currentSize} of {project.teamSize} spots open
                </span>
                <span className="notice-owner">
                    <span className="notice-owner-avatar" aria-hidden="true">
                        {project.ownerName[0]}
                    </span>
                    <span className="notice-owner-copy">
                        <strong>{project.ownerName}</strong>
                        <span>@{project.ownerUsername}</span>
                    </span>
                </span>
            </div>
        </article>
    );
}

function reducer(state, action) {
    switch (action.type) {
        case "SET_PAGE":
            return {
                ...state,
                search: action.search,
                currentPage: action.payload
            };

        case "SET_SORT":
            return { ...state, sortBy: action.payload, currentPage: 1 };

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

        case "TOGGLE_TECH":
            return {
                ...state,
                techStacks: toggle(state.techStacks, action.payload),
                currentPage: 1
            };

        case "TOGGLE_SPOTS":
            return { ...state, moreSpotsOnly: !state.moreSpotsOnly, currentPage: 1 };

        case "TOGGLE_MATCH_SKILLS":
            return { ...state, matchSkills: !state.matchSkills, currentPage: 1 };

        case "TOGGLE_HIDE_APPLIED":
            return { ...state, hideApplied: action.payload, currentPage: 1 };

        case "CLEAR_FILTERS":
            return {
                ...state,
                roles: [],
                types: [],
                techStacks: [],
                sortBy: "newest",
                moreSpotsOnly: false,
                matchSkills: false,
                hideApplied: false,
                currentPage: 1
            };

        default:
            return state;
    }
}

function Browse() {
    const [state, dispatch] = useReducer(reducer, {
        search: "",
        currentPage: 1,
        roles: [],
        types: [],
        techStacks: [],
        sortBy: "newest",
        moreSpotsOnly: false,
        matchSkills: false,
        hideApplied: false
    });
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [appliedProjectIds, setAppliedProjectIds] = useState([]);
    const [appliedFilterLoading, setAppliedFilterLoading] = useState(false);
    const [appliedFilterError, setAppliedFilterError] = useState("");
    const [peopleSearch, setPeopleSearch] = useState({
        query: "",
        results: [],
        loading: false,
        error: ""
    });

    const {
        currentPage: savedPage,
        roles,
        types,
        techStacks,
        sortBy,
        moreSpotsOnly,
        matchSkills,
        hideApplied
    } = state;
    const { isSignedIn, isLoaded: authLoaded, user } = useAuth();

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const search = searchParams.get("search") || "";
    const currentPage = state.search === search ? savedPage : 1;
    const highlightId = location.state?.highlightId;

    const { projects, loading, error } = useProjects();

    const projectsPerPage = 4;
    const usernameQuery = search.trim().replace(/^@/, "").toLowerCase();
    const userSkills = useMemo(() => toTags(user?.skills), [user?.skills]);
    const userSkillSet = useMemo(
        () => new Set(userSkills.map(normalizedTag)),
        [userSkills]
    );
    const availableTechStacks = useMemo(
        () => [...new Map(
            projects.flatMap((project) => toTags(project.techStack))
                .map((tech) => [normalizedTag(tech), tech])
        ).values()].sort((a, b) => a.localeCompare(b)),
        [projects]
    );

    async function handleHideApplied(enabled) {
        dispatch({ type: "TOGGLE_HIDE_APPLIED", payload: enabled });
        setAppliedFilterError("");

        if (!enabled) return;

        setAppliedFilterLoading(true);
        try {
            const response = await api.get("/applications/sent");
            setAppliedProjectIds(
                response.data
                    .map((application) => application.project?._id)
                    .filter(Boolean)
                    .map(String)
            );
        } catch (requestError) {
            dispatch({ type: "TOGGLE_HIDE_APPLIED", payload: false });
            setAppliedFilterError(
                requestError.response?.data?.message ||
                "Could not load your applications. Please try again."
            );
        } finally {
            setAppliedFilterLoading(false);
        }
    }

    useEffect(() => {
        let active = true;
        const query = usernameQuery;

        if (query.length < 2 || !isSignedIn) return undefined;

        const timer = setTimeout(async () => {
            setPeopleSearch({
                query,
                results: [],
                loading: true,
                error: ""
            });

            try {
                const response = await api.get("/users/search", {
                    params: { username: query }
                });
                if (active) {
                    setPeopleSearch({
                        query,
                        results: response.data,
                        loading: false,
                        error: ""
                    });
                }
            } catch (requestError) {
                if (active) {
                    setPeopleSearch({
                        query,
                        results: [],
                        loading: false,
                        error: requestError.response?.data?.message ||
                            "Failed to search members"
                    });
                }
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [usernameQuery, isSignedIn]);

    const filteredProjects = useMemo(() => {
        const query = search.toLowerCase();

        const filtered = projects.filter((project) => {
            const matchesSearch =
                project.title.toLowerCase().includes(query) ||
                project.description.toLowerCase().includes(query) ||
                (project.owner?.username || "").toLowerCase().includes(usernameQuery);

            const matchesRole =
                roles.length === 0 ||
                (project.roles || []).some((role) => roles.includes(role));

            const matchesType =
                types.length === 0 || types.includes(project.projectType);

            const projectTech = toTags(project.techStack).map(normalizedTag);
            const matchesTech =
                techStacks.length === 0 ||
                techStacks.some((tech) => projectTech.includes(normalizedTag(tech)));

            const matchesSpots = !moreSpotsOnly || openSpots(project) >= 2;
            const projectSkills = toTags(project.skillsNeeded).map(normalizedTag);
            const matchesSkills =
                !matchSkills ||
                projectSkills.some((skill) => userSkillSet.has(skill));
            const hasApplied = appliedProjectIds.includes(String(project._id));

            return matchesSearch &&
                matchesRole &&
                matchesType &&
                matchesTech &&
                matchesSpots &&
                matchesSkills &&
                (!hideApplied || !hasApplied);
        });

        if (sortBy === "oldest") {
            return filtered.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
        }

        if (sortBy === "most-spots") {
            return filtered.sort(
                (a, b) => openSpots(b) - openSpots(a) ||
                    new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        if (sortBy === "fewest-spots") {
            return filtered.sort(
                (a, b) => openSpots(a) - openSpots(b) ||
                    new Date(b.createdAt) - new Date(a.createdAt)
            );
        }

        return newestFirst(filtered);
    }, [
        projects,
        search,
        usernameQuery,
        roles,
        types,
        techStacks,
        moreSpotsOnly,
        matchSkills,
        userSkillSet,
        hideApplied,
        appliedProjectIds,
        sortBy
    ]);

    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    const startIndex = (currentPage - 1) * projectsPerPage;

    const currentProjects = filteredProjects.slice(
        startIndex,
        startIndex + projectsPerPage
    );

    if (loading) return <p className="status-msg">Loading projects...</p>;

    if (error) return <p className="status-msg">{error}</p>;

    const activeFilterCount = roles.length + types.length + techStacks.length +
        Number(sortBy !== "newest") +
        Number(moreSpotsOnly) +
        Number(matchSkills) +
        Number(hideApplied);
    const showExamples = authLoaded && !isSignedIn && !search && activeFilterCount === 0 &&
        filteredProjects.length === 0;
    const showPeople = usernameQuery.length >= 2;
    const peopleSearchMatches = peopleSearch.query === usernameQuery;
    const people = peopleSearchMatches ? peopleSearch.results : [];
    const peopleLoading = showPeople && isSignedIn &&
        (!peopleSearchMatches || peopleSearch.loading);
    const peopleError = peopleSearchMatches ? peopleSearch.error : "";
    const showMemberCount = showPeople && isSignedIn && !peopleLoading && !peopleError;
    const activeFilterChips = [
        ...roles.map((role) => ({
            label: ROLES.find((option) => option.value === role)?.label || role,
            remove: () => dispatch({ type: "TOGGLE_ROLE", payload: role })
        })),
        ...types.map((type) => ({
            label: PROJECT_TYPES.find((option) => option.value === type)?.label || type,
            remove: () => dispatch({ type: "TOGGLE_TYPE", payload: type })
        })),
        ...techStacks.map((tech) => ({
            label: tech,
            remove: () => dispatch({ type: "TOGGLE_TECH", payload: tech })
        })),
        ...(sortBy !== "newest" ? [{
            label: {
                oldest: "Oldest first",
                "most-spots": "Most open spots",
                "fewest-spots": "Fewest open spots"
            }[sortBy],
            remove: () => dispatch({ type: "SET_SORT", payload: "newest" })
        }] : []),
        ...(moreSpotsOnly ? [{
            label: "2+ open spots",
            remove: () => dispatch({ type: "TOGGLE_SPOTS" })
        }] : []),
        ...(matchSkills ? [{
            label: "Matches my skills",
            remove: () => dispatch({ type: "TOGGLE_MATCH_SKILLS" })
        }] : []),
        ...(hideApplied ? [{
            label: "Hide applied",
            remove: () => handleHideApplied(false)
        }] : [])
    ];

    function clearFilters() {
        dispatch({ type: "CLEAR_FILTERS" });
        setAppliedFilterError("");
    }

    return (
        <div className={`browse-layout${filtersOpen ? " browse-layout-filters-open" : ""}`}>
            {filtersOpen && (
                <button
                    className="filters-backdrop"
                    type="button"
                    aria-label="Close filters"
                    onClick={() => setFiltersOpen(false)}
                />
            )}
            <aside
                className={`filters ${filtersOpen ? "filters-open" : "filters-collapsed"}`}
                id="browse-filters"
                aria-label="Sort and filters"
                onKeyDown={(event) => {
                    if (event.key === "Escape") setFiltersOpen(false);
                }}
            >
                <div className="filters-heading">
                    {filtersOpen && <h2>Sort &amp; filter</h2>}
                    <button
                        className="filters-toggle"
                        type="button"
                        aria-label={filtersOpen ? "Close sort and filters" : "Open sort and filters"}
                        aria-expanded={filtersOpen}
                        aria-controls="browse-filters"
                        title="Sort & filter"
                        onClick={() => setFiltersOpen((open) => !open)}
                    >
                        {filtersOpen ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M4 7h9m4 0h3M4 17h3m4 0h9" />
                                <circle cx="15" cy="7" r="2" />
                                <circle cx="9" cy="17" r="2" />
                            </svg>
                        )}
                        {!filtersOpen && <span>Filters</span>}
                        {!filtersOpen && activeFilterCount > 0 && (
                            <span className="filter-count">{activeFilterCount}</span>
                        )}
                    </button>
                </div>

                {filtersOpen && (
                    <>
                        {activeFilterCount > 0 && (
                            <button className="text-button filters-clear" type="button" onClick={clearFilters}>
                                Clear all
                            </button>
                        )}

                    <details className="filter-section">
                        <summary>Sort by</summary>
                        <fieldset className="check-group filter-options">
                            <legend className="sr-only">Sort projects by</legend>
                            {[
                                ["newest", "Newest"],
                                ["oldest", "Oldest"],
                                ["most-spots", "Most open spots"],
                                ["fewest-spots", "Fewest open spots"]
                            ].map(([value, label]) => (
                                <label className="check" key={value}>
                                    <input
                                        type="radio"
                                        name="project-sort"
                                        checked={sortBy === value}
                                        onChange={() => dispatch({ type: "SET_SORT", payload: value })}
                                    />
                                    {label}
                                </label>
                            ))}
                        </fieldset>
                    </details>

                    <details className="filter-section">
                        <summary>Role needed</summary>
                        <fieldset className="check-group filter-options">
                            <legend className="sr-only">Filter by role needed</legend>
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
                    </details>

                    <details className="filter-section">
                        <summary>Project type</summary>
                        <fieldset className="check-group filter-options">
                            <legend className="sr-only">Filter by project type</legend>
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
                    </details>

                    <details className="filter-section">
                        <summary>Tech stack</summary>
                        <fieldset className="check-group filter-options">
                            <legend className="sr-only">Filter by tech stack</legend>
                            {availableTechStacks.length === 0 ? (
                                <p className="field-hint">No tech stack tags available.</p>
                            ) : availableTechStacks.map((tech) => (
                                <label className="check" key={tech}>
                                    <input
                                        type="checkbox"
                                        checked={techStacks.includes(tech)}
                                        onChange={() =>
                                            dispatch({ type: "TOGGLE_TECH", payload: tech })
                                        }
                                    />
                                    {tech}
                                </label>
                            ))}
                        </fieldset>
                    </details>

                    <details className="filter-section">
                        <summary>Availability</summary>
                        <fieldset className="check-group filter-options">
                            <legend className="sr-only">Filter by team availability</legend>
                            <label className="check">
                                <input
                                    type="checkbox"
                                    checked={moreSpotsOnly}
                                    onChange={() => dispatch({ type: "TOGGLE_SPOTS" })}
                                />
                                2 or more open spots
                            </label>
                        </fieldset>
                    </details>

                    <details className="filter-section">
                        <summary>For you</summary>
                        <div className="filter-options">
                            <label className="check">
                                <input
                                    type="checkbox"
                                    checked={matchSkills}
                                    disabled={!isSignedIn || userSkills.length === 0}
                                    onChange={() => dispatch({ type: "TOGGLE_MATCH_SKILLS" })}
                                />
                                Match my skills
                            </label>
                            {!isSignedIn ? (
                                <p className="field-hint">Sign in to match projects to your skills.</p>
                            ) : userSkills.length === 0 ? (
                                <p className="field-hint">Add skills to your profile to use this filter.</p>
                            ) : null}

                            <label className="check">
                                <input
                                    type="checkbox"
                                    checked={hideApplied}
                                    disabled={!isSignedIn || appliedFilterLoading}
                                    onChange={(event) => handleHideApplied(event.target.checked)}
                                />
                                Hide projects I’ve applied to
                            </label>
                            {!isSignedIn && (
                                <p className="field-hint">Sign in to filter your applications.</p>
                            )}
                            {appliedFilterLoading && (
                                <p className="field-hint" role="status">Loading your applications...</p>
                            )}
                            {appliedFilterError && (
                                <p className="notice-error" role="alert">{appliedFilterError}</p>
                            )}
                        </div>
                    </details>
                    </>
                )}
            </aside>

            <main className="browse-main">
                <div className="page-head browse-head">
                    <div>
                        {(filteredProjects.length > 0 || showMemberCount) && (
                            <div className="eyebrow">
                                {filteredProjects.length > 0 && (
                                    <>
                                        {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
                                        {showMemberCount && " · "}
                                    </>
                                )}
                                {showMemberCount && (
                                    <>{people.length} {people.length === 1 ? "member" : "members"}</>
                                )}
                            </div>
                        )}
                        <h1>The board</h1>
                    </div>
                </div>

                {activeFilterChips.length > 0 && (
                    <div className="active-filter-chips" aria-label="Active filters">
                        {activeFilterChips.map((chip, index) => (
                            <button
                                className="filter-chip"
                                type="button"
                                key={`${chip.label}-${index}`}
                                onClick={chip.remove}
                                aria-label={`Remove ${chip.label}`}
                            >
                                {chip.label}<span aria-hidden="true">×</span>
                            </button>
                        ))}
                        <button className="text-button" type="button" onClick={clearFilters}>
                            Clear all
                        </button>
                    </div>
                )}

                {showPeople && (
                    <section className="people-results" aria-live="polite">
                        <h2>People</h2>
                        {peopleLoading ? (
                            <p className="field-hint">Searching usernames...</p>
                        ) : !isSignedIn ? (
                            <p className="field-hint">Sign in to search members by username.</p>
                        ) : peopleError ? (
                            <p className="notice-error" role="alert">{peopleError}</p>
                        ) : people.length === 0 ? (
                            <p className="field-hint">No members found for @{usernameQuery}.</p>
                        ) : (
                            <div className="people-list">
                                {people.map((person) => (
                                    <Link className="person-result" to={`/user/${person._id}`} key={person._id}>
                                        <span className="avatar" aria-hidden="true">{person.name?.[0]}</span>
                                        <span>
                                            <strong>{person.name}</strong>
                                            <span className="eyebrow">@{person.username}</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {hideApplied && appliedFilterLoading ? (
                    <p className="status-msg" role="status">Checking your applications...</p>
                ) : currentProjects.length === 0 ? (
                    (activeFilterCount > 0 || search) && (
                        <p className="status-msg">Nothing matches those filters.</p>
                    )
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
                                ownerName={project.owner?.name}
                                ownerUsername={project.owner?.username}
                                skillsNeeded={project.skillsNeeded}
                                compact
                                highlight={project._id === highlightId}
                            />
                        ))}
                    </div>
                )}

                {showExamples && (
                    <section className="example-projects" aria-labelledby="example-projects-heading">
                        <div className="example-projects-heading">
                            <h2 id="example-projects-heading">Example projects</h2>
                        </div>
                        <div className="board">
                            {EXAMPLE_PROJECTS.map((project) => (
                                <ExampleProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </section>
                )}

                <div className="pager">
                    <button
                        className="btn"
                        disabled={currentPage === 1}
                        onClick={() =>
                            dispatch({ type: "SET_PAGE", payload: currentPage - 1, search })
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
                            dispatch({ type: "SET_PAGE", payload: currentPage + 1, search })
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
