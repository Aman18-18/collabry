import useApplications from "../hooks/useApplications";

function Applicants() {
    const {
        applications,
        loading,
        error,
        updateApplication
    } = useApplications();

    async function handleStatus(id, status) {
        try {
            const response = await updateApplication(id, status);

            alert(response.message);
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to update application"
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
                                            handleStatus(
                                                application._id,
                                                "accepted"
                                            )
                                        }
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="btn"
                                        onClick={() =>
                                            handleStatus(
                                                application._id,
                                                "rejected"
                                            )
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
