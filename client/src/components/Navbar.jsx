import { Link, NavLink } from "react-router-dom";
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
    const { isSignedIn, logout } = useAuth();
    const { pending, unseenDecisions } = useNotifications();
    const toast = useToast();

    async function handleLogout() {
        try {
            await logout();
        } catch {
            toast.show("Unable to log out. Please try again.", "error");
        }
    }

    return (
        <nav className="nav" aria-label="Main">
            <div className="nav-inner">
                <Link to="/" className="brand">Collabry</Link>

                <div className="nav-links">
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
            </div>
        </nav>
    );
}

export default Navbar;
