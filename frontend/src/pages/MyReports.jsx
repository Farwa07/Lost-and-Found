import "./MyReports.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CommentsButton from "../components/CommentsButton";
import { getMyReports, deleteMyReport, updateMyReportStatus, updateMyReport } from "../api/reportApi";
import {
  getFallbackReportImage,
  mapBackendReportsToUi,
  mapUiReportToUpdatePayload,
} from "../utils/reportMapper";

import {
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEye,
  FaFileAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTimes,
  FaTrash,
  FaUser,
  FaCamera,
  FaExclamationCircle,
} from "react-icons/fa";

const getSafeImage = (report) => {
  if (report.image) {
    return report.image;
  }

  return getFallbackReportImage(report.category);
};

const handleReportImageError = (event, category = "Item") => {
  const fallbackImage = getFallbackReportImage(category);

  if (event.currentTarget.src !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
};

const getReportImageUploadField = (report = {}) => {
  const category = String(report.category || report.reportCategory || "").toLowerCase();
  const type = String(report.type || "").toLowerCase();

  if (category === "person") {
    return type === "found" ? "foundPersonImage" : "missingPersonImage";
  }

  return type === "found" ? "foundItemImage" : "lostItemImage";
};

const buildReportUpdateFormData = (report, imageFile) => {
  const payload = mapUiReportToUpdatePayload(report);
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  if (imageFile) {
    formData.append(getReportImageUploadField(report), imageFile);
  }

  return formData;
};

const normalizeReport = (report) => {
  const type = report.type || report.status || "Missing";
  const category = report.category || "Person";

  return {
    ...report,
    id: report.id,
    type,
    status: type,
    category,
    title: report.title || report.name || report.itemName || "Untitled Report",
    age: report.age || "",
    gender: report.gender || "",
    itemCategory: report.itemCategory || "",
    color: report.color || report.itemColor || "",
    brand: report.brand || report.itemBrand || "",
    city: report.city || "Unknown",
    location:
      report.location ||
      report.lastSeenLocation ||
      report.foundLocation ||
      report.lostLocation ||
      "",
    currentLocation: report.currentLocation || "",
    date: report.date || report.lostDate || report.foundDate || "",
    adminStatus: report.adminStatus || "Pending Review",
    caseStatus: report.caseStatus || "Unsolved",
    description: report.description || report.itemDescription || "",
    reporterName:
      report.reporterName ||
      report.reporterFullName ||
      report.ownerName ||
      "Unknown Reporter",
    reporterContact:
      report.reporterContact || report.reporterContactNumber || "",
    reporterEmail: report.reporterEmail || report.ownerEmail || "",
    reporterAddress: report.reporterAddress || "",
    relation: report.relation || report.reporterRelationship || "",
    ownerName:
      report.ownerName ||
      report.reporterName ||
      report.reporterFullName ||
      "",
    ownerEmail:
      report.ownerEmail ||
      report.reporterEmail ||
      "",
    ownerId:
      report.ownerId ||
      report.ownerEmail ||
      report.reporterEmail ||
      "",
    image: getSafeImage(report),
    comments: Array.isArray(report.comments) ? report.comments : [],
    flags: Array.isArray(report.flags) ? report.flags : [],
    flagCount: Number(report.flagCount || 0),
    createdAt: report.createdAt || new Date().toISOString(),
  };
};

const getStatusClass = (status = "") => {
  const normalized = String(status).toLowerCase();

  if (normalized === "pending review") {
    return "pending";
  }

  return normalized.replace(/\s+/g, "-");
};

export default function MyReports() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allReports, setAllReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [autoOpenCommentReportId, setAutoOpenCommentReportId] = useState("");
  const [autoOpenCommentKey, setAutoOpenCommentKey] = useState("");
  const [highlightedCommentId, setHighlightedCommentId] = useState("");

  const loadMyReports = async () => {
    try {
      const response = await getMyReports();
      const apiReports = mapBackendReportsToUi(response?.reports || []).map(normalizeReport);
      setAllReports(apiReports);
    } catch (error) {
      console.error("My reports load error:", error);
      setAllReports([]);
      setMessage(error.message || "Unable to load your reports.");
    }
  };

  const saveAllReports = (nextReports) => {
    const normalizedReports = nextReports.map(normalizeReport);
    setAllReports(normalizedReports);
  };

  useEffect(() => {
    loadMyReports();

    window.addEventListener("authChanged", loadMyReports);

    return () => {
      window.removeEventListener("authChanged", loadMyReports);
    };
  }, []);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [message]);

  const reports = useMemo(() => {
    // Backend /reports/my-reports already filters reports by logged-in userId.
    // Do not filter again by reporterEmail, because reporter details can be
    // different from the logged-in account email.
    return allReports;
  }, [allReports]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) =>
        ["Pending", "Pending Review"].includes(report.adminStatus)
      ).length,
      verified: reports.filter((report) => report.adminStatus === "Verified")
        .length,
      solved: reports.filter((report) => report.caseStatus === "Solved").length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (activeFilter === "pending") {
      return reports.filter((report) =>
        ["Pending", "Pending Review"].includes(report.adminStatus)
      );
    }

    if (activeFilter === "verified") {
      return reports.filter((report) => report.adminStatus === "Verified");
    }

    if (activeFilter === "solved") {
      return reports.filter((report) => report.caseStatus === "Solved");
    }

    return reports;
  }, [reports, activeFilter]);

  useEffect(() => {
    const reportId = searchParams.get("reportId");
    const shouldOpenComments = searchParams.get("openComments") === "true";
    const commentId = searchParams.get("commentId") || "";

    if (!reportId || reports.length === 0) {
      return;
    }

    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    if (!targetReport) {
      return;
    }

    if (shouldOpenComments) {
      setActiveFilter("all");
      setSelectedReport(null);
      setEditingReport(null);

      setAutoOpenCommentReportId(String(targetReport.id));
      setHighlightedCommentId(commentId);
      setAutoOpenCommentKey(`${targetReport.id}-${commentId || "comments"}-${Date.now()}`);

      setTimeout(() => {
        const reportElement = document.getElementById(
          `myreport-${targetReport.id}`
        );

        reportElement?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);

      return;
    }

    setHighlightedCommentId("");
    setSelectedReport(targetReport);
  }, [searchParams, reports]);

  const openReportDetails = (report) => {
    setSelectedReport(report);

    setSearchParams({
      reportId: String(report.id),
    });
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setHighlightedCommentId("");
    setSearchParams({});
  };

  const handleDeleteReport = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMyReport(id);

      const nextReports = allReports.filter(
        (report) => String(report.id) !== String(id)
      );

      saveAllReports(nextReports);
      setMessage("Report deleted successfully.");
      setSelectedReport(null);
      setSearchParams({});
    } catch (error) {
      setMessage(error.message || "Unable to delete this report.");
    }
  };

  const handleSolvedToggle = async (id) => {
    const targetReport = reports.find(
      (report) => String(report.id) === String(id)
    );

    if (!targetReport) {
      setMessage("You can update only your own reports.");
      return;
    }

    const nextCaseStatus =
      targetReport.caseStatus === "Solved" ? "Unsolved" : "Solved";

    try {
      const response = await updateMyReportStatus(id, nextCaseStatus);
      const updatedReport = normalizeReport(mapBackendReportsToUi([response?.report])[0] || {
        ...targetReport,
        caseStatus: nextCaseStatus,
      });

      const nextReports = allReports.map((report) =>
        String(report.id) === String(id) ? updatedReport : report
      );

      saveAllReports(nextReports);
      setMessage("Case status updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update case status.");
    }
  };

  const handleEditChange = (e) => {
    setEditingReport({
      ...editingReport,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    setEditImageFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditingReport((currentReport) => ({
        ...currentReport,
        image: reader.result,
      }));
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editingReport) {
      return;
    }

    const targetReport = reports.find(
      (report) => String(report.id) === String(editingReport.id)
    );

    if (!targetReport) {
      setMessage("You can edit only your own reports.");
      setEditingReport(null);
      setEditImageFile(null);
      return;
    }

    try {
      const payload = editImageFile
        ? buildReportUpdateFormData(editingReport, editImageFile)
        : mapUiReportToUpdatePayload(editingReport);

      const response = await updateMyReport(editingReport.id, payload);
      const updatedReport = normalizeReport(
        mapBackendReportsToUi([response?.report])[0] || editingReport
      );

      const nextReports = allReports.map((report) =>
        String(report.id) === String(editingReport.id) ? updatedReport : report
      );

      saveAllReports(nextReports);
      setMessage("Report updated successfully.");
      setEditingReport(null);
      setEditImageFile(null);
    } catch (error) {
      setMessage(error.message || "Unable to update report.");
    }
  };

  const getAdminIcon = (status) => {
    if (status === "Verified" || status === "Matched") {
      return <FaCheckCircle />;
    }

    if (status === "Rejected") {
      return <FaExclamationCircle />;
    }

    return <FaClock />;
  };

  return (
    <div className="myreports">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="myreports__container">
        <Sidebar open={sidebarOpen} />

        <main className="myreports__main">
          <section className="myreports-hero">
            <div>
              <h1>My Reports</h1>

              <p>
                View, edit and manage your submitted reports. Admin verification
                status will update after admin review.
              </p>
            </div>

            <div className="myreports-hero__actions">
              <button onClick={() => navigate("/report-missing-person")}>
                <FaUser />
                Report Person
              </button>

              <button onClick={() => navigate("/report-lost-item")}>
                <FaBoxOpen />
                Report Item
              </button>
            </div>
          </section>

          <section className="myreports-stats">
            <button
              type="button"
              className={`myreports-stat-card ${
                activeFilter === "all" ? "myreports-stat-card--active" : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              <div className="myreports-stat-icon">
                <FaFileAlt />
              </div>

              <div>
                <h3>{stats.total}</h3>
                <p>Total Reports</p>
              </div>
            </button>

            <button
              type="button"
              className={`myreports-stat-card ${
                activeFilter === "pending" ? "myreports-stat-card--active" : ""
              }`}
              onClick={() => setActiveFilter("pending")}
            >
              <div className="myreports-stat-icon">
                <FaClock />
              </div>

              <div>
                <h3>{stats.pending}</h3>
                <p>Pending Review</p>
              </div>
            </button>

            <button
              type="button"
              className={`myreports-stat-card ${
                activeFilter === "verified" ? "myreports-stat-card--active" : ""
              }`}
              onClick={() => setActiveFilter("verified")}
            >
              <div className="myreports-stat-icon">
                <FaCheckCircle />
              </div>

              <div>
                <h3>{stats.verified}</h3>
                <p>Verified</p>
              </div>
            </button>

            <button
              type="button"
              className={`myreports-stat-card ${
                activeFilter === "solved" ? "myreports-stat-card--active" : ""
              }`}
              onClick={() => setActiveFilter("solved")}
            >
              <div className="myreports-stat-icon">
                <FaCheckCircle />
              </div>

              <div>
                <h3>{stats.solved}</h3>
                <p>Solved</p>
              </div>
            </button>
          </section>

          {message && (
            <div className="myreports-message">
              <FaCheckCircle />
              {message}

              <button onClick={() => setMessage("")}>
                <FaTimes />
              </button>
            </div>
          )}

          <section className="myreports-list">
            {filteredReports.length === 0 ? (
              <div className="empty-box">
                <h3>No report found</h3>
                <p>
                  You have not submitted any report in this filter yet.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  id={`myreport-${report.id}`}
                  className="myreports-card"
                  key={report.id}
                >
                  <div className="myreports-card__image">
                    <img
                      src={report.image}
                      alt={report.title}
                      onError={(event) => handleReportImageError(event, report.category)}
                    />

                    <span
                      className={`myreports-type ${
                        report.type === "Found"
                          ? "myreports-type--found"
                          : "myreports-type--missing"
                      }`}
                    >
                      {report.type}
                    </span>
                  </div>

                  <div className="myreports-card__content">
                    <div className="myreports-card__top">
                      <span className="myreports-category">
                        {report.category}
                      </span>

                      <div className="myreports-badges">
                        <span
                          className={`myreports-admin-status myreports-admin-status--${getStatusClass(
                            report.adminStatus
                          )}`}
                        >
                          {getAdminIcon(report.adminStatus)}
                          {report.adminStatus}
                        </span>

                        <span
                          className={`myreports-case-status ${
                            report.caseStatus === "Solved"
                              ? "myreports-case-status--solved"
                              : "myreports-case-status--unsolved"
                          }`}
                        >
                          {report.caseStatus}
                        </span>
                      </div>
                    </div>

                    <h2>{report.title}</h2>

                    <p>
                      <FaMapMarkerAlt />
                      {report.location}
                    </p>

                    <p>
                      <FaCalendarAlt />
                      {report.date}
                    </p>

                    <p className="myreports-description">
                      {report.description}
                    </p>

                    <div className="myreports-card__footer">
                      <label className="myreports-solved-check">
                        <input
                          type="checkbox"
                          checked={report.caseStatus === "Solved"}
                          onChange={() => handleSolvedToggle(report.id)}
                        />

                        Mark as solved
                      </label>

                      <div className="myreports-actions">
                        <button onClick={() => openReportDetails(report)}>
                          <FaEye />
                          View
                        </button>
<CommentsButton
  reportId={report.id}
  reportTitle={report.title || report.name}
  initialComments={report.comments || []}
  currentUser={currentUser?.fullName || "User"}
  autoOpenKey={
    autoOpenCommentReportId === String(report.id)
      ? autoOpenCommentKey
      : ""
  }
  highlightedCommentId={
    autoOpenCommentReportId === String(report.id)
      ? highlightedCommentId
      : ""
  }
/>

                        <button
                          onClick={() => {
                            setEditImageFile(null);
                            setEditingReport(report);
                          }}
                        >
                          <FaEdit />
                          Edit
                        </button>

                        <button
                          className="myreports-delete"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {selectedReport && (
            <div
              className="myreports-modal-overlay"
              onClick={closeReportDetails}
            >
              <div
                className="myreports-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="myreports-modal-close"
                  onClick={closeReportDetails}
                >
                  <FaTimes />
                </button>

                <img
                  src={selectedReport.image}
                  alt={selectedReport.title}
                  onError={(event) =>
                    handleReportImageError(event, selectedReport.category)
                  }
                />

                <span
                  className={`myreports-type ${
                    selectedReport.type === "Found"
                      ? "myreports-type--found"
                      : "myreports-type--missing"
                  }`}
                >
                  {selectedReport.type}
                </span>

                <h2>{selectedReport.title}</h2>

                <div className="myreports-detail-grid">
                  <p>
                    <b>Category:</b> {selectedReport.category}
                  </p>

                  <p>
                    <b>Admin Status:</b> {selectedReport.adminStatus}
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
                  <b>Contact Number:</b> {selectedReport.reporterContact}
                </p>

                <a
                  href={`tel:${selectedReport.reporterContact}`}
                  className="myreports-call-btn"
                >
                  <FaPhoneAlt />
                  Contact Now
                </a>
              </div>
            </div>
          )}

          {editingReport && (
            <div
              className="myreports-modal-overlay"
              onClick={() => {
                setEditingReport(null);
                setEditImageFile(null);
              }}
            >
              <div
                className="myreports-edit-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="myreports-modal-close"
                  onClick={() => {
                    setEditingReport(null);
                    setEditImageFile(null);
                  }}
                >
                  <FaTimes />
                </button>

                <h2>Edit Report</h2>

                <p className="myreports-edit-subtitle">
                  Update all report information. Admin status cannot be changed
                  by user.
                </p>

                <form className="myreports-edit-form" onSubmit={handleSaveEdit}>
                  <div className="myreports-edit-image">
                    <img
                      src={editingReport.image}
                      alt={editingReport.title}
                      onError={(event) =>
                        handleReportImageError(event, editingReport.category)
                      }
                    />

                    <label>
                      <FaCamera />
                      Change Report Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                      />
                    </label>
                  </div>

                  <div className="myreports-edit-grid">
                    <div className="myreports-field">
                      <label>Report Type</label>

                      <select
                        name="type"
                        value={editingReport.type}
                        onChange={handleEditChange}
                      >
                        <option>Missing</option>
                        <option>Found</option>
                        <option>Lost</option>
                      </select>
                    </div>

                    <div className="myreports-field">
                      <label>Category</label>

                      <select
                        name="category"
                        value={editingReport.category}
                        onChange={handleEditChange}
                      >
                        <option>Person</option>
                        <option>Item</option>
                      </select>
                    </div>

                    <div className="myreports-field">
                      <label>Title / Name</label>

                      <input
                        type="text"
                        name="title"
                        value={editingReport.title}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Date</label>

                      <input
                        type="date"
                        name="date"
                        value={editingReport.date}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    {editingReport.category === "Person" && (
                      <>
                        <div className="myreports-field">
                          <label>Age</label>

                          <input
                            type="number"
                            name="age"
                            value={editingReport.age}
                            onChange={handleEditChange}
                            placeholder="Enter age"
                          />
                        </div>

                        <div className="myreports-field">
                          <label>Gender</label>

                          <select
                            name="gender"
                            value={editingReport.gender}
                            onChange={handleEditChange}
                          >
                            <option value="">Select gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div className="myreports-field">
                          <label>Relation</label>

                          <input
                            type="text"
                            name="relation"
                            value={editingReport.relation}
                            onChange={handleEditChange}
                            placeholder="Father, Brother, Citizen etc."
                          />
                        </div>
                      </>
                    )}

                    {editingReport.category === "Item" && (
                      <>
                        <div className="myreports-field">
                          <label>Item Category</label>

                          <input
                            type="text"
                            name="itemCategory"
                            value={editingReport.itemCategory}
                            onChange={handleEditChange}
                            placeholder="Wallet, Mobile, Bag etc."
                          />
                        </div>

                        <div className="myreports-field">
                          <label>Brand</label>

                          <input
                            type="text"
                            name="brand"
                            value={editingReport.brand}
                            onChange={handleEditChange}
                            placeholder="Enter brand"
                          />
                        </div>

                        <div className="myreports-field">
                          <label>Color</label>

                          <input
                            type="text"
                            name="color"
                            value={editingReport.color}
                            onChange={handleEditChange}
                            placeholder="Enter color"
                          />
                        </div>
                      </>
                    )}

                    <div className="myreports-field">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        value={editingReport.city}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Location</label>

                      <input
                        type="text"
                        name="location"
                        value={editingReport.location}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Current Location</label>

                      <input
                        type="text"
                        name="currentLocation"
                        value={editingReport.currentLocation}
                        onChange={handleEditChange}
                        placeholder="For found case only"
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Reporter Name</label>

                      <input
                        type="text"
                        name="reporterName"
                        value={editingReport.reporterName}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Reporter Contact</label>

                      <input
                        type="tel"
                        name="reporterContact"
                        value={editingReport.reporterContact}
                        onChange={handleEditChange}
                        required
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Reporter Email</label>

                      <input
                        type="email"
                        name="reporterEmail"
                        value={editingReport.reporterEmail}
                        onChange={handleEditChange}
                      />
                    </div>

                    <div className="myreports-field">
                      <label>Reporter Address</label>

                      <input
                        type="text"
                        name="reporterAddress"
                        value={editingReport.reporterAddress}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>

                  <div className="myreports-field">
                    <label>Description</label>

                    <textarea
                      name="description"
                      value={editingReport.description}
                      onChange={handleEditChange}
                      required
                    ></textarea>
                  </div>

                  <button className="myreports-save-btn" type="submit">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          <Footer />
        </main>
      </div>
    </div>
  );
}