import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useNotifications from "../hooks/useNotifications";
import useToast from "../hooks/useToast";

// small number bubble, hidden at zero
function Count({ value, label }) {
    if (!value) return null;

    return (
        <span className="count">
            <span aria-hidden="true">{value > 9 ? "9+" : value}</span>
            <span className="sr-only"> {value} {label}</span>
        </span>
    );
}

function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { isSignedIn, logout } = useAuth();
    const { pending, unseenDecisions } = useNotifications();
    const toast = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const currentSearch = new URLSearchParams(location.search).get("search") || "";

    function handleSearchSubmit(event) {
        event.preventDefault();
        const query = searchQuery.trim();
        setSearchOpen(false);
        navigate(query ? `/browse?search=${encodeURIComponent(query)}` : "/browse");
    }

    function closeSearch() {
        setSearchOpen(false);
        setSearchQuery(currentSearch);
    }

    async function handleLogout() {
        try {
            await logout();
        } catch {
            toast.show("Unable to log out. Please try again.", "error");
        }
    }

    return (
        <nav className="nav" aria-label="Main">
            <div className={`nav-inner${searchOpen ? " nav-inner-search" : ""}`}>
                {searchOpen ? (
                    <>
                        <button
                            className="nav-search-back"
                            type="button"
                            aria-label="Close search"
                            onClick={closeSearch}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="m15 18-6-6 6-6" />
                                <path d="M9 12h11" />
                            </svg>
                        </button>
                        <form
                            className="nav-search-form"
                            id="nav-search-form"
                            role="search"
                            onSubmit={handleSearchSubmit}
                        >
                            <label className="sr-only" htmlFor="nav-search-input">
                                Search projects or people
                            </label>
                            <input
                                className="nav-search-input"
                                id="nav-search-input"
                                type="search"
                                placeholder="Search projects or usernames..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Escape") closeSearch();
                                }}
                                autoFocus
                            />
                            <button className="nav-search-submit" type="submit" aria-label="Search">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="10.8" cy="10.8" r="6.5" />
                                    <path d="m16 16 5 5" />
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <Link to="/" className="brand">Collabry</Link>

                        <div className="nav-links">
                            <button
                                className="nav-search-toggle"
                                type="button"
                                aria-label="Open search"
                                aria-expanded="false"
                                aria-controls="nav-search-form"
                                onClick={() => {
                                    setSearchQuery(currentSearch);
                                    setSearchOpen(true);
                                }}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="10.8" cy="10.8" r="6.5" />
                                    <path d="m16 16 5 5" />
                                </svg>
                            </button>
                            <NavLink to="/browse">Board</NavLink>

                            {!isSignedIn && (
                                <>
                                    <NavLink to="/login">Login</NavLink>
                                    <Link to="/register" className="btn btn-primary">Join</Link>
                                </>
                            )}

                            {isSignedIn && (
                                <>
                                    <NavLink to="/my-projects">My projects</NavLink>
                                    <NavLink to="/applicants">Applicants<Count value={pending} label="waiting" /></NavLink>
                                    <NavLink to="/profile">Profile<Count value={unseenDecisions} label="new updates" /></NavLink>
                                    <Link to="/postproject" className="btn btn-primary">Pin a project</Link>
                                    <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
