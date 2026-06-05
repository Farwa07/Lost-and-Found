import "./AdminPanel.css";

import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaBan,
  FaBell,
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaCheckDouble,
  FaClipboardList,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaEye,
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

const REPORTS_KEY = "lostFoundReports";
const NOTIFICATIONS_KEY = "lostFoundNotifications";
const USERS_KEY = "lostFoundUsers";
const ADMIN_LOG_KEY = "lostFoundAdminActionLog";

const defaultReports = [
  {
    id: 1,
    type: "Missing",
    category: "Person",
    title: "Ali Hassan",
    age: "10",
    gender: "Male",
    itemCategory: "",
    color: "",
    brand: "",
    city: "Lahore",
    location: "Anarkali Bazaar, Lahore",
    currentLocation: "",
    date: "2026-05-12",
    adminStatus: "Pending Review",
    caseStatus: "Unsolved",
    description:
      "Last seen wearing blue shirt and black trousers near Anarkali Bazaar.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterEmail: "john@example.com",
    reporterAddress: "Gujranwala",
    relation: "Father",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-05-12T10:30:00.000Z",
  },
  {
    id: 2,
    type: "Lost",
    category: "Item",
    title: "Black Wallet",
    age: "",
    gender: "",
    itemCategory: "Wallet",
    color: "Black",
    brand: "Leather Hub",
    city: "Gujranwala",
    location: "Satellite Town Market, Gujranwala",
    currentLocation: "",
    date: "2026-05-20",
    adminStatus: "Pending Review",
    caseStatus: "Unsolved",
    description:
      "Black leather wallet with CNIC copy and some cash inside. Lost near market area.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterEmail: "john@example.com",
    reporterAddress: "Satellite Town, Gujranwala",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
    flags: [
      { user: "Ahsan", reason: "Duplicate post", date: "2026-05-21" },
      { user: "Sana", reason: "Contact number not responding", date: "2026-05-22" },
      { user: "Bilal", reason: "Incomplete information", date: "2026-05-23" },
      { user: "Nimra", reason: "Looks suspicious", date: "2026-05-24" },
      { user: "Hassan", reason: "Possible fake post", date: "2026-05-25" },
    ],
    flagCount: 5,
    createdAt: "2026-05-20T09:20:00.000Z",
  },
  {
    id: 3,
    type: "Found",
    category: "Item",
    title: "Samsung Mobile",
    age: "",
    gender: "",
    itemCategory: "Mobile",
    color: "Blue",
    brand: "Samsung",
    city: "Sialkot",
    location: "Paris Road, Sialkot",
    currentLocation: "Nearby shop at Paris Road",
    date: "2026-05-22",
    adminStatus: "Verified",
    caseStatus: "Unsolved",
    description:
      "Samsung mobile found near roadside. Owner can contact with proof.",
    reporterName: "Ayesha Malik",
    reporterContact: "03123456789",
    reporterEmail: "ayesha@example.com",
    reporterAddress: "Sialkot",
    relation: "Citizen",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-05-22T15:00:00.000Z",
  },
  {
    id: 4,
    type: "Found",
    category: "Person",
    title: "Unknown Child",
    age: "7",
    gender: "Female",
    itemCategory: "",
    color: "",
    brand: "",
    city: "Karachi",
    location: "Saddar Market, Karachi",
    currentLocation: "Edhi Center Karachi",
    date: "2026-04-30",
    adminStatus: "Verified",
    caseStatus: "Unsolved",
    description:
      "Child found crying near market area. Wearing pink dress and white shoes.",
    reporterName: "Sadia Ahmed",
    reporterContact: "03125556666",
    reporterEmail: "sadia@example.com",
    reporterAddress: "Karachi",
    relation: "Citizen",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-04-30T13:10:00.000Z",
  },
  {
    id: 5,
    type: "Lost",
    category: "Item",
    title: "School Backpack",
    age: "",
    gender: "",
    itemCategory: "Bag",
    color: "Blue",
    brand: "Nike",
    city: "Lahore",
    location: "Liberty Market, Lahore",
    currentLocation: "",
    date: "2026-05-10",
    adminStatus: "Rejected",
    caseStatus: "Unsolved",
    description:
      "Blue school backpack lost near Liberty Market. It has books, notebooks and a cartoon keychain attached.",
    reporterName: "Hamza Ali",
    reporterContact: "03008887777",
    reporterEmail: "hamza@example.com",
    reporterAddress: "Johar Town, Lahore",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop",
    flags: [{ user: "Admin", reason: "Image unclear", date: "2026-05-11" }],
    flagCount: 1,
    createdAt: "2026-05-10T17:45:00.000Z",
  },
  {
    id: 6,
    type: "Lost",
    category: "Item",
    title: "Dell Laptop Bag",
    age: "",
    gender: "",
    itemCategory: "Laptop Bag",
    color: "Black",
    brand: "Dell",
    city: "Faisalabad",
    location: "D Ground Faisalabad",
    currentLocation: "",
    date: "2026-03-18",
    adminStatus: "Verified",
    caseStatus: "Unsolved",
    description:
      "Black Dell laptop bag lost near D Ground Faisalabad. It contains charger, documents and personal notes.",
    reporterName: "Naveed Ahmed",
    reporterContact: "03450001122",
    reporterEmail: "naveed@example.com",
    reporterAddress: "Peoples Colony, Faisalabad",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-03-18T08:40:00.000Z",
  },
  {
    id: 7,
    type: "Found",
    category: "Item",
    title: "Black Dell Laptop Bag",
    age: "",
    gender: "",
    itemCategory: "Laptop Bag",
    color: "Black",
    brand: "Dell",
    city: "Faisalabad",
    location: "D Ground Faisalabad",
    currentLocation: "Security office near D Ground",
    date: "2026-03-20",
    adminStatus: "Pending Review",
    caseStatus: "Unsolved",
    description:
      "Found a black Dell laptop bag with charger near D Ground parking area.",
    reporterName: "Farhan Raza",
    reporterContact: "03212223333",
    reporterEmail: "farhan@example.com",
    reporterAddress: "Faisalabad",
    relation: "Citizen",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-03-20T11:15:00.000Z",
  },
  {
    id: 8,
    type: "Missing",
    category: "Person",
    title: "Areeba Noor",
    age: "9",
    gender: "Female",
    itemCategory: "",
    color: "",
    brand: "",
    city: "Karachi",
    location: "Saddar Market, Karachi",
    currentLocation: "",
    date: "2026-04-29",
    adminStatus: "Pending Review",
    caseStatus: "Unsolved",
    description:
      "Missing girl wearing pink frock and white sandals. Last seen near Saddar Market.",
    reporterName: "Noor Ahmed",
    reporterContact: "03029998877",
    reporterEmail: "noor@example.com",
    reporterAddress: "Karachi",
    relation: "Father",
    image:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200&auto=format&fit=crop",
    flags: [],
    flagCount: 0,
    createdAt: "2026-04-29T18:10:00.000Z",
  },
];

