import "./Sidebar.css";
import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaBell,
  FaFileAlt,
  FaCog,
  FaUserCircle,
  FaPlus
} from "react-icons/fa";

export default function Sidebar({ open }) {

  return (

    <aside className={`sidebar ${open ? "" : "sidebar--closed"}`}>

      <button className="sidebar__btn">
        + New Report
      </button>

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

      </div>

      <div className="sidebar__bottom">

        <a href="/settings" className="sidebar__link">
          <FaCog />
          Settings
        </a>

        <div className="sidebar__profile">

          <div className="sidebar__avatar">
            JD
          </div>

          <div>

            <h4>
              John Doe
            </h4>

            <p>
              View Profile
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}