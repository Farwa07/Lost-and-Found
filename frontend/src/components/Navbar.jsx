import "./Navbar.css";

import { FaUser } from "react-icons/fa";
import logo from "../assets/Logo.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const { isRegistered, isLoggedIn, logout } = useAuth();

  const handleAuthButton = () => {
    if (isLoggedIn) {
      logout();
      navigate("/");
      return;
    }

    if (isRegistered) {
      navigate("/login");
      return;
    }

    navigate("/signup");
  };

  const getAuthButtonText = () => {
    if (isLoggedIn) return "Logout";
    if (isRegistered) return "Login";
    return "Sign Up";
  };

  const getLinkClass = ({ isActive }) =>
    `navbar__link ${isActive ? "navbar__link--active" : ""}`;

  return (
    <header className="navbar">
      {isLoggedIn && (
        <button
          type="button"
          className="navbar__menu"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
      )}

      <Link to="/" className="navbar__brand">
        <div className="navbar__logo">
          <img src={logo} alt="Lost & Found logo" />
        </div>

        <h2>Lost & Found</h2>
      </Link>

      <nav className="navbar__links">
        <NavLink to="/" end className={getLinkClass}>
          Home
        </NavLink>

        <NavLink to="/persons" className={getLinkClass}>
          Persons
        </NavLink>

        <NavLink to="/items" className={getLinkClass}>
          Items
        </NavLink>

        <NavLink to="/statistics" className={getLinkClass}>
          Statistics
        </NavLink>

        <NavLink to="/contact" className={getLinkClass}>
          Contact
        </NavLink>
      </nav>

      <div className="navbar__right">
        <button
          type="button"
          className="navbar__signup"
          onClick={handleAuthButton}
        >
          <FaUser />
          <span>{getAuthButtonText()}</span>
        </button>
      </div>
    </header>
  );
}