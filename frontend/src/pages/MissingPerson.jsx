import React, { useEffect, useMemo, useState } from "react";
import "./MissingPerson.css";
import { createMissingPersonReport } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { applyReporterFields, getReporterFieldsFromUser, normalizeEmail } from "../utils/reporterInfo";
import {
  FaUserAlt,
  FaUpload,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";

const initialState = {
  missingPersonName: "",
  missingPersonAge: "",
  missingPersonGender: "",
  missingPersonLastSeenLocation: "",
  missingPersonLastSeenDate: "",
  missingPersonDescription: "",

  reporterFullName: "",
  reporterContactNumber: "",
  reporterEmail: "",
  reporterAddress: "",
  reporterRelationship: "",

  reporterIdCardImage: null,
  firReportImage: null,
  missingPersonImage: null,
};

const MissingPerson = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState(() => applyReporterFields(initialState, currentUser));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reporterDefaults = useMemo(
    () => getReporterFieldsFromUser(currentUser),
    [currentUser]
  );

  useEffect(() => {
    setFormData((previousData) => ({
      ...previousData,
      ...reporterDefaults,
    }));
  }, [reporterDefaults]);

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

    const loggedInEmail = normalizeEmail(currentUser?.email || "");

    if (!loggedInEmail) {
      alert("Please login again before submitting a report.");
      return;
    }

    if (normalizeEmail(formData.reporterEmail) !== loggedInEmail) {
      alert("Reporter email must match your logged-in account email.");
      setFormData((previousData) => ({
        ...previousData,
        reporterEmail: loggedInEmail,
      }));
      return;
    }

    const formElement = e.currentTarget;

    try {
      setIsSubmitting(true);

      const payload = new FormData();

      payload.append("missingPersonName", formData.missingPersonName.trim());
      payload.append("missingPersonAge", formData.missingPersonAge);
      payload.append("missingPersonGender", formData.missingPersonGender);
      payload.append(
        "missingPersonLastSeenLocation",
        formData.missingPersonLastSeenLocation.trim()
      );
      payload.append(
        "missingPersonLastSeenDate",
        formData.missingPersonLastSeenDate
      );
      payload.append(
        "missingPersonDescription",
        formData.missingPersonDescription.trim()
      );

      payload.append("reporterFullName", formData.reporterFullName.trim());
      payload.append(
        "reporterContactNumber",
        formData.reporterContactNumber.trim()
      );
      payload.append("reporterEmail", normalizeEmail(currentUser?.email || formData.reporterEmail));
      payload.append("reporterAddress", formData.reporterAddress.trim());
      payload.append(
        "reporterRelationship",
        formData.reporterRelationship.trim()
      );

      if (formData.missingPersonImage) {
        payload.append("missingPersonImage", formData.missingPersonImage);
      }

      if (formData.reporterIdCardImage) {
        payload.append("reporterIdCardImage", formData.reporterIdCardImage);
      }

      if (formData.firReportImage) {
        payload.append("firReportImage", formData.firReportImage);
      }

      const response = await createMissingPersonReport(payload);

      alert(
        response?.message ||
          "Missing Person Report Submitted Successfully! It is now pending admin verification."
      );

      setFormData(applyReporterFields(initialState, currentUser));
      formElement.reset();
    } catch (error) {
      console.error("Missing Person Submit Error:", error);
      alert(
        error.message ||
          "Something went wrong while submitting the report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  placeholder="Enter last seen location, city"
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
                <label>Reporter Email</label>
                <input
                  type="email"
                  name="reporterEmail"
                  placeholder="Enter reporter email"
                  value={formData.reporterEmail}
                  onChange={handleChange}
                  readOnly
                  autoComplete="email"
                  title="Reporter email is locked to your logged-in account email"
                  required
                />
              </div>

              <div className="input-group">
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
                  <p className="file-name">
                    {formData.missingPersonImage.name}
                  </p>
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

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Missing Person Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MissingPerson;
