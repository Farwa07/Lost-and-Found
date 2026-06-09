import "./AdminPanel.css";

import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

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

const REPORTS_KEY = "lostFoundReports";
const NOTIFICATIONS_KEY = "lostFoundNotifications";
const USERS_KEY = "lostFoundUsers";
const ADMIN_LOG_KEY = "lostFoundAdminActionLog";
const CONFIRMED_MATCHES_KEY = "lostFoundConfirmedMatches";
const MATCH_DECISIONS_KEY = "lostFoundMatchDecisions";

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
    title: "Black Leather Wallet",
    age: "",
    gender: "",
    itemCategory: "Wallet",
    color: "Black",
    brand: "Leather Hub",
    city: "Gujranwala",
    location: "Satellite Town Market, Gujranwala",
    currentLocation: "Shop number 14, Satellite Town Market",
    date: "2026-05-22",
    adminStatus: "Verified",
    caseStatus: "Unsolved",
    description:
      "Found black leather wallet near Satellite Town Market. It contains CNIC copy and cash.",
    reporterName: "Ayesha Malik",
    reporterContact: "03123456789",
    reporterEmail: "ayesha@example.com",
    reporterAddress: "Gujranwala",
    relation: "Citizen",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
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

const dispatchReportsUpdate = () => {
  window.dispatchEvent(new Event("lostFoundReportsUpdated"));
};

