import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HeroSection from "../components/HeroSection";

import {
  FaSearch,
  FaUsers,
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";

import bagimage from "../assets/bag.jfif";
import "./Home.css";

const recentReports = [
  {
    id: 1,
    type: "Missing",
    category: "Person",
    title: "Abdullah Khan",
    age: 7,
    gender: "Male",
    city: "Lahore",
    location: "Anarkali Bazaar, Lahore",
    date: "2026-05-12",
    description: "Last seen wearing red t-shirt and blue jeans. Small school bag with him.",
    reporterName: "Imran Khan",
    reporterContact: "03001112222",
    relation: "Father",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    type: "Found",
    category: "Person",
    title: "Areeba Noor",
    age: 9,
    gender: "Female",
    city: "Karachi",
    location: "Saddar Market, Karachi",
    currentLocation: "Edhi Center Karachi",
    date: "2026-05-18",
    description: "Found crying near market area. Wearing pink frock and white sandals.",
    reporterName: "Sadia Ahmed",
    reporterContact: "03125556666",
    relation: "Citizen",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    type: "Missing",
    category: "Person",
    title: "Hasnain Ali",
    age: 11,
    gender: "Male",
    city: "Islamabad",
    location: "G-10 Markaz, Islamabad",
    date: "2026-04-28",
    description: "Last seen after school hours wearing black school uniform.",
    reporterName: "Naveed Ali",
    reporterContact: "03214445555",
    relation: "Brother",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    type: "Found",
    category: "Person",
    title: "Iqra Fatima",
    age: 6,
    gender: "Female",
    city: "Multan",
    location: "Bus Stand, Multan",
    currentLocation: "Women Protection Center Multan",
    date: "2026-05-02",
    description: "Found alone near bus stand. Wearing yellow dress and black shoes.",
    reporterName: "Saima Bibi",
    reporterContact: "03334445555",
    relation: "NGO Worker",
    image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    type: "Lost",
    category: "Item",
    title: "School Backpack",
    itemCategory: "Bag",
    color: "Blue",
    brand: "Nike",
    city: "Lahore",
    location: "Liberty Market, Lahore",
    date: "2026-05-10",
    description: "Blue school backpack with cartoon keychain and books inside.",
    reporterName: "Ahmed Khan",
    reporterContact: "03009998888",
    reporterAddress: "Johar Town Lahore",
    image: "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    type: "Found",
    category: "Item",
    title: "Black Wallet",
    itemCategory: "Wallet",
    color: "Black",
    brand: "Leather Hub",
    city: "Multan",
    location: "Multan Bus Stand",
    currentLocation: "Police Station Multan",
    date: "2026-05-22",
    description: "Black wallet found near waiting area with some cards inside.",
    reporterName: "Ali Raza",
    reporterContact: "03335556666",
    reporterAddress: "Cantt Multan",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    type: "Lost",
    category: "Item",
    title: "Dell Laptop",
    itemCategory: "Laptop",
    color: "Gray",
    brand: "Dell",
    city: "Faisalabad",
    location: "D Ground Faisalabad",
    date: "2026-03-18",
    description: "Dell Inspiron laptop in black bag with charger.",
    reporterName: "Hassan Tariq",
    reporterContact: "03456667777",
    reporterAddress: "Peoples Colony Faisalabad",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    type: "Found",
    category: "Item",
    title: "Gold Watch",
    itemCategory: "Watch",
    color: "Golden",
    brand: "Rolex",
    city: "Rawalpindi",
    location: "Committee Chowk Rawalpindi",
    currentLocation: "District Office Rawalpindi",
    date: "2026-04-12",
    description: "Golden wrist watch found near shopping center.",
    reporterName: "Noman Malik",
    reporterContact: "03016667777",
    reporterAddress: "Satellite Town Rawalpindi",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 9,
    type: "Lost",
    category: "Item",
    title: "Samsung Tablet",
    itemCategory: "Mobile",
    color: "Black",
    brand: "Samsung",
    city: "Peshawar",
    location: "University Road Peshawar",
    date: "2026-05-25",
    description: "Samsung tablet with cracked corner and black cover.",
    reporterName: "Kamran Ali",
    reporterContact: "03297776666",
    reporterAddress: "Hayatabad Peshawar",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();

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

            <div className="recent-grid">
              {recentReports.map((report) => (
                <div key={report.id} className="recent-card">
                  <div
                    className={`case-tag ${
                      report.type === "Found"
                        ? "case-tag--found"
                        : "case-tag--missing"
                    }`}
                  >
                    {report.type}
                  </div>

                  <img src={report.image} alt={report.title} />

                  <div className="recent-card__content">
                    <span className="case-category">{report.category}</span>

                    <h3>{report.title}</h3>

                    <p>
                      <FaMapMarkerAlt /> {report.location}
                    </p>

                    <p>
                      <FaCalendarAlt /> {report.date}
                    </p>

                    <button onClick={() => setSelectedReport(report)}>
                      View Details
                    </button>
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

      <img src={selectedReport.image} alt={selectedReport.title} />

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
        <p><b>Case Type:</b> {selectedReport.type}</p>
        <p><b>Category:</b> {selectedReport.category}</p>

        {selectedReport.age && (
          <p><b>Age:</b> {selectedReport.age}</p>
        )}

        {selectedReport.gender && (
          <p><b>Gender:</b> {selectedReport.gender}</p>
        )}

        {selectedReport.city && (
          <p><b>City:</b> {selectedReport.city}</p>
        )}

        <p><b>Date:</b> {selectedReport.date}</p>
      </div>

      {selectedReport.itemCategory && (
        <p><b>Item Category:</b> {selectedReport.itemCategory}</p>
      )}

      {selectedReport.brand && (
        <p><b>Brand:</b> {selectedReport.brand}</p>
      )}

      {selectedReport.color && (
        <p><b>Color:</b> {selectedReport.color}</p>
      )}

      <p><b>Location:</b> {selectedReport.location}</p>

      {selectedReport.currentLocation && (
        <p><b>Current Location:</b> {selectedReport.currentLocation}</p>
      )}

      <p><b>Description:</b> {selectedReport.description}</p>

      <hr />

      <h3>Reporter Details</h3>

      <p><b>Reporter Name:</b> {selectedReport.reporterName}</p>

      {selectedReport.relation && (
        <p><b>Relation:</b> {selectedReport.relation}</p>
      )}

      {selectedReport.reporterAddress && (
        <p><b>Address:</b> {selectedReport.reporterAddress}</p>
      )}

      <p><b>Contact Number:</b> {selectedReport.reporterContact}</p>

      <a
        href={`tel:${selectedReport.reporterContact}`}
        className="call-btn"
      >
        <FaPhoneAlt /> Contact Now
      </a>
    </div>
  </div>
)}

          <Footer />
        </main>
      </div>
    </div>
  );
}