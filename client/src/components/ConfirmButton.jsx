import { useState } from "react";

// a button that asks "are you sure?" in place before doing something drastic
function ConfirmButton({ label, question, confirmLabel = "Yes", onConfirm, className = "btn" }) {
    const [asking, setAsking] = useState(false);
    const [busy, setBusy] = useState(false);

    async function handleConfirm() {
        setBusy(true);

        try {
            await onConfirm();
        } finally {
            setBusy(false);
            setAsking(false);
        }
    }

    if (!asking) {
        return (
            <button type="button" className={className} onClick={() => setAsking(true)}>
                {label}
            </button>
        );
    }

    return (
        <div className="confirm-box" role="alertdialog" aria-label={question}>
            <p>{question}</p>
            <div className="notice-actions">
                <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
                    {busy ? "Working..." : confirmLabel}
                </button>
                <button type="button" className="btn" onClick={() => setAsking(false)} disabled={busy}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ConfirmButton;