const dispatchNotificationsUpdate = () => {
  window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
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

const getDateScore = (lostDate, foundDate) => {
  if (!lostDate || !foundDate) return 0;

  const firstDate = new Date(lostDate);
  const secondDate = new Date(foundDate);

  if (Number.isNaN(firstDate.getTime()) || Number.isNaN(secondDate.getTime())) {
    return 0;
  }

  const diffDays = Math.abs(secondDate - firstDate) / (1000 * 60 * 60 * 24);

  if (diffDays <= 3) return 15;
  if (diffDays <= 10) return 10;
  if (diffDays <= 30) return 6;

  return 0;
};

const keywordScore = (left = "", right = "") => {
  const leftWords = normalize(left)
    .split(/\W+/)
    .filter((word) => word.length > 3);

  const rightWords = normalize(right)
    .split(/\W+/)
    .filter((word) => word.length > 3);

  if (!leftWords.length || !rightWords.length) return 0;

  const matchedWords = leftWords.filter((word) => rightWords.includes(word));

  return Math.min(matchedWords.length * 5, 15);
};

const calculateMatchScore = (lostReport, foundReport) => {
  let score = 0;
  const reasons = [];
  const matchedFields = [];

  if (lostReport.category === foundReport.category) {
    score += 15;
    reasons.push("Same report category");
    matchedFields.push("Category");
  }

  if (normalize(lostReport.city) === normalize(foundReport.city)) {
    score += 20;
    reasons.push("Same city");
    matchedFields.push("City");
  }

  const locationMatch =
    normalize(lostReport.location) === normalize(foundReport.location) ||
    normalize(lostReport.location).includes(normalize(foundReport.city)) ||
    normalize(foundReport.location).includes(normalize(lostReport.city));

  if (locationMatch) {
    score += 10;
    reasons.push("Location information is similar");
    matchedFields.push("Location");
  }

  const datePoints = getDateScore(lostReport.date, foundReport.date);

  if (datePoints > 0) {
    score += datePoints;
    reasons.push("Dates are close");
    matchedFields.push("Date");
  }

  if (lostReport.category === "Person") {
    if (normalize(lostReport.gender) === normalize(foundReport.gender)) {
      score += 15;
      reasons.push("Same gender");
      matchedFields.push("Gender");
    }

    const ageDiff = Math.abs(Number(lostReport.age) - Number(foundReport.age));

    if (!Number.isNaN(ageDiff) && ageDiff <= 3) {
      score += 10;
      reasons.push("Similar age");
      matchedFields.push("Age");
    }
  }

  if (lostReport.category === "Item") {
    if (normalize(lostReport.itemCategory) === normalize(foundReport.itemCategory)) {
      score += 18;
      reasons.push("Same item category");
      matchedFields.push("Item Category");
    }

    if (lostReport.color && normalize(lostReport.color) === normalize(foundReport.color)) {
      score += 10;
      reasons.push("Same color");
      matchedFields.push("Color");
    }

    if (lostReport.brand && normalize(lostReport.brand) === normalize(foundReport.brand)) {
      score += 10;
      reasons.push("Same brand");
      matchedFields.push("Brand");
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
    matchedFields.push("Title Keywords");
  }

  if (descriptionPoints > 0) {
    score += descriptionPoints;
    reasons.push("Description keywords are similar");
    matchedFields.push("Description Keywords");
  }

  return {
    score: Math.min(score, 100),
    reasons: [...new Set(reasons)],
    matchedFields: [...new Set(matchedFields)],
  };
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [matchDecisions, setMatchDecisions] = useState([]);
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
    const savedDecisions = readStorage(MATCH_DECISIONS_KEY, []);

    if (Array.isArray(savedReports) && savedReports.length > 0) {
      const cleanReports = removeDuplicateReports(savedReports);
      setReports(cleanReports);
      writeStorage(REPORTS_KEY, cleanReports);
    } else {
      const cleanReports = removeDuplicateReports(defaultReports);
      setReports(cleanReports);
      writeStorage(REPORTS_KEY, cleanReports);
    }

    if (Array.isArray(savedUsers) && savedUsers.length > 0) {
      setUsers(savedUsers);
    } else {
      setUsers(defaultUsers);
      writeStorage(USERS_KEY, defaultUsers);
    }

    setMatchDecisions(Array.isArray(savedDecisions) ? savedDecisions : []);
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
    writeStorage(REPORTS_KEY, cleanReports);
    dispatchReportsUpdate();
    showMessage(successMessage);
  };

  const saveUsers = (nextUsers, successMessage = "User changes saved.") => {
    setUsers(nextUsers);
    writeStorage(USERS_KEY, nextUsers);
    showMessage(successMessage);
  };

  const saveMatchDecisions = (nextDecisions) => {
    setMatchDecisions(nextDecisions);
    writeStorage(MATCH_DECISIONS_KEY, nextDecisions);
  };

  const addAdminLog = (action, reportTitle = "") => {
    const previousLogs = readStorage(ADMIN_LOG_KEY, []);

    const nextLogs = [
      {
        id: `${Date.now()}-${Math.random()}`,
        action,
        reportTitle,
        date: new Date().toLocaleString("en-PK"),
      },
      ...previousLogs,
    ].slice(0, 60);

    writeStorage(ADMIN_LOG_KEY, nextLogs);
  };

  const addNotification = (report, type, title, text, extraData = {}) => {
    const previousNotifications = readStorage(NOTIFICATIONS_KEY, []);

    const nextNotification = {
      id: `${Date.now()}-${Math.random()}`,
      reportId: report?.id || null,
      type,
      title,
      message: text,
      caseTitle: report?.title || "System Update",
      city: report?.city || "All Cities",
      time: "Just now",
      isRead: false,
      createdAt: new Date().toISOString(),
      ...extraData,
    };

    writeStorage(NOTIFICATIONS_KEY, [
      nextNotification,
      ...previousNotifications,
    ]);

    dispatchNotificationsUpdate();
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

      const flaggedMatch =
        !filters.flaggedOnly || Number(report.flagCount || 0) >= 5;

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
    const dismissedPairKeys = new Set(
      matchDecisions
        .filter((decision) => decision.decision === "Not Matched")
        .map((decision) => decision.pairKey)
    );

    const dismissedVisualKeys = new Set(
      matchDecisions
        .filter((decision) => decision.decision === "Not Matched")
        .map((decision) => decision.visualPairKey)
        .filter(Boolean)
    );

    const confirmedPairKeys = new Set(
      matchDecisions
        .filter((decision) => decision.decision === "Confirmed")
        .map((decision) => decision.pairKey)
    );

    const confirmedVisualKeys = new Set(
      matchDecisions
        .filter((decision) => decision.decision === "Confirmed")
        .map((decision) => decision.visualPairKey)
        .filter(Boolean)
    );

    const lostReports = reports.filter(
      (report) =>
        ["Missing", "Lost"].includes(report.type) &&
        report.adminStatus !== "Rejected" &&
        report.adminStatus !== "Matched" &&
        report.caseStatus !== "Solved"
    );

    const foundReports = reports.filter(
      (report) =>
        report.type === "Found" &&
        report.adminStatus !== "Rejected" &&
        report.adminStatus !== "Matched" &&
        report.caseStatus !== "Solved"
    );

    const matches = [];
    const usedVisualPairs = new Set();

    lostReports.forEach((lostReport) => {
      foundReports.forEach((foundReport) => {
        if (lostReport.category !== foundReport.category) {
          return;
        }

        const pairKey = getPairKey(lostReport.id, foundReport.id);
        const visualPairKey = getVisualPairKey(lostReport, foundReport);

        if (
          dismissedPairKeys.has(pairKey) ||
          dismissedVisualKeys.has(visualPairKey) ||
          confirmedPairKeys.has(pairKey) ||
          confirmedVisualKeys.has(visualPairKey) ||
          usedVisualPairs.has(visualPairKey)
        ) {
          return;
        }

        const result = calculateMatchScore(lostReport, foundReport);

        if (result.score >= 60) {
          usedVisualPairs.add(visualPairKey);

          matches.push({
            id: pairKey,
            pairKey,
            visualPairKey,
            lostReport,
            foundReport,
            score: result.score,
            reasons: result.reasons,
            matchedFields: result.matchedFields,
          });
        }
      });
    });

    return matches.sort((a, b) => b.score - a.score);
  }, [reports, matchDecisions]);

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

  const updateAdminStatus = (reportId, nextStatus) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    const nextReports = reports.map((report) =>
      String(report.id) === String(reportId)
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
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    const nextReports = reports.map((report) =>
      String(report.id) === String(reportId)
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
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    const nextReports = reports.map((report) =>
      String(report.id) === String(reportId)
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
    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report as fake/inappropriate?"
    );

    if (!confirmDelete) return;

    const nextReports = reports.filter(
      (report) => String(report.id) !== String(reportId)
    );

    saveReports(nextReports, "Report deleted by admin.");
    addAdminLog("Report deleted", targetReport?.title);

    if (targetReport) {
      addNotification(
        targetReport,
        "Alert",
        "Report Deleted by Admin",
        `Your report "${targetReport.title}" was removed because it was fake, duplicate or inappropriate.`
      );
    }

    setSelectedReport(null);
  };

  const confirmMatch = (match) => {
    const confirmAction = window.confirm(
      `Confirm match between "${match.lostReport.title}" and "${match.foundReport.title}"?`
    );

    if (!confirmAction) {
      return;
    }

    const matchId = `match-${match.lostReport.id}-${match.foundReport.id}-${Date.now()}`;
    const matchedAt = new Date().toISOString();

    let updatedLostReport = null;
    let updatedFoundReport = null;

    const nextReports = reports.map((report) => {
      if (String(report.id) === String(match.lostReport.id)) {
        updatedLostReport = {
          ...report,
          adminStatus: "Matched",
          caseStatus: "Solved",
          matchedWith: match.foundReport.id,
          matchId,
          matchScore: match.score,
          matchedFields: match.matchedFields,
          matchedAt,
          matchedBy: "Admin",
          matchDecision: "Confirmed",
        };

        return updatedLostReport;
      }

      if (String(report.id) === String(match.foundReport.id)) {
        updatedFoundReport = {
          ...report,
          adminStatus: "Matched",
          caseStatus: "Solved",
          matchedWith: match.lostReport.id,
          matchId,
          matchScore: match.score,
          matchedFields: match.matchedFields,
          matchedAt,
          matchedBy: "Admin",
          matchDecision: "Confirmed",
        };

        return updatedFoundReport;
      }

      return report;
    });

    const matchRecord = {
      id: matchId,
      matchId,
      pairKey: match.pairKey,
      visualPairKey: match.visualPairKey,
      score: match.score,
      threshold: 60,
      reasons: match.reasons,
      matchedFields: match.matchedFields,
      lostReport: updatedLostReport,
      foundReport: updatedFoundReport,
      matchedAt,
      matchedBy: "Admin",
      decision: "Confirmed",
      userMessage:
        "Admin confirmed this rule-based match. Please compare both reports and contact the other reporter using the phone/email details shown below.",
    };

    const previousMatches = readStorage(CONFIRMED_MATCHES_KEY, []);

    const nextMatches = [
      matchRecord,
      ...previousMatches.filter(
        (item) =>
          item.pairKey !== match.pairKey &&
          item.visualPairKey !== match.visualPairKey
      ),
    ];

    writeStorage(CONFIRMED_MATCHES_KEY, nextMatches);

    const nextDecisions = [
      {
        id: `${Date.now()}-${Math.random()}`,
        pairKey: match.pairKey,
        visualPairKey: match.visualPairKey,
        decision: "Confirmed",
        matchId,
        score: match.score,
        lostReportId: match.lostReport.id,
        foundReportId: match.foundReport.id,
        lostTitle: match.lostReport.title,
        foundTitle: match.foundReport.title,
        decidedAt: matchedAt,
        decidedBy: "Admin",
      },
      ...matchDecisions.filter(
        (item) =>
          item.pairKey !== match.pairKey &&
          item.visualPairKey !== match.visualPairKey
      ),
    ];

    saveMatchDecisions(nextDecisions);

    saveReports(
      nextReports,
      "Match confirmed. Both reports are saved as Matched and Solved."
    );

    addAdminLog(
      "Match confirmed",
      `${match.lostReport.title} + ${match.foundReport.title}`
    );

    const actionUrl = `/match-alert/${matchId}`;

    addNotification(
      updatedLostReport,
      "Match",
      "Match Confirmed by Admin",
      `Admin confirmed a ${match.score}% match for your report "${updatedLostReport.title}". Open this alert to compare both reports.`,
      { matchId, actionUrl }
    );

    addNotification(
      updatedFoundReport,
      "Match",
      "Match Confirmed by Admin",
      `Admin confirmed your found report "${updatedFoundReport.title}" as a ${match.score}% match. Open this alert to compare both reports.`,
      { matchId, actionUrl }
    );
  };

  const dismissMatch = (match) => {
    const confirmAction = window.confirm(
      `Mark "${match.lostReport.title}" and "${match.foundReport.title}" as Not Matched?`
    );

    if (!confirmAction) {
      return;
    }

    const nextDecisions = [
      {
        id: `${Date.now()}-${Math.random()}`,
        pairKey: match.pairKey,
        visualPairKey: match.visualPairKey,
        decision: "Not Matched",
        score: match.score,
        lostReportId: match.lostReport.id,
        foundReportId: match.foundReport.id,
        lostTitle: match.lostReport.title,
        foundTitle: match.foundReport.title,
        decidedAt: new Date().toISOString(),
        decidedBy: "Admin",
      },
      ...matchDecisions.filter(
        (item) =>
          item.pairKey !== match.pairKey &&
          item.visualPairKey !== match.visualPairKey
      ),
    ];

    saveMatchDecisions(nextDecisions);

    addAdminLog(
      "Match dismissed",
      `${match.lostReport.title} + ${match.foundReport.title}`
    );

    showMessage("Match suggestion removed and saved as Not Matched.");
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

    setAlertForm({
      type: "Alert",
      title: "Admin Alert",
      message: "",
    });
  };

  const toggleUserStatus = (userId) => {
    const nextUsers = users.map((user) =>
      String(user.id) === String(userId)
        ? {
            ...user,
            status: user.status === "Blocked" ? "Active" : "Blocked",
          }
        : user
    );

    saveUsers(nextUsers, "User status updated.");
  };

  const deleteUser = (userId) => {
    const confirmDelete = window.confirm("Delete this user from frontend admin list?");

    if (!confirmDelete) return;

    saveUsers(
      users.filter((user) => String(user.id) !== String(userId)),
      "User removed from admin list."
    );
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
        <img src={report.image} alt={report.title} />

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
              Only 60% or higher lost/missing vs found candidates are shown for admin decision.
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
                  <b>Threshold:</b> 60%
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
            <h3>No 60%+ potential matches</h3>
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
    const logs = readStorage(ADMIN_LOG_KEY, []);

    return (
      <section className="admin-alert-card">
        <div className="admin-alert-card__heading">
          <FaClipboardList />

          <div>
            <h2>Admin Activity Log</h2>
            <p>Recent frontend admin actions saved in localStorage.</p>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="admin-report-info-grid">
            {logs.map((log) => (
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
                compare 60%+ rule-based matches and send alerts to users.
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
                <p>60%+ Matches</p>
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

          <Footer />
        </main>
      </div>
    </div>
  );
}