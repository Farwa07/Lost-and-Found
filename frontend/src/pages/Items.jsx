import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaEye,
  FaShareAlt,
  FaRedo,
} from "react-icons/fa";

import "./Items.css";
import CommentsButton from "../components/CommentsButton";
import ReportPostButton from "../components/ReportPostButton";

const REPORTS_KEY = "lostFoundReports";

const itemData = [
  {
    id: 1,
    status: "Lost",
    itemName: "School Backpack",
    category: "Bag",
    color: "Blue",
    brand: "Nike",
    location: "Liberty Market Lahore",
    city: "Lahore",
    date: "2026-05-10",
    description:
      "Blue school backpack with cartoon keychain and books inside.",
    reporterName: "Ahmed Khan",
    reporterContact: "03001112222",
    reporterAddress: "Johar Town Lahore",
    image:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 2,
    status: "Found",
    itemName: "iPhone 14 Pro",
    category: "Mobile",
    color: "Black",
    brand: "Apple",
    location: "Saddar Karachi",
    currentLocation: "Edhi Center Karachi",
    city: "Karachi",
    date: "2026-05-14",
    description: "Black iPhone found near food street. Locked device.",
    reporterName: "Saad Ahmed",
    reporterContact: "03112223333",
    reporterAddress: "Clifton Karachi",
    image:
      "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 3,
    status: "Lost",
    itemName: "Wallet",
    category: "Wallet",
    color: "Brown",
    brand: "Leather Hub",
    location: "F-10 Islamabad",
    city: "Islamabad",
    date: "2026-04-20",
    description: "Brown leather wallet containing CNIC and cash.",
    reporterName: "Usman Ali",
    reporterContact: "03214445555",
    reporterAddress: "G-11 Islamabad",
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 4,
    status: "Found",
    itemName: "Car Keys",
    category: "Keys",
    color: "Silver",
    brand: "Honda",
    location: "Multan Bus Stand",
    currentLocation: "Police Station Multan",
    city: "Multan",
    date: "2026-05-02",
    description: "Honda car keys with red keychain found near waiting area.",
    reporterName: "Ali Raza",
    reporterContact: "03335556666",
    reporterAddress: "Cantt Multan",
    image:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 5,
    status: "Lost",
    itemName: "Dell Laptop",
    category: "Laptop",
    color: "Gray",
    brand: "Dell",
    location: "D Ground Faisalabad",
    city: "Faisalabad",
    date: "2026-03-18",
    description: "Dell Inspiron laptop in black bag with charger.",
    reporterName: "Hassan Tariq",
    reporterContact: "03456667777",
    reporterAddress: "Peoples Colony Faisalabad",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 6,
    status: "Found",
    itemName: "Gold Watch",
    category: "Watch",
    color: "Golden",
    brand: "Rolex",
    location: "Committee Chowk Rawalpindi",
    currentLocation: "District Office Rawalpindi",
    city: "Rawalpindi",
    date: "2026-04-12",
    description: "Golden wrist watch found near shopping center.",
    reporterName: "Noman Malik",
    reporterContact: "03016667777",
    reporterAddress: "Satellite Town Rawalpindi",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 7,
    status: "Lost",
    itemName: "Student ID Card",
    category: "Documents",
    color: "White",
    brand: "University Card",
    location: "Clock Tower Sialkot",
    city: "Sialkot",
    date: "2026-05-16",
    description: "University student card with blue lanyard.",
    reporterName: "Bilal Ahmed",
    reporterContact: "03078889999",
    reporterAddress: "Model Town Sialkot",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 8,
    status: "Found",
    itemName: "Ladies Handbag",
    category: "Bag",
    color: "Pink",
    brand: "Gucci",
    location: "Hyderabad Market",
    currentLocation: "Local Police Station Hyderabad",
    city: "Hyderabad",
    date: "2026-05-21",
    description: "Pink ladies handbag containing cosmetics and cards.",
    reporterName: "Farhan Sheikh",
    reporterContact: "03189990000",
    reporterAddress: "Latifabad Hyderabad",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },

  {
    id: 9,
    status: "Lost",
    itemName: "Samsung Tablet",
    category: "Mobile",
    color: "Black",
    brand: "Samsung",
    location: "University Road Peshawar",
    city: "Peshawar",
    date: "2026-05-25",
    description: "Samsung tablet with cracked corner and black cover.",
    reporterName: "Kamran Ali",
    reporterContact: "03297776666",
    reporterAddress: "Hayatabad Peshawar",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
    comments: [],
    adminStatus: "Verified",
    caseStatus: "Unsolved",
  },
];

