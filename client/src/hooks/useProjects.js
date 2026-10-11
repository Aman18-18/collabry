import { useCallback, useEffect, useState } from "react";
import api from "../lib/axios";

function useProjects() {

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProjects = useCallback(async () => {
    try {
        setLoading(true);
        setError("");

        const response = await api.get("/projects");
        setProjects(response.data);
    } catch (error) {
        setError(
            error.response?.data?.message ||
            "Failed to fetch projects"
        );
    } finally {
        setLoading(false);
    }
}, []);

   useEffect(() => {
    fetchProjects();
}, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects
    };
}

export default useProjects;