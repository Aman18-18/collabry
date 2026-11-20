import { Link } from "react-router-dom";
import { LAST_UPDATED } from "../lib/siteInfo";

function Privacy() {
    return (
        <main className="page prose">
            <div className="eyebrow">Last updated {LAST_UPDATED}</div>
            <h1>Privacy Policy</h1>

            <p>
                Collabry is a small student project that helps people find teammates.
                This page explains what information it stores, how it is used, and
                who can see it.
            </p>

            <h2>What we store</h2>
            <ul>
                <li>
                    <strong>Your account:</strong> name, email address, unique username,
                    and a Clerk account identifier. Clerk handles current sign-in,
                    passwords, and password resets. Older accounts may still have
                    legacy password hashes from an earlier version; they are not
                    used to sign in.
                </li>
                <li>
                    <strong>Your profile, if you fill it in:</strong> college, branch,
                    year, skills, bio, GitHub username or link, and an optional
                    profile photo. Photos are stored with Collabry’s database and
                    may be up to 1 MB.
                </li>
                <li>
                    <strong>What you post:</strong> project title, description,
                    project type, tech stack, roles or skills needed, team size,
                    status, optional team chat link, and applications with their
                    message and status.
                </li>
                <li>
                    <strong>Sign-in and technical data:</strong> the session
                    information needed to keep you signed in. Clerk and our hosting
                    providers may process security and diagnostic data, such as
                    request times and IP addresses. Collabry does not set advertising
                    cookies.
                </li>
            </ul>

            <h2>Who can see what</h2>
            <ul>
                <li>
                    <strong>Anyone</strong> can browse open projects with available
                    spots and see project details, the owner’s name and username,
                    and accepted team members’ names and usernames. A project page
                    may also be opened directly by its link when it is full or closed.
                </li>
                <li>
                    <strong>Signed-in members</strong> can search for members by
                    username and view profiles, including name, username, college,
                    branch, year, skills, bio, GitHub information, optional profile
                    photo, and project titles and statuses. Email addresses are not
                    shown on profiles.
                </li>
                <li>
                    <strong>A project’s owner</strong> can see an applicant’s name,
                    username, email, college, branch, year, skills, bio, GitHub
                    information, and application message. Application details and
                    status are visible to the applicant and the project owner.
                </li>
                <li>
                    <strong>The team chat link</strong> is visible only to the
                    project owner and accepted members.
                </li>
                <li>
                    If there are no matching public listings, the signed-out board
                    may show static cards under “Example projects.” They are page
                    examples, not user accounts or saved project records, and
                    applications cannot be sent to them.
                </li>
            </ul>

            <h2>Who it's shared with</h2>
            <p>
                Your data is not sold and not used for ads. It is stored with the
                services that run the site: Clerk (authentication), Vercel (the
                website), Render (the server), and MongoDB Atlas (the database).
                These providers process information as needed to provide their services.
            </p>

            <h2>Keeping and deleting your data</h2>
            <p>
                You can edit your profile, remove your profile photo, withdraw an
                application, leave a team, and delete a project. Deleting a project
                also deletes its applications. Account deletion is not self-service
                yet; to request it, <Link to="/contact" className="ulink">contact me</Link>
                from the email address on your account so I can verify the request.
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
