import "./Navbar.css";

import { FaUser } from "react-icons/fa";
import logo from "../assets/Logo.png";
import { Link, useNavigate } from "react-router-dom";
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
    if (isLoggedIn) {
      return "Logout";
    }

    if (isRegistered) {
      return "Login";
    }

    return "Sign Up";
  };

  return (
    <header className="navbar">
      {isLoggedIn && (
        <button className="navbar__menu" onClick={toggleSidebar}>
          ☰
        </button>
      )}

      <Link to="/" className="navbar__brand">
        <div className="navbar__logo">
          <img src={logo} alt="logo" />
        </div>

        <h2>Lost & Found</h2>
      </Link>

      <nav className="navbar__links">
        <a href="/">Home</a>
        <a href="/persons">Persons</a>
        <a href="/items">Items</a>
        <a href="/statistics">Statistics</a>
        <a href="/contact">Contact</a>
      </nav>

      <div className="navbar__right">
        <button className="navbar__signup" onClick={handleAuthButton}>
          <FaUser />
          {getAuthButtonText()}
        </button>
      </div>
    </header>
  );
}