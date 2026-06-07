import "./Sidebar.css";

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaCog,
  FaUserShield,
} from "react-icons/fa";

export default function Sidebar({ open }) {
  const { isLoggedIn, isAdmin, currentUser } = useAuth();

  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState(
    currentUser?.fullName || "John Doe"
  );

  const loadProfileData = () => {
    const savedImage = localStorage.getItem("lostFoundProfileImage");
    const savedProfile = localStorage.getItem("lostFoundProfileData");
    const savedCurrentUser = localStorage.getItem("lostFoundCurrentUser");

    setProfileImage(savedImage || "");

    try {
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);

        setProfileName(
          parsedProfile.fullName ||
            parsedProfile.name ||
            currentUser?.fullName ||
            "John Doe"
        );

        return;
      }

      if (savedCurrentUser) {
        const parsedUser = JSON.parse(savedCurrentUser);

        setProfileName(
          parsedUser.fullName ||
            parsedUser.name ||
            currentUser?.fullName ||
            "John Doe"
        );

        return;
      }

      setProfileName(currentUser?.fullName || "John Doe");
    } catch {
      setProfileName(currentUser?.fullName || "John Doe");
    }
  };

  useEffect(() => {
    loadProfileData();

    window.addEventListener("profileUpdated", loadProfileData);
    window.addEventListener("storage", loadProfileData);
    window.addEventListener("authChanged", loadProfileData);

    return () => {
      window.removeEventListener("profileUpdated", loadProfileData);
      window.removeEventListener("storage", loadProfileData);
      window.removeEventListener("authChanged", loadProfileData);
    };
  }, [currentUser]);

  if (!isLoggedIn) {
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
    <aside className={`sidebar ${open ? "" : "sidebar--closed"}`}>
      <div className="sidebar__links">
        <NavLink to="/" end className={getLinkClass}>
          <FaTachometerAlt />
          Dashboard
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin-panel" className={getLinkClass}>
            <FaUserShield />
            Admin Panel
          </NavLink>
        )}

        <NavLink to="/persons" className={getLinkClass}>
          <FaUsers />
          Persons
        </NavLink>

        <NavLink to="/items" className={getLinkClass}>
          <FaBoxOpen />
          Items
        </NavLink>

        <NavLink to="/statistics" className={getLinkClass}>
          <FaChartBar />
          Statistics
        </NavLink>

        <NavLink to="/notifications" className={getLinkClass}>
          <FaBell />
          Notifications
        </NavLink>

        <NavLink to="/reports" className={getLinkClass}>
          <FaFileAlt />
          My Reports
        </NavLink>

        <NavLink to="/settings" className={getLinkClass}>
          <FaCog />
          Settings
        </NavLink>

        <NavLink to="/profile" className="sidebar__profile">
          <div className="sidebar__avatar">
            {profileImage ? <img src={profileImage} alt="Profile" /> : initials}
          </div>

          <div>
            <h4>{profileName}</h4>
            <p>View Profile</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}