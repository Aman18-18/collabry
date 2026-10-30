import { CONTACT_EMAIL, GITHUB_URL, LINKEDIN_URL, X_URL } from "../lib/siteInfo";

function Contact() {
    return (
        <main className="page prose">
            <div className="eyebrow">Get in touch</div>
            <h1>Contact us</h1>

            <p>
                Collabry is a student-run project, so there's a real person reading
                this. Reach out if something is broken, you have an idea, or you
                want your account and data deleted. I usually reply within a few days.
            </p>

            <h2>How to reach me</h2>
            <ul>
                {CONTACT_EMAIL && (
                    <li>
                        Email: <a href={`mailto:${CONTACT_EMAIL}?subject=Collabry`}>{CONTACT_EMAIL}</a>
                    </li>
                )}
                <li>
                    LinkedIn: <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">message me on LinkedIn</a>
                </li>
                <li>
                    X: <a href={X_URL} target="_blank" rel="noopener noreferrer">@ykykaman</a>
                </li>
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

            <h2>Deleting your account</h2>
            <p>
                There's no delete button yet. Contact me from the email address you
                registered with, and I'll remove your account, your profile details
                and your applications.
            </p>
        </main>
    );
}

export default Contact;
