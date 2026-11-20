const RESERVED_USERNAMES = new Set(["admin", "support"]);

function normalizeUsername(value) {
    return String(value ?? "").trim().replace(/^@/, "").toLowerCase();
}

function validateUsername(username) {
    if (!username) {
        return "Choose a username";
    }

    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return "Usernames must be 3–20 characters and use only letters, numbers, and underscores";
    }

    if (RESERVED_USERNAMES.has(username)) {
        return "That username is reserved";
    }

    return null;
}

function usernameBase(value) {
    const base = normalizeUsername(value)
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

    return (base.length >= 3 ? base : `user${base}`).slice(0, 20);
}

function* usernameCandidates(value) {
    const base = usernameBase(value);

    for (let suffix = 1; suffix <= 1000; suffix++) {
        const suffixText = suffix === 1 ? "" : `_${suffix}`;
        const username = `${base.slice(0, 20 - suffixText.length)}${suffixText}`;

        if (!validateUsername(username)) {
            yield username;
        }
    }
}

module.exports = {
    normalizeUsername,
    validateUsername,
    usernameBase,
    usernameCandidates
};
