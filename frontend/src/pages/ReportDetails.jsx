import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCopy,
  FaCalendarAlt,
  FaEnvelope,
  FaExpand,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShareAlt,
  FaWhatsapp,
} from "react-icons/fa";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CommentsButton from "../components/CommentsButton";
import ReportPostButton from "../components/ReportPostButton";
import ImagePreviewModal from "../components/ImagePreviewModal";
import AdminReviewPanel from "../components/AdminReviewPanel";
import { useAuth } from "../context/AuthContext";
import { getReportById } from "../api/reportApi";
import {
  getFallbackReportImage,
  normalizeItemReport,
  normalizePersonReport,
} from "../utils/reportMapper";
import { formatDisplayDate, getReportPath, shareReport } from "../utils/reportLinks";
import { toast } from "../utils/notify";
import "./ReportDetails.css";
import BackButton from "../components/BackButton";

const STATUS_NOTICES = {
  pending: "This report is waiting for admin review. Only you and the admins can see it for now.",
  rejected: "This report was rejected by an admin and is not visible to the public.",
};

const toWhatsAppNumber = (phone = "") => String(phone).replace(/\D/g, "");

// Phones open the dialer for tel: links; desktop browsers instead ask to open
// an app (e.g. Windows "Phone Link"), so on desktop we copy the number.
const canPlaceCalls = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const copyText = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied: ${text}`);
  } catch {
    toast.error(`Unable to copy the ${label.toLowerCase()}.`);
  }
};

// Opens a Gmail draft in a new tab. mailto: links do nothing on computers
// without a mail app configured, which is the common case.
const getEmailComposeUrl = (email, subject) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;

const buildFacts = (report) => {
  const isItem = report.reportCategory === "Item";
  const isFound = report.type === "Found";

  const facts = isItem
    ? [
        ["Category", report.itemCategory],
        ["Brand", report.brand],
        ["Color", report.color],
        [isFound ? "Found on" : "Lost on", formatDisplayDate(report.date)],
        [isFound ? "Found at" : "Lost at", report.location],
        ["Currently kept at", report.currentLocation],
      ]
    : [
        ["Age", report.age && report.age !== "N/A" ? `${report.age} years` : ""],
        ["Gender", report.gender],
        [isFound ? "Found on" : "Last seen on", formatDisplayDate(report.date)],
        [
          isFound ? "Found at" : "Last seen at",
          isFound ? report.foundLocation || report.location : report.lastSeenLocation || report.location,
        ],
        ["Currently at", report.currentLocation],
      ];

  return [
    ...facts,
    ["City", report.city !== "Unknown" ? report.city : ""],
    ["Case status", report.caseStatus],
    ["Reported on", formatDisplayDate(report.createdAt)],
  ].filter(([, value]) => value);
};

export default function ReportDetails({ kind }) {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [rawReport, setRawReport] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { isAdmin } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadReport = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await getReportById(id);
        if (ignore) return;

        const data = response?.report || {};
        const normalize =
          String(data.category).toLowerCase() === "item" ? normalizeItemReport : normalizePersonReport;
        setRawReport(data);
        setReport(normalize(data));
      } catch (err) {
        if (ignore) return;
        setReport(null);
        setRawReport(null);
        setError(
          err.status === 404 || err.status === 400
            ? "This report does not exist or is no longer public."
            : err.message || "Unable to load this report."
        );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadReport();

    return () => {
      ignore = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    if (!report) return undefined;

    const previousTitle = document.title;
    const place = report.city && report.city !== "Unknown" ? ` in ${report.city}` : "";
    document.title = `${report.type} ${report.reportCategory === "Item" ? "item" : "person"}: ${report.title}${place} | Lost & Found`;

    return () => {
      document.title = previousTitle;
    };
  }, [report]);

  const listPath = kind === "item" ? "/items" : "/persons";
  const listLabel = kind === "item" ? "Items" : "Persons";
  // Pages that link here (e.g. the admin panel) can pass where "Back" should go.
  const backTo = location.state?.backTo || listPath;
  const backLabel = location.state?.backLabel || `Back to ${listLabel}`;
  const rawStatus = String(rawReport?.status || "").toLowerCase();

  // /items/:id opened for a person report (or the other way round).
  if (report && getReportPath(report) !== location.pathname) {
    return <Navigate to={getReportPath(report)} state={location.state} replace />;
  }

  const facts = report ? buildFacts(report) : [];
  const phone = report?.reporterContactNumber || report?.reporterContact || "";
  const imageIsFallback =
    report && report.image === getFallbackReportImage(report.reportCategory);

  return (
    <div className="rdetails-page">
      <Navbar />

      <div className="rdetails-layout">
        <Sidebar />

        <main className="rdetails-main">
          <BackButton fallback={backTo} label={backLabel} className="rdetails-back" />

          {isLoading && !report && (
            <div className="rdetails-card rdetails-skeleton" aria-busy="true" aria-label="Loading report">
              <div className="rdetails-skeleton__image" />
              <div className="rdetails-skeleton__lines">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="rdetails-card rdetails-empty">
              <h1>Report not found</h1>
              <p>{error}</p>
              <Link to={listPath} className="rdetails-btn rdetails-btn--primary">
                Browse {listLabel}
              </Link>
            </div>
          )}

          {report && (
            <>
              {isAdmin && rawReport && (
                <AdminReviewPanel report={rawReport} onChanged={() => setReloadKey((key) => key + 1)} />
              )}

              {!isAdmin && STATUS_NOTICES[rawStatus] && (
                <p className={`rdetails-notice is-${rawStatus}`} role="status">
                  {STATUS_NOTICES[rawStatus]}
                </p>
              )}

              <article className="rdetails-card rdetails-grid">
                <div className="rdetails-media">
                  <button
                    type="button"
                    className="rdetails-media__button"
                    onClick={() => setShowPreview(true)}
                    disabled={imageIsFallback}
                    aria-label="View full image"
                  >
                    <img
                      src={report.image}
                      alt={report.title}
                      onError={(event) => {
                        const fallback = getFallbackReportImage(report.reportCategory);
                        if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
                      }}
                    />
                    {!imageIsFallback && (
                      <span className="rdetails-media__hint">
                        <FaExpand aria-hidden="true" /> Full image
                      </span>
                    )}
                  </button>
                </div>

                <div className="rdetails-info">
                  <div className="rdetails-badges">
                    <span className={`rdetails-badge is-${report.type.toLowerCase()}`}>
                      {report.type} {report.reportCategory === "Item" ? "Item" : "Person"}
                    </span>
                    {report.caseStatus === "Solved" && (
                      <span className="rdetails-badge is-solved">Solved</span>
                    )}
                  </div>

                  <h1>{report.title}</h1>

                  <p className="rdetails-summary">
                    {report.location && (
                      <span>
                        <FaMapMarkerAlt aria-hidden="true" /> {report.location}
                      </span>
                    )}
                    {report.date && (
                      <span>
                        <FaCalendarAlt aria-hidden="true" /> {formatDisplayDate(report.date)}
                      </span>
                    )}
                  </p>

                  <dl className="rdetails-facts">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {report.description && (
                    <section className="rdetails-section">
                      <h2>Description</h2>
                      <p className="rdetails-description">{report.description}</p>
                    </section>
                  )}

                  <div className="rdetails-actions">
                    <button
                      type="button"
                      className="rdetails-btn rdetails-btn--ghost"
                      onClick={() => shareReport(report)}
                    >
                      <FaShareAlt aria-hidden="true" /> Share
                    </button>
                    <CommentsButton reportId={report.id} reportTitle={report.title} />
                    <ReportPostButton report={report} />
                  </div>
                </div>
              </article>

              <section className="rdetails-card rdetails-contact" aria-labelledby="contact-heading">
                <div>
                  <h2 id="contact-heading">Contact the reporter</h2>
                  <p className="rdetails-contact__lead">
                    If you have information about this case, reach out directly. Never pay anyone in
                    advance for returning an item or person.
                  </p>

                  <dl className="rdetails-facts rdetails-facts--compact">
                    <div>
                      <dt>Name</dt>
                      <dd>{report.reporterFullName}</dd>
                    </div>
                    {report.reporterRelationship && (
                      <div>
                        <dt>Relationship</dt>
                        <dd>{report.reporterRelationship}</dd>
                      </div>
                    )}
                    {report.reporterCity && (
                      <div>
                        <dt>City</dt>
                        <dd>{report.reporterCity}</dd>
                      </div>
                    )}
                    {phone && (
                      <div>
                        <dt>Phone</dt>
                        <dd className="rdetails-copyable">
                          <span>{phone}</span>
                          <button type="button" onClick={() => copyText(phone, "Phone number")} aria-label="Copy phone number" title="Copy">
                            <FaCopy aria-hidden="true" />
                          </button>
                        </dd>
                      </div>
                    )}
                    {report.reporterEmail && (
                      <div>
                        <dt>Email</dt>
                        <dd className="rdetails-copyable">
                          <span>{report.reporterEmail}</span>
                          <button type="button" onClick={() => copyText(report.reporterEmail, "Email")} aria-label="Copy email" title="Copy">
                            <FaCopy aria-hidden="true" />
                          </button>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="rdetails-contact__buttons">
                  {phone &&
                    (canPlaceCalls() ? (
                      <a href={`tel:${phone}`} className="rdetails-btn rdetails-btn--primary">
                        <FaPhoneAlt aria-hidden="true" /> Call
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="rdetails-btn rdetails-btn--primary"
                        onClick={() => copyText(phone, "Phone number")}
                      >
                        <FaPhoneAlt aria-hidden="true" /> Copy Number
                      </button>
                    ))}
                  {phone && (
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(
                        `Hi, I am contacting you about "${report.title}" on Lost & Found.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rdetails-btn rdetails-btn--whatsapp"
                    >
                      <FaWhatsapp aria-hidden="true" /> WhatsApp
                    </a>
                  )}
                  {report.reporterEmail && (
                    <a
                      href={getEmailComposeUrl(report.reporterEmail, `About "${report.title}" on Lost & Found`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rdetails-btn rdetails-btn--ghost"
                    >
                      <FaEnvelope aria-hidden="true" /> Email
                    </a>
                  )}
                </div>
              </section>
            </>
          )}

          <ImagePreviewModal
            image={showPreview ? report?.image : ""}
            alt={report?.title}
            onClose={() => setShowPreview(false)}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}