const readReports = () => {
  try {
    const savedReports = localStorage.getItem(REPORTS_KEY);
    const parsedReports = savedReports ? JSON.parse(savedReports) : [];

    return Array.isArray(parsedReports) ? parsedReports : [];
  } catch {
    return [];
  }
};

const normalizeItemReport = (report) => {
  const status = report.status || report.type || "Lost";

  return {
    ...report,
    id: report.id,
    status,
    type: status,
    reportCategory: "Item",
    itemName: report.itemName || report.title || "Unknown Item",
    title: report.title || report.itemName || "Unknown Item",
    category:
      report.itemCategory ||
      (report.category !== "Item" ? report.category : "Other") ||
      "Other",
    itemCategory:
      report.itemCategory ||
      (report.category !== "Item" ? report.category : "Other") ||
      "Other",
    color: report.color || report.itemColor || "N/A",
    brand: report.brand || report.itemBrand || "N/A",
    location: report.location || report.lostLocation || report.foundLocation || "",
    currentLocation: report.currentLocation || "",
    city: report.city || "Unknown",
    date: report.date || report.lostDate || report.foundDate || "",
    description: report.description || report.itemDescription || "",
    reporterName:
      report.reporterName || report.reporterFullName || "Unknown Reporter",
    reporterContact:
      report.reporterContact || report.reporterContactNumber || "",
    reporterEmail: report.reporterEmail || "",
    reporterAddress: report.reporterAddress || "",
    image:
      report.image ||
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop",
    comments: Array.isArray(report.comments) ? report.comments : [],
    adminStatus: report.adminStatus || "Pending Review",
    caseStatus: report.caseStatus || "Unsolved",
    flagCount: Number(report.flagCount || 0),
    flags: Array.isArray(report.flags) ? report.flags : [],
  };
};

const getItemReportsFromStorage = () => {
  return readReports()
    .filter((report) => report.category === "Item")
    .filter((report) => ["Lost", "Found"].includes(report.type || report.status))
    .filter((report) => report.adminStatus !== "Rejected")
    .map(normalizeItemReport);
};

