import { useContext } from "react";
import { NotificationsContext } from "../context/NotificationsContext";

function useNotifications() {
    return useContext(NotificationsContext);
}

export default useNotifications;
