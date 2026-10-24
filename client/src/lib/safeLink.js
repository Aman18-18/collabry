// only plain web links are ever put into an href
export function safeLink(value) {
    try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

// a GitHub username or a full link, always returned as a safe web address
export function githubHref(value) {
    if (!value) return "";
    return safeLink(value.startsWith("http") ? value : `https://github.com/${value}`);
}
