import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Home.css";

const featureCards = [
  {
    bg: "rgba(14,165,233,0.12)", stroke: "#1e5f7d",
    title: "Report Missing/Found Persons",
    desc: "Quickly report missing or found persons with detailed information to help community search efforts.",
    icon: <FaUser />,
  },
  {
    bg: "rgba(99,102,241,0.12)", stroke: "#494bc6",
    title: "Report Lost/Found Items",
    desc: "Post lost or found items to help reunite belongings with their rightful owners.",
    icon: <FaBoxOpen />,
  },
  {
    bg: "rgba(168,85,247,0.12)", stroke: "#a855f7",
    title: "Advanced Search",
    desc: "Use our powerful search tools to find cases by location, date and description.",
    icon: <FaSearch />,
  },
];

const reportTypes = [
  { bg: "rgba(14,165,233,0.12)", stroke: "#0c577a", label: "Lost Person", icon: <FaUser /> },
  { bg: "rgba(99,102,241,0.12)", stroke: "#6366f1", label: "Found Person", icon: <FaUser /> },
  { bg: "rgba(168,85,247,0.12)", stroke: "#a855f7", label: "Lost Item", icon: <FaBoxOpen /> },
  { bg: "rgba(236,72,153,0.12)", stroke: "#ec4899", label: "Found Item", icon: <FaBoxOpen /> },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="home">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className="home__body">
        <Sidebar isOpen={sidebarOpen} />

        <main className="home__main">
          {isHome ? (
            <>
              <section className="hero">
                <h1 className="hero__title">Reuniting People &amp; Items</h1>
                <p className="hero__subtitle">
                  A comprehensive platform to report and find lost persons and items.
                  Join our community in making reunions happen.
                </p>
                <div className="hero__buttons">
                  <button className="btn--primary">
                   <FaSearch />
                    Search Cases
                  </button>
                  <button className="btn--outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    Report a Case
                  </button>
                </div>
              </section>

              <div className="feature-cards">
                {featureCards.map(card => (
                  <div key={card.title} className="feature-card">
                    <div className="feature-card__icon" style={{ background: card.bg }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={card.stroke} strokeWidth="2">
                        {card.icon}
                      </svg>
                    </div>
                    <h3 className="feature-card__title">{card.title}</h3>
                    <p className="feature-card__desc">{card.desc}</p>
                  </div>
                ))}
              </div>

              <div className="report-section">
                <h2 className="report-section__title">Report a Case</h2>
                <p className="report-section__sub">Choose what you want to report</p>
                <div className="report-types">
                  {reportTypes.map(rt => (
                    <div key={rt.label} className="report-type-card">
                      <div className="report-type-card__icon" style={{ background: rt.bg }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={rt.stroke} strokeWidth="2">
                          {rt.icon}
                        </svg>
                      </div>
                      <div className="report-type-card__label">{rt.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "24px" }}>
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}