import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { CONTACT_EMAIL } from "../lib/siteInfo";

function Login() {
    const { user, login } = useAuth();
    const location = useLocation();
    const toast = useToast();
    const passwordResetEmail = CONTACT_EMAIL
        ? `mailto:${CONTACT_EMAIL}?subject=Collabry%20password%20reset&body=Hello%2C%20I%20need%20help%20resetting%20my%20Collabry%20password.%0A%0AMy%20registered%20email%20address%20is%3A%20`
        : "";

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
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="email"
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
                        autoComplete="current-password"
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

                <p className="form-foot">
                    Forgot your password? {passwordResetEmail ? (
                        <a href={passwordResetEmail}>Email me</a>
                    ) : (
                        <Link to="/contact">Contact me</Link>
                    )} and I'll reset it.
                </p>
            </form>
        </main>
    );
}

export default Login;
