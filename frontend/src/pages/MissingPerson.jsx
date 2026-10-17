import React, { useEffect, useMemo, useState } from "react";
import "./MissingPerson.css";
import { createMissingPersonReport } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { applyReporterFields, getReporterFieldsFromUser, normalizeEmail } from "../utils/reporterInfo";
import { isValidPhoneNumber, normalizePhoneNumber } from "../utils/phoneNumber";
import {
  FaUserAlt,
  FaUpload,
  FaIdCard,
  FaFileAlt,
} from "react-icons/fa";
import { toast } from "../utils/notify";
import { todayInputValue } from "../utils/date";
import ReportFormShell from "../components/ReportFormShell";
import FileField from "../components/FileField";
import CityInput from "../components/CityInput";
import useFormDraft from "../hooks/useFormDraft";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  missingPersonName: "",
  missingPersonAge: "",
  missingPersonGender: "",
  missingPersonLastSeenLocation: "",
  city: "",
  missingPersonLastSeenDate: "",
  missingPersonDescription: "",

  reporterFullName: "",
  reporterContactNumber: "+92",
  reporterEmail: "",
  reporterAddress: "",
  reporterCity: "",
  reporterRelationship: "",

  reporterIdCardImage: null,
  firReportImage: null,
  missingPersonImage: null,
};

const MissingPerson = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData, clearDraft] = useFormDraft("report-missing-person", () =>
    applyReporterFields(initialState, currentUser)
  );
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
  }, [reporterDefaults, setFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "reporterContactNumber" ? normalizePhoneNumber(value) : value;

    setFormData((previousData) => ({
      ...previousData,
      [name]: nextValue,
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
    if (!isValidPhoneNumber(formData.reporterContactNumber)) {
      toast("Enter 10 digits after the +92 prefix.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    const loggedInEmail = normalizeEmail(currentUser?.email || "");

    if (!loggedInEmail) {
      toast("Please login again before submitting a report.");
      return;
    }

    if (normalizeEmail(formData.reporterEmail) !== loggedInEmail) {
      toast("Reporter email must match your logged-in account email.");
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
      payload.append("city", formData.city.trim());
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
      payload.append("reporterCity", formData.reporterCity.trim());
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

      toast(
        response?.message ||
          "Missing Person Report Submitted Successfully! It is now pending admin verification."
      );

      clearDraft();
      setFormData(applyReporterFields(initialState, currentUser));
      formElement.reset();
      navigate("/reports");
    } catch (error) {
      console.error("Missing Person Submit Error:", error);
      toast(
        error.message ||
          "Something went wrong while submitting the report. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ReportFormShell backTo="/persons" backLabel="Back to Persons">
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
                <label htmlFor="missingPersonLastSeenLocation">Last seen location</label>
                <input
                  type="text"
                  id="missingPersonLastSeenLocation"
                  name="missingPersonLastSeenLocation"
                  placeholder="e.g. Data Darbar, near main gate"
                  value={formData.missingPersonLastSeenLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="city">City</label>
                <CityInput id="city" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label>Last Seen Date</label>
                <input
                  type="date"
                  max={todayInputValue()}
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

            <p className="reporter-profile-note">
              These details come from your profile and are shown to people who want to contact you.{" "}
              <Link to="/profile">Edit profile</Link>
            </p>

            <div className="form-grid">
              <div className="input-group">
                <label>Reporter Full Name</label>
                <input
                  type="text"
                  name="reporterFullName"
                  readOnly={Boolean(reporterDefaults.reporterFullName)}
                  title={reporterDefaults.reporterFullName ? "Taken from your profile. Update it in Profile to change it." : undefined}
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
                  readOnly={Boolean(reporterDefaults.reporterContactNumber)}
                  title={reporterDefaults.reporterContactNumber ? "Taken from your profile. Update it in Profile to change it." : undefined}
                  placeholder="+923XXXXXXXXX"
                  value={formData.reporterContactNumber}
                  onChange={handleChange}
                  pattern="\+92[0-9]{10}"
                  maxLength="13"
                  title="Enter +92 followed by exactly 10 digits"
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
                <label htmlFor="reporterAddress">Your address</label>
                <input
                  type="text"
                  id="reporterAddress"
                  name="reporterAddress"
                  readOnly={Boolean(reporterDefaults.reporterAddress)}
                  title={reporterDefaults.reporterAddress ? "Taken from your profile. Update it in Profile to change it." : undefined}
                  placeholder="House no, street, area"
                  value={formData.reporterAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="reporterCity">Your city</label>
                <CityInput
                  id="reporterCity"
                  name="reporterCity"
                  value={formData.reporterCity}
                  onChange={handleChange}
                  readOnly={Boolean(reporterDefaults.reporterCity)}
                  title={reporterDefaults.reporterCity ? "Taken from your profile. Update it in Profile to change it." : undefined}
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
              <FileField
                name="missingPersonImage"
                label="Missing Person Picture"
                icon={FaUpload}
                file={formData.missingPersonImage}
                onChange={handleFileChange}
                required
              />

              <FileField
                name="reporterIdCardImage"
                label="Your CNIC / ID card"
                icon={FaIdCard}
                hint="Kept private. Only you and the admins can see it."
                file={formData.reporterIdCardImage}
                onChange={handleFileChange}
                required
              />

              <FileField
                name="firReportImage"
                label="FIR report"
                icon={FaFileAlt}
                hint="Kept private. JPG, PNG or PDF, up to 5 MB."
                file={formData.firReportImage}
                onChange={handleFileChange}
                allowPdf
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Missing Person Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </ReportFormShell>
  );
};

export default MissingPerson;
