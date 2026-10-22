import useApplications from "../hooks/useApplications";
import useToast from "../hooks/useToast";
import api from "../lib/axios";

function Applicants() {
    const toast = useToast();
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
                    {applications.map((application) => (
                        <article className="notice" key={application._id}>
                            <div className="eyebrow">Applying to</div>
                            <h2>{application.project.title}</h2>

                            <div className="detail" style={{ boxShadow: "none", border: "0", padding: 0 }}>
                                <dl>
                                    <dt>Name</dt>
                                    <dd>{application.applicant.name}</dd>
                                    <dt>Email</dt>
                                    <dd>{application.applicant.email}</dd>
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
