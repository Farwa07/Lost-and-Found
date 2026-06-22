import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaEye,
  FaShareAlt,
  FaRedo,
  FaPhoneAlt,
} from "react-icons/fa";
import "./Persons.css";
import CommentsButton from "../components/CommentsButton";
import ReportPostButton from "../components/ReportPostButton";
import { getPublicPersonReports } from "../api/reportApi";
import { normalizePersonReport } from "../utils/reportMapper";

export default function Persons() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [caseType, setCaseType] = useState("All");
  const [city, setCity] = useState("All");
  const [gender, setGender] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [allPersons, setAllPersons] = useState([]);
  const [cities, setCities] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    const loadPersons = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getPublicPersonReports({
          keyword: search.trim(),
          reportType: caseType,
          city,
          gender,
        });

        if (ignore) return;

        const nextPersons = (response?.reports || []).map(normalizePersonReport);
        const backendCities = response?.filters?.cities || [];

        setAllPersons(nextPersons);
        setCities(["All", ...backendCities.filter(Boolean)]);
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Unable to load person reports.");
          setAllPersons([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadPersons();

    return () => {
      ignore = true;
    };
  }, [search, caseType, city, gender]);

  const filteredPersons = allPersons;

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
              placeholder="Search by name, city or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
            >
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
            Showing {filteredPersons.length} of {allPersons.length} reports
          </p>

          {isLoading && <div className="empty-box"><h3>Loading person reports...</h3></div>}

          {error && !isLoading && <div className="empty-box"><h3>{error}</h3></div>}

          {!isLoading && !error && (filteredPersons.length === 0 ? (
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
                      <button
                        className="view-details-btn"
                        onClick={() => setSelectedPerson(person)}
                      >
                        <FaEye /> View Details
                      </button>

                      <CommentsButton
  reportId={person.id}
  reportTitle={person.title || person.name}
  initialComments={person.comments || []}
  currentUser="John Doe"
/>

                      <ReportPostButton report={person} />

                      <button
                        className="share-btn"
                        onClick={() => handleShare(person)}
                      >
                        <FaShareAlt />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {selectedPerson && (
            <div
              className="modal-overlay"
              onClick={() => setSelectedPerson(null)}
            >
              <div
                className="details-modal"
                onClick={(e) => e.stopPropagation()}
              >
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
                  <p>
                    <b>Age:</b> {selectedPerson.age}
                  </p>

                  <p>
                    <b>Gender:</b> {selectedPerson.gender}
                  </p>

                  <p>
                    <b>City:</b> {selectedPerson.city}
                  </p>

                  <p>
                    <b>Date:</b> {selectedPerson.date}
                  </p>

                  <p>
                    <b>Case Status:</b>{" "}
                    {selectedPerson.caseStatus || "Unsolved"}
                  </p>
                </div>

                {selectedPerson.status === "Missing" ? (
                  <p>
                    <b>Last Seen Location:</b>{" "}
                    {selectedPerson.lastSeenLocation}
                  </p>
                ) : (
                  <>
                    <p>
                      <b>Found Location:</b> {selectedPerson.foundLocation}
                    </p>

                    <p>
                      <b>Currently Present At:</b>{" "}
                      {selectedPerson.currentLocation}
                    </p>
                  </>
                )}

                <p>
                  <b>Description:</b> {selectedPerson.description}
                </p>

                <hr />

                <h3>Reporter Contact Details</h3>

                <p>
                  <b>Reporter Name:</b> {selectedPerson.reporterFullName}
                </p>

                <p>
                  <b>Relationship:</b> {selectedPerson.reporterRelationship}
                </p>

                <p>
                  <b>Contact Number:</b>{" "}
                  {selectedPerson.reporterContactNumber}
                </p>

                {selectedPerson.reporterEmail && (
                  <p>
                    <b>Email:</b> {selectedPerson.reporterEmail}
                  </p>
                )}

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