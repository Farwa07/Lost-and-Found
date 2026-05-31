import React, { useState } from "react";
import "./FoundPerson.css";

import {
  FaSearchLocation,
  FaUpload,
  FaIdCard,
  FaMapMarkerAlt,
} from "react-icons/fa";

const FoundPerson = () => {
  const [formData, setFormData] = useState({
    // Found Person Details
    foundPersonName: "",
    estimatedAge: "",
    foundPersonGender: "",
    foundLocation: "",
    foundDate: "",
    currentLocation: "",
    foundPersonDescription: "",

    // Reporter Details
    reporterFullName: "",
    reporterContactNumber: "",
    reporterRelationship: "",

    // Uploads
    foundPersonImage: null,
    reporterIdCardImage: null,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
    alert("Found Person Report Submitted Successfully!");
  };

  return (
    <div className="found-person-page">
      <div className="found-overlay">
        <div className="found-container">
          {/* Header */}
          <div className="found-header">
            <FaSearchLocation className="found-icon" />

            <h2>Report Found Person</h2>

            <p>
              Submit complete details of the found person to help reconnect
              them with their family.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Found Person Details */}
            <div className="section-title">
              <h3>Found Person Details</h3>
            </div>

            <div className="found-grid">
              <div className="found-input">
                <label>Found Person Name (If Known)</label>

                <input
                  type="text"
                  name="foundPersonName"
                  placeholder="Enter found person's name"
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                  
                />
              </div>

              <div className="found-input">
                <label>Estimated Age</label>

                <input
  type="number"
  name="estimatedAge"
  placeholder="Enter estimated age"
  onChange={handleChange}
  min="0"
  max="120"
  onInput={(e) => {
    if (e.target.value < 0)
      e.target.value = "";
  }}
  onKeyDown={(e) => {
    if (
      e.key === "-" ||
      e.key === "+" ||
      e.key === "e"
    ) {
      e.preventDefault();
    }
  }}
  required
/>
              </div>

              <div className="found-input">
                <label>Found Person Gender</label>

                <select
                  name="foundPersonGender"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="found-input">
                <label>Found Location</label>

                <input
                  type="text"
                  name="foundLocation"
                  placeholder="Where was the person found?"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label>Found Date</label>

                <input
                  type="date"
                  name="foundDate"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
  <label>
    Current Location of Found Person
  </label>

  <textarea
    rows="4"
    name="currentLocation"
    placeholder="Enter complete current address where the found person is currently staying (Police Station, NGO, Hospital, Home etc.)"
    onChange={handleChange}
    required
  ></textarea>
</div>
            </div>

            <div className="found-input full-width">
              <label>
                Found Person Description
              </label>

              <textarea
                rows="5"
                name="foundPersonDescription"
                placeholder="Mention clothes, condition, appearance, injuries, identification marks or any important details."
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Reporter Details */}
            <div className="section-title">
              <h3>Reporter Details</h3>
            </div>

            <div className="found-grid">
              <div className="found-input">
                <label>Reporter Full Name</label>

                <input
                  type="text"
                  name="reporterFullName"
                  placeholder="Enter reporter full name"
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                  required
                />
              </div>

              <div className="found-input">
                <label>Reporter Contact Number</label>

                <input
                type="tel"
                name="reporterContactNumber"
                placeholder="03XXXXXXXXX"
                onChange={handleChange}
                pattern="[0-9]{11}"
                maxLength="11"
                title="Enter valid 11 digit phone number"
                required
                />
              </div>

              <div className="found-input">
                <label>
                  Relationship With Found Person
                </label>

                <input
                  type="text"
                  name="reporterRelationship"
                  placeholder="Relative, Citizen, NGO Worker etc."
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Upload Section */}
            <div className="section-title">
              <h3>Required Uploads</h3>
            </div>

            <div className="upload-grid">
              {/* Found Person Image */}
              <div className="upload-box">
                <label htmlFor="foundPersonImage">
                  <FaUpload className="upload-icon" />

                  Upload Found Person Picture
                </label>

                <input
                  type="file"
                  id="foundPersonImage"
                  name="foundPersonImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {/* Reporter ID Card */}
              <div className="upload-box">
                <label htmlFor="reporterIdCardImage">
                  <FaIdCard className="upload-icon" />

                  Upload Reporter ID Card Picture
                </label>

                <input
                  type="file"
                  id="reporterIdCardImage"
                  name="reporterIdCardImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="found-submit-btn">
              Submit Found Person Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoundPerson;