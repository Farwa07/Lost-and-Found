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
  getConfirmedMatches,
  getMatchSuggestions,
  sendGeneralAlert,
  sendReportAlert,
  unblockAdminUser,
  updateAdminReportStatus,
  updateAdminReportCaseStatus,
} from "../api/adminApi";
import {
  getFallbackReportImage,
  mapBackendReportToUi,
  mapBackendReportsToUi,
} from "../utils/reportMapper";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getReportPath } from "../utils/reportLinks";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ImagePreviewModal from "../components/ImagePreviewModal";
import MatchPairCard from "../components/MatchPairCard";

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
import { confirmDialog, toast } from "../utils/notify";

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

// Only drops the exact same report appearing twice. Reports with identical
// content are kept on purpose: admins must see them to catch spam/fake posts.
const removeDuplicateReports = (reports) => {
  const seen = new Set();

  return reports.filter((report) => {
    const key = String(report.id);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const ADMIN_TABS = ["reports", "matches", "matched", "users", "alerts", "logs"];

export default function AdminPanel() {
  // The open tab lives in the URL (?tab=matches) so "Back" from a report returns to it.
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = ADMIN_TABS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "reports";
  const setActiveTab = (tab) => setSearchParams(tab === "reports" ? {} : { tab }, { replace: true });
  const navigate = useNavigate();
  const openReportPage = (report) =>
    navigate(getReportPath(report), {
      state: { backTo: `/admin-panel?tab=${activeTab}`, backLabel: "Back to Admin Panel" },
    });
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [apiMatchSuggestions, setApiMatchSuggestions] = useState([]);
  const [confirmedMatches, setConfirmedMatches] = useState({ pairs: [], unpaired: [] });
  const [previewImage, setPreviewImage] = useState(null);
  const [alertReport, setAlertReport] = useState(null);
  const [showAlertPopup, setShowAlertPopup] = useState(false);

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
    } catch {
      setAdminLogs([]);
    }
  };

  const mapMatchSuggestions = (matchesResponse) =>
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
      : [];

  // Suggestions are calculated on the server when a report is verified or its
  // status changes, so reload them after such actions.
  const loadMatchSuggestions = async () => {
    try {
      setApiMatchSuggestions(mapMatchSuggestions(await getMatchSuggestions()));
    } catch {
      setApiMatchSuggestions([]);
    }
  };

  const loadConfirmedMatches = async () => {
    try {
      const response = await getConfirmedMatches();
      setConfirmedMatches({
        pairs: (response?.matches || []).map((match) => ({
          id: match.matchId,
          score: match.score || 0,
          reasons: Array.isArray(match.reasons) ? match.reasons : [],
          confirmedAt: match.confirmedAt,
          lostReport: mapBackendReportToUi(match.lostReport),
          foundReport: mapBackendReportToUi(match.foundReport),
        })),
        unpaired: mapBackendReportsToUi(response?.unpairedReports || []),
      });
    } catch {
      setConfirmedMatches({ pairs: [], unpaired: [] });
    }
  };

  const loadAdminData = async () => {
    try {
      const [reportsResponse, usersResponse, matchesResponse, logsResponse] = await Promise.all([
        getAdminReports(),
        getAdminUsers(),
        getMatchSuggestions().catch(() => ({ suggestions: [] })),
        getAdminLogs().catch(() => ({ logs: [] })),
        loadConfirmedMatches(),
      ]);

      setReports(removeDuplicateReports(mapBackendReportsToUi(reportsResponse?.reports || [])));
      setUsers((usersResponse?.users || []).map(normalizeAdminUser));
      setAdminLogs((logsResponse?.logs || []).map(normalizeAdminLog));
      setApiMatchSuggestions(mapMatchSuggestions(matchesResponse));
    } catch (error) {
      console.error("Admin data load error:", error);
      showMessage(error.message || "Unable to load admin data.");
      setReports([]);
      setUsers([]);
      setApiMatchSuggestions([]);
    }
  };

  const showMessage = (text) => toast(text);

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      addAdminLog(`Report marked as ${nextStatus}`, targetReport?.title);
      loadMatchSuggestions();
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
      addAdminLog(`Case status changed to ${nextCaseStatus}`, targetReport?.title);
      loadMatchSuggestions();
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

    const confirmClear = await confirmDialog(
      `Mark all flags on "${targetReport.title}" as reviewed and clear them?`,
      { title: "Clear flags", confirmText: "Clear Flags", danger: false }
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

    const confirmDelete = await confirmDialog(
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
    } catch (error) {
      showMessage(error.message || "Unable to delete report.");
    }
  };

  const confirmMatch = async (match) => {
    const confirmAction = await confirmDialog(
      `Confirm match between "${match.lostReport.title}" and "${match.foundReport.title}"?`,
      { title: "Confirm match", confirmText: "Confirm Match", danger: false }
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
    const confirmAction = await confirmDialog(
      `Mark "${match.lostReport.title}" and "${match.foundReport.title}" as Not Matched?`,
      { title: "Not a match?", confirmText: "Mark Not Matched" }
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
    const confirmDelete = await confirmDialog(
      "Delete this user permanently? All of their reports, comments and uploaded files will also be deleted."
    );

    if (!confirmDelete) return;

    try {
      await deleteAdminUser(userId);
      await loadAdminData();
      showMessage("User and all related data deleted.");
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
                  <option key={status} value={status}>{status === "All" ? "All statuses" : status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-report-actions">
            <button type="button" onClick={() => openReportPage(report)}>
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
            aria-label="Filter by status"
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
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
          >
            <option value="All">Persons & items</option>
            <option value="Person">Persons</option>
            <option value="Item">Items</option>
          </select>

          <select
            aria-label="Filter by case type"
            value={filters.type}
            onChange={(e) =>
              setFilters({
                ...filters,
                type: e.target.value,
              })
            }
          >
            {types.map((type) => (
              <option key={type} value={type}>{type === "All" ? "All case types" : type}</option>
            ))}
          </select>

          <select
            aria-label="Filter by city"
            value={filters.city}
            onChange={(e) =>
              setFilters({
                ...filters,
                city: e.target.value,
              })
            }
          >
            {cities.map((city) => (
              <option key={city} value={city}>{city === "All" ? "All cities" : city}</option>
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


  const formatMatchDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
      : "";

  const renderMatchedTab = () => {
    const { pairs, unpaired } = confirmedMatches;

    return (
      <>
        <section className="admin-list-heading">
          <div>
            <h2>Confirmed Matches</h2>
            <p>Lost or missing reports that an admin confirmed as the same case as a found report. Both reports are marked Solved.</p>
          </div>
        </section>

        <section className="admin-match-list">
          {pairs.length > 0 ? (
            pairs.map((match) => (
              <MatchPairCard
                key={match.id}
                lostReport={match.lostReport}
                foundReport={match.foundReport}
                score={match.score}
                reasons={match.reasons}
                status={
                  <span className="admin-match-confirmed">
                    <FaCheckDouble aria-hidden="true" /> Confirmed {formatMatchDate(match.confirmedAt)}
                  </span>
                }
              >
                <button type="button" onClick={() => openReportPage(match.lostReport)}>
                  <FaEye aria-hidden="true" /> View {match.lostReport.type.toLowerCase()} report
                </button>
                <button type="button" onClick={() => openReportPage(match.foundReport)}>
                  <FaEye aria-hidden="true" /> View found report
                </button>
              </MatchPairCard>
            ))
          ) : (
            <div className="admin-empty-box">
              <FaPeopleArrows />
              <h3>No confirmed matches</h3>
              <p>When you confirm a suggestion in the Suggestions tab, the pair appears here.</p>
            </div>
          )}
        </section>

        {unpaired.length > 0 && (
          <>
            <section className="admin-list-heading">
              <div>
                <h2>Matched, partner report deleted</h2>
                <p>
                  These reports were matched, but the report they were matched with has since been deleted.
                  Change their status if they should be searchable again.
                </p>
              </div>
            </section>

            <section className="admin-report-list">{unpaired.map(renderReportCard)}</section>
          </>
        )}
      </>
    );
  };

  const renderMatchesTab = () => {
    return (
      <section className="admin-match-list">
        <section className="admin-list-heading">
          <div>
            <h2>Match Suggestions</h2>
            <p>
              Verified lost/missing and found reports that look like the same case (55% similar or more).
              Check both reports, then confirm or reject the match.
            </p>
          </div>
        </section>

        {potentialMatches.length > 0 ? (
          potentialMatches.map((match) => (
            <MatchPairCard
              key={match.id}
              lostReport={match.lostReport}
              foundReport={match.foundReport}
              score={match.score}
              reasons={match.reasons}
            >
              <button type="button" onClick={() => openReportPage(match.lostReport)}>
                <FaEye aria-hidden="true" /> View {match.lostReport.type.toLowerCase()}
              </button>
              <button type="button" onClick={() => openReportPage(match.foundReport)}>
                <FaEye aria-hidden="true" /> View found
              </button>
              <button type="button" className="is-danger is-push" onClick={() => dismissMatch(match)}>
                <FaBan aria-hidden="true" /> Not a match
              </button>
              <button type="button" className="is-primary" onClick={() => confirmMatch(match)}>
                <FaCheckDouble aria-hidden="true" /> Confirm match
              </button>
            </MatchPairCard>
          ))
        ) : (
          <div className="admin-empty-box">
            <FaPeopleArrows />
            <h3>No suggestions right now</h3>
            <p>
              Suggestions are created automatically when a verified lost/missing report and a verified found
              report are at least 55% similar.
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
      <Navbar />

      <div className="admin-panel__container">
        <Sidebar />

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
                <p>Match suggestions</p>
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
              <FaPeopleArrows /> Suggestions
            </button>

            <button
  type="button"
  className={activeTab === "matched" ? "admin-tab--active" : ""}
  onClick={() => setActiveTab("matched")}
>
  <FaCheckDouble /> Confirmed
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