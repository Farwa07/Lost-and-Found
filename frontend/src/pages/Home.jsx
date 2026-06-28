import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";
import CommentsButton from "../components/CommentsButton";
import ReportPostButton from "../components/ReportPostButton";
import ImagePreviewModal from "../components/ImagePreviewModal";

import {
  FaSearch,
  FaUsers,
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPhoneAlt,
  FaTimes,
  FaEye,
  FaShareAlt,
} from "react-icons/fa";

import "./Home.css";
import { getPublicReports } from "../api/reportApi";
import { getFallbackReportImage, normalizePublicReport } from "../utils/reportMapper";

const handleHomeReportImageError = (event, category = "Item") => {
  const fallbackImage = getFallbackReportImage(category);

  if (event.currentTarget.src !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
};

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [homeReports, setHomeReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadRecentReports = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getPublicReports({ limit: 9 });

        if (ignore) return;

        setHomeReports((response?.reports || []).map(normalizePublicReport));
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load recent reports.");
          setHomeReports([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadRecentReports();

    return () => {
      ignore = true;
    };
  }, []);

  const handleShare = (report) => {
    const title = report.title || report.name || report.itemName || "Report";

    const location =
      report.location ||
      report.lastSeenLocation ||
      report.foundLocation ||
      "N/A";

    const contact =
      report.reporterContact ||
      report.reporterContactNumber ||
      "N/A";

    const text = `${report.type} ${report.category}: ${title}, Location: ${location}, Contact: ${contact}`;

    navigator.clipboard.writeText(text);

    alert("Report details copied for sharing!");
  };

  return (
    <div className="home">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="home__container">
        <Sidebar open={sidebarOpen} />

        <main className="home__main">
          <HeroSection />

          <section className="features">
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Report Missing or Found Persons</h3>
              <p>
                Quickly report missing or found persons with complete details and images.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaBoxOpen />
              </div>
              <h3>Lost & Found Items</h3>
              <p>
                Post lost or found items and help people recover their belongings.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaSearch />
              </div>
              <h3>Search & Filter Cases</h3>
              <p>
                Search reports by name, item, city, category and case type.
              </p>
            </div>
          </section>

          <section className="report-section">
            <h2 className="section-title">Report a Case</h2>
            <p className="section-subtitle">Choose what you want to report</p>

            <div className="report-grid">
              <button
                className="report-card"
                onClick={() => navigate("/report-missing-person")}
              >
                <div className="report-card__icon">
                  <FaUser />
                </div>
                <h3>Missing Person</h3>
              </button>

              <button
                className="report-card"
                onClick={() => navigate("/report-found-person")}
              >
                <div className="report-card__icon">
                  <FaUser />
                </div>
                <h3>Found Person</h3>
              </button>

              <button
                className="report-card"
                onClick={() => navigate("/report-lost-item")}
              >
                <div className="report-card__icon">
                  <FaBoxOpen />
                </div>
                <h3>Lost Item</h3>
              </button>

              <button
                className="report-card"
                onClick={() => navigate("/report-found-item")}
              >
                <div className="report-card__icon">
                  <FaBoxOpen />
                </div>
                <h3>Found Item</h3>
              </button>
            </div>
          </section>

          <section className="recent-reports">
            <div className="recent-header">
              <div>
                <h2 className="section-title">Recent Cases</h2>
                <p className="section-subtitle">
                  Latest missing, lost and found reports
                </p>
              </div>

              <div className="recent-header-buttons">
                <button onClick={() => navigate("/persons")}>View Persons</button>
                <button onClick={() => navigate("/items")}>View Items</button>
              </div>
            </div>

            {isLoading && <div className="empty-box"><h3>Loading recent cases...</h3></div>}
            {error && !isLoading && <div className="empty-box"><h3>{error}</h3></div>}

            <div className="recent-grid">
              {homeReports.map((report) => (
                <div key={report.viewId} className="recent-card">
                  <div
                    className={`case-tag ${
                      report.type === "Found"
                        ? "case-tag--found"
                        : "case-tag--missing"
                    }`}
                  >
                    {report.type}
                  </div>

                  <img
                    className="clickable-report-image"
                    src={report.image}
                    alt={report.title}
                    title="Click to view full image"
                    onClick={() => setPreviewImage({ src: report.image, alt: report.title })}
                    onError={(event) =>
                      handleHomeReportImageError(event, report.category)
                    }
                  />

                  <div className="recent-card__content">
                    <span className="case-category">{report.category}</span>

                    <h3>{report.title}</h3>

                    <p>
                      <FaMapMarkerAlt /> {report.location || report.city}
                    </p>

                    <p>
                      <FaCalendarAlt /> {report.date || "N/A"}
                    </p>

                    <div className="recent-card__actions">
                      <button
                        className="recent-view-btn"
                        onClick={() => setSelectedReport(report)}
                      >
                        <FaEye />
                        View Details
                      </button>

                      <CommentsButton
  reportId={report.id}
  reportTitle={report.title}
  initialComments={report.comments || []}
  currentUser="User"
/>

                      <ReportPostButton report={report} />

                      <button
                        className="recent-share-btn"
                        onClick={() => handleShare(report)}
                      >
                        <FaShareAlt />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {selectedReport && (
            <div
              className="home-modal-overlay"
              onClick={() => setSelectedReport(null)}
            >
              <div
                className="home-details-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="home-modal-close"
                  onClick={() => setSelectedReport(null)}
                >
                  <FaTimes />
                </button>

                <img
                  className="clickable-report-image"
                  src={selectedReport.image}
                  alt={selectedReport.title}
                  title="Click to view full image"
                  onClick={() => setPreviewImage({ src: selectedReport.image, alt: selectedReport.title })}
                  onError={(event) =>
                    handleHomeReportImageError(event, selectedReport.category)
                  }
                />

                <span
                  className={`detail-status ${
                    selectedReport.type === "Found"
                      ? "case-tag--found"
                      : "case-tag--missing"
                  }`}
                >
                  {selectedReport.type}
                </span>

                <h2>{selectedReport.title}</h2>

                <div className="home-detail-grid">
                  <p>
                    <b>Case Type:</b> {selectedReport.type}
                  </p>

                  <p>
                    <b>Category:</b> {selectedReport.category}
                  </p>

                  {selectedReport.age && (
                    <p>
                      <b>Age:</b> {selectedReport.age}
                    </p>
                  )}

                  {selectedReport.gender && (
                    <p>
                      <b>Gender:</b> {selectedReport.gender}
                    </p>
                  )}

                  {selectedReport.city && (
                    <p>
                      <b>City:</b> {selectedReport.city}
                    </p>
                  )}

                  <p>
                    <b>Date:</b> {selectedReport.date || "N/A"}
                  </p>

                  <p>
                    <b>Case Status:</b>{" "}
                    {selectedReport.caseStatus || "Unsolved"}
                  </p>
                </div>

                {selectedReport.itemCategory && (
                  <p>
                    <b>Item Category:</b> {selectedReport.itemCategory}
                  </p>
                )}

                {selectedReport.brand && (
                  <p>
                    <b>Brand:</b> {selectedReport.brand}
                  </p>
                )}

                {selectedReport.color && (
                  <p>
                    <b>Color:</b> {selectedReport.color}
                  </p>
                )}

                <p>
                  <b>Location:</b> {selectedReport.location || "N/A"}
                </p>

                {selectedReport.currentLocation && (
                  <p>
                    <b>Current Location:</b> {selectedReport.currentLocation}
                  </p>
                )}

                <p>
                  <b>Description:</b> {selectedReport.description}
                </p>

                <hr />

                <h3>Reporter Details</h3>

                <p>
                  <b>Reporter Name:</b> {selectedReport.reporterName}
                </p>

                {selectedReport.relation && (
                  <p>
                    <b>Relation:</b> {selectedReport.relation}
                  </p>
                )}

                {selectedReport.reporterAddress && (
                  <p>
                    <b>Address:</b> {selectedReport.reporterAddress}
                  </p>
                )}

                {selectedReport.reporterEmail && (
                  <p>
                    <b>Email:</b> {selectedReport.reporterEmail}
                  </p>
                )}

                <p>
                  <b>Contact Number:</b>{" "}
                  {selectedReport.reporterContact || "N/A"}
                </p>

                {selectedReport.reporterContact && (
                  <a
                    href={`tel:${selectedReport.reporterContact}`}
                    className="call-btn"
                  >
                    <FaPhoneAlt /> Contact Now
                  </a>
                )}
              </div>
            </div>
          )}

          <ImagePreviewModal
            image={previewImage?.src}
            alt={previewImage?.alt}
            onClose={() => setPreviewImage(null)}
          />

          <Footer />
        </main>
      </div>
    </div>
  );
}