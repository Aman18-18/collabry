import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

const SLOW_AFTER_MS = 5000;

// Two jobs, both watching every request the app makes:
// 1. a request taking over 5 seconds shows a "waking the server up" notice
// 2. a 401 on an authenticated request reports the rejected endpoint without clearing Clerk's session
function ApiWatcher() {
    const { isSignedIn } = useAuth();
    const { show } = useToast();

    const [slow, setSlow] = useState(false);
    const timers = useRef(new Map());
    const expiredShown = useRef(false);

    useEffect(() => {
        if (isSignedIn) expiredShown.current = false;
    }, [isSignedIn]);

    useEffect(() => {
        const pending = timers.current;
        let nextId = 1;

        function finish(config) {
            const id = config?.slowId;
            if (!id) return;

            clearTimeout(pending.get(id));
            pending.delete(id);

            if (pending.size === 0) setSlow(false);
        }

        const requestInterceptor = api.interceptors.request.use((config) => {
            const id = nextId++;
            config.slowId = id;
            pending.set(id, setTimeout(() => setSlow(true), SLOW_AFTER_MS));
            return config;
        });

        const responseInterceptor = api.interceptors.response.use(
            (response) => {
                finish(response.config);
                return response;
            },
            (error) => {
                finish(error.config);

                const headers = error.config?.headers;
                const sentToken = Boolean(
                    headers?.Authorization || headers?.get?.("Authorization")
                );

                if (error.response?.status === 401 && sentToken && isSignedIn && !expiredShown.current) {
                    expiredShown.current = true;
                    const method = error.config?.method?.toUpperCase() || "API";
                    const endpoint = error.config?.url || "request";
                    console.warn("Collabry API rejected a Clerk-authenticated request:", method, endpoint);
                    show(
                        `The API rejected your session on ${method} ${endpoint}. You are still signed in; refresh the page or contact support.`,
                        "error"
                    );
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
            pending.forEach((timer) => clearTimeout(timer));
            pending.clear();
        };
    }, [show, isSignedIn]);

    if (!slow) return null;

    return (
        <div className="wake-banner" role="status">
            Waking the server up. The first load after a quiet spell can take up to a minute.
        </div>
    );
}

export default ApiWatcher;
