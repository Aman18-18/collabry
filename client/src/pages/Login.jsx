import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth as useClerkAuth, useSignIn } from "@clerk/react";
import useToast from "../hooks/useToast";
import { clerkNavigation, safeInternalDestination } from "../lib/clerkNavigation";

function Login() {
    const { isLoaded, isSignedIn } = useClerkAuth();
    const { signIn, fetchStatus } = useSignIn();
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [stage, setStage] = useState("credentials");
    const busy = fetchStatus === "fetching";
    const destination = safeInternalDestination(location.state?.from);

    async function finishSignIn() {
        const { error: finalizeError } = await signIn.finalize({
            navigate: clerkNavigation(navigate, destination)
        });

        if (finalizeError) {
            setError(finalizeError.message || "Unable to complete sign in.");
        } else {
            toast.show("Welcome back to Collabry.");
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            const { error: signInError } = await signIn.password({
                identifier: email.trim(),
                password
            });

            if (signInError) {
                setError(signInError.message || "Login failed.");
                return;
            }

            if (signIn.status === "complete") {
                await finishSignIn();
                return;
            }

            if (["needs_client_trust", "needs_second_factor"].includes(signIn.status)) {
                const hasEmailCode = signIn.supportedSecondFactors?.some(
                    (factor) => factor.strategy === "email_code"
                );

                if (!hasEmailCode) {
                    setError("This account requires a verification method that is not enabled for this sign-in flow.");
                    return;
                }

                const { error: codeError } = await signIn.mfa.sendEmailCode();

                if (codeError) {
                    setError(codeError.message || "Unable to send a verification code.");
                    return;
                }

                setStage("challenge");
                return;
            }

            setError("Sign in needs another verification step. Please try again or contact support.");
        } catch (signInError) {
            setError(signInError.message || "Login failed.");
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
            const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });

            if (verifyError) {
                setError(verifyError.message || "Invalid verification code.");
                return;
            }

            if (signIn.status === "complete") {
                await finishSignIn();
                return;
            }

            setError("Verification is incomplete. Check the code and try again.");
        } catch (verifyError) {
            setError(verifyError.message || "Unable to verify the code.");
        }
    }

    async function handlePasswordResetRequest(event) {
        event.preventDefault();
        setError("");
        setPassword("");

        if (!email.trim()) {
            setError("Enter your email address.");
            return;
        }

        try {
            const { error: createError } = await signIn.create({
                identifier: email.trim()
            });

            if (createError) {
                setError(createError.message || "Unable to start password reset.");
                return;
            }

            const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();

            if (sendError) {
                setError(sendError.message || "Unable to send a password reset code.");
                return;
            }

            setStage("reset-code");
        } catch (resetError) {
            setError(resetError.message || "Unable to start password reset.");
        }
    }

    async function handlePasswordResetVerification(event) {
        event.preventDefault();
        setError("");

        if (!/^\d{6}$/.test(code)) {
            setError("Enter the six-digit password reset code.");
            return;
        }

        try {
            const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({ code });

            if (verifyError) {
                setError(verifyError.message || "Invalid password reset code.");
                return;
            }

            if (signIn.status === "needs_new_password") {
                setStage("new-password");
                return;
            }

            setError("Password reset verification is incomplete. Request a new code and try again.");
        } catch (verifyError) {
            setError(verifyError.message || "Unable to verify the reset code.");
        }
    }

    async function handleNewPassword(event) {
        event.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            const { error: passwordError } = await signIn.resetPasswordEmailCode.submitPassword({
                password,
                signOutOfOtherSessions: true
            });

            if (passwordError) {
                setError(passwordError.message || "Unable to reset your password.");
                return;
            }

            if (signIn.status === "complete") {
                await finishSignIn();
                return;
            }

            setError("Password reset is incomplete. Please try again.");
        } catch (resetError) {
            setError(resetError.message || "Unable to reset your password.");
        }
    }

    function returnToLogin() {
        signIn.reset();
        setCode("");
        setError("");
        setStage("credentials");
    }

    if (isLoaded && isSignedIn) {
        return <Navigate to={destination} replace />;
    }

    const resetFlow = stage === "reset-code" || stage === "new-password";
    const pageTitle = resetFlow
        ? "Reset password"
        : stage === "challenge" ? "Verify your sign in" : "Login";

    return (
        <main className="page page-narrow">
            <div className="page-head">
                <div>
                    <div className="eyebrow">{resetFlow ? "Account recovery" : "Welcome back"}</div>
                    <h1>{pageTitle}</h1>
                </div>
            </div>

            <form
                className="form-card"
                onSubmit={
                    stage === "credentials" ? handleLogin
                        : stage === "challenge" ? handleVerify
                            : stage === "reset-code" ? handlePasswordResetVerification
                                : stage === "new-password" ? handleNewPassword
                                    : handlePasswordResetRequest
                }
            >
                {stage !== "challenge" && (
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
                            readOnly={resetFlow}
                            required
                        />
                    </div>
                )}

                {stage === "credentials" && (
                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>
                )}

                {(stage === "challenge" || stage === "reset-code") && (
                    <div className="field">
                        <label htmlFor="code">
                            {stage === "challenge" ? "Email verification code" : "Password reset code"}
                        </label>
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
                )}

                {stage === "new-password" && (
                    <div className="field">
                        <label htmlFor="password">New password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>
                )}

                {error && <p className="notice-error" role="alert">{error}</p>}

                <button className="btn btn-primary" type="submit" disabled={busy}>
                    {busy ? "Please wait..." :
                        stage === "credentials" ? "Login" :
                            stage === "challenge" ? "Verify and continue" :
                                stage === "reset-code" ? "Verify reset code" :
                                    stage === "new-password" ? "Set new password" : "Send reset code"}
                </button>

                {stage === "credentials" && (
                    <>
                        <p className="form-foot">
                            <button className="text-button" type="button" onClick={handlePasswordResetRequest} disabled={busy}>
                                Forgot your password?
                            </button>
                        </p>
                        <p className="form-foot">
                            New here? <Link to="/register">Create an account</Link>
                        </p>
                    </>
                )}

                {stage !== "credentials" && (
                    <p className="form-foot">
                        <button className="text-button" type="button" onClick={returnToLogin} disabled={busy}>
                            Back to login
                        </button>
                    </p>
                )}
            </form>
        </main>
    );
}

export default Login;
