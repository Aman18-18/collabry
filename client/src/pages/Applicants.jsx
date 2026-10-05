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
        return <h2>Loading applicants...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <>
            <h1>Applicants</h1>

            {applications.length === 0 ? (
                <p>No applicants yet.</p>
            ) : (
                applications.map((application) => (
                    <div key={application._id}>
                        <h2>{application.project.title}</h2>

                        <p>
                            <strong>Name:</strong>{" "}
                            {application.applicant.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {application.applicant.email}
                        </p>

                        <p>
                            <strong>Message:</strong>{" "}
                            {application.message}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {application.status}
                        </p>

                        {application.status === "pending" && (
                            <>
                                <button
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
                                    onClick={() =>
                                        handleStatus(
                                            application._id,
                                            "rejected"
                                        )
                                    }
                                >
                                    Reject
                                </button>
                            </>
                        )}

                        <hr />
                    </div>
                ))
            )}
        </>
    );
}

export default Applicants;