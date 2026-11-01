import { useState } from "react";
import api from "../lib/axios";
import useToast from "../hooks/useToast";

function ChangePassword() {
    const toast = useToast();

    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    function close() {
        setOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("The new passwords don't match");
            return;
        }

        setSaving(true);

        try {
            const response = await api.put("/users/me/password", {
                currentPassword,
                newPassword
            });

            toast.show(response.data.message);
            close();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setSaving(false);
        }
    }

    if (!open) {
        return (
            <div>
                <button className="btn" onClick={() => setOpen(true)}>
                    Change password
                </button>
            </div>
        );
    }

    return (
        <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: 440 }}>
            <div className="field">
                <label htmlFor="current-password">Current password</label>
                <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                />
            </div>

            <div className="field">
                <label htmlFor="new-password">New password</label>
                <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                />
                <span className="field-hint">At least 8 characters.</span>
            </div>

            <div className="field">
                <label htmlFor="confirm-new-password">Confirm new password</label>
                <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
            </div>

            {error && <p className="notice-error" role="alert">{error}</p>}

            <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save new password"}
                </button>
                <button className="btn" type="button" onClick={close} disabled={saving}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default ChangePassword;
