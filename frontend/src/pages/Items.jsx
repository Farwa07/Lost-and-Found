import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";

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
import ImagePreviewModal from "../components/ImagePreviewModal";
import { getPublicItemReports } from "../api/reportApi";
import { getFallbackReportImage, normalizeItemReport } from "../utils/reportMapper";

const handleItemImageError = (event) => {
  const fallbackImage = getFallbackReportImage("Item");

  if (event.currentTarget.src !== fallbackImage) {
    event.currentTarget.src = fallbackImage;
  }
};

const defaultCategories = [
  "All",
  "Mobile",
  "Wallet",
  "Bag",
  "Laptop",
  "Keys",
  "Watch",
  "Documents",
  "Jewelry",
  "Other",
];

export default function Items() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [city, setCity] = useState("All");
  const [category, setCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [cities, setCities] = useState(["All"]);
  const [categories, setCategories] = useState(defaultCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getPublicItemReports({
          keyword: search.trim(),
          reportType: status,
          city,
          itemCategory: category,
        });

        if (ignore) return;

        const nextItems = (response?.reports || []).map(normalizeItemReport);
        const backendCities = response?.filters?.cities || [];
        const backendCategories = response?.filters?.categories || [];

        setAllItems(nextItems);
        setCities(["All", ...backendCities.filter(Boolean)]);
        setCategories([
          "All",
          ...new Set([
            ...backendCategories.filter(Boolean),
            ...defaultCategories.filter((item) => item !== "All"),
          ]),
        ]);
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load item reports.");
          setAllItems([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadItems();

    return () => {
      ignore = true;
    };
  }, [search, status, city, category]);

  const filteredItems = allItems;

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

          {isLoading && <div className="empty-box"><h3>Loading item reports...</h3></div>}

          {error && !isLoading && <div className="empty-box"><h3>{error}</h3></div>}

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

                <img
                  className="clickable-report-image"
                  src={item.image}
                  alt={item.itemName}
                  title="Click to view full image"
                  onClick={() => setPreviewImage({ src: item.image, alt: item.itemName })}
                  onError={handleItemImageError}
                />

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
  currentUser="User"
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

          {!isLoading && !error && filteredItems.length === 0 && (
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

                <img
                  className="clickable-report-image"
                  src={selectedItem.image}
                  alt={selectedItem.itemName}
                  title="Click to view full image"
                  onClick={() => setPreviewImage({ src: selectedItem.image, alt: selectedItem.itemName })}
                  onError={handleItemImageError}
                />

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