import { useState } from "react";
import { CONTACT_EMAIL, GITHUB_URL } from "../lib/siteInfo";

function Contact() {
    const [copyStatus, setCopyStatus] = useState("");

    async function copyEmail() {
        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error("Clipboard access is unavailable");
            }

            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setCopyStatus("Email address copied.");
        } catch {
            setCopyStatus("Copy isn’t available here. Select the email address to copy it.");
        }
    }

    const emailLink = `mailto:${CONTACT_EMAIL}?subject=Collabry%20message`;

    return (
        <main className="page prose">
            <div className="eyebrow">Get in touch</div>
            <h1>Contact us</h1>

            <p>
                Collabry is a student-run project. Reach out if something is broken,
                you have an idea, need help with your profile or username, or want
                to request account and data deletion. I usually reply within a few days.
            </p>

            <h2>How to reach me</h2>
            {CONTACT_EMAIL && (
                <div className="contact-email">
                    <p>
                        Email: <a href={emailLink}>{CONTACT_EMAIL}</a>
                    </p>
                    <div className="form-actions">
                        <a className="btn btn-primary" href={emailLink}>Write an email</a>
                        <button className="btn" type="button" onClick={copyEmail}>
                            Copy email
                        </button>
                    </div>
                    {copyStatus && (
                        <p className="field-hint" role="status" aria-live="polite">
                            {copyStatus}
                        </p>
                    )}
                </div>
            )}
            <ul>
                <li>
                    GitHub: <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">open an issue or say hi</a>
                </li>
            </ul>

            <h2>Reporting a problem</h2>
            <p>It helps a lot if you tell me:</p>
            <ul>
                <li>what page you were on and what you clicked,</li>
                <li>what you expected, and what happened instead,</li>
                <li>whether it was on a phone or a computer, and a screenshot if you can.</li>
            </ul>

            <h2>Forgot your password?</h2>
            <p>
                On the sign-in page, choose <strong>Forgot your password?</strong>,
                enter your account email, and follow the six-digit code sent to you
                to set a new password. If you can’t access that email or the reset
                doesn’t work, contact me and include your username. Never send your
                password or a verification code.
            </p>

            <h2>Deleting your account</h2>
            <p>
                There isn’t a self-service delete option yet. Contact me from the
                email address on your account to request deletion. I’ll verify the
                request and help remove your account, profile, projects and
                associated applications.
            </p>
        </main>
    );
}

export default Contact;
