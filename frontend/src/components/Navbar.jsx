import "./Navbar.css";

import { FaArrowLeft, FaBars, FaTimes, FaUser } from "react-icons/fa";
import logo from "../assets/Logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useSmartBack from "../hooks/useSmartBack";
import { useAuth } from "../context/AuthContext";
import { toggleSidebar, useIsMobile, useSidebarOpen } from "../utils/sidebarStore";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/persons", label: "Persons" },
  { to: "/items", label: "Items" },
  { to: "/statistics", label: "Statistics" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { isRegistered, isLoggedIn, logout } = useAuth();
  const sidebarOpen = useSidebarOpen();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const goBack = useSmartBack("/");

  const handleAuthButton = () => {
    if (isLoggedIn) {
      logout();
      navigate("/");
      return;
    }

    navigate(isRegistered ? "/login" : "/signup");
  };

  const getAuthButtonText = () => {
    if (isLoggedIn) return "Logout";
    if (isRegistered) return "Login";
    return "Sign Up";
  };

  const getLinkClass = ({ isActive }) =>
    `navbar__link ${isActive ? "navbar__link--active" : ""}`;

  // Logged-in users always get the sidebar toggle; guests only need it on
  // mobile, where the top links are hidden and live in the drawer instead.
  const showMenuButton = isLoggedIn || isMobile;

  return (
    <header className="navbar">
      {showMenuButton && (
        <button
          type="button"
          className="navbar__menu"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          {sidebarOpen && isMobile ? <FaTimes /> : <FaBars />}
        </button>
      )}

      {pathname !== "/" && (
        <button type="button" className="navbar__back" onClick={goBack} aria-label="Go back" title="Back">
          <FaArrowLeft aria-hidden="true" />
        </button>
      )}

      <Link to="/" className="navbar__brand" aria-label="Lost & Found home">
        <div className="navbar__logo">
          <img src={logo} alt="" width="42" height="42" />
        </div>

        <span className="navbar__title">Lost & Found</span>
      </Link>

      <nav className="navbar__links" aria-label="Main navigation">
        {PUBLIC_LINKS.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={getLinkClass}>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar__right">
        <button type="button" className="navbar__signup" onClick={handleAuthButton}>
          <FaUser aria-hidden="true" />
          <span>{getAuthButtonText()}</span>
        </button>
      </div>
    </header>
  );
}
