import {Link} from "react-router-dom";
import useAuth from "../hooks/useAuth";



function Navbar(){

 const { user, login, logout } = useAuth();

    return (
        <nav>
            <Link to ="/">Home</Link><br></br>
            <Link to = "/browse">Browse</Link><br></br>
            <Link to = "/login">Login</Link><br></br>
            <Link to = "/postproject">Post Project</Link><br></br>
            <Link to = "/register">Register</Link><br></br>
            <Link to = "/profile">Profile</Link>

      
        </nav>
    );
}

export default Navbar;