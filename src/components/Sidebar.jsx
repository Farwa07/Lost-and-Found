import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const menuItems = [
  {
    label: "Dashboard", path: "/",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  },
  {
    label: "Persons", path: "/persons", dot: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  },
  {
    label: "Items", path: "/items", dot: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  },
  {
    label: "Statistics", path: "/statistics",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    label: "Notifications", path: "/notifications", dot: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    label: "My Reports", path: "/reports",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  },
];

const bottomItems = [
  {
    label: "Settings", path: "/settings",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  },
];

export default function Sidebar({ isOpen }) {
  const location = useLocation();

  return (
    <div className={`sidebar ${!isOpen ? "sidebar--closed" : ""}`}>
      <div className="sidebar__inner">

        <Link to="/reports/new" className="sidebar__new-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Report
        </Link>

        <div className="sidebar__group">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar__item ${location.pathname === item.path ? "sidebar__item--active" : ""}`}
            >
              {item.icon}
              {item.label}
              {item.dot && <span className="sidebar__dot" />}
            </Link>
          ))}
        </div>

        <div className="sidebar__divider" />

        <div className="sidebar__group">
          {bottomItems.map(item => (
            <Link key={item.path} to={item.path} className="sidebar__item">
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sidebar__avatar">
          <div className="sidebar__avatar-circle">JD</div>
          <div>
            <div className="sidebar__avatar-name">John Doe</div>
            <div className="sidebar__avatar-role">View Profile</div>
          </div>
        </div>

      </div>
    </div>
  );
}