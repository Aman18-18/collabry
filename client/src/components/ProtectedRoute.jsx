import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // remember where they were going so login can send them back
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
