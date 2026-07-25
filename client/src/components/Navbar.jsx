import {Link} from "react-router-dom";

function Navbar(){
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