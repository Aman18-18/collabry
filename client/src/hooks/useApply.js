import { useState } from "react";
import api from "../lib/axios";
import useToast from "./useToast";

const DEFAULT_MESSAGE = "I would like to contribute to this project.";

function useApply(projectId) {
    const toast = useToast();
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    async function apply(message) {
        setApplying(true);

        try {
            const response = await api.post(
                `/applications/${projectId}/apply`,
                { message: message?.trim() || DEFAULT_MESSAGE }
            );

            toast.show(response.data.message);
            setApplied(true);
        } catch (error) {
            toast.show(
                error.response?.data?.message || "Failed to apply",
                "error"
            );
        } finally {
            setApplying(false);
        }
    }

    return { apply, applying, applied };
}

export default useApply;
