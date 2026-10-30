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
                join others. It does not check who anyone is and does not guarantee
                that a team will work out.
            </p>

            <h2>Be a decent person</h2>
            <ul>
                <li>Use your real name and your own email address. One person, one account.</li>
                <li>Don't harass, threaten or spam anyone, and don't post abusive, illegal or misleading content.</li>
                <li>Only post projects you actually intend to work on, and only share team chat links that you control.</li>
                <li>Don't try to break the site, scrape other people's data, or get into accounts that aren't yours.</li>
            </ul>

            <h2>Your content</h2>
            <p>
                You're responsible for what you post. You keep ownership of your
                ideas and work. Posting a project on the board lets other users see
                it, and that's all the permission Collabry needs.
            </p>

            <h2>Meeting your teammates</h2>
            <p>
                Collabry only introduces people. What you share with a teammate, and
                any agreement you make with them, is between you. Be careful with
                personal information, and be sensible before meeting anyone in person.
            </p>

            <h2>Removing content or accounts</h2>
            <p>
                Projects or accounts that break these rules may be removed without
                notice. You can leave at any time, see the{" "}
                <Link to="/privacy" className="ulink">Privacy Policy</Link> for how
                your data is handled.
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
