import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute() {
    const { user, isLoaded, isSignedIn, profileError } = useAuth();
    const location = useLocation();

    if (!isLoaded) {
        return <p className="status-msg">Checking your session...</p>;
    }

    if (!isSignedIn) {
        // remember where they were going so login can send them back
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (profileError) {
        return <p className="status-msg notice-error" role="alert">{profileError}</p>;
    }

    if (!user) {
        return <p className="status-msg">Loading your Collabry profile...</p>;
    }

    return <Outlet />;
}

export default ProtectedRoute;
