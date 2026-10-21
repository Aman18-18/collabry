import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

function Login() {
    const { user, login } = useAuth();
    const location = useLocation();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        setError("");

        if (email.trim().length === 0) {
            setError("Email is required");
            return;
        }

        if (password.trim().length === 0) {
            setError("Password is required");
            return;
        }

        try {
            const loggedInUser = await login(email, password);
            toast.show(`Welcome back, ${loggedInUser.name}`);
        } catch (error) {
            setError(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    // already logged in (or just logged in): go where they were headed, else profile
    if (user) {
        return <Navigate to={location.state?.from || "/profile"} replace />;
    }

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Welcome back</div>
                    <h1>Login</h1>
                </div>
            </div>

            <form className="form-card" onSubmit={handleLogin}>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                {error && <p className="notice-error" role="alert">{error}</p>}

                <button className="btn btn-primary" type="submit">
                    Login
                </button>

                <p className="form-foot">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </form>
        </main>
    );
}

export default Login;
