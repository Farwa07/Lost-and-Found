import "./Sidebar.css";

import { useEffect, useState } from "react";

import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";

export default function Sidebar({ open }) {
  const [profileImage, setProfileImage] = useState("");
  const [profileName, setProfileName] = useState("John Doe");

  const loadProfileData = () => {
    const savedImage = localStorage.getItem("lostFoundProfileImage");
    const savedProfile = localStorage.getItem("lostFoundProfileData");

    setProfileImage(savedImage || "");

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);

      setProfileName(parsedProfile.fullName || "John Doe");
    } else {
      setProfileName("John Doe");
    }
  };

  useEffect(() => {
    loadProfileData();

    window.addEventListener("profileUpdated", loadProfileData);
    window.addEventListener("storage", loadProfileData);

    return () => {
      window.removeEventListener("profileUpdated", loadProfileData);
      window.removeEventListener("storage", loadProfileData);
    };
  }, []);

  const initials = profileName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className={`sidebar ${open ? "" : "sidebar--closed"}`}>
      <div className="sidebar__links">
        <a href="/" className="sidebar__link sidebar__link--active">
          <FaTachometerAlt />
          Dashboard
        </a>

        <a href="/persons" className="sidebar__link">
          <FaUsers />
          Persons
        </a>

        <a href="/items" className="sidebar__link">
          <FaBoxOpen />
          Items
        </a>

        <a href="/statistics" className="sidebar__link">
          <FaChartBar />
          Statistics
        </a>

        <a href="/notifications" className="sidebar__link">
          <FaBell />
          Notifications
        </a>

        <a href="/reports" className="sidebar__link">
          <FaFileAlt />
          My Reports
        </a>

        <a href="/settings" className="sidebar__link">
          <FaCog />
          Settings
        </a>

        <a href="/profile" className="sidebar__profile">
          <div className="sidebar__avatar">
            {profileImage ? (
              <img src={profileImage} alt="Profile" />
            ) : (
              initials
            )}
          </div>

          <div>
            <h4>{profileName}</h4>

            <p>View Profile</p>
          </div>
        </a>
      </div>
    </aside>
  );
}