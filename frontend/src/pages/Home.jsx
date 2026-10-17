import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";
import ReportCard, { ReportCardSkeleton } from "../components/ReportCard";
import { FaSearch, FaUsers, FaBoxOpen, FaUser, FaBell, FaArrowRight } from "react-icons/fa";

import "./Home.css";
import { getPublicReports } from "../api/reportApi";
import useCachedRequest from "../hooks/useCachedRequest";
import { normalizePublicReport } from "../utils/reportMapper";

const FEATURES = [
  {
    icon: FaUsers,
    title: "Report missing or found persons",
    text: "Share a photo, last seen location and contact details so people nearby can help.",
  },
  {
    icon: FaBoxOpen,
    title: "Recover lost belongings",
    text: "Post lost or found phones, wallets, documents and more in a couple of minutes.",
  },
  {
    icon: FaBell,
    title: "Get notified about matches",
    text: "Similar lost and found reports are matched and both reporters are alerted.",
  },
];

const REPORT_TYPES = [
  { to: "/report-missing-person", label: "Missing Person", hint: "Someone you know is missing", icon: FaUser, tone: "lost" },
  { to: "/report-found-person", label: "Found Person", hint: "You found someone who is lost", icon: FaUser, tone: "found" },
  { to: "/report-lost-item", label: "Lost Item", hint: "You lost something", icon: FaBoxOpen, tone: "lost" },
  { to: "/report-found-item", label: "Found Item", hint: "You found something", icon: FaSearch, tone: "found" },
];

export default function Home() {
  const { data, error, isLoading } = useCachedRequest("home:recent", () =>
    getPublicReports({ limit: 8 })
  );
  const homeReports = (data?.reports || []).map(normalizePublicReport);

  return (
    <div className="home">
      <Navbar />

      <div className="home__container">
        <Sidebar />

        <main className="home__main">
          <HeroSection />

          <section className="home-section home-features" aria-label="How Lost & Found helps">
            {FEATURES.map((feature) => (
              <div className="home-feature" key={feature.title}>
                <div className="home-feature__icon">
                  <feature.icon aria-hidden="true" />
                </div>
                <h2>{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            ))}
          </section>

          <section className="home-section" aria-labelledby="report-heading">
            <h2 id="report-heading" className="home-title">
              Report a Case
            </h2>
            <p className="home-subtitle">Choose what you want to report</p>

            <div className="home-report-types">
              {REPORT_TYPES.map((type) => (
                <Link key={type.to} to={type.to} className={`home-report-type is-${type.tone}`}>
                  <span className="home-report-type__icon">
                    <type.icon aria-hidden="true" />
                  </span>
                  <span className="home-report-type__label">{type.label}</span>
                  <span className="home-report-type__hint">{type.hint}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="home-section" aria-labelledby="recent-heading">
            <div className="home-recent__header">
              <div>
                <h2 id="recent-heading" className="home-title">
                  Recent Cases
                </h2>
                <p className="home-subtitle">Latest missing, lost and found reports</p>
              </div>

              <div className="home-recent__links">
                <Link to="/persons">
                  All Persons <FaArrowRight aria-hidden="true" />
                </Link>
                <Link to="/items">
                  All Items <FaArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="report-grid">
              {isLoading &&
                Array.from({ length: 6 }, (_, index) => <ReportCardSkeleton key={index} />)}

              {!isLoading && error && (
                <div className="report-empty" role="alert">
                  <h3>Could not load recent cases</h3>
                  <p>{error}</p>
                </div>
              )}

              {!isLoading && !error && homeReports.length === 0 && (
                <div className="report-empty">
                  <h3>No cases yet</h3>
                  <p>Be the first to report a missing person or a lost item.</p>
                </div>
              )}

              {!isLoading &&
                !error &&
                homeReports.map((report) => <ReportCard key={report.id} report={report} />)}
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
