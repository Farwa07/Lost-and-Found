import React, { useEffect, useMemo, useState } from "react";

import "./FoundItem.css";
import { createFoundItemReport } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { applyReporterFields, getReporterFieldsFromUser, normalizeEmail } from "../utils/reporterInfo";
import { isValidPhoneNumber, normalizePhoneNumber } from "../utils/phoneNumber";

import {
  FaBoxOpen,
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


const FoundItem = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const initialState = {
    itemName: "",
    itemCategory: "",
    itemColor: "",
    itemBrand: "",
    foundLocation: "",
    city: "",
    foundDate: "",
    currentLocation: "",
    itemDescription: "",

    reporterFullName: "",
    reporterContactNumber: "+92",
    reporterEmail: "",
    reporterAddress: "",
    reporterCity: "",

    foundItemImage: null,
    reporterIdCardImage: null,
  };

  const [formData, setFormData, clearDraft] = useFormDraft("report-found-item", () =>
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
    setFormData({
      ...formData,
      [name]: name === "reporterContactNumber" ? normalizePhoneNumber(value) : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
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

      payload.append("itemName", formData.itemName.trim());
      payload.append("itemCategory", formData.itemCategory);
      payload.append("itemColor", formData.itemColor.trim());
      payload.append("itemBrand", formData.itemBrand.trim());
      payload.append("foundLocation", formData.foundLocation.trim());
      payload.append("foundDate", formData.foundDate);
      payload.append("currentLocation", formData.currentLocation.trim());
      payload.append("itemDescription", formData.itemDescription.trim());
      payload.append("city", formData.city.trim());

      payload.append("reporterFullName", formData.reporterFullName.trim());
      payload.append(
        "reporterContactNumber",
        formData.reporterContactNumber.trim()
      );
      payload.append("reporterEmail", normalizeEmail(currentUser?.email || formData.reporterEmail));
      payload.append("reporterAddress", formData.reporterAddress.trim());
      payload.append("reporterCity", formData.reporterCity.trim());

      if (formData.foundItemImage) {
        payload.append("foundItemImage", formData.foundItemImage);
      }

      if (formData.reporterIdCardImage) {
        payload.append("reporterIdCardImage", formData.reporterIdCardImage);
      }

      const response = await createFoundItemReport(payload);

      console.log("Found Item Report Submitted:", response?.report);

      toast(
        response?.message ||
          "Found Item Report Submitted Successfully! It is now pending admin verification."
      );

      clearDraft();
      setFormData(applyReporterFields(initialState, currentUser));
      formElement.reset();
      navigate("/reports");
    } catch (error) {
      console.error("Found Item Submit Error:", error);
      toast(error.message || "Something went wrong while submitting the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ReportFormShell backTo="/items" backLabel="Back to Items">
    <div className="found-item-page">
      <div className="found-item-overlay">
        <div className="found-item-container">
          <div className="found-item-header">
            <FaBoxOpen className="found-item-icon" />

            <h2>Report Found Item</h2>

            <p>
              Submit details about the found item to help reconnect it with the
              rightful owner.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              <h3>Found Item Details</h3>
            </div>

            <div className="found-item-grid">
              <div className="found-item-input">
                <label>Item Name</label>

                <input
                  type="text"
                  name="itemName"
                  placeholder="Enter item name"
                  value={formData.itemName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-item-input">
                <label>Item Category</label>

                <select
                  name="itemCategory"
                  value={formData.itemCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option>Mobile</option>
                  <option>Wallet</option>
                  <option>Bag</option>
                  <option>Laptop</option>
                  <option>Keys</option>
                  <option>Watch</option>
                  <option>Documents</option>
                  <option>Jewelry</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="found-item-input">
                <label>Item Color</label>

                <input
                  type="text"
                  name="itemColor"
                  placeholder="Enter item color"
                  value={formData.itemColor}
                  onChange={handleChange}
                />
              </div>

              <div className="found-item-input">
                <label>Item Brand</label>

                <input
                  type="text"
                  name="itemBrand"
                  placeholder="Enter item brand"
                  value={formData.itemBrand}
                  onChange={handleChange}
                />
              </div>

              <div className="found-item-input">
                <label htmlFor="foundLocation">Found location</label>

                <input
                  type="text"
                  id="foundLocation"
                  name="foundLocation"
                  placeholder="e.g. Liberty Market, Gulberg"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-item-input">
                <label htmlFor="city">City</label>
                <CityInput id="city" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="found-item-input">
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

              <div className="found-item-input">
                <label>Current Location of Item</label>

                <textarea
                  rows="4"
                  name="currentLocation"
                  placeholder="Where is the item kept now? e.g. Kamoki police station"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="found-item-input full-width">
              <label>Item Description</label>

              <textarea
                rows="5"
                name="itemDescription"
                placeholder="Mention item condition, marks, model, serial number, or any important details."
                value={formData.itemDescription}
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

            <div className="found-item-grid">
              <div className="found-item-input">
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

              <div className="found-item-input">
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

              <div className="found-item-input">
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

              <div className="found-item-input">
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

              <div className="found-item-input">
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
            </div>

            <div className="section-title">
              <h3>Required Uploads</h3>
            </div>

            <div className="upload-grid">
              <FileField
                name="foundItemImage"
                label="Found Item Picture"
                icon={FaUpload}
                file={formData.foundItemImage}
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
              className="found-item-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Found Item Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </ReportFormShell>
  );
};

export default FoundItem;
