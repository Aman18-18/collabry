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

module.exports = { normalizeUsername, validateUsername };
