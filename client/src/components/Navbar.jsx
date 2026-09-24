import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav>
            <Link to="/">Home</Link><br />
            <Link to="/browse">Browse</Link><br />
            
            {!user && (
                <>
                    <Link to="/login">Login</Link><br />
                    <Link to="/register">Register</Link><br />
                </>
            )}

            {user && (
                <>
                    <Link to="/postproject">Post Project</Link><br />
                    <Link to="/profile">Profile</Link><br />
                    <button onClick={logout}>Logout</button>
                </>
            )}
        </nav>
    );
}

export default Navbar;