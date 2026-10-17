import "./Footer.css";
import { Link } from "react-router-dom";

// TODO: replace with the real support email / phone before launch.
const SUPPORT_EMAIL = "support@lostandfound.com";
const SUPPORT_PHONE = "+92 300 1234567";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <h2 className="footer__brand">Lost & Found</h2>
          <p>Helping reunite people and belongings safely across Pakistan.</p>
        </div>

        <nav aria-label="Quick links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/persons">Persons</Link>
          <Link to="/items">Items</Link>
          <Link to="/statistics">Statistics</Link>
        </nav>

        <nav aria-label="Support">
          <h3>Support</h3>
          <Link to="/faqs">FAQs</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
        </nav>

        <div>
          <h3>Contact</h3>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}>{SUPPORT_PHONE}</a>
        </div>
      </div>

      <p className="footer__copy">© {new Date().getFullYear()} Lost & Found. All rights reserved.</p>
    </footer>
  );
}
