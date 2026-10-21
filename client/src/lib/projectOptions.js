export const ROLES = [
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "design", label: "Design" },
    { value: "ml", label: "ML" },
    { value: "mobile", label: "Mobile" }
];

export const PROJECT_TYPES = [
    { value: "hackathon", label: "Hackathon" },
    { value: "minor-project", label: "Minor project" },
    { value: "startup", label: "Startup" },
    { value: "other", label: "Other" }
];

export const TYPE_LABELS = Object.fromEntries(
    PROJECT_TYPES.map((type) => [type.value, type.label])
);

export function newestFirst(projects) {
    return [...projects].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
}
