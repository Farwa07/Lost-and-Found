import "./MyReports.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import CommentsButton from "../components/CommentsButton";

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

const initialReports = [
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
    adminStatus: "Verified",
    caseStatus: "Unsolved",
    description:
      "Last seen wearing blue shirt and black trousers near Anarkali Bazaar.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Gujranwala",
    relation: "Father",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop",
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
    adminStatus: "Pending",
    caseStatus: "Unsolved",
    description:
      "Black leather wallet with CNIC copy and some cash inside. Lost near market area.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Satellite Town, Gujranwala",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
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
    adminStatus: "Matched",
    caseStatus: "Solved",
    description:
      "Samsung mobile found near roadside. Owner can contact with proof.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Gujranwala",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
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
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Gujranwala",
    relation: "Citizen",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop",
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
    adminStatus: "Pending",
    caseStatus: "Unsolved",
    description:
      "Blue school backpack lost near Liberty Market. It has books, notebooks and a cartoon keychain attached.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Johar Town, Lahore",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop",
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
      "Black Dell laptop bag lost near D Ground Faisalabad. It contains charger, documents and some personal notes.",
    reporterName: "John Doe",
    reporterContact: "03001234567",
    reporterAddress: "Peoples Colony, Faisalabad",
    relation: "",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function MyReports() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [message, setMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) => report.adminStatus === "Pending")
        .length,
      verified: reports.filter((report) => report.adminStatus === "Verified")
        .length,
      solved: reports.filter((report) => report.caseStatus === "Solved").length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
  if (activeFilter === "pending") {
    return reports.filter((report) => report.adminStatus === "Pending");
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

    if (!reportId) {
      return;
    }

    const targetReport = reports.find(
      (report) => String(report.id) === String(reportId)
    );

    if (targetReport) {
      setSelectedReport(targetReport);
    }
  }, [searchParams, reports]);

  const openReportDetails = (report) => {
    setSelectedReport(report);

    setSearchParams({
      reportId: String(report.id),
    });
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setSearchParams({});
  };

  const handleDeleteReport = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) {
      return;
    }

    setReports(reports.filter((report) => report.id !== id));
    setMessage("Report deleted successfully.");
    setSelectedReport(null);
    setSearchParams({});
  };

  const handleSolvedToggle = (id) => {
    setReports(
      reports.map((report) =>
        report.id === id
          ? {
              ...report,
              caseStatus:
                report.caseStatus === "Solved" ? "Unsolved" : "Solved",
            }
          : report
      )
    );

    setMessage("Case status updated successfully.");
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

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditingReport({
        ...editingReport,
        image: reader.result,
      });
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();

    setReports(
      reports.map((report) =>
        report.id === editingReport.id ? editingReport : report
      )
    );

    setMessage("Report updated successfully.");
    setEditingReport(null);
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
            {filteredReports.map((report) => (
              <div className="myreports-card" key={report.id}>
                <div className="myreports-card__image">
                  <img src={report.image} alt={report.title} />

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
                        className={`myreports-admin-status myreports-admin-status--${report.adminStatus.toLowerCase()}`}
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
    reportTitle={report.title || report.name}
    initialComments={report.comments || []}
    currentUser="John Doe"
  />

  <button onClick={() => setEditingReport(report)}>
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
            ))}
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

                <img src={selectedReport.image} alt={selectedReport.title} />

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
              onClick={() => setEditingReport(null)}
            >
              <div
                className="myreports-edit-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="myreports-modal-close"
                  onClick={() => setEditingReport(null)}
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
                    <img src={editingReport.image} alt={editingReport.title} />

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