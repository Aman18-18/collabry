import { useEffect, useState } from "react";
import api from "../lib/axios";

function useApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchApplications() {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/applications/mine");

            setApplications(response.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to fetch applications"
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateApplication(id, status) {
        const response = await api.patch(`/applications/${id}`, {
            status
        });

        await fetchApplications();

        return response.data;
    }

    useEffect(() => {
        fetchApplications();
    }, []);

    return {
        applications,
        loading,
        error,
        fetchApplications,
        updateApplication
    };
}

export default useApplications;