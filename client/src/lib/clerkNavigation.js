export function safeInternalDestination(destination) {
    if (typeof destination !== "string" || !destination) {
        return "/profile";
    }

    try {
        const url = new URL(destination, window.location.origin);

        if (url.origin !== window.location.origin) {
            return "/profile";
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return "/profile";
    }
}

export function clerkNavigation(navigate, destination) {
    return ({ decorateUrl }) => {
        const url = decorateUrl(safeInternalDestination(destination));

        if (url.startsWith("http")) {
            window.location.assign(url);
        } else {
            navigate(url, { replace: true });
        }
    };
}
