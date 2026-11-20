import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useSignUp } from "@clerk/react";
import useToast from "../hooks/useToast";
import { clerkNavigation } from "../lib/clerkNavigation";

function Register() {
    const { isLoaded, isSignedIn } = useClerkAuth();
    const { signUp, fetchStatus } = useSignUp();
    const navigate = useNavigate();
    const toast = useToast();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [verifying, setVerifying] = useState(false);
    const busy = fetchStatus === "fetching";

    async function handleRegister(event) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const { error: signUpError } = await signUp.password({
                emailAddress: email.trim(),
                password,
                unsafeMetadata: {
                    collabryName: name.trim()
                }
            });

            if (signUpError) {
                setError(signUpError.message || "Registration failed.");
                return;
            }

            const { error: codeError } = await signUp.verifications.sendEmailCode();

            if (codeError) {
                setError(codeError.message || "Unable to send an email verification code.");
                return;
            }

            setVerifying(true);
        } catch (signUpError) {
            setError(signUpError.message || "Registration failed. Please try again.");
        }
    }

    async function handleVerify(event) {
        event.preventDefault();
        setError("");

        if (!/^\d{6}$/.test(code)) {
            setError("Enter the six-digit verification code.");
            return;
        }

        try {
            const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });

            if (verifyError) {
                setError(verifyError.message || "Invalid verification code.");
                return;
            }

            if (signUp.status !== "complete") {
                setError("Email verification is incomplete. Check the code and try again.");
                return;
            }

            const { error: finalizeError } = await signUp.finalize({
                navigate: clerkNavigation(navigate, "/profile")
            });

            if (finalizeError) {
                setError(finalizeError.message || "Unable to complete registration.");
                return;
            }

            toast.show("Welcome to Collabry.");
        } catch (verifyError) {
            setError(verifyError.message || "Unable to verify your email.");
        }
    }

    async function resendCode() {
        setError("");

        try {
            const { error: resendError } = await signUp.verifications.sendEmailCode();
            if (resendError) {
                setError(resendError.message || "Unable to resend the verification code.");
            }
        } catch (resendError) {
            setError(resendError.message || "Unable to resend the verification code.");
        }
    }

    function startOver() {
        signUp.reset();
        setVerifying(false);
        setCode("");
        setError("");
    }

    if (isLoaded && isSignedIn) {
        return <Navigate to="/profile" replace />;
    }

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">{verifying ? "Check your inbox" : "Join Collabry"}</div>
                    <h1>{verifying ? "Verify your email" : "Register"}</h1>
                </div>
            </div>

            <form className="form-card" onSubmit={verifying ? handleVerify : handleRegister}>
                {!verifying && (
                    <>
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                required
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
                                required
                            />
                        </div>

                        <p className="form-foot">
                            We’ll create a unique @username for you. You can change it later on your profile.
                        </p>

                        <div className="field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <span className="field-hint">At least 8 characters.</span>
                        </div>

                        <div className="field">
                            <label htmlFor="confirm">Confirm password</label>
                            <input
                                id="confirm"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                required
                            />
                        </div>
                    </>
                )}

                {verifying && (
                    <>
                        <p className="form-foot">We sent a six-digit verification code to {email}.</p>
                        <div className="field">
                            <label htmlFor="code">Email verification code</label>
                            <input
                                id="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                placeholder="Enter six-digit code"
                                value={code}
                                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                            />
                        </div>
                    </>
                )}

                {error && <p className="notice-error" role="alert">{error}</p>}

                <button className="btn btn-primary" type="submit" disabled={busy}>
                    {busy ? "Please wait..." : verifying ? "Verify and continue" : "Register"}
                </button>

                {verifying ? (
                    <p className="form-foot">
                        <button className="text-button" type="button" onClick={resendCode} disabled={busy}>
                            Resend code
                        </button>
                        {" · "}
                        <button className="text-button" type="button" onClick={startOver} disabled={busy}>
                            Change details
                        </button>
                    </p>
                ) : (
                    <p className="form-foot">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                )}
            </form>
        </main>
    );
}

export default Register;
