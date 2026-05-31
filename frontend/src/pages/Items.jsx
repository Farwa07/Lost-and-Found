import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import "./Items.css";

const itemsData = [
  {
    id: 1,
    status: "Lost",
    name: "iPhone 14 Pro",
    category: "Mobile",
    location: "Lahore",
    date: "2026-05-10",
    phone: "0300-1234567",
    description: "Black iPhone 14 Pro lost near Liberty Market.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    status: "Found",
    name: "Black Wallet",
    category: "Wallet",
    location: "Karachi",
    date: "2026-05-16",
    phone: "0312-7654321",
    description: "Wallet found near Saddar with cards inside.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    status: "Lost",
    name: "HP Laptop",
    category: "Laptop",
    location: "Islamabad",
    date: "2026-04-22",
    phone: "0321-9999999",
    description: "Silver HP laptop lost in university bus.",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    status: "Found",
    name: "Car Keys",
    category: "Keys",
    location: "Multan",
    date: "2026-05-01",
    phone: "0333-8888888",
    description: "Car keys found near parking area.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    status: "Lost",
    name: "Smart Watch",
    category: "Watch",
    location: "Faisalabad",
    date: "2026-03-17",
    phone: "0345-2222222",
    description: "Black smart watch lost near D-Ground.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    status: "Found",
    name: "Backpack",
    category: "Bag",
    location: "Rawalpindi",
    date: "2026-04-08",
    phone: "0301-3333333",
    description: "Blue backpack found near metro station.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Items() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const navigate = useNavigate();

  const categories = ["All", ...new Set(itemsData.map((item) => item.category))];
  const cities = ["All", ...new Set(itemsData.map((item) => item.location))];

  const filteredItems = useMemo(() => {
    return itemsData.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());

      const matchCategory = category === "All" || item.category === category;
      const matchCity = city === "All" || item.location === city;
      const matchStatus = status === "All" || item.status === status;

      return matchSearch && matchCategory && matchCity && matchStatus;
    });
  }, [search, category, city, status]);

  const totalLost = itemsData.filter((item) => item.status === "Lost").length;
  const totalFound = itemsData.filter((item) => item.status === "Found").length;

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setCity("All");
    setStatus("All");
  };

  const handleShare = (item) => {
    const text = `${item.status} Item: ${item.name}, Category: ${item.category}, Location: ${item.location}`;
    navigator.clipboard.writeText(text);
    alert("Item report copied for sharing!");
  };

  return (
    <div className="items-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="items-container">
        <Sidebar open={sidebarOpen} />

        <main className="items-main">
          <section className="items-hero">
            <div>
              <span className="items-label">Lost & Found Items</span>
              <h1>Lost & Found Items</h1>
              <p>Search, filter, view and share item reports easily.</p>
            </div>

            <div className="items-stats">
              <div>
                <strong>{itemsData.length}</strong>
                <span>Total Items</span>
              </div>
              <div>
                <strong>{totalLost}</strong>
                <span>Lost</span>
              </div>
              <div>
                <strong>{totalFound}</strong>
                <span>Found</span>
              </div>
            </div>
          </section>

          <div className="items-actions">
            <button className="lost-item-btn" onClick={() => navigate("/report-lost-item")}>
              Report Lost Item
            </button>

            <button className="found-item-btn" onClick={() => navigate("/report-found-item")}>
              Report Found Item
            </button>
          </div>

          <div className="items-filters">
            <input
              type="text"
              placeholder="Search by item, city or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>

            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName === "All" ? "All Cities" : cityName}
                </option>
              ))}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>

            <button className="reset-filter-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <p className="result-count">
            Showing <b>{filteredItems.length}</b> of <b>{itemsData.length}</b> reports
          </p>

          {filteredItems.length === 0 ? (
            <div className="empty-box">
              <h3>No item report found</h3>
              <p>Try changing category, city, status or search text.</p>
            </div>
          ) : (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="item-card">
                  <div className={`item-status ${item.status === "Found" ? "status-found" : "status-lost"}`}>
                    {item.status}
                  </div>

                  <img src={item.image} alt={item.name} />

                  <div className="item-card-content">
                    <h3>{item.name}</h3>
                    <p>Category: {item.category}</p>
                    <p>Location: {item.location}</p>
                    <p>Date: {item.date}</p>

                    <div className="card-buttons">
                      <button onClick={() => setSelectedItem(item)}>View Details</button>
                      <button className="share-btn" onClick={() => handleShare(item)}>Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedItem && (
            <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setSelectedItem(null)}>×</button>
                <img src={selectedItem.image} alt={selectedItem.name} />
                <h2>{selectedItem.name}</h2>
                <p><b>Status:</b> {selectedItem.status}</p>
                <p><b>Category:</b> {selectedItem.category}</p>
                <p><b>Location:</b> {selectedItem.location}</p>
                <p><b>Date:</b> {selectedItem.date}</p>
                <p><b>Contact:</b> {selectedItem.phone}</p>
                <p><b>Description:</b> {selectedItem.description}</p>
              </div>
            </div>
          )}

          <Footer />
        </main>
      </div>
    </div>
  );
}