const defaultUsers = [
  {
    id: 1,
    fullName: "John Doe",
    email: "john@example.com",
    phone: "03001234567",
    role: "Registered User",
    status: "Active",
    joinedAt: "2026-05-01",
  },
  {
    id: 2,
    fullName: "Ayesha Malik",
    email: "ayesha@example.com",
    phone: "03123456789",
    role: "Registered User",
    status: "Active",
    joinedAt: "2026-05-10",
  },
  {
    id: 3,
    fullName: "Hamza Ali",
    email: "hamza@example.com",
    phone: "03008887777",
    role: "Registered User",
    status: "Blocked",
    joinedAt: "2026-05-08",
  },
];

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

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const addDaysDifferenceScore = (lostDate, foundDate) => {
  if (!lostDate || !foundDate) {
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

const keywordScore = (left = "", right = "") => {
  const leftWords = normalize(left)
    .split(/\W+/)
    .filter((word) => word.length > 3);

  const rightWords = normalize(right)
    .split(/\W+/)
    .filter((word) => word.length > 3);

  if (!leftWords.length || !rightWords.length) {
    return 0;
  }

  const matches = leftWords.filter((word) => rightWords.includes(word));
  return Math.min(matches.length * 5, 15);
};

const calculateMatchScore = (lostReport, foundReport) => {
  let score = 0;
  const reasons = [];

  if (lostReport.category === foundReport.category) {
    score += 20;
    reasons.push("Same report category");
  }

  if (normalize(lostReport.city) === normalize(foundReport.city)) {
    score += 20;
    reasons.push("Same city");
  }

  if (lostReport.category === "Person") {
    if (normalize(lostReport.gender) === normalize(foundReport.gender)) {
      score += 15;
      reasons.push("Same gender");
    }

    const ageDiff = Math.abs(Number(lostReport.age) - Number(foundReport.age));

    if (!Number.isNaN(ageDiff) && ageDiff <= 3) {
      score += 10;
      reasons.push("Similar age");
    }
  }

  if (lostReport.category === "Item") {
    if (normalize(lostReport.itemCategory) === normalize(foundReport.itemCategory)) {
      score += 18;
      reasons.push("Same item category");
    }

    if (lostReport.color && normalize(lostReport.color) === normalize(foundReport.color)) {
      score += 10;
      reasons.push("Same color");
    }

    if (lostReport.brand && normalize(lostReport.brand) === normalize(foundReport.brand)) {
      score += 10;
      reasons.push("Same brand");
    }
  }

  const titlePoints = keywordScore(lostReport.title, foundReport.title);
  const descriptionPoints = keywordScore(
    lostReport.description,
    foundReport.description
  );

  if (titlePoints > 0) {
    score += titlePoints;
    reasons.push("Title keywords are similar");
  }

  if (descriptionPoints > 0) {
    score += descriptionPoints;
    reasons.push("Description keywords are similar");
  }

  const datePoints = addDaysDifferenceScore(lostReport.date, foundReport.date);

  if (datePoints > 0) {
    score += datePoints;
    reasons.push("Dates are close");
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
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

  useEffect(() => {
    const savedReports = readStorage(REPORTS_KEY, null);
    const savedUsers = readStorage(USERS_KEY, null);

    if (savedReports && Array.isArray(savedReports) && savedReports.length > 0) {
      setReports(savedReports);
    } else {
      setReports(defaultReports);
      writeStorage(REPORTS_KEY, defaultReports);
    }

    if (savedUsers && Array.isArray(savedUsers) && savedUsers.length > 0) {
      setUsers(savedUsers);
    } else {
      setUsers(defaultUsers);
      writeStorage(USERS_KEY, defaultUsers);
    }
  }, []);

  const saveReports = (nextReports, successMessage = "Admin changes saved.") => {
    setReports(nextReports);
    writeStorage(REPORTS_KEY, nextReports);
    window.dispatchEvent(new Event("lostFoundReportsUpdated"));
    showMessage(successMessage);
  };

  const saveUsers = (nextUsers, successMessage = "User changes saved.") => {
    setUsers(nextUsers);
    writeStorage(USERS_KEY, nextUsers);
    showMessage(successMessage);
  };

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3200);
  };

  const addAdminLog = (action, reportTitle = "") => {
    const previousLogs = readStorage(ADMIN_LOG_KEY, []);

    const nextLogs = [
      {
        id: Date.now(),
        action,
        reportTitle,
        date: new Date().toLocaleString("en-PK"),
      },
      ...previousLogs,
    ].slice(0, 50);

    writeStorage(ADMIN_LOG_KEY, nextLogs);
  };

  const addNotification = (report, type, title, text) => {
    const previousNotifications = readStorage(NOTIFICATIONS_KEY, []);

    const nextNotification = {
      id: Date.now(),
      reportId: report?.id || null,
      type,
      title,
      message: text,
      caseTitle: report?.title || "System Update",
      city: report?.city || "All Cities",
      time: "Just now",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    writeStorage(NOTIFICATIONS_KEY, [nextNotification, ...previousNotifications]);
    window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
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
      flagged: reports.filter((report) => Number(report.flagCount || 0) >= 5)
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
      const flaggedMatch = !filters.flaggedOnly || Number(report.flagCount || 0) >= 5;

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

  const flaggedReports = useMemo(() => {
    return reports.filter((report) => Number(report.flagCount || 0) >= 5);
  }, [reports]);

  const potentialMatches = useMemo(() => {
    const lostReports = reports.filter(
      (report) =>
        ["Missing", "Lost"].includes(report.type) &&
        report.adminStatus !== "Rejected"
    );

    const foundReports = reports.filter(
      (report) => report.type === "Found" && report.adminStatus !== "Rejected"
    );

    const matches = [];

    lostReports.forEach((lostReport) => {
      foundReports.forEach((foundReport) => {
        if (lostReport.category !== foundReport.category) {
          return;
        }

        const result = calculateMatchScore(lostReport, foundReport);

        if (result.score >= 45) {
          matches.push({
            id: `${lostReport.id}-${foundReport.id}`,
            lostReport,
            foundReport,
            score: result.score,
            reasons: result.reasons,
          });
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score);
  }, [reports]);

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

  const updateAdminStatus = (reportId, nextStatus) => {
    const targetReport = reports.find((report) => report.id === reportId);

    const nextReports = reports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            adminStatus: nextStatus,
          }
        : report
    );

    saveReports(nextReports, `Report marked as ${nextStatus}.`);
    addAdminLog(`Report marked as ${nextStatus}`, targetReport?.title);

    if (targetReport) {
      addNotification(
        targetReport,
        "Verification",
        `Report ${nextStatus}`,
        `Your report "${targetReport.title}" has been marked as ${nextStatus} by admin.`
      );
    }
  };

  const updateCaseStatus = (reportId, nextCaseStatus) => {
    const targetReport = reports.find((report) => report.id === reportId);

    const nextReports = reports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            caseStatus: nextCaseStatus,
          }
        : report
    );

    saveReports(nextReports, `Case status changed to ${nextCaseStatus}.`);
    addAdminLog(`Case status changed to ${nextCaseStatus}`, targetReport?.title);

    if (targetReport) {
      addNotification(
        targetReport,
        "Status",
        "Case Status Updated",
        `Your report "${targetReport.title}" case status is now ${nextCaseStatus}.`
      );
    }
  };

  const clearFlags = (reportId) => {
    const targetReport = reports.find((report) => report.id === reportId);

    const nextReports = reports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            flags: [],
            flagCount: 0,
          }
        : report
    );

    saveReports(nextReports, "Flags reviewed and cleared.");
    addAdminLog("Flags cleared", targetReport?.title);
  };

  const deleteReport = (reportId) => {
    const targetReport = reports.find((report) => report.id === reportId);

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report as fake/inappropriate?"
    );

    if (!confirmDelete) {
      return;
    }

    const nextReports = reports.filter((report) => report.id !== reportId);

    saveReports(nextReports, "Report deleted by admin.");
    addAdminLog("Report deleted", targetReport?.title);
    setSelectedReport(null);
  };

  const confirmMatch = (lostReport, foundReport) => {
    const confirmAction = window.confirm(
      `Confirm match between "${lostReport.title}" and "${foundReport.title}"?`
    );

    if (!confirmAction) {
      return;
    }

    const nextReports = reports.map((report) => {
      if (report.id === lostReport.id || report.id === foundReport.id) {
        return {
          ...report,
          adminStatus: "Matched",
          caseStatus: "Solved",
          matchedWith:
            report.id === lostReport.id ? foundReport.id : lostReport.id,
        };
      }

      return report;
    });

    saveReports(nextReports, "Match confirmed and both reports marked solved.");
    addAdminLog("Match confirmed", `${lostReport.title} + ${foundReport.title}`);

    addNotification(
      lostReport,
      "Match",
      "Match Confirmed",
      `Admin confirmed a possible match for your report "${lostReport.title}".`
    );

    addNotification(
      foundReport,
      "Match",
      "Match Confirmed",
      `Admin confirmed your found report "${foundReport.title}" as a possible match.`
    );
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

  const sendAlert = (e) => {
    e.preventDefault();

    if (!alertForm.title.trim() || !alertForm.message.trim()) {
      showMessage("Please enter alert title and message.");
      return;
    }

    addNotification(
      alertReport,
      alertForm.type,
      alertForm.title.trim(),
      alertForm.message.trim()
    );

    addAdminLog("Alert sent", alertReport?.title || "General Alert");
    showMessage("Alert notification created successfully.");
    setAlertReport(null);
    setShowAlertPopup(false);
  };

  const toggleUserStatus = (userId) => {
    const nextUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: user.status === "Blocked" ? "Active" : "Blocked",
          }
        : user
    );

    saveUsers(nextUsers, "User status updated.");
  };

  const deleteUser = (userId) => {
    const confirmDelete = window.confirm(
      "Delete this user from frontend admin list?"
    );

    if (!confirmDelete) {
      return;
    }

    saveUsers(
      users.filter((user) => user.id !== userId),
      "User removed from admin list."
    );
  };

  const renderStatusBadge = (status) => {
    return (
      <span className={`admin-status admin-status--${getStatusClass(status)}`}>
        {status === "Verified" && <FaCheckCircle />}
        {status === "Pending Review" && <FaClock />}
        {status === "Pending" && <FaClock />}
        {status === "Rejected" && <FaBan />}
        {status === "Matched" && <FaPeopleArrows />}
        {status}
      </span>
    );
  };

  const renderReportCard = (report) => {
    const isFlagged = Number(report.flagCount || 0) >= 5;

    return (
      <article
        className={`admin-report-card ${
          isFlagged ? "admin-report-card--flagged" : ""
        }`}
        key={report.id}
      >
        <div className="admin-report-card__image">
          <img src={report.image} alt={report.title} />

          <span
            className={`admin-type-badge ${
              report.type === "Found" ? "admin-type-badge--found" : ""
            }`}
          >
            {report.type}
          </span>

          {isFlagged && (
            <span className="admin-flag-badge">
              <FaFlag /> Review Required
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
            <FaMapMarkerAlt /> {report.location}
          </p>

          <p className="admin-report-meta">
            <FaCalendarAlt /> {report.date}
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
              <b>Flags:</b> {report.flagCount || 0}
            </span>
            <span>
              <b>City:</b> {report.city || "N/A"}
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
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {statusOptions.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option>All</option>
            <option>Person</option>
            <option>Item</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            {types.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
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
                setFilters({ ...filters, flaggedOnly: e.target.checked })
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

  const renderFlaggedTab = () => {
    return (
      <section className="admin-report-list">
        {flaggedReports.length > 0 ? (
          flaggedReports.map(renderReportCard)
        ) : (
          <div className="admin-empty-box">
            <FaFlag />
            <h3>No flagged reports</h3>
            <p>Reports with 5 or more flags will appear here for admin review.</p>
          </div>
        )}
      </section>
    );
  };

  const renderMatchesTab = () => {
    return (
      <section className="admin-match-list">
        {potentialMatches.length > 0 ? (
          potentialMatches.map((match) => (
            <article className="admin-match-card" key={match.id}>
              <div className="admin-match-score">
                <strong>{match.score}%</strong>
                <span>Match Score</span>
              </div>

              <div className="admin-match-columns">
                <div className="admin-match-report">
                  <img src={match.lostReport.image} alt={match.lostReport.title} />
                  <span>{match.lostReport.type}</span>
                  <h3>{match.lostReport.title}</h3>
                  <p>{match.lostReport.location}</p>
                </div>

                <div className="admin-match-line">
                  <FaPeopleArrows />
                </div>

                <div className="admin-match-report">
                  <img src={match.foundReport.image} alt={match.foundReport.title} />
                  <span>{match.foundReport.type}</span>
                  <h3>{match.foundReport.title}</h3>
                  <p>{match.foundReport.location}</p>
                </div>
              </div>

              <div className="admin-match-reasons">
                {match.reasons.map((reason) => (
                  <span key={reason}>{reason}</span>
                ))}
              </div>

              <div className="admin-report-actions">
                <button
                  type="button"
                  onClick={() => setSelectedReport(match.lostReport)}
                >
                  <FaEye /> View Lost/Missing
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReport(match.foundReport)}
                >
                  <FaEye /> View Found
                </button>

                <button
                  type="button"
                  className="admin-action-success"
                  onClick={() => confirmMatch(match.lostReport, match.foundReport)}
                >
                  <FaCheckDouble /> Confirm Match
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty-box">
            <FaPeopleArrows />
            <h3>No potential matches</h3>
            <p>Rule-based matching will show similar lost/found cases here.</p>
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
              This creates a frontend notification in localStorage. Later backend
              can replace this with Nodemailer/API notification logic.
            </p>
          </div>
        </div>

        <form
          className="admin-alert-form"
          onSubmit={(e) => {
            e.preventDefault();
            setAlertReport(null);

            if (!alertForm.title.trim() || !alertForm.message.trim()) {
              showMessage("Please enter alert title and message.");
              return;
            }

            addNotification(null, alertForm.type, alertForm.title, alertForm.message);
            addAdminLog("General alert sent", "All Users");
            showMessage("General notification created successfully.");

            setAlertForm({
              type: "Alert",
              title: "Admin Alert",
              message: "",
            });
          }}
        >
          <div className="admin-form-grid">
            <label>
              Alert Type
              <select
                value={alertForm.type}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, type: e.target.value })
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
                  setAlertForm({ ...alertForm, title: e.target.value })
                }
                placeholder="Enter alert title"
              />
            </label>
          </div>

          <label>
            Alert Message
            <textarea
              rows="5"
              value={alertForm.message}
              onChange={(e) =>
                setAlertForm({ ...alertForm, message: e.target.value })
              }
              placeholder="Write notification message for users..."
            ></textarea>
          </label>

          <button type="submit" className="admin-primary-btn">
            <FaPaperPlane /> Send Alert
          </button>
        </form>
      </section>
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
                Verify reports, review flagged posts, confirm matches, manage
                users, update case status and send alerts.
              </p>
            </div>

            <button
              type="button"
              className="admin-hero__btn"
              onClick={() => openAlertModal(null)}
            >
              <FaBell /> Create Alert
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
            <button type="button" onClick={() => setActiveTab("reports")}>
              <span>
                <FaClipboardList />
              </span>
              <div>
                <h3>{stats.total}</h3>
                <p>Total Reports</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("reports")}>
              <span>
                <FaClock />
              </span>
              <div>
                <h3>{stats.pending}</h3>
                <p>Pending Review</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("reports")}>
              <span>
                <FaCheckCircle />
              </span>
              <div>
                <h3>{stats.verified}</h3>
                <p>Verified</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("flagged")}>
              <span>
                <FaFlag />
              </span>
              <div>
                <h3>{stats.flagged}</h3>
                <p>Flagged Review</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("matches")}>
              <span>
                <FaPeopleArrows />
              </span>
              <div>
                <h3>{potentialMatches.length}</h3>
                <p>Potential Matches</p>
              </div>
            </button>

            <button type="button" onClick={() => setActiveTab("users")}>
              <span>
                <FaUsers />
              </span>
              <div>
                <h3>{users.length}</h3>
                <p>Users</p>
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
              className={activeTab === "flagged" ? "admin-tab--active" : ""}
              onClick={() => setActiveTab("flagged")}
            >
              <FaFlag /> Flagged Posts
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
              <FaBell /> Alerts
            </button>
          </section>

          {activeTab === "reports" && renderReportsTab()}
          {activeTab === "flagged" && renderFlaggedTab()}
          {activeTab === "matches" && renderMatchesTab()}
          {activeTab === "users" && renderUsersTab()}
          {activeTab === "alerts" && renderAlertsTab()}

          <Footer />
        </main>
      </div>

      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-details-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setSelectedReport(null)}
            >
              <FaTimes />
            </button>

            <img src={selectedReport.image} alt={selectedReport.title} />

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
                <b>City:</b> {selectedReport.city}
              </p>
              <p>
                <b>Date:</b> {selectedReport.date}
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
              {selectedReport.itemCategory && (
                <p>
                  <b>Item Category:</b> {selectedReport.itemCategory}
                </p>
              )}
              {selectedReport.color && (
                <p>
                  <b>Color:</b> {selectedReport.color}
                </p>
              )}
              {selectedReport.brand && (
                <p>
                  <b>Brand:</b> {selectedReport.brand}
                </p>
              )}
              <p>
                <b>Flags:</b> {selectedReport.flagCount || 0}
              </p>
            </div>

            <p>
              <b>Location:</b> {selectedReport.location}
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

            <h3>Reporter Information</h3>
            <div className="admin-detail-grid">
              <p>
                <b>Name:</b> {selectedReport.reporterName || "N/A"}
              </p>
              <p>
                <b>Contact:</b> {selectedReport.reporterContact || "N/A"}
              </p>
              <p>
                <b>Email:</b> {selectedReport.reporterEmail || "N/A"}
              </p>
              <p>
                <b>Relation:</b> {selectedReport.relation || "N/A"}
              </p>
            </div>

            {selectedReport.flags?.length > 0 && (
              <>
                <hr />
                <h3>Flag Reasons</h3>
                <div className="admin-flag-list">
                  {selectedReport.flags.map((flag, index) => (
                    <div key={`${flag.reason}-${index}`}>
                      <b>{flag.user || "User"}</b>
                      <span>{flag.reason}</span>
                      <small>{flag.date}</small>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="admin-report-actions admin-modal-actions">
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

              <button type="button" onClick={() => openAlertModal(selectedReport)}>
                <FaBell /> Alert
              </button>

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
      )}

      {showAlertPopup && (
        <div className="admin-modal-overlay" onClick={() => setShowAlertPopup(false)}>
          <form className="admin-alert-modal" onSubmit={sendAlert} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="admin-modal-close"
              onClick={() => setShowAlertPopup(false)}
            >
              <FaTimes />
            </button>

            <FaBell className="admin-alert-modal__icon" />
            <h2>{alertReport ? "Send Report Alert" : "Create Admin Alert"}</h2>
            <p>
              {alertReport
                ? `This alert will be linked with "${alertReport.title}".`
                : "This alert will be saved as a general frontend notification."}
            </p>

            <label>
              Alert Type
              <select
                value={alertForm.type}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, type: e.target.value })
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
                  setAlertForm({ ...alertForm, title: e.target.value })
                }
                placeholder="Enter title"
              />
            </label>

            <label>
              Message
              <textarea
                rows="5"
                value={alertForm.message}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, message: e.target.value })
                }
                placeholder="Write message..."
              ></textarea>
            </label>

            <button type="submit" className="admin-primary-btn">
              <FaPaperPlane /> Send Alert
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
