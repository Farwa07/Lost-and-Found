import "./MatchAlertDetails.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ImagePreviewModal from "../components/ImagePreviewModal";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPeopleArrows,
  FaPhoneAlt,
  FaShieldAlt,
  FaUser,
} from "react-icons/fa";

import { API_BASE_URL } from "../api/apiClient";
import { getMatchById } from "../api/matchApi";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

const normalize = (value = "") => String(value || "").trim().toLowerCase();

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const resolveImageUrl = (value = "") => {
  if (!value) return "";

  const path = String(value);

  if (path.startsWith("http") || path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
};

const getReportTitle = (report) => {
  return (
    report.itemName ||
    report.missingPersonName ||
    report.foundPersonName ||
    report.title ||
    "Untitled Report"
  );
};

const getReportImage = (report) => {
  return resolveImageUrl(
    report.lostItemImage ||
      report.foundItemImage ||
      report.missingPersonImage ||
      report.foundPersonImage ||
      report.image ||
      ""
  );
};

const getReportTypeLabel = (report) => {
  if (report.reportType === "found") return "Found";
  if (report.category === "person") return "Missing";
  return "Lost";
};

const getReportDate = (report) => {
  return formatDate(
    report.lostDate || report.foundDate || report.missingPersonLastSeenDate || report.date
  );
};

const getReportLocation = (report) => {
  return (
    report.lostLocation ||
    report.foundLocation ||
    report.missingPersonLastSeenLocation ||
    report.location ||
    "N/A"
  );
};

const getReportDescription = (report) => {
  return (
    report.itemDescription ||
    report.missingPersonDescription ||
    report.foundPersonDescription ||
    report.description ||
    "No description available."
  );
};

const mapBackendReportToUi = (report = {}) => {
  const category = report.category === "person" ? "Person" : "Item";

  return {
    id: report._id || report.id,
    raw: report,
    type: getReportTypeLabel(report),
    category,
    title: getReportTitle(report),
    image: getReportImage(report),
    city: report.city || "N/A",
    date: getReportDate(report),
    location: getReportLocation(report),
    currentLocation: report.currentLocation || "",
    caseStatus: report.caseStatus || "N/A",
    description: getReportDescription(report),
    age: report.missingPersonAge || report.estimatedAge || "",
    gender: report.missingPersonGender || report.foundPersonGender || "",
    itemCategory: report.itemCategory || "",
    color: report.itemColor || "",
    brand: report.itemBrand || "",
    reporterName: report.reporterFullName || "N/A",
    reporterContact: report.reporterContactNumber || "",
    reporterEmail: report.reporterEmail || "",
  };
};

const addDaysDifferenceScore = (lostDate, foundDate) => {
  if (!lostDate || !foundDate || lostDate === "N/A" || foundDate === "N/A") {
    return 0;
  }

  const firstDate = new Date(lostDate);
  const secondDate = new Date(foundDate);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return 0;
  }

  const diff = Math.abs(secondDate - firstDate) / (1000 * 60 * 60 * 24);

  if (diff <= 3) return 15;
  if (diff <= 10) return 10;
  if (diff <= 30) return 6;

  return 0;
};

const getFieldRows = (lostReport, foundReport) => {
  if (!lostReport || !foundReport) {
    return [];
  }

  const rows = [
    {
      label: "Report Category",
      left: lostReport.category || "N/A",
      right: foundReport.category || "N/A",
      matched: normalize(lostReport.category) === normalize(foundReport.category),
    },
    {
      label: "City",
      left: lostReport.city || "N/A",
      right: foundReport.city || "N/A",
      matched: normalize(lostReport.city) === normalize(foundReport.city),
    },
    {
      label: "Location",
      left: lostReport.location || "N/A",
      right: foundReport.location || "N/A",
      matched:
        normalize(lostReport.location).includes(normalize(foundReport.city)) ||
        normalize(foundReport.location).includes(normalize(lostReport.city)) ||
        normalize(lostReport.location) === normalize(foundReport.location),
    },
    {
      label: "Date",
      left: lostReport.date || "N/A",
      right: foundReport.date || "N/A",
      matched: addDaysDifferenceScore(lostReport.date, foundReport.date) >= 10,
    },
  ];

  if (lostReport.category === "Person") {
    rows.push(
      {
        label: "Gender",
        left: lostReport.gender || "N/A",
        right: foundReport.gender || "N/A",
        matched: normalize(lostReport.gender) === normalize(foundReport.gender),
      },
      {
        label: "Age",
        left: lostReport.age || "N/A",
        right: foundReport.age || "N/A",
        matched:
          !Number.isNaN(Math.abs(Number(lostReport.age) - Number(foundReport.age))) &&
          Math.abs(Number(lostReport.age) - Number(foundReport.age)) <= 3,
      }
    );
  }

  if (lostReport.category === "Item") {
    rows.push(
      {
        label: "Item Category",
        left: lostReport.itemCategory || "N/A",
        right: foundReport.itemCategory || "N/A",
        matched: normalize(lostReport.itemCategory) === normalize(foundReport.itemCategory),
      },
      {
        label: "Color",
        left: lostReport.color || "N/A",
        right: foundReport.color || "N/A",
        matched: normalize(lostReport.color) === normalize(foundReport.color),
      },
      {
        label: "Brand",
        left: lostReport.brand || "N/A",
        right: foundReport.brand || "N/A",
        matched: normalize(lostReport.brand) === normalize(foundReport.brand),
      }
    );
  }

  return rows;
};

