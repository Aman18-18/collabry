import { useState } from "react";

function PasswordInput({ id, value, onChange, autoComplete, placeholder, required }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="password-input-wrap">
            <input
                id={id}
                className="password-input"
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />
            <button
                className="password-visibility-toggle"
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                onClick={() => setVisible((current) => !current)}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    {visible ? (
                        <>
                            <path d="m3 3 18 18" />
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                            <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.8" />
                            <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 4.1-.8" />
                        </>
                    ) : (
                        <>
                            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                        </>
                    )}
                </svg>
            </button>
        </div>
    );
}

export default PasswordInput;
