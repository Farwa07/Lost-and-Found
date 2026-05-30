import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaEye,
  FaShareAlt,
  FaRedo,
  FaPhoneAlt,
} from "react-icons/fa";
import "./Persons.css";

const personsData = [
  {
    id: 1,
    status: "Missing",
    name: "Abdullah Khan",
    age: 7,
    gender: "Male",
    lastSeenLocation: "Anarkali Bazaar, Lahore",
    city: "Lahore",
    date: "2026-05-12",
    description:
      "Last seen wearing red t-shirt and blue jeans. Small school bag with cartoons.",
    reporterFullName: "Imran Khan",
    reporterContactNumber: "03001112222",
    reporterRelationship: "Father",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 2,
    status: "Found",
    name: "Areeba Noor",
    age: 9,
    gender: "Female",
    foundLocation: "Saddar Market, Karachi",
    currentLocation: "Edhi Center Karachi",
    city: "Karachi",
    date: "2026-05-18",
    description:
      "Found crying near market area. Wearing pink frock and white sandals.",
    reporterFullName: "Sadia Ahmed",
    reporterContactNumber: "03125556666",
    reporterRelationship: "Citizen",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 3,
    status: "Missing",
    name: "Hasnain Ali",
    age: 11,
    gender: "Male",
    lastSeenLocation: "G-10 Markaz, Islamabad",
    city: "Islamabad",
    date: "2026-04-28",
    description:
      "Last seen after school hours wearing black school uniform.",
    reporterFullName: "Naveed Ali",
    reporterContactNumber: "03214445555",
    reporterRelationship: "Brother",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 4,
    status: "Found",
    name: "Iqra Fatima",
    age: 6,
    gender: "Female",
    foundLocation: "Bus Stand, Multan",
    currentLocation: "Women Protection Center Multan",
    city: "Multan",
    date: "2026-05-02",
    description:
      "Found alone near bus stand. Wearing yellow dress and black shoes.",
    reporterFullName: "Saima Bibi",
    reporterContactNumber: "03334445555",
    reporterRelationship: "NGO Worker",
    image:
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 5,
    status: "Missing",
    name: "Muhammad Bilal",
    age: 14,
    gender: "Male",
    lastSeenLocation: "D-Ground Faisalabad",
    city: "Faisalabad",
    date: "2026-03-19",
    description:
      "Last seen wearing grey hoodie and black trousers.",
    reporterFullName: "Shahid Mehmood",
    reporterContactNumber: "03457778888",
    reporterRelationship: "Father",
    image:
      "https://images.unsplash.com/photo-1517588632672-9758d6acba04?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 6,
    status: "Found",
    name: "Zainab Malik",
    age: 13,
    gender: "Female",
    foundLocation: "Committee Chowk, Rawalpindi",
    currentLocation: "District Hospital Rawalpindi",
    city: "Rawalpindi",
    date: "2026-04-09",
    description:
      "Found near hospital road. Carrying small purple backpack.",
    reporterFullName: "Nadia Khan",
    reporterContactNumber: "03016667777",
    reporterRelationship: "Citizen",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 7,
    status: "Missing",
    name: "Hamza Tariq",
    age: 5,
    gender: "Male",
    lastSeenLocation: "Clock Tower, Sialkot",
    city: "Sialkot",
    date: "2026-05-20",
    description:
      "Lost during shopping rush. Wearing blue cap and white shirt.",
    reporterFullName: "Tariq Ahmed",
    reporterContactNumber: "03078889999",
    reporterRelationship: "Father",
    image:
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 8,
    status: "Found",
    name: "Minal Faisal",
    age: 10,
    gender: "Female",
    foundLocation: "Latifabad Hyderabad",
    currentLocation: "Local Police Station Hyderabad",
    city: "Hyderabad",
    date: "2026-05-22",
    description:
      "Found near shopping area. Wearing green dress and white scarf.",
    reporterFullName: "Faisal Ahmed",
    reporterContactNumber: "03189990000",
    reporterRelationship: "Citizen",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },

  {
    id: 9,
    status: "Missing",
    name: "Ali Raza",
    age: 34,
    gender: "Male",
    lastSeenLocation: "University Road, Peshawar",
    city: "Peshawar",
    date: "2026-05-25",
    description:
      "Last seen wearing brown jacket and black shoes.",
    reporterFullName: "Kamran Raza",
    reporterContactNumber: "03297776666",
    reporterRelationship: "Brother",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function Persons() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [caseType, setCaseType] = useState("All");
  const [city, setCity] = useState("All");
  const [gender, setGender] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState(null);

  const navigate = useNavigate();

  const cities = ["All", ...new Set(personsData.map((p) => p.city))];

  const filteredPersons = useMemo(() => {
    return personsData.filter((person) => {
      const nameMatch = person.name
        .toLowerCase()
        .startsWith(search.toLowerCase());

      const caseMatch = caseType === "All" || person.status === caseType;
      const cityMatch = city === "All" || person.city === city;
      const genderMatch = gender === "All" || person.gender === gender;

      return nameMatch && caseMatch && cityMatch && genderMatch;
    });
  }, [search, caseType, city, gender]);

  const resetFilters = () => {
    setSearch("");
    setCaseType("All");
    setCity("All");
    setGender("All");
  };

  const handleShare = (person) => {
    const location =
      person.status === "Missing"
        ? person.lastSeenLocation
        : person.foundLocation;

    const text = `${person.status} Person: ${person.name}, Age: ${person.age}, Location: ${location}, Contact: ${person.reporterContactNumber}`;
    navigator.clipboard.writeText(text);
    alert("Person report copied for sharing!");
  };

  return (
    <div className="persons-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="persons-container">
        <Sidebar open={sidebarOpen} />

        <main className="persons-main">
          <div className="persons-header">
            <h1>Missing & Found Persons</h1>
            <p>Search and explore reported person cases.</p>
          </div>

          <div className="persons-actions">
            <button
              className="missing-person-btn"
              onClick={() => navigate("/report-missing-person")}
            >
              <FaUser /> Report Missing
            </button>

            <button
              className="found-person-btn"
              onClick={() => navigate("/report-found-person")}
            >
              <FaUser /> Report Found
            </button>
          </div>

          <div className="persons-filters">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={caseType} onChange={(e) => setCaseType(e.target.value)}>
              <option value="All">All Cases</option>
              <option value="Missing">Missing</option>
              <option value="Found">Found</option>
            </select>

            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName === "All" ? "All Cities" : cityName}
                </option>
              ))}
            </select>

            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <button className="reset-filter-btn" onClick={resetFilters}>
              <FaRedo /> Reset
            </button>
          </div>

          <p className="result-count">
            Showing {filteredPersons.length} of {personsData.length} reports
          </p>

          {filteredPersons.length === 0 ? (
            <div className="empty-box">
              <h3>No person report found</h3>
              <p>Try another name, city, gender or case type.</p>
            </div>
          ) : (
            <div className="persons-grid">
              {filteredPersons.map((person) => (
                <div key={person.id} className="person-card">
                  <span
                    className={`person-status ${
                      person.status === "Found"
                        ? "status-found"
                        : "status-missing"
                    }`}
                  >
                    {person.status}
                  </span>

                  <img src={person.image} alt={person.name} />

                  <div className="person-card-content">
                    <h3>{person.name}</h3>

                    <p>
                      <FaUser /> Age: {person.age} <span>|</span> Gender:{" "}
                      {person.gender}
                    </p>

                    <p>
                      <FaMapMarkerAlt />{" "}
                      {person.status === "Missing"
                        ? person.lastSeenLocation
                        : person.foundLocation}
                    </p>

                    <p>
                      <FaCalendarAlt /> Date: {person.date}
                    </p>

                    <div className="card-buttons">
                      <button onClick={() => setSelectedPerson(person)}>
                        <FaEye /> View Details
                      </button>

                      <button
                        className="share-btn"
                        onClick={() => handleShare(person)}
                      >
                        <FaShareAlt /> Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedPerson && (
            <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                <button
                  className="close-modal"
                  onClick={() => setSelectedPerson(null)}
                >
                  ×
                </button>

                <img src={selectedPerson.image} alt={selectedPerson.name} />

                <span
                  className={`detail-status ${
                    selectedPerson.status === "Found"
                      ? "status-found"
                      : "status-missing"
                  }`}
                >
                  {selectedPerson.status}
                </span>

                <h2>{selectedPerson.name}</h2>

                <div className="detail-grid">
                  <p><b>Age:</b> {selectedPerson.age}</p>
                  <p><b>Gender:</b> {selectedPerson.gender}</p>
                  <p><b>City:</b> {selectedPerson.city}</p>
                  <p><b>Date:</b> {selectedPerson.date}</p>
                </div>

                {selectedPerson.status === "Missing" ? (
                  <p><b>Last Seen Location:</b> {selectedPerson.lastSeenLocation}</p>
                ) : (
                  <>
                    <p><b>Found Location:</b> {selectedPerson.foundLocation}</p>
                    <p><b>Currently Present At:</b> {selectedPerson.currentLocation}</p>
                  </>
                )}

                <p><b>Description:</b> {selectedPerson.description}</p>

                <hr />

                <h3>Reporter Contact Details</h3>
                <p><b>Reporter Name:</b> {selectedPerson.reporterFullName}</p>
                <p><b>Relationship:</b> {selectedPerson.reporterRelationship}</p>
                <p><b>Contact Number:</b> {selectedPerson.reporterContactNumber}</p>

                <a
                  href={`tel:${selectedPerson.reporterContactNumber}`}
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