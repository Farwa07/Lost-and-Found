import "./AdminPanel.css";
import {
  blockAdminUser,
  confirmMatchSuggestion,
  clearAdminReportFlags,
  deleteAdminReport,
  deleteAdminUser,
  dismissMatchSuggestion,
  getAdminLogs,
  getAdminReports,
  getAdminUsers,
  getMatchSuggestions,
  rejectAdminReport,
  sendGeneralAlert,
  sendReportAlert,
  unblockAdminUser,
  updateAdminReportStatus,
  updateAdminReportCaseStatus,
  verifyAdminReport,
} from "../api/adminApi";
import {
  getFallbackReportImage,
  mapBackendReportToUi,
  mapBackendReportsToUi,
} from "../utils/reportMapper";

import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ImagePreviewModal from "../components/ImagePreviewModal";

import {
  FaBan,
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaCheckDouble,
  FaClipboardList,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
  FaFileAlt,
  FaFlag,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPeopleArrows,
  FaPhoneAlt,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUnlock,
  FaUser,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

const handleReportImageError = (event, category = "Item") => {
  const fallbackImage = getFallbackReportImage(category);

  if (event.currentTarget.src !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
};

const statusOptions = [
  "All",
  "Pending Review",
  "Verified",
  "Rejected",
  "Matched",
];

const caseStatusOptions = ["Unsolved", "Solved", "Closed"];

const normalize = (value = "") => String(value).trim().toLowerCase();

const getStatusClass = (value = "") => {
  return normalize(value).replace(/\s+/g, "-");
};

const adminStatusToBackend = (status = "") => {
  const normalized = String(status).trim().toLowerCase();

  if (normalized === "verified") return "verified";
  if (normalized === "rejected") return "rejected";
  if (normalized === "matched") return "matched";
  if (normalized === "closed") return "closed";

  return "pending";
};

const getPairKey = (lostId, foundId) => `${lostId}-${foundId}`;

const getReportIdentityKey = (report) => {
  return [
    report.type,
    report.category,
    report.title,
    report.city,
    report.location,
    report.date,
    report.itemCategory,
    report.color,
    report.brand,
    report.gender,
    report.age,
  ]
    .map((value) => normalize(value || ""))
    .join("|");
};

const getVisualPairKey = (lostReport, foundReport) => {
  return `${getReportIdentityKey(lostReport)}---${getReportIdentityKey(
    foundReport
  )}`;
};

const removeDuplicateReports = (reports) => {
  const seen = new Set();

  return reports.filter((report) => {
    const key = getReportIdentityKey(report);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [apiMatchSuggestions, setApiMatchSuggestions] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [alertReport, setAlertReport] = useState(null);
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [message, setMessage] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    category: "All",
    type: "All",
    city: "All",
    flaggedOnly: false,
  });

  const [alertForm, setAlertForm] = useState({
    type: "Alert",
    title: "Admin Alert",
    message: "",
  });

  const normalizeAdminUser = (user = {}) => ({
    ...user,
    id: user._id || user.id,
    name: user.fullName || user.name || "User",
    fullName: user.fullName || user.name || "User",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role === "admin" ? "Admin" : "Registered User",
    status: user.status === "blocked" ? "Blocked" : "Active",
    joinedAt: user.createdAt || user.joinedAt || "",
  });

  const normalizeAdminLog = (log = {}) => ({
    id: log._id || log.id || `${log.action}-${log.createdAt}`,
    action: log.action || "Admin action",
    reportTitle: log.details || log.targetType || "System",
    date: log.createdAt
      ? new Date(log.createdAt).toLocaleString("en-PK")
      : "Just now",
  });

  const loadAdminLogs = async () => {
    try {
      const logsResponse = await getAdminLogs();
      setAdminLogs((logsResponse?.logs || []).map(normalizeAdminLog));
    } catch (error) {
      setAdminLogs([]);
    }
  };

  const loadAdminData = async () => {
    try {
      const [reportsResponse, usersResponse, matchesResponse, logsResponse] = await Promise.all([
        getAdminReports(),
        getAdminUsers(),
        getMatchSuggestions().catch(() => ({ suggestions: [] })),
        getAdminLogs().catch(() => ({ logs: [] })),
      ]);

      setReports(removeDuplicateReports(mapBackendReportsToUi(reportsResponse?.reports || [])));
      setUsers((usersResponse?.users || []).map(normalizeAdminUser));
      setAdminLogs((logsResponse?.logs || []).map(normalizeAdminLog));
      setApiMatchSuggestions(
        Array.isArray(matchesResponse?.suggestions)
          ? matchesResponse.suggestions.map((suggestion) => {
              const lostReport = mapBackendReportToUi(suggestion.lostReport || {});
              const foundReport = mapBackendReportToUi(suggestion.foundReport || {});

              return {
                id: suggestion.matchId || suggestion._id,
                matchId: suggestion.matchId || suggestion._id,
                pairKey: getPairKey(lostReport.id, foundReport.id),
                visualPairKey: getVisualPairKey(lostReport, foundReport),
                score: suggestion.score || 0,
                reasons: Array.isArray(suggestion.reasons) ? suggestion.reasons : [],
                matchedFields: Array.isArray(suggestion.matchedFields)
                  ? suggestion.matchedFields
                  : [],
                threshold: suggestion.threshold || 55,
                status: suggestion.status || "suggested",
                lostReport,
                foundReport,
              };
            })
          : []
      );
    } catch (error) {
      console.error("Admin data load error:", error);
      showMessage(error.message || "Unable to load admin data.");
      setReports([]);
      setUsers([]);
      setApiMatchSuggestions([]);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3200);
  };

  const saveReports = (nextReports, successMessage = "Admin changes saved.") => {
    const cleanReports = removeDuplicateReports(nextReports);

    setReports(cleanReports);
    showMessage(successMessage);
  };

  const saveUsers = (nextUsers, successMessage = "User changes saved.") => {
    setUsers(nextUsers);
    showMessage(successMessage);
  };

  const addAdminLog = () => {
    loadAdminLogs();
  };

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) =>
        ["Pending", "Pending Review"].includes(report.adminStatus)
      ).length,
      verified: reports.filter((report) => report.adminStatus === "Verified")
        .length,
      rejected: reports.filter((report) => report.adminStatus === "Rejected")
        .length,
      matched: reports.filter((report) => report.adminStatus === "Matched")
        .length,
      flagged: reports.filter((report) => Number(report.flagCount || 0) > 0)
        .length,
      solved: reports.filter((report) => report.caseStatus === "Solved").length,
    };
  }, [reports]);

  const cities = useMemo(() => {
    return ["All", ...new Set(reports.map((report) => report.city).filter(Boolean))];
  }, [reports]);

  const types = useMemo(() => {
    return ["All", ...new Set(reports.map((report) => report.type).filter(Boolean))];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchValue = normalize(filters.search);

      const searchMatch =
        !searchValue ||
        normalize(report.title).includes(searchValue) ||
        normalize(report.city).includes(searchValue) ||
        normalize(report.location).includes(searchValue) ||
        normalize(report.description).includes(searchValue) ||
        normalize(report.reporterName).includes(searchValue);

      const statusMatch =
        filters.status === "All" || report.adminStatus === filters.status;

      const categoryMatch =
        filters.category === "All" || report.category === filters.category;

      const typeMatch = filters.type === "All" || report.type === filters.type;
      const cityMatch = filters.city === "All" || report.city === filters.city;

      const flaggedMatch =
        !filters.flaggedOnly || Number(report.flagCount || 0) > 0;

      return (
        searchMatch &&
        statusMatch &&
        categoryMatch &&
        typeMatch &&
        cityMatch &&
        flaggedMatch
      );
    });
  }, [reports, filters]);

  const matchedReports = useMemo(() => {
  return reports.filter(
    (report) =>
      report.adminStatus === "Matched" ||
      report.matchDecision === "Confirmed" ||
      report.matchId
  );
}, [reports]);


  const potentialMatches = useMemo(() => {
    return apiMatchSuggestions
      .filter((match) => match.status === "suggested")
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  }, [apiMatchSuggestions]);

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      category: "All",
      type: "All",
      city: "All",
      flaggedOnly: false,
    });
  };

  const openFilteredReports = (status, flaggedOnly = false) => {
    setActiveTab("reports");

    setFilters({
      search: "",
      status,
      category: "All",
      type: "All",
      city: "All",
      flaggedOnly,
    });
  };

  const updateAdminStatus = async (reportId, nextStatus) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    if (!targetReport) {
      showMessage("Report not found on this page. Please refresh and try again.");
      return;
    }

    const previousReports = reports;
    const optimisticReports = reports.map((report) =>
      String(report.id) === String(reportId)
        ? {
            ...report,
            adminStatus: nextStatus,
          }
        : report
    );

    setReports(optimisticReports);

    try {
      const apiStatus = adminStatusToBackend(nextStatus);
      const response = await updateAdminReportStatus(reportId, apiStatus);
      const updatedReport = response?.report
        ? mapBackendReportToUi(response.report)
        : null;

      const syncedReports = optimisticReports.map((report) =>
        String(report.id) === String(reportId)
          ? {
              ...report,
              ...(updatedReport || {}),
              adminStatus: nextStatus,
            }
          : report
      );

      saveReports(syncedReports, `Report marked as ${nextStatus}.`);
      setSelectedReport((previousReport) =>
        previousReport && String(previousReport.id) === String(reportId)
          ? syncedReports.find((report) => String(report.id) === String(reportId)) || previousReport
          : previousReport
      );
      addAdminLog(`Report marked as ${nextStatus}`, targetReport?.title);
    } catch (error) {
      console.error("Admin status update error:", error);
      setReports(previousReports);
      showMessage(error.message || "Unable to update report status.");
    }
  };

  const updateCaseStatus = async (reportId, nextCaseStatus) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    if (!targetReport) {
      showMessage("Report not found on this page. Please refresh and try again.");
      return;
    }

    const previousReports = reports;
    const optimisticReports = reports.map((report) =>
      String(report.id) === String(reportId)
        ? {
            ...report,
            caseStatus: nextCaseStatus,
          }
        : report
    );

    setReports(optimisticReports);

    try {
      const response = await updateAdminReportCaseStatus(reportId, nextCaseStatus);
      const updatedReport = response?.report
        ? mapBackendReportToUi(response.report)
        : null;

      const syncedReports = optimisticReports.map((report) =>
        String(report.id) === String(reportId)
          ? {
              ...report,
              ...(updatedReport || {}),
              caseStatus: nextCaseStatus,
            }
          : report
      );

      saveReports(syncedReports, `Case status changed to ${nextCaseStatus}.`);
      setSelectedReport((previousReport) =>
        previousReport && String(previousReport.id) === String(reportId)
          ? syncedReports.find((report) => String(report.id) === String(reportId)) || previousReport
          : previousReport
      );
      addAdminLog(`Case status changed to ${nextCaseStatus}`, targetReport?.title);
    } catch (error) {
      console.error("Admin case status update error:", error);
      setReports(previousReports);
      showMessage(error.message || "Unable to update case status.");
    }
  };

  const clearFlags = async (reportId) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    if (!targetReport) {
      showMessage("Report not found on this page. Please refresh and try again.");
      return;
    }

    const confirmClear = window.confirm(
      `Mark all flags on "${targetReport.title}" as reviewed and clear them?`
    );

    if (!confirmClear) return;

    const previousReports = reports;
    const optimisticReports = reports.map((report) =>
      String(report.id) === String(reportId)
        ? {
            ...report,
            flags: [],
            flagCount: 0,
          }
        : report
    );

    setReports(optimisticReports);

    try {
      const response = await clearAdminReportFlags(reportId);
      const updatedReport = response?.report
        ? mapBackendReportToUi(response.report)
        : null;

      const syncedReports = optimisticReports.map((report) =>
        String(report.id) === String(reportId)
          ? {
              ...report,
              ...(updatedReport || {}),
              flags: [],
              flagCount: 0,
            }
          : report
      );

      saveReports(syncedReports, "Flags reviewed and cleared.");
      setSelectedReport((previousReport) =>
        previousReport && String(previousReport.id) === String(reportId)
          ? syncedReports.find((report) => String(report.id) === String(reportId)) || previousReport
          : previousReport
      );
      addAdminLog("Flags cleared", targetReport?.title);
    } catch (error) {
      console.error("Clear flags error:", error);
      setReports(previousReports);
      showMessage(error.message || "Unable to clear flags.");
    }
  };

  const deleteReport = async (reportId) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report as fake/inappropriate?"
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminReport(reportId);

      const nextReports = reports.filter(
        (report) => String(report.id) !== String(reportId)
      );

      saveReports(nextReports, "Report deleted by admin.");
      addAdminLog("Report deleted", targetReport?.title);
      setSelectedReport(null);
    } catch (error) {
      showMessage(error.message || "Unable to delete report.");
    }
  };

  const confirmMatch = async (match) => {
    const confirmAction = window.confirm(
      `Confirm match between "${match.lostReport.title}" and "${match.foundReport.title}"?`
    );

    if (!confirmAction) {
      return;
    }

    if (!match.matchId) {
      showMessage("Match id missing. Please refresh and try again.");
      return;
    }

    try {
      const response = await confirmMatchSuggestion(match.matchId);
      const confirmedMatch = response?.match || {};
      const lostReport = confirmedMatch.lostReportId
        ? mapBackendReportToUi(confirmedMatch.lostReportId)
        : match.lostReport;
      const foundReport = confirmedMatch.foundReportId
        ? mapBackendReportToUi(confirmedMatch.foundReportId)
        : match.foundReport;

      const nextReports = reports.map((report) => {
        if (String(report.id) === String(lostReport.id)) {
          return {
            ...report,
            ...lostReport,
            adminStatus: "Matched",
            caseStatus: "Solved",
            matchId: confirmedMatch._id || match.matchId,
            matchScore: confirmedMatch.score || match.score,
          };
        }

        if (String(report.id) === String(foundReport.id)) {
          return {
            ...report,
            ...foundReport,
            adminStatus: "Matched",
            caseStatus: "Solved",
            matchId: confirmedMatch._id || match.matchId,
            matchScore: confirmedMatch.score || match.score,
          };
        }

        return report;
      });

      setApiMatchSuggestions((previousSuggestions) =>
        previousSuggestions.filter(
          (item) => String(item.matchId) !== String(match.matchId)
        )
      );

      saveReports(
        nextReports,
        response?.message || "Match confirmed. Both reports are Matched and Solved."
      );

      // Reload backend data so the match does not come back after refresh/login.
      await loadAdminData();
      setActiveTab("matched");

      addAdminLog(
        "Match confirmed",
        `${match.lostReport.title} + ${match.foundReport.title}`
      );
    } catch (error) {
      console.error("Confirm match error:", error);
      showMessage(error.message || "Unable to confirm match.");
    }
  };

  const dismissMatch = async (match) => {
    const confirmAction = window.confirm(
      `Mark "${match.lostReport.title}" and "${match.foundReport.title}" as Not Matched?`
    );

    if (!confirmAction) {
      return;
    }

    if (!match.matchId) {
      showMessage("Match id missing. Please refresh and try again.");
      return;
    }

    try {
      const response = await dismissMatchSuggestion(match.matchId);

      setApiMatchSuggestions((previousSuggestions) =>
        previousSuggestions.filter(
          (item) => String(item.matchId) !== String(match.matchId)
        )
      );

      await loadAdminData();

      addAdminLog(
        "Match dismissed",
        `${match.lostReport.title} + ${match.foundReport.title}`
      );

      showMessage(response?.message || "Match suggestion removed and saved as Not Matched.");
    } catch (error) {
      console.error("Dismiss match error:", error);
      showMessage(error.message || "Unable to dismiss match.");
    }
  };

  const openAlertModal = (report) => {
    setAlertReport(report);
    setShowAlertPopup(true);

    setAlertForm({
      type: "Alert",
      title: "Admin Alert",
      message: report
        ? `Admin has reviewed your report "${report.title}". Please check report details.`
        : "",
    });
  };

  const sendAlert = async (e) => {
    e.preventDefault();

    if (!alertForm.title.trim() || !alertForm.message.trim()) {
      showMessage("Please enter alert title and message.");
      return;
    }

    try {
      const payload = {
        type: alertForm.type,
        title: alertForm.title.trim(),
        message: alertForm.message.trim(),
      };

      if (alertReport?.id) {
        await sendReportAlert(alertReport.id, payload);
      } else {
        await sendGeneralAlert(payload);
      }

      addAdminLog("Alert sent", alertReport?.title || "General Alert");
      showMessage("Alert notification created successfully.");

      setAlertReport(null);
      setShowAlertPopup(false);

      setAlertForm({
        type: "Alert",
        title: "Admin Alert",
        message: "",
      });
    } catch (error) {
      showMessage(error.message || "Unable to send alert.");
    }
  };

  const toggleUserStatus = async (userId) => {
    const nextUsers = users.map((user) =>
      String(user.id) === String(userId)
        ? {
            ...user,
            status: user.status === "Blocked" ? "Active" : "Blocked",
          }
        : user
    );

    try {
      const targetUser = users.find((user) => String(user.id) === String(userId));
      if (targetUser?.status === "Blocked") {
        await unblockAdminUser(userId);
      } else {
        await blockAdminUser(userId);
      }

      saveUsers(nextUsers, "User status updated.");
    } catch (error) {
      showMessage(error.message || "Unable to update user status.");
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Delete this user from frontend admin list?");

    if (!confirmDelete) return;

    try {
      await deleteAdminUser(userId);
      saveUsers(
        users.filter((user) => String(user.id) !== String(userId)),
        "User removed from admin list."
      );
    } catch (error) {
      showMessage(error.message || "Unable to delete user.");
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <span className={`admin-status admin-status--${getStatusClass(status)}`}>
        {(status === "Pending" || status === "Pending Review") && <FaClock />}
        {status === "Verified" && <FaCheckCircle />}
        {status === "Rejected" && <FaBan />}
        {status === "Matched" && <FaPeopleArrows />}
        {status}
      </span>
    );
  };

  const renderReportCard = (report) => {
    const flagCount = Number(report.flagCount || 0);
    const isFlagged = flagCount > 0;
    const needsAdminReview = flagCount >= 5;

    return (
      <article
        className={`admin-report-card ${
          isFlagged ? "admin-report-card--flagged" : ""
        }`}
        key={report.id}
      >
        <div className="admin-report-card__image">
          <img
            className="clickable-report-image"
            src={report.image}
            alt={report.title}
            title="Click to view full image"
            onClick={() => setPreviewImage({ src: report.image, alt: report.title })}
            onError={(event) => handleReportImageError(event, report.category)}
          />

          <span
            className={`admin-type-badge ${
              report.type === "Found" ? "admin-type-badge--found" : ""
            }`}
          >
            {report.type}
          </span>

          {isFlagged && (
            <span className="admin-flag-badge">
              <FaFlag /> {needsAdminReview ? "Review Required" : `${flagCount} Flag${flagCount > 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        <div className="admin-report-card__content">
          <div className="admin-report-card__top">
            <div>
              <span className="admin-category-badge">{report.category}</span>
              <h2>{report.title}</h2>
            </div>

            <div className="admin-badge-group">
              {renderStatusBadge(report.adminStatus)}

              <span
                className={`admin-case-status admin-case-status--${getStatusClass(
                  report.caseStatus
                )}`}
              >
                {report.caseStatus}
              </span>
            </div>
          </div>

          <p className="admin-report-meta">
            <FaMapMarkerAlt /> {report.location || "N/A"}
          </p>

          <p className="admin-report-meta">
            <FaCalendarAlt /> {report.date || "N/A"}
          </p>

          <p className="admin-report-desc">{report.description}</p>

          <div className="admin-report-info-grid">
            <span>
              <b>Reporter:</b> {report.reporterName || "Unknown"}
            </span>
            <span>
              <b>Contact:</b> {report.reporterContact || "N/A"}
            </span>
            <span>
              <b>Email:</b> {report.reporterEmail || "N/A"}
            </span>
            <span>
              <b>Flags:</b> {report.flagCount || 0}
            </span>
          </div>

          <div className="admin-status-row">
            <label>
              Admin Status
              <select
                value={report.adminStatus}
                onChange={(e) => updateAdminStatus(report.id, e.target.value)}
              >
                <option>Pending Review</option>
                <option>Verified</option>
                <option>Rejected</option>
                <option>Matched</option>
              </select>
            </label>

            <label>
              Case Status
              <select
                value={report.caseStatus}
                onChange={(e) => updateCaseStatus(report.id, e.target.value)}
              >
                {caseStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-report-actions">
            <button type="button" onClick={() => setSelectedReport(report)}>
              <FaEye /> View
            </button>

            <button
              type="button"
              className="admin-action-success"
              onClick={() => updateAdminStatus(report.id, "Verified")}
            >
              <FaCheckCircle /> Verify
            </button>

            <button
              type="button"
              className="admin-action-warning"
              onClick={() => updateAdminStatus(report.id, "Rejected")}
            >
              <FaBan /> Reject
            </button>

            <button type="button" onClick={() => openAlertModal(report)}>
              <FaBell /> Alert
            </button>

            {Number(report.flagCount || 0) > 0 && (
              <button type="button" onClick={() => clearFlags(report.id)}>
                <FaCheckDouble /> Clear Flags
              </button>
            )}

            <button
              type="button"
              className="admin-action-danger"
              onClick={() => deleteReport(report.id)}
            >
              <FaTrash /> Delete Fake
            </button>
          </div>
        </div>
      </article>
    );
  };

  const renderReportsTab = () => {
    return (
      <>
        <section className="admin-filters-card">
          <div className="admin-search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by title, city, location, description or reporter..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
          >
            <option>All</option>
            <option>Person</option>
            <option>Item</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value,
              })
            }
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.city}
            onChange={(e) =>
              setFilters({
                ...filters,
                city: e.target.value,
              })
            }
          >
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>

          <label className="admin-flag-filter">
            <input
              type="checkbox"
              checked={filters.flaggedOnly}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  flaggedOnly: e.target.checked,
                })
              }
            />
            Flagged Only
          </label>

          <button className="admin-reset-btn" type="button" onClick={resetFilters}>
            <FaRedo /> Reset
          </button>
        </section>

        <section className="admin-list-heading">
          <div>
            <h2>Manage Reports</h2>
            <p>
              Showing {filteredReports.length} of {reports.length} reports.
            </p>
          </div>
        </section>

        <section className="admin-report-list">
          {filteredReports.length > 0 ? (
            filteredReports.map(renderReportCard)
          ) : (
            <div className="admin-empty-box">
              <FaClipboardList />
              <h3>No reports found</h3>
              <p>Try changing the search or filter options.</p>
            </div>
          )}
        </section>
      </>
    );
  };


  const renderMatchedTab = () => {
  return (
    <>
      <section className="admin-list-heading">
        <div>
          <h2>Matched & Solved Reports</h2>

          <p>
            These are the reports confirmed by admin as matched. Both lost/missing
            and found reports are saved here with Matched and Solved status.
          </p>
        </div>
      </section>

      <section className="admin-report-list">
        {matchedReports.length > 0 ? (
          matchedReports.map(renderReportCard)
        ) : (
          <div className="admin-empty-box">
            <FaPeopleArrows />
            <h3>No matched reports yet</h3>
            <p>
              Confirm a match from Matches tab. After confirmation, matched reports
              will appear here.
            </p>
          </div>
        )}
      </section>
    </>
  );
};


  const renderMatchReportBox = (report, sideTitle) => {
    return (
      <div className="admin-match-report">
        <img
          className="clickable-report-image"
          src={report.image}
          alt={report.title}
          title="Click to view full image"
          onClick={() => setPreviewImage({ src: report.image, alt: report.title })}
          onError={(event) => handleReportImageError(event, report.category)}
        />

        <span>{sideTitle}</span>

        <h3>{report.title}</h3>

        <p>{report.location}</p>

        <div className="admin-report-info-grid">
          <span>
            <b>Type:</b> {report.type}
          </span>
          <span>
            <b>Category:</b> {report.category}
          </span>
          <span>
            <b>City:</b> {report.city}
          </span>
          <span>
            <b>Date:</b> {report.date}
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

          <span>
            <b>Reporter:</b> {report.reporterName || "N/A"}
          </span>
          <span>
            <b>Phone:</b> {report.reporterContact || "N/A"}
          </span>
          <span>
            <b>Email:</b> {report.reporterEmail || "N/A"}
          </span>
        </div>
      </div>
    );
  };

  const renderMatchesTab = () => {
    return (
      <section className="admin-match-list">
        <section className="admin-list-heading">
          <div>
            <h2>Rule-Based Match Comparison</h2>
            <p>
              Only 55% or higher lost/missing vs found candidates are shown for admin decision.
            </p>
          </div>
        </section>

        {potentialMatches.length > 0 ? (
          potentialMatches.map((match) => (
            <article className="admin-match-card" key={match.id}>
              <div className="admin-match-score">
                <strong>{match.score}%</strong>
                <span>Match Score</span>
              </div>

              <div className="admin-match-columns">
                {renderMatchReportBox(match.lostReport, "Lost / Missing Case")}

                <div className="admin-match-line">
                  <FaPeopleArrows />
                </div>

                {renderMatchReportBox(match.foundReport, "Found Case")}
              </div>

              <div className="admin-match-reasons">
                {match.reasons.map((reason) => (
                  <span key={reason}>{reason}</span>
                ))}
              </div>

              <div className="admin-report-info-grid">
                <span>
                  <b>Matched Fields:</b> {match.matchedFields.join(", ")}
                </span>

                <span>
                  <b>Threshold:</b> {match.threshold || 55}%
                </span>
              </div>

              <div className="admin-report-actions">
                <button type="button" onClick={() => setSelectedReport(match.lostReport)}>
                  <FaEye /> View Lost/Missing
                </button>

                <button type="button" onClick={() => setSelectedReport(match.foundReport)}>
                  <FaEye /> View Found
                </button>

                <button
                  type="button"
                  className="admin-action-success"
                  onClick={() => confirmMatch(match)}
                >
                  <FaCheckDouble /> Confirm Matched & Solve
                </button>

                <button
                  type="button"
                  className="admin-action-warning"
                  onClick={() => dismissMatch(match)}
                >
                  <FaBan /> Not Matched
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty-box">
            <FaPeopleArrows />
            <h3>No 55%+ potential matches</h3>
            <p>
              New possible matches will appear here when lost/missing and found reports have strong similarity.
            </p>
          </div>
        )}
      </section>
    );
  };

  const renderUsersTab = () => {
    return (
      <section className="admin-users-grid">
        {users.map((user) => (
          <article className="admin-user-card" key={user.id}>
            <div className="admin-user-avatar">
              {user.fullName
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div className="admin-user-info">
              <h3>{user.fullName}</h3>
              <p>
                <FaEnvelope /> {user.email}
              </p>
              <p>
                <FaPhoneAlt /> {user.phone}
              </p>
              <p>
                <FaCalendarAlt /> Joined: {user.joinedAt}
              </p>
            </div>

            <span
              className={`admin-user-status admin-user-status--${getStatusClass(
                user.status
              )}`}
            >
              {user.status}
            </span>

            <div className="admin-report-actions">
              <button type="button" onClick={() => toggleUserStatus(user.id)}>
                {user.status === "Blocked" ? <FaUnlock /> : <FaBan />}
                {user.status === "Blocked" ? "Unblock" : "Block"}
              </button>

              <button
                type="button"
                className="admin-action-danger"
                onClick={() => deleteUser(user.id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    );
  };

  const renderAlertsTab = () => {
    return (
      <section className="admin-alert-card">
        <div className="admin-alert-card__heading">
          <FaPaperPlane />

          <div>
            <h2>Send General Admin Alert</h2>
            <p>
              General alert will only show in notification popup. Report-specific alert opens the related report.
            </p>
          </div>
        </div>

        <form className="admin-alert-form" onSubmit={sendAlert}>
          <div className="admin-form-grid">
            <label>
              Alert Type
              <select
                value={alertForm.type}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    type: e.target.value,
                  })
                }
              >
                <option>Alert</option>
                <option>Verification</option>
                <option>Match</option>
                <option>Status</option>
              </select>
            </label>

            <label>
              Alert Title
              <input
                type="text"
                value={alertForm.title}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    title: e.target.value,
                  })
                }
                placeholder="Enter alert title"
              />
            </label>
          </div>

          <label>
            Alert Message
            <textarea
              value={alertForm.message}
              onChange={(e) =>
                setAlertForm({
                  ...alertForm,
                  message: e.target.value,
                })
              }
              placeholder="Write notification message..."
            ></textarea>
          </label>

          <button type="submit" className="admin-primary-btn">
            <FaPaperPlane /> Send Notification
          </button>
        </form>
      </section>
    );
  };

  const renderLogsTab = () => {
    return (
      <section className="admin-alert-card">
        <div className="admin-alert-card__heading">
          <FaClipboardList />

          <div>
            <h2>Admin Activity Log</h2>
            <p>Recent admin actions loaded from backend.</p>
          </div>
        </div>

        {adminLogs.length > 0 ? (
          <div className="admin-report-info-grid">
            {adminLogs.map((log) => (
              <span key={log.id}>
                <b>{log.action}</b>
                <br />
                {log.reportTitle || "System"} — {log.date}
              </span>
            ))}
          </div>
        ) : (
          <div className="admin-empty-box">
            <FaClipboardList />
            <h3>No admin logs yet</h3>
            <p>
              Actions like verify, reject, delete, alert and match confirmation will appear here.
            </p>
          </div>
        )}
      </section>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedReport) return null;

    return (
      <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
        <div className="admin-details-modal" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-modal-close"
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
            handleReportImageError(event, selectedReport.category)
          }
        />

          <div className="admin-modal-badges">
            <span
              className={`admin-type-badge ${
                selectedReport.type === "Found" ? "admin-type-badge--found" : ""
              }`}
            >
              {selectedReport.type}
            </span>

            {renderStatusBadge(selectedReport.adminStatus)}
          </div>

          <h2>{selectedReport.title}</h2>

          <div className="admin-detail-grid">
            <p>
              <b>Category:</b> {selectedReport.category}
            </p>
            <p>
              <b>Case Status:</b> {selectedReport.caseStatus}
            </p>
            <p>
              <b>City:</b> {selectedReport.city || "N/A"}
            </p>
            <p>
              <b>Date:</b> {selectedReport.date || "N/A"}
            </p>
            <p>
              <b>Location:</b> {selectedReport.location || "N/A"}
            </p>
            <p>
              <b>Current Location:</b> {selectedReport.currentLocation || "N/A"}
            </p>

            {selectedReport.category === "Person" && (
              <>
                <p>
                  <b>Age:</b> {selectedReport.age || "N/A"}
                </p>
                <p>
                  <b>Gender:</b> {selectedReport.gender || "N/A"}
                </p>
                <p>
                  <b>Relation:</b> {selectedReport.relation || "N/A"}
                </p>
              </>
            )}

            {selectedReport.category === "Item" && (
              <>
                <p>
                  <b>Item Category:</b> {selectedReport.itemCategory || "N/A"}
                </p>
                <p>
                  <b>Color:</b> {selectedReport.color || "N/A"}
                </p>
                <p>
                  <b>Brand:</b> {selectedReport.brand || "N/A"}
                </p>
              </>
            )}
          </div>

          <h3>Description</h3>
          <p>{selectedReport.description}</p>

          <hr />

          <h3>Reporter Details</h3>

          <div className="admin-detail-grid">
            <p>
              <FaUser /> <b>Name:</b> {selectedReport.reporterName || "N/A"}
            </p>
            <p>
              <FaPhoneAlt /> <b>Phone:</b>{" "}
              {selectedReport.reporterContact || "N/A"}
            </p>
            <p>
              <FaEnvelope /> <b>Email:</b>{" "}
              {selectedReport.reporterEmail || "N/A"}
            </p>
            <p>
              <FaMapMarkerAlt /> <b>Address:</b>{" "}
              {selectedReport.reporterAddress || "N/A"}
            </p>
          </div>

          <hr />

          <h3>Flags / Reports</h3>

          {Number(selectedReport.flagCount || 0) > 0 ? (
            <div className="admin-detail-grid">
              {(selectedReport.flags || []).map((flag, index) => (
                <p key={`${flag.reason}-${index}`}>
                  <FaFlag /> <b>{flag.user || "User"}:</b> {flag.reason}{" "}
                  {flag.date ? `(${flag.date})` : ""}
                </p>
              ))}
            </div>
          ) : (
            <p>No flags reported for this post.</p>
          )}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-action-success"
              onClick={() => updateAdminStatus(selectedReport.id, "Verified")}
            >
              <FaCheckCircle /> Verify
            </button>

            <button
              type="button"
              className="admin-action-warning"
              onClick={() => updateAdminStatus(selectedReport.id, "Rejected")}
            >
              <FaBan /> Reject
            </button>

            {activeTab !== "matches" && (
  <button type="button" onClick={() => openAlertModal(selectedReport)}>
    <FaBell /> Send Alert
  </button>
)}

            <button
              type="button"
              className="admin-action-danger"
              onClick={() => deleteReport(selectedReport.id)}
            >
              <FaTrash /> Delete Fake
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAlertModal = () => {
    if (!showAlertPopup) return null;

    return (
      <div
        className="admin-modal-overlay"
        onClick={() => {
          setShowAlertPopup(false);
          setAlertReport(null);
        }}
      >
        <div className="admin-alert-modal" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="admin-modal-close"
            onClick={() => {
              setShowAlertPopup(false);
              setAlertReport(null);
            }}
          >
            <FaTimes />
          </button>

          <div className="admin-alert-modal__icon">
            <FaBell />
          </div>

          <h2>{alertReport ? "Send Report Alert" : "Send General Alert"}</h2>

          <p>
            {alertReport
              ? `Notification will be created for "${alertReport.title}".`
              : "Notification will be created as a general admin alert."}
          </p>

          <form className="admin-alert-form" onSubmit={sendAlert}>
            <label>
              Alert Type
              <select
                value={alertForm.type}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    type: e.target.value,
                  })
                }
              >
                <option>Alert</option>
                <option>Verification</option>
                <option>Match</option>
                <option>Status</option>
              </select>
            </label>

            <label>
              Alert Title
              <input
                type="text"
                value={alertForm.title}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    title: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Alert Message
              <textarea
                value={alertForm.message}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    message: e.target.value,
                  })
                }
              ></textarea>
            </label>

            <button type="submit" className="admin-primary-btn">
              <FaPaperPlane /> Send Alert
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-panel">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="admin-panel__container">
        <Sidebar open={sidebarOpen} />

        <main className="admin-panel__main">
          <section className="admin-hero">
            <div>
              <span className="admin-kicker">
                <FaUserShield /> Admin Dashboard
              </span>

              <h1>Admin Panel</h1>

              <p>
                Verify reports, review flagged content, manage users, update case status,
                compare 55%+ rule-based matches and send alerts to users.
              </p>
            </div>

            <button
              type="button"
              className="admin-hero__btn"
              onClick={() => openAlertModal(null)}
            >
              <FaBell /> Send Alert
            </button>
          </section>

          {message && (
            <div className="admin-message">
              <FaCheckCircle />
              {message}

              <button type="button" onClick={() => setMessage("")}>
                <FaTimes />
              </button>
            </div>
          )}

          <section className="admin-stats-grid">
            <button type="button" onClick={() => openFilteredReports("All")}>
              <span>
                <FaFileAlt />
              </span>

              <div>
                <h3>{stats.total}</h3>
                <p>Total Reports</p>
              </div>
            </button>

            <button type="button" onClick={() => openFilteredReports("Pending Review")}>
              <span>
                <FaClock />
              </span>

              <div>
                <h3>{stats.pending}</h3>
                <p>Pending Review</p>
              </div>
            </button>

            <button type="button" onClick={() => openFilteredReports("Verified")}>
              <span>
                <FaCheckCircle />
              </span>

              <div>
                <h3>{stats.verified}</h3>
                <p>Verified</p>
              </div>
            </button>

            <button type="button" onClick={() => openFilteredReports("Rejected")}>
              <span>
                <FaBan />
              </span>

              <div>
                <h3>{stats.rejected}</h3>
                <p>Rejected</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("matches")}>
              <span>
                <FaPeopleArrows />
              </span>

              <div>
                <h3>{potentialMatches.length}</h3>
                <p>55%+ Matches</p>
              </div>
            </button>

            <button type="button" onClick={() => openFilteredReports("All", true)}>
              <span>
                <FaFlag />
              </span>

              <div>
                <h3>{stats.flagged}</h3>
                <p>Flagged Posts</p>
              </div>
            </button>
          </section>

          <section className="admin-tabs">
            <button
              type="button"
              className={activeTab === "reports" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("reports")}
            >
              <FaClipboardList /> Reports
            </button>

            <button
              type="button"
              className={activeTab === "matches" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("matches")}
            >
              <FaPeopleArrows /> Matches
            </button>

            <button
  type="button"
  className={activeTab === "matched" ? "admin-tab--active" : ""}
  onClick={() => setActiveTab("matched")}
>
  <FaCheckDouble /> Matched
</button>

            <button
              type="button"
              className={activeTab === "users" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <FaUsers /> Users
            </button>

            <button
              type="button"
              className={activeTab === "alerts" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("alerts")}
            >
              <FaPaperPlane /> Alerts
            </button>

            <button
              type="button"
              className={activeTab === "logs" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("logs")}
            >
              <FaShieldAlt /> Logs
            </button>
          </section>

          {activeTab === "reports" && renderReportsTab()}
          {activeTab === "matches" && renderMatchesTab()}
          {activeTab === "matched" && renderMatchedTab()}
          {activeTab === "users" && renderUsersTab()}
          {activeTab === "alerts" && renderAlertsTab()}
          {activeTab === "logs" && renderLogsTab()}

          {renderDetailsModal()}
          {renderAlertModal()}

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