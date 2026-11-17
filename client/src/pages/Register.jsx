
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";
import { normalizeUsername, validateUsername } from "../lib/username";

function Register() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (name.trim().length === 0) {
            setError("Name is required");
            return;
        }

        const usernameIssue = validateUsername(username);

        if (usernameIssue) {
            setError(usernameIssue);
            return;
        }

        if (email.trim().length === 0) {
            setError("Email is required");
            return;
        }

        if (password.trim().length === 0) {
            setError("Password is required");
            return;
        }

        if (confirmPassword.trim().length === 0) {
            setError("Confirm Password is required");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(name, normalizeUsername(username), email, password);
            toast.show("Account created. Log in to continue.");
            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

    if (user) {
        return <Navigate to="/profile" replace />;
    }

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">Join Collabry</div>
                    <h1>Register</h1>
                </div>
            </div>

            <form className="form-card" onSubmit={handleRegister}>
                <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

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
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        required
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="username"
                        maxLength={21}
                        placeholder="your_name"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                    <span className="field-hint">
                        We’ll show it as @username. Use 3–20 letters, numbers, or underscores.
                    </span>
                </div>

                <div className="field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <span className="field-hint">At least 8 characters.</span>
                </div>

                <div className="field">
                    <label htmlFor="confirm">Confirm password</label>
                    <input
                        id="confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                </div>

                {message && (
                    <p className="notice-ok" role="status">{message}</p>
                )}

                {error && (
                    <p className="notice-error" role="alert">{error}</p>
                )}

                <button className="btn btn-primary" type="submit">
                    Register
                </button>

                <p className="form-foot">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </main>
    );
}

export default Register;
