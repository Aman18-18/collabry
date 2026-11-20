import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/react";
import api, { setAuthTokenGetter } from "../lib/axios";
import AuthContext from "./authContext";

function AuthProvider({ children }) {
    const { isLoaded: clerkLoaded, isSignedIn, getToken } = useClerkAuth();
    const { signOut } = useClerk();
    const { user: clerkUser, isLoaded: clerkUserLoaded } = useUser();
    const [profileRecord, setProfileRecord] = useState(null);

    setAuthTokenGetter(getToken);

    useEffect(() => {
        if (!clerkLoaded || !clerkUserLoaded || !isSignedIn || !clerkUser?.id) {
            return undefined;
        }

        let active = true;

        api.get("/users/me").then(
            ({ data }) => {
                if (!active) return;

                setProfileRecord({
                    clerkUserId: clerkUser.id,
                    user: { ...data, id: data._id || data.id },
                    error: ""
                });
            },
            (error) => {
                if (!active) return;

                setProfileRecord({
                    clerkUserId: clerkUser.id,
                    user: null,
                    error: error.response?.data?.message ||
                        "Failed to load your Collabry profile"
                });
            }
        );

        return () => {
            active = false;
        };
    }, [clerkLoaded, clerkUserLoaded, isSignedIn, clerkUser?.id]);

    const profileMatchesSession = Boolean(
        isSignedIn && clerkUser?.id && profileRecord?.clerkUserId === clerkUser.id
    );
    const user = profileMatchesSession ? profileRecord.user : null;
    const profileError = profileMatchesSession ? profileRecord.error : "";

    const updateUser = useCallback((updates) => {
        setProfileRecord((current) => current?.clerkUserId === clerkUser?.id
            ? {
                ...current,
                user: current.user ? { ...current.user, ...updates } : current.user
            }
            : current
        );
    }, [clerkUser?.id]);

    const logout = useCallback(async () => {
        await signOut();
    }, [signOut]);

    const value = useMemo(() => ({
        user,
        isSignedIn: Boolean(isSignedIn),
        isLoaded: clerkLoaded && clerkUserLoaded && (!isSignedIn || profileMatchesSession),
        profileError,
        updateUser,
        logout
    }), [user, isSignedIn, clerkLoaded, clerkUserLoaded, profileMatchesSession, profileError, updateUser, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;
