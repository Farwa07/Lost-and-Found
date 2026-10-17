import "./Sidebar.css";

import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotificationSummary } from "../api/notificationApi";
import { resolveMediaUrl } from "../utils/mediaUrl";
import {
  closeSidebarOnMobile,
  setSidebarOpen,
  useIsMobile,
  useSidebarOpen,
} from "../utils/sidebarStore";

import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaCog,
  FaUserShield,
  FaEnvelope,
  FaHome,
} from "react-icons/fa";

const GUEST_LINKS = [
  { to: "/", label: "Home", icon: FaHome, end: true },
  { to: "/persons", label: "Persons", icon: FaUsers },
  { to: "/items", label: "Items", icon: FaBoxOpen },
  { to: "/statistics", label: "Statistics", icon: FaChartBar },
  { to: "/contact", label: "Contact", icon: FaEnvelope },
];

export default function Sidebar() {
  const { isLoggedIn, isAdmin, currentUser } = useAuth();
  const location = useLocation();
  const open = useSidebarOpen();
  const isMobile = useIsMobile();

  const profileImage = resolveMediaUrl(currentUser?.profileImage || "");
  const profileName = currentUser?.fullName || currentUser?.name || "User";
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const loadNotificationBadge = useCallback(async () => {
    if (!isLoggedIn) {
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const response = await getNotificationSummary();
      const summary = response?.summary || response?.counts || {};
      const unreadCount = Number(summary?.unread ?? response?.unread ?? 0);
      setUnreadNotificationCount(Number.isFinite(unreadCount) ? unreadCount : 0);
    } catch {
      setUnreadNotificationCount(0);
    }
  }, [isLoggedIn]);

  // Close the mobile drawer after navigating.
  useEffect(() => {
    closeSidebarOnMobile();
  }, [location.pathname]);

  useEffect(() => {
    loadNotificationBadge();
  }, [loadNotificationBadge, location.pathname]);

  useEffect(() => {
    if (!isLoggedIn) {
      return undefined;
    }

    const handleNotificationUpdate = () => {
      loadNotificationBadge();
    };

    window.addEventListener("lostFoundNotificationsUpdated", handleNotificationUpdate);
    window.addEventListener("focus", handleNotificationUpdate);

    const intervalId = window.setInterval(handleNotificationUpdate, 30000);

    return () => {
      window.removeEventListener("lostFoundNotificationsUpdated", handleNotificationUpdate);
      window.removeEventListener("focus", handleNotificationUpdate);
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, loadNotificationBadge]);

  // Mobile drawer: close with Escape and stop the page behind from scrolling.
  useEffect(() => {
    if (!isMobile || !open) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isMobile, open]);

  // Guests use the top navbar links on desktop; the drawer is mobile only.
  if (!isLoggedIn && !isMobile) {
    return null;
  }

  const initials = profileName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getLinkClass = ({ isActive }) =>
    `sidebar__link ${isActive ? "sidebar__link--active" : ""}`;

  return (
    <>
      {isMobile && open && (
        <div
          className="sidebar__backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`sidebar ${open ? "" : "sidebar--closed"}`}
        aria-label="Sidebar navigation"
        aria-hidden={!open}
        inert={!open}
      >
        <nav className="sidebar__links">
          {!isLoggedIn &&
            GUEST_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={getLinkClass}>
                <link.icon aria-hidden="true" />
                {link.label}
              </NavLink>
            ))}

          {isLoggedIn && (
            <>
              <NavLink to="/" end className={getLinkClass}>
                <FaTachometerAlt aria-hidden="true" />
                Dashboard
              </NavLink>

              {isAdmin && (
                <NavLink to="/admin-panel" className={getLinkClass}>
                  <FaUserShield aria-hidden="true" />
                  Admin Panel
                </NavLink>
              )}

              <NavLink to="/persons" className={getLinkClass}>
                <FaUsers aria-hidden="true" />
                Persons
              </NavLink>

              <NavLink to="/items" className={getLinkClass}>
                <FaBoxOpen aria-hidden="true" />
                Items
              </NavLink>

              <NavLink to="/statistics" className={getLinkClass}>
                <FaChartBar aria-hidden="true" />
                Statistics
              </NavLink>

              <NavLink to="/notifications" className={getLinkClass}>
                <FaBell aria-hidden="true" />
                <span className="sidebar__link-text">Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span
                    className="sidebar__notification-badge"
                    aria-label={`${unreadNotificationCount} unread notifications`}
                    title={`${unreadNotificationCount} unread notifications`}
                  >
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/reports" className={getLinkClass}>
                <FaFileAlt aria-hidden="true" />
                My Reports
              </NavLink>

              <NavLink to="/settings" className={getLinkClass}>
                <FaCog aria-hidden="true" />
                Settings
              </NavLink>

              {isMobile && (
                <NavLink to="/contact" className={getLinkClass}>
                  <FaEnvelope aria-hidden="true" />
                  Contact
                </NavLink>
              )}

              <NavLink to="/profile" className="sidebar__profile">
                <div className="sidebar__avatar">
                  {profileImage ? <img src={profileImage} alt="" /> : initials}
                </div>

                <div className="sidebar__profile-info">
                  <h4>{profileName}</h4>
                  <p>View Profile</p>
                </div>
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
