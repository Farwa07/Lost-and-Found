import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Navbar.css";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/persons", label: "Persons" },
  { path: "/items", label: "Items" },
  { path: "/statistics", label: "Statistics" },
  { path: "/contact", label: "Contact" },
];

export default function Navbar({ onToggleSidebar }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <button className="navbar__hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <div className="navbar__brand">
        <div className="navbar__logo-circle">
          <img src={logo} alt="Lost and Found logo" />
        </div>
        <span className="navbar__brand-text">Lost &amp; Found</span>
      </div>

      <div className="navbar__links">
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar__link ${location.pathname === link.path ? "navbar__link--active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbar__auth">
        <Link to="/login" className="navbar__signin">Sign In</Link>
        <Link to="/signup" className="navbar__signup">Sign Up</Link>
      </div>
    </nav>
  );
}