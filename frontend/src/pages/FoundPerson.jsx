import React, { useState } from "react";
import "./FoundPerson.css";
import { createFoundPersonReport } from "../api/reportApi";

import {
  FaSearchLocation,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const initialState = {
  foundPersonName: "",
  estimatedAge: "",
  foundPersonGender: "",
  foundLocation: "",
  foundDate: "",
  currentLocation: "",
  foundPersonDescription: "",

  reporterFullName: "",
  reporterContactNumber: "",
  reporterEmail: "",
  reporterAddress: "",
  reporterRelationship: "",

  foundPersonImage: null,
  reporterIdCardImage: null,
};

const FoundPerson = () => {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;

    setFormData((previousData) => ({
      ...previousData,
      [name]: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const formElement = e.currentTarget;

    try {
      setIsSubmitting(true);

      const payload = new FormData();

      payload.append("foundPersonName", formData.foundPersonName.trim());
      payload.append("estimatedAge", formData.estimatedAge);
      payload.append("foundPersonGender", formData.foundPersonGender);
      payload.append("foundLocation", formData.foundLocation.trim());
      payload.append("foundDate", formData.foundDate);
      payload.append("currentLocation", formData.currentLocation.trim());
      payload.append(
        "foundPersonDescription",
        formData.foundPersonDescription.trim()
      );

      payload.append("reporterFullName", formData.reporterFullName.trim());
      payload.append(
        "reporterContactNumber",
        formData.reporterContactNumber.trim()
      );
      payload.append("reporterEmail", formData.reporterEmail.trim());
      payload.append("reporterAddress", formData.reporterAddress.trim());
      payload.append(
        "reporterRelationship",
        formData.reporterRelationship.trim()
      );

      if (formData.foundPersonImage) {
        payload.append("foundPersonImage", formData.foundPersonImage);
      }

      if (formData.reporterIdCardImage) {
        payload.append("reporterIdCardImage", formData.reporterIdCardImage);
      }

      const response = await createFoundPersonReport(payload);

      alert(
        response?.message ||
          "Found Person Report Submitted Successfully! It is now pending admin verification."
      );

      setFormData(initialState);
      formElement.reset();
    } catch (error) {
      console.error("Found Person Submit Error:", error);
      alert(
        error.message ||
          "Something went wrong while submitting the report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="found-person-page">
      <div className="found-overlay">
        <div className="found-container">
          <div className="found-header">
            <FaSearchLocation className="found-icon" />

            <h2>Report Found Person</h2>

            <p>
              Submit complete details of the found person to help reconnect
              them with their family.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
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
                  value={formData.foundPersonName}
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
                  value={formData.estimatedAge}
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

              <div className="found-input">
                <label>Found Person Gender</label>

                <select
                  name="foundPersonGender"
                  value={formData.foundPersonGender}
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
                  placeholder="Where was the person found, city?"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label>Found Date</label>

                <input
                  type="date"
                  name="foundDate"
                  value={formData.foundDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label>Current Location of Found Person</label>

                <textarea
                  rows="4"
                  name="currentLocation"
                  placeholder="Enter complete current address where the found person is currently staying (Police Station, NGO, Hospital, Home etc.), city"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="found-input full-width">
              <label>Found Person Description</label>

              <textarea
                rows="5"
                name="foundPersonDescription"
                placeholder="Mention clothes, condition, appearance, injuries, identification marks or any important details."
                value={formData.foundPersonDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>

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
                  value={formData.reporterFullName}
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
                  value={formData.reporterContactNumber}
                  onChange={handleChange}
                  pattern="[0-9]{11}"
                  maxLength="11"
                  title="Enter valid 11 digit phone number"
                  required
                />
              </div>

              <div className="found-input">
                <label>Reporter Email</label>
                <input
                  type="email"
                  name="reporterEmail"
                  placeholder="Enter reporter email"
                  value={formData.reporterEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label>Reporter Address</label>
                <input
                  type="text"
                  name="reporterAddress"
                  placeholder="Enter reporter address, city"
                  value={formData.reporterAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label>Relationship With Found Person</label>

                <input
                  type="text"
                  name="reporterRelationship"
                  placeholder="Relative, Citizen, NGO Worker etc."
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

                {formData.foundPersonImage && (
                  <p className="file-name">{formData.foundPersonImage.name}</p>
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
                  <p className="file-name">
                    {formData.reporterIdCardImage.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="found-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Found Person Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoundPerson;
