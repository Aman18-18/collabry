import { Link } from "react-router-dom";

function NotFound() {
    return (
        <main className="page page-narrow">
            <div className="eyebrow">Error 404</div>
            <h1>This notice isn't on the board.</h1>
            <p style={{ margin: "16px 0 28px", color: "var(--muted)" }}>
                The page you're looking for doesn't exist, or the link has a typo.
            </p>
            <Link to="/browse" className="btn btn-primary">Browse the board</Link>
        </main>
    );
}

export default NotFound;
