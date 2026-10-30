import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div>
                    <div className="footer-brand">Collabry</div>
                    <p className="footer-tag">
                        Pin a project, say who you're missing, and find teammates
                        on campus for hackathons, minor projects and startups.
                    </p>
                </div>

                <nav aria-label="Product">
                    <h2>Product</h2>
                    <ul>
                        <li><Link to="/browse">Browse the board</Link></li>
                        <li><Link to="/postproject">Pin a project</Link></li>
                        <li><Link to="/profile">Your profile</Link></li>
                    </ul>
                </nav>

                <nav aria-label="Legal and help">
                    <h2>Legal</h2>
                    <ul>
                        <li><Link to="/privacy">Privacy Policy</Link></li>
                        <li><Link to="/terms">Terms of Use</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                    </ul>
                </nav>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Collabry. All rights reserved.</span>
                <span>Made by a student, for students.</span>
            </div>
        </footer>
    );
}

export default Footer;
