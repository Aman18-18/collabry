import { Link } from "react-router-dom";
import { LAST_UPDATED } from "../lib/siteInfo";

function Privacy() {
    return (
        <main className="page prose">
            <div className="eyebrow">Last updated {LAST_UPDATED}</div>
            <h1>Privacy Policy</h1>

            <p>
                Collabry is a small student project that helps people find teammates.
                This page explains, in plain words, what it stores about you and who
                can see it.
            </p>

            <h2>What we store</h2>
            <ul>
                <li><strong>Your account:</strong> name, email address and password. The password is stored scrambled (hashed), so nobody, including me, can read it.</li>
                <li><strong>Your profile, if you fill it in:</strong> college, branch, year, skills, bio and GitHub username.</li>
                <li><strong>What you post:</strong> projects (title, description, tech stack, roles needed, team size and an optional team chat link) and the applications you send, with your message and their status.</li>
                <li><strong>In your browser:</strong> a login token that keeps you signed in. There are no advertising cookies and no analytics or tracking tools.</li>
                <li>Our hosting providers may keep standard technical logs, such as IP addresses and request times.</li>
            </ul>

            <h2>Who can see what</h2>
            <ul>
                <li><strong>Anyone with the link</strong> can see projects on the board and the names of each project's owner and accepted members.</li>
                <li><strong>Logged-in users</strong> can open another member's profile: name, college, branch, year, skills, bio, GitHub and the projects they pinned. Email addresses are never shown on profiles.</li>
                <li><strong>A project's owner</strong> can see the name, email, profile details and message of everyone who applies to that project.</li>
                <li><strong>The team chat link</strong> is visible only to the owner and accepted members.</li>
                <li>Your applications are visible only to you and the owner of the project you applied to.</li>
            </ul>

            <h2>Who it's shared with</h2>
            <p>
                Your data is not sold and not used for ads. It is stored with the
                services that run the site: Vercel (the website), Render (the server)
                and MongoDB Atlas (the database).
            </p>

            <h2>Keeping and deleting your data</h2>
            <p>
                Your data stays while your account exists. You can edit your profile
                at any time, withdraw an application, leave a team, and delete a
                project (which also deletes its applications). To delete your whole
                account, <Link to="/contact" className="ulink">contact me</Link> and I'll remove it.
            </p>

            <h2>Changes</h2>
            <p>
                If this changes, the date at the top will change too. Questions?
                Use the <Link to="/contact" className="ulink">contact page</Link>.
            </p>
        </main>
    );
}

export default Privacy;
