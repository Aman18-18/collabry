export function normalizeUsername(value) {
    return String(value ?? "").trim().replace(/^@/, "").toLowerCase();
}

export function validateUsername(value) {
    const username = normalizeUsername(value);

    if (!username) return "Choose a username";
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return "Use 3–20 letters, numbers, or underscores";
    }
    if (["admin", "support"].includes(username)) {
        return "That username is reserved";
    }

    return "";
}
