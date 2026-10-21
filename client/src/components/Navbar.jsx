import { Link, NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="nav" aria-label="Main">
            <div className="nav-inner">
                <Link to="/" className="brand">Collabry</Link>

                <div className="nav-links">
                    <NavLink to="/browse">Board</NavLink>

                    {!user && (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <Link to="/register" className="btn btn-primary">Join</Link>
                        </>
                    )}

                    {user && (
                        <>
                            <NavLink to="/my-projects">My projects</NavLink>
                            <NavLink to="/applicants">Applicants</NavLink>
                            <NavLink to="/profile">Profile</NavLink>
                            <Link to="/postproject" className="btn btn-primary">Pin a project</Link>
                            <button className="btn btn-ghost" onClick={logout}>Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
