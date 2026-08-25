
import React, {useState} from "react";
import useAuth from "../hooks/useAuth";

function Login(){
     const {login} = useAuth();
     const [email,setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [error , setError] = useState("");

     const handleLogin = (event) =>{
        event.preventDefault();
        setError("");

        if(email.trim().length === 0){
            setError("Email is required");
            return;
        }

        if(password.trim().length === 0){
            setError("Password is required");
            return;
        }

        console.log("Email:", email);
        console.log("Password:", password);
     }
    return (
        <>
        <form onSubmit={handleLogin}>
            <div>
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>
            <br />
            <div>
                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <br />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit">
                Login
            </button>
        </form>
        </>
    )
}

export default Login;