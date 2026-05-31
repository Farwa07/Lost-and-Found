import React, { useState } from "react";
import "./MissingPerson.css";
import {
  FaUserAlt,
  FaUpload,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";

const MissingPerson = () => {
  const initialState = {
    missingPersonName: "",
    missingPersonAge: "",
    missingPersonGender: "",
    missingPersonLastSeenLocation: "",
    missingPersonLastSeenDate: "",
    missingPersonDescription: "",
    reporterFullName: "",
    reporterContactNumber: "",
    reporterRelationship: "",
    reporterIdCardImage: null,
    firReportImage: null,
    missingPersonImage: null,
  };

  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setFormData({
      ...formData,
      [e.target.name]: file,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Missing Person Report:", formData);

    alert("Missing Person Report Submitted Successfully!");

    setFormData(initialState);
    e.target.reset();
  };

  return (
    <div className="missing-person-page">
      <div className="missing-overlay">
        <div className="missing-form-container">
          <div className="form-header">
            <FaUserAlt className="header-icon" />
            <h2>Report Missing Person</h2>
            <p>
              Provide complete and accurate details to help identify and locate
              the missing person.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              <h3>Missing Person Details</h3>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label>Missing Person Full Name</label>
                <input
                  type="text"
                  name="missingPersonName"
                  placeholder="Enter missing person's full name"
                  value={formData.missingPersonName}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                  required
                />
              </div>

              <div className="input-group">
                <label>Missing Person Age</label>
                <input
                  type="number"
                  name="missingPersonAge"
                  placeholder="Enter age"
                  value={formData.missingPersonAge}
                  onChange={handleChange}
                  min="0"
                  max="120"
                  onKeyDown={(e) => {
                    if (["-", "+", "e"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>

              <div className="input-group">
                <label>Missing Person Gender</label>
                <select
                  name="missingPersonGender"
                  value={formData.missingPersonGender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Last Seen Location</label>
                <input
                  type="text"
                  name="missingPersonLastSeenLocation"
                  placeholder="Enter last seen location"
                  value={formData.missingPersonLastSeenLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Last Seen Date</label>
                <input
                  type="date"
                  name="missingPersonLastSeenDate"
                  value={formData.missingPersonLastSeenDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-group textarea-group">
              <label>Missing Person Description</label>
              <textarea
                rows="5"
                name="missingPersonDescription"
                placeholder="Mention clothes, appearance, identification marks, condition, or any important details."
                value={formData.missingPersonDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="section-title">
              <h3>Reporter Details</h3>
            </div>

            <div className="form-grid">
              <div className="input-group">
                <label>Reporter Full Name</label>
                <input
                  type="text"
                  name="reporterFullName"
                  placeholder="Enter reporter full name"
                  value={formData.reporterFullName}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                  required
                />
              </div>

              <div className="input-group">
                <label>Reporter Contact Number</label>
                <input
                  type="tel"
                  name="reporterContactNumber"
                  placeholder="03XXXXXXXXX"
                  value={formData.reporterContactNumber}
                  onChange={handleChange}
                  pattern="[0-9]{11}"
                  maxLength="11"
                  title="Enter valid 11 digit phone number"
                  required
                />
              </div>

              <div className="input-group">
                <label>Relationship With Missing Person</label>
                <input
                  type="text"
                  name="reporterRelationship"
                  placeholder="Father, Mother, Brother, Friend etc."
                  value={formData.reporterRelationship}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="section-title">
              <h3>Required Uploads</h3>
            </div>

            <div className="upload-grid">
              <div className="upload-box">
                <label htmlFor="missingPersonImage">
                  <FaUpload className="upload-icon" />
                  Upload Missing Person Picture
                </label>
                <input
                  type="file"
                  id="missingPersonImage"
                  name="missingPersonImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
                {formData.missingPersonImage && (
                  <p className="file-name">{formData.missingPersonImage.name}</p>
                )}
              </div>

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
                {formData.reporterIdCardImage && (
                  <p className="file-name">{formData.reporterIdCardImage.name}</p>
                )}
              </div>

              <div className="upload-box">
                <label htmlFor="firReportImage">
                  <FaFileAlt className="upload-icon" />
                  Upload FIR Report Picture / PDF Optional
                </label>
                <input
                  type="file"
                  id="firReportImage"
                  name="firReportImage"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                {formData.firReportImage && (
                  <p className="file-name">{formData.firReportImage.name}</p>
                )}
              </div>
            </div>

            <button type="submit" className="submit-btn">
              Submit Missing Person Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MissingPerson;