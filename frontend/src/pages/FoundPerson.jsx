import React, { useEffect, useMemo, useState } from "react";
import "./FoundPerson.css";
import { createFoundPersonReport } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { applyReporterFields, getReporterFieldsFromUser, normalizeEmail } from "../utils/reporterInfo";
import { isValidPhoneNumber, normalizePhoneNumber } from "../utils/phoneNumber";

import {
  FaSearchLocation,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";
import { toast } from "../utils/notify";
import { todayInputValue } from "../utils/date";
import ReportFormShell from "../components/ReportFormShell";
import FileField from "../components/FileField";
import CityInput from "../components/CityInput";
import useFormDraft from "../hooks/useFormDraft";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  foundPersonName: "",
  estimatedAge: "",
  foundPersonGender: "",
  foundLocation: "",
  city: "",
  foundDate: "",
  currentLocation: "",
  foundPersonDescription: "",

  reporterFullName: "",
  reporterContactNumber: "+92",
  reporterEmail: "",
  reporterAddress: "",
  reporterCity: "",
  reporterRelationship: "",

  foundPersonImage: null,
  reporterIdCardImage: null,
};

const FoundPerson = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData, clearDraft] = useFormDraft("report-found-person", () =>
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

      payload.append("foundPersonName", formData.foundPersonName.trim());
      payload.append("estimatedAge", formData.estimatedAge);
      payload.append("foundPersonGender", formData.foundPersonGender);
      payload.append("foundLocation", formData.foundLocation.trim());
      payload.append("city", formData.city.trim());
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
      payload.append("reporterEmail", normalizeEmail(currentUser?.email || formData.reporterEmail));
      payload.append("reporterAddress", formData.reporterAddress.trim());
      payload.append("reporterCity", formData.reporterCity.trim());
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

      toast(
        response?.message ||
          "Found Person Report Submitted Successfully! It is now pending admin verification."
      );

      clearDraft();
      setFormData(applyReporterFields(initialState, currentUser));
      formElement.reset();
      navigate("/reports");
    } catch (error) {
      console.error("Found Person Submit Error:", error);
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
                <label htmlFor="foundLocation">Found location</label>

                <input
                  type="text"
                  id="foundLocation"
                  name="foundLocation"
                  placeholder="e.g. Railway Station, platform 2"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-input">
                <label htmlFor="city">City</label>
                <CityInput id="city" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="found-input">
                <label>Found Date</label>

                <input
                  type="date"
                  max={todayInputValue()}
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
                  placeholder="Where is the person staying now? e.g. Police Station, Edhi Centre, hospital, home address"
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

            <p className="reporter-profile-note">
              These details come from your profile and are shown to people who want to contact you.{" "}
              <Link to="/profile">Edit profile</Link>
            </p>

            <div className="found-grid">
              <div className="found-input">
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

              <div className="found-input">
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

              <div className="found-input">
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

              <div className="found-input">
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

              <div className="found-input">
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
              <FileField
                name="foundPersonImage"
                label="Found Person Picture"
                icon={FaUpload}
                file={formData.foundPersonImage}
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
    </ReportFormShell>
  );
};

export default FoundPerson;