const removeDuplicateItems = (reports) => {
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

export default function Items() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [storedItems, setStoredItems] = useState([]);

  useEffect(() => {
    const syncItemReports = () => {
      setStoredItems(getItemReportsFromStorage());
    };

    syncItemReports();

    window.addEventListener("storage", syncItemReports);
    window.addEventListener("lostFoundReportsUpdated", syncItemReports);

    return () => {
      window.removeEventListener("storage", syncItemReports);
      window.removeEventListener("lostFoundReportsUpdated", syncItemReports);
    };
  }, []);

  const allItems = useMemo(() => {
    return removeDuplicateItems([
      ...storedItems,
      ...itemData.map(normalizeItemReport),
    ]);
  }, [storedItems]);

  const cities = useMemo(() => {
    return [
      "All",
      ...new Set(allItems.map((item) => item.city).filter(Boolean)),
    ];
  }, [allItems]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(allItems.map((item) => item.category).filter(Boolean)),
    ];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const searchValue = search.trim().toLowerCase();

      const nameMatch =
        !searchValue ||
        item.itemName.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue) ||
        item.city.toLowerCase().includes(searchValue) ||
        item.location.toLowerCase().includes(searchValue) ||
        item.description.toLowerCase().includes(searchValue) ||
        item.brand.toLowerCase().includes(searchValue) ||
        item.color.toLowerCase().includes(searchValue);

      const statusMatch = status === "All" || item.status === status;
      const cityMatch = city === "All" || item.city === city;
      const categoryMatch = category === "All" || item.category === category;

      return nameMatch && statusMatch && cityMatch && categoryMatch;
    });
  }, [allItems, search, status, city, category]);

  const resetFilters = () => {
    setSearch("");
    setStatus("All");
    setCity("All");
    setCategory("All");
  };

  const handleShare = (item) => {
    const text = `${item.status} Item: ${item.itemName}, Category: ${item.category}, Location: ${item.location}, Contact: ${item.reporterContact}`;

    navigator.clipboard.writeText(text);

    alert("Item details copied!");
  };

  return (
    <div className="items-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="items-layout">
        <Sidebar open={sidebarOpen} />

        <main className="items-main">
          <div className="items-header">
            <h1>Lost & Found Items</h1>

            <p>Search and explore reported item cases.</p>

            <div className="items-actions">
              <button
                className="lost-item-btn"
                onClick={() => navigate("/report-lost-item")}
              >
                Report Lost Item
              </button>

              <button
                className="found-item-btn"
                onClick={() => navigate("/report-found-item")}
              >
                Report Found Item
              </button>
            </div>
          </div>

          <div className="items-filters">
            <div className="search-box">
              <FaSearch />

              <input
                type="text"
                placeholder="Search by item name, city, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Cases</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>

            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName === "All" ? "All Cities" : cityName}
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <button className="reset-btn" onClick={resetFilters}>
              <FaRedo />
              Reset
            </button>
          </div>

          <div className="items-grid">
            {filteredItems.map((item) => (
              <div className="item-card" key={item.id}>
                <span
                  className={`item-status ${
                    item.status === "Found" ? "found" : "lost"
                  }`}
                >
                  {item.status}
                </span>

                <img src={item.image} alt={item.itemName} />

                <div className="item-content">
                  <h3>{item.itemName}</h3>

                  <p>
                    <FaBoxOpen />
                    {item.category}
                  </p>

                  <p>
                    <FaMapMarkerAlt />
                    {item.location}
                  </p>

                  <p>
                    <FaCalendarAlt />
                    {item.date}
                  </p>

                  <div className="item-buttons">
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedItem(item)}
                    >
                      <FaEye />
                      View Details
                    </button>

                    <CommentsButton
  reportId={item.id}
  reportTitle={item.title || item.itemName}
  initialComments={item.comments || []}
  currentUser="John Doe"
/>
                    <ReportPostButton report={item} />

                    <button
                      className="share-btn"
                      onClick={() => handleShare(item)}
                    >
                      <FaShareAlt />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-box">
              <h3>No item report found</h3>
              <p>Try another item name, city, category or case type.</p>
            </div>
          )}

          {selectedItem && (
            <div
              className="modal-overlay"
              onClick={() => setSelectedItem(null)}
            >
              <div
                className="details-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-btn"
                  onClick={() => setSelectedItem(null)}
                >
                  ×
                </button>

                <img src={selectedItem.image} alt={selectedItem.itemName} />

                <span
                  className={`detail-status ${
                    selectedItem.status === "Found" ? "found" : "lost"
                  }`}
                >
                  {selectedItem.status}
                </span>

                <h2>{selectedItem.itemName}</h2>

                <div className="detail-grid">
                  <p>
                    <b>Category:</b> {selectedItem.category}
                  </p>

                  <p>
                    <b>Brand:</b> {selectedItem.brand || "N/A"}
                  </p>

                  <p>
                    <b>Color:</b> {selectedItem.color || "N/A"}
                  </p>

                  <p>
                    <b>Date:</b> {selectedItem.date}
                  </p>

                  <p>
                    <b>Case Status:</b>{" "}
                    {selectedItem.caseStatus || "Unsolved"}
                  </p>
                </div>

                <p>
                  <b>Location:</b> {selectedItem.location}
                </p>

                {selectedItem.currentLocation && (
                  <p>
                    <b>Current Location:</b> {selectedItem.currentLocation}
                  </p>
                )}

                <p>
                  <b>Description:</b> {selectedItem.description}
                </p>

                <hr />

                <h3>Reporter Details</h3>

                <p>
                  <b>Name:</b> {selectedItem.reporterName}
                </p>

                <p>
                  <b>Contact:</b> {selectedItem.reporterContact}
                </p>

                <p>
                  <b>Address:</b> {selectedItem.reporterAddress || "N/A"}
                </p>

                {selectedItem.reporterEmail && (
                  <p>
                    <b>Email:</b> {selectedItem.reporterEmail}
                  </p>
                )}

                <a
                  href={`tel:${selectedItem.reporterContact}`}
                  className="call-btn"
                >
                  Contact Now
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