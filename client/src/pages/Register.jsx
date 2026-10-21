
import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Register() {
    const { register } = useAuth();

    const [name, setName] = useState("");
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

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            await register(name, email, password);
            setMessage("Registration successful! You can now log in.");

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }
    };

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