const normalizeBackendMatch = (backendMatch) => {
  if (!backendMatch) return null;

  const lostReport = mapBackendReportToUi(backendMatch.lostReportId || backendMatch.lostReport);
  const foundReport = mapBackendReportToUi(backendMatch.foundReportId || backendMatch.foundReport);

  return {
    id: backendMatch._id || backendMatch.id,
    matchId: backendMatch._id || backendMatch.id,
    score: backendMatch.score || 0,
    threshold: backendMatch.threshold || 55,
    reasons: backendMatch.reasons || [],
    matchedFields: backendMatch.matchedFields || [],
    lostReport,
    foundReport,
    matchedAt: backendMatch.confirmedAt || backendMatch.matchedAt || backendMatch.updatedAt,
    matchedBy: backendMatch.confirmedBy?.fullName || "Admin",
    decision: "Confirmed",
  };
};

export default function MatchAlertDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [match, setMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getMatchById(matchId);
        setMatch(normalizeBackendMatch(response.match));
      } catch (err) {
        setError(err.message || "Match details could not be loaded.");
        setMatch(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  const rows = useMemo(() => {
    if (!match) return [];
    return getFieldRows(match.lostReport, match.foundReport);
  }, [match]);

  const renderCaseCard = (report, sideTitle) => {
    return (
      <article className="match-alert-case-card">
        <div className="match-alert-case-image">
          {report.image ? (
            <img
              className="clickable-report-image"
              src={report.image}
              alt={report.title}
              title="Click to view full image"
              onClick={() => setPreviewImage({ src: report.image, alt: report.title })}
            />
          ) : (
            <div className="match-alert-empty-image">No Image</div>
          )}

          <span
            className={`match-alert-type ${report.type === "Found" ? "match-alert-type--found" : ""}`}
          >
            {report.type}
          </span>
        </div>

        <div className="match-alert-case-body">
          <p className="match-alert-side-title">{sideTitle}</p>
          <h2>{report.title}</h2>

          <div className="match-alert-meta-grid">
            <span>
              <b>Category:</b> {report.category || "N/A"}
            </span>
            <span>
              <b>City:</b> {report.city || "N/A"}
            </span>
            <span>
              <b>Date:</b> {report.date || "N/A"}
            </span>
            <span>
              <b>Status:</b> {report.caseStatus || "N/A"}
            </span>

            {report.category === "Person" && (
              <>
                <span>
                  <b>Age:</b> {report.age || "N/A"}
                </span>
                <span>
                  <b>Gender:</b> {report.gender || "N/A"}
                </span>
              </>
            )}

            {report.category === "Item" && (
              <>
                <span>
                  <b>Item:</b> {report.itemCategory || "N/A"}
                </span>
                <span>
                  <b>Color:</b> {report.color || "N/A"}
                </span>
                <span>
                  <b>Brand:</b> {report.brand || "N/A"}
                </span>
              </>
            )}
          </div>

          <p className="match-alert-location">
            <FaMapMarkerAlt /> {report.location || "N/A"}
          </p>

          {report.currentLocation && (
            <p className="match-alert-location">
              <FaMapMarkerAlt /> Current: {report.currentLocation}
            </p>
          )}

          <p className="match-alert-description">{report.description}</p>

          <div className="match-alert-contact-box">
            <h3>Reporter Contact</h3>

            <p>
              <FaUser /> {report.reporterName || "N/A"}
            </p>

            <p>
              <FaPhoneAlt /> {report.reporterContact || "N/A"}
            </p>

            <p>
              <FaEnvelope /> {report.reporterEmail || "N/A"}
            </p>

            <div className="match-alert-contact-actions">
              {report.reporterContact && (
                <a href={`tel:${report.reporterContact}`}>
                  <FaPhoneAlt /> Contact Now
                </a>
              )}

              {report.reporterEmail && (
                <a href={`mailto:${report.reporterEmail}`}>
                  <FaEnvelope /> Email
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="match-alert-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="match-alert-container">
        <Sidebar open={sidebarOpen} />

        <main className="match-alert-main">
          {isLoading ? (
            <section className="match-alert-empty">
              <FaPeopleArrows />
              <h1>Loading match comparison...</h1>
              <p>Please wait while match details are loaded from backend.</p>
            </section>
          ) : match ? (
            <>
              <section className="match-alert-hero">
                <button
                  type="button"
                  className="match-alert-back"
                  onClick={() => navigate("/notifications")}
                >
                  <FaArrowLeft /> Back to Notifications
                </button>

                <div className="match-alert-hero-content">
                  <span className="match-alert-kicker">
                    <FaShieldAlt /> Admin Confirmed Match
                  </span>

                  <h1>Matched Reports Comparison</h1>

                  <p>
                    Admin has confirmed this rule-based match. Compare both reports
                    and use the contact details to communicate safely.
                  </p>
                </div>

                <div className="match-alert-score-card">
                  <strong>{match.score}%</strong>
                  <span>Match Score</span>
                </div>
              </section>

              <section className="match-alert-status-card">
                <div>
                  <FaCheckCircle />
                </div>

                <div>
                  <h2>Case Solved by Admin Verification</h2>
                  <p>
                    Both reports are marked as <b>Matched</b> and <b>Solved</b>.
                    You can now contact the related reporter using phone or email.
                  </p>
                </div>

                <span>
                  <FaCalendarAlt />
                  {match.matchedAt ? new Date(match.matchedAt).toLocaleString("en-PK") : "Just now"}
                </span>
              </section>

              <section className="match-alert-comparison-card">
                <div className="match-alert-comparison-grid">
                  {renderCaseCard(
                    match.lostReport,
                    match.lostReport.type === "Missing" ? "Left: Missing Person Case" : "Left: Lost Item Case"
                  )}

                  <div className="match-alert-middle-icon">
                    <FaPeopleArrows />
                    <b>{match.score}%</b>
                    <small>Confirmed</small>
                  </div>

                  {renderCaseCard(
                    match.foundReport,
                    match.foundReport.category === "Person" ? "Right: Found Person Case" : "Right: Found Item Case"
                  )}
                </div>

                <div className="match-alert-reasons">
                  {(match.reasons || []).length > 0 ? (
                    match.reasons.map((reason) => <span key={reason}>{reason}</span>)
                  ) : (
                    <span>Admin confirmed this match after review</span>
                  )}
                </div>
              </section>

              <section className="match-alert-table-card">
                <div className="match-alert-table-heading">
                  <h2>Matched Input Fields</h2>
                  <p>These fields helped the system calculate the match score.</p>
                </div>

                <div className="match-alert-field-table">
                  <div className="match-alert-field-head">
                    <span>Input Field</span>
                    <span>Lost/Missing Case</span>
                    <span>Found Case</span>
                    <span>Result</span>
                  </div>

                  {rows.map((row) => (
                    <div className="match-alert-field-row" key={row.label}>
                      <span>{row.label}</span>
                      <span>{row.left}</span>
                      <span>{row.right}</span>
                      <span
                        className={
                          row.matched
                            ? "match-alert-result match-alert-result--matched"
                            : "match-alert-result match-alert-result--weak"
                        }
                      >
                        {row.matched ? "Matched" : "Weak"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="match-alert-empty">
              <FaPeopleArrows />
              <h1>Match details not found</h1>
              <p>{error || "This match alert could not be opened from backend."}</p>
              <button type="button" onClick={() => navigate("/notifications")}>
                Back to Notifications
              </button>
            </section>
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
