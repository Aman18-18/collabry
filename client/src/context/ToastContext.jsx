import { createContext, useCallback, useRef, useState } from "react";

export const ToastContext = createContext(null);

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback((message, type = "success") => {
        const id = nextId.current++;

        // keep at most 3 on screen
        setToasts((current) => [...current.slice(-2), { id, message, type }]);
        setTimeout(() => dismiss(id), 4500);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ show }}>
            {children}

            <div className="toast-stack" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                        role={toast.type === "error" ? "alert" : "status"}
                    >
                        <span>{toast.message}</span>
                        <button
                            className="toast-close"
                            onClick={() => dismiss(toast.id)}
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export default ToastProvider;
