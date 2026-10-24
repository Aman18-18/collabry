import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

export const NotificationsContext = createContext({
    pending: 0,
    unseenDecisions: 0,
    refresh: () => {}
});

const EMPTY = { pending: 0, unseenDecisions: 0 };

function plural(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function NotificationsProvider({ children }) {
    const { user } = useAuth();
    const { show } = useToast();
    const [counts, setCounts] = useState(EMPTY);

    const refresh = useCallback(async () => {
        if (!user) return;

        try {
            const { data } = await api.get("/applications/summary");

            setCounts({
                pending: data.pending,
                unseenDecisions: data.unseenDecisions
            });

            // announce once per browser session, not on every refresh
            const key = `collabry-announced-${user.id}`;
            let alreadyAnnounced = false;

            try {
                alreadyAnnounced = sessionStorage.getItem(key) === "1";
                sessionStorage.setItem(key, "1");
            } catch {
                // storage can be unavailable, then we just announce again
            }

            if (alreadyAnnounced) return;

            if (data.pending > 0) {
                show(`${plural(data.pending, "applicant")} waiting for your decision`);
            }

            if (data.decisions.length === 1) {
                const [decision] = data.decisions;
                show(
                    decision.status === "accepted"
                        ? `You were accepted to "${decision.title}"`
                        : `Your application to "${decision.title}" was not accepted`
                );
            } else if (data.unseenDecisions > 1) {
                show(`${data.unseenDecisions} of your applications have an update. Check your profile.`);
            }
        } catch {
            // badges are a nice extra, never block the page on them
        }
    }, [user, show]);

    useEffect(() => {
        if (!user) return;

        refresh();

        const timer = setInterval(refresh, 60000);

        function onVisible() {
            if (document.visibilityState === "visible") refresh();
        }

        document.addEventListener("visibilitychange", onVisible);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [user, refresh]);

    const value = useMemo(
        () => ({ ...(user ? counts : EMPTY), refresh }),
        [user, counts, refresh]
    );

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export default NotificationsProvider;
