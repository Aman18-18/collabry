import useApplications from "../hooks/useApplications";
import useToast from "../hooks/useToast";
import api from "../lib/axios";
import useNotifications from "../hooks/useNotifications";
import { Link } from "react-router-dom";
import { githubHref } from "../lib/safeLink";

function Applicants() {
    const toast = useToast();
    const { refresh } = useNotifications();
    const {
        applications,
        loading,
        error,
        updateApplication
    } = useApplications();

    async function handleStatus(id, status, projectId) {
        try {
            const response = await updateApplication(id, status);

            toast.show(response.message);
            refresh();

            if (status === "accepted") {
                // nudge the owner if the new member has nowhere to go next
                try {
                    const link = await api.get(`/projects/${projectId}/team-link`);

                    if (!link.data.teamLink) {
                        toast.show("Tip: add a team chat link under Edit so your new member can reach you.");
                    }
                } catch {
                    // the tip is optional, ignore failures
                }
            }
        } catch (error) {
            toast.show(
                error.response?.data?.message ||
                "Failed to update application",
                "error"
            );
        }
    }

    if (loading) {
        return <p className="status-msg">Loading applicants...</p>;
    }

    if (error) {
        return <p className="status-msg">{error}</p>;
    }

    return (
        <main className="page">
            <div className="page-head">
                <div>
                    <div className="eyebrow">People who want in</div>
                    <h1>Applicants</h1>
                </div>
            </div>

            {applications.length === 0 ? (
                <p className="status-msg">No applicants yet.</p>
            ) : (
                <div className="stack">
                    {[...applications]
                        .sort((a, b) => (b.status === "pending") - (a.status === "pending"))
                        .map((application) => (
                        <article className="notice" key={application._id}>
                            <div className="eyebrow">Applying to</div>
                            <h2>{application.project.title}</h2>

                            <div className="detail" style={{ boxShadow: "none", border: "0", padding: 0 }}>
                                <dl>
                                    <dt>Name</dt>
                                    <dd>
                                        <Link to={`/user/${application.applicant._id}`} className="ulink">
                                            {application.applicant.name}
                                        </Link>
                                    </dd>
                                    <dt>Email</dt>
                                    <dd>{application.applicant.email}</dd>
                                    {(application.applicant.college || application.applicant.branch || application.applicant.year) && (
                                        <>
                                            <dt>Studies</dt>
                                            <dd>
                                                {[
                                                    application.applicant.college,
                                                    application.applicant.branch,
                                                    application.applicant.year ? `Year ${application.applicant.year}` : ""
                                                ].filter(Boolean).join(" · ")}
                                            </dd>
                                        </>
                                    )}
                                    {application.applicant.skills?.length > 0 && (
                                        <>
                                            <dt>Skills</dt>
                                            <dd>
                                                <div className="tags">
                                                    {application.applicant.skills.map((skill) => (
                                                        <span className="tag" key={skill}>{skill}</span>
                                                    ))}
                                                </div>
                                            </dd>
                                        </>
                                    )}
                                    {application.applicant.bio && (
                                        <>
                                            <dt>About</dt>
                                            <dd>{application.applicant.bio}</dd>
                                        </>
                                    )}
                                    {githubHref(application.applicant.github) && (
                                        <>
                                            <dt>GitHub</dt>
                                            <dd>
                                                <a
                                                    href={githubHref(application.applicant.github)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: "underline" }}
                                                >
                                                    {application.applicant.github}
                                                </a>
                                            </dd>
                                        </>
                                    )}
                                    <dt>Message</dt>
                                    <dd>{application.message}</dd>
                                </dl>
                            </div>

                            <span className={`badge badge-${application.status}`}>
                                {application.status}
                            </span>

                            {application.status === "pending" && (
                                <div className="notice-actions">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() =>
                                            handleStatus(application._id, "accepted", application.project._id)
                                        }
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="btn"
                                        onClick={() =>
                                            handleStatus(application._id, "rejected", application.project._id)
                                        }
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default Applicants;
