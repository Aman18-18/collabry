import { Link } from "react-router-dom";
import { LAST_UPDATED } from "../lib/siteInfo";

function Terms() {
    return (
        <main className="page prose">
            <div className="eyebrow">Last updated {LAST_UPDATED}</div>
            <h1>Terms of Use</h1>

            <p>
                By using Collabry you agree to these simple rules. They exist to
                keep it a good place to find teammates.
            </p>

            <h2>What Collabry is</h2>
            <p>
                A free, student-run board where people post projects and apply to
                join others. Email verification helps protect accounts, but Collabry
                does not independently verify a person’s identity, school, skills,
                or project claims, and cannot guarantee that a team will work out.
            </p>

            <h2>Be a decent person</h2>
            <ul>
                <li>Use an email address you control, keep your account secure, and choose a unique username. Don’t impersonate another person.</li>
                <li>Don't harass, threaten or spam anyone, and don't post abusive, illegal or misleading content.</li>
                <li>Only post projects you actually intend to work on, and only share team chat links that you control.</li>
                <li>Only upload profile photos and other content that you own or have permission to share. Don’t post sensitive personal information.</li>
                <li>Don't try to break the site, scrape other people's data, or get into accounts that aren't yours.</li>
            </ul>

            <h2>Your content</h2>
            <p>
                You're responsible for what you post and keep ownership of your
                ideas and work. You give Collabry permission to store and display
                your profile and project content so the service can operate. Project
                listings and the owner’s name and username are visible on the public
                board; profile details are available to signed-in members as
                described in the <Link to="/privacy" className="ulink">Privacy Policy</Link>.
            </p>

            <h2>Meeting your teammates</h2>
            <p>
                Collabry only introduces people. What you share with a teammate, and
                any agreement you make with them, is between you. Be careful with
                personal information, and be sensible before meeting anyone in person.
            </p>

            <h2>Example projects</h2>
            <p>
                When the signed-out board has no matching public listings, it may
                show example project cards. These are illustrative page content,
                not member accounts or project posts, and cannot receive applications.
            </p>

            <h2>Removing content or accounts</h2>
            <p>
                Projects or accounts that break these rules may be removed without
                notice. You can delete a project, which also deletes its applications.
                Account deletion is handled by request through the{" "}
                <Link to="/contact" className="ulink">contact page</Link>. See the{" "}
                <Link to="/privacy" className="ulink">Privacy Policy</Link> for details.
            </p>

            <h2>No guarantees</h2>
            <p>
                Collabry is provided as it is. It runs on free hosting, so it can be
                slow, go down, lose data or change without warning. It may also be
                stopped at any time.
            </p>

            <h2>Questions</h2>
            <p>
                Use the <Link to="/contact" className="ulink">contact page</Link>.
            </p>
        </main>
    );
}

export default Terms;
