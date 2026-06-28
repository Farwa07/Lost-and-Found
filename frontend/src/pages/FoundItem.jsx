import React, { useEffect, useMemo, useState } from "react";

import "./FoundItem.css";
import { createFoundItemReport } from "../api/reportApi";
import { useAuth } from "../context/AuthContext";
import { applyReporterFields, getReporterFieldsFromUser, normalizeEmail } from "../utils/reporterInfo";

import {
  FaBoxOpen,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";


const cityOptions = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Gujranwala",
  "Kamoki",
  "Kamoke",
  "Sialkot",
  "Faisalabad",
  "Multan",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Wazirabad",
  "Gujrat",
  "Sheikhupura",
  "Sargodha",
  "Bahawalpur",
  "Sahiwal",
  "Okara",
  "Kasur",
  "Jhelum",
  "Mardan",
  "Abbottabad",
  "Sukkur",
];

const cityAliases = {
  kamoki: "Kamoki",
  kamoke: "Kamoki",
  gujranwala: "Gujranwala",
  grw: "Gujranwala",
  lahore: "Lahore",
  karachi: "Karachi",
  islamabad: "Islamabad",
  rawalpindi: "Rawalpindi",
  pindi: "Rawalpindi",
  faisalabad: "Faisalabad",
  multan: "Multan",
  sialkot: "Sialkot",
  peshawar: "Peshawar",
  quetta: "Quetta",
  hyderabad: "Hyderabad",
  wazirabad: "Wazirabad",
  gujrat: "Gujrat",
  sheikhupura: "Sheikhupura",
  sargodha: "Sargodha",
  bahawalpur: "Bahawalpur",
  sahiwal: "Sahiwal",
  okara: "Okara",
  kasur: "Kasur",
  jhelum: "Jhelum",
  mardan: "Mardan",
  abbottabad: "Abbottabad",
  sukkur: "Sukkur",
};

const cleanCityName = (value = "") => {
  return String(value)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ");
};

const titleCaseCity = (value = "") => {
  return cleanCityName(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const inferCity = (...values) => {
  const combinedValue = values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const aliasKey = Object.keys(cityAliases).find((key) => {
    const pattern = new RegExp(`\\b${key}\\b`, "i");
    return pattern.test(combinedValue);
  });

  if (aliasKey) {
    return cityAliases[aliasKey];
  }

  const matchedCity = cityOptions.find((city) => {
    const pattern = new RegExp(`\\b${city.toLowerCase()}\\b`, "i");
    return pattern.test(combinedValue);
  });

  if (matchedCity) {
    return matchedCity === "Kamoke" ? "Kamoki" : matchedCity;
  }

  const locationValue = values.find(Boolean) || "";

  const locationParts = locationValue
    .split(",")
    .map((part) => cleanCityName(part))
    .filter(Boolean);

  if (locationParts.length > 1) {
    return titleCaseCity(locationParts[locationParts.length - 1]);
  }

  const words = cleanCityName(locationValue)
    .split(" ")
    .filter(Boolean);

  if (words.length > 0) {
    return titleCaseCity(words[words.length - 1]);
  }

  return "Unknown";
};

const FoundItem = () => {
  const { currentUser } = useAuth();

  const initialState = {
    itemName: "",
    itemCategory: "",
    itemColor: "",
    itemBrand: "",
    foundLocation: "",
    foundDate: "",
    currentLocation: "",
    itemDescription: "",

    reporterFullName: "",
    reporterContactNumber: "",
    reporterEmail: "",
    reporterAddress: "",

    foundItemImage: null,
    reporterIdCardImage: null,
  };

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

      payload.append("itemName", formData.itemName.trim());
      payload.append("itemCategory", formData.itemCategory);
      payload.append("itemColor", formData.itemColor.trim());
      payload.append("itemBrand", formData.itemBrand.trim());
      payload.append("foundLocation", formData.foundLocation.trim());
      payload.append("foundDate", formData.foundDate);
      payload.append("currentLocation", formData.currentLocation.trim());
      payload.append("itemDescription", formData.itemDescription.trim());
      payload.append(
        "city",
        inferCity(formData.foundLocation, formData.currentLocation, formData.reporterAddress)
      );

      payload.append("reporterFullName", formData.reporterFullName.trim());
      payload.append(
        "reporterContactNumber",
        formData.reporterContactNumber.trim()
      );
      payload.append("reporterEmail", normalizeEmail(currentUser?.email || formData.reporterEmail));
      payload.append("reporterAddress", formData.reporterAddress.trim());

      if (formData.foundItemImage) {
        payload.append("foundItemImage", formData.foundItemImage);
      }

      if (formData.reporterIdCardImage) {
        payload.append("reporterIdCardImage", formData.reporterIdCardImage);
      }

      const response = await createFoundItemReport(payload);

      console.log("Found Item Report Submitted:", response?.report);

      alert(
        response?.message ||
          "Found Item Report Submitted Successfully! It is now pending admin verification."
      );

      setFormData(applyReporterFields(initialState, currentUser));
      formElement.reset();
    } catch (error) {
      console.error("Found Item Submit Error:", error);
      alert(error.message || "Something went wrong while submitting the report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                <label>Found Location</label>

                <input
                  type="text"
                  name="foundLocation"
                  placeholder="Enter found location, city"
                  value={formData.foundLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="found-item-input">
                <label>Found Date</label>

                <input
                  type="date"
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
                  placeholder="Enter current location where item is kept, city"
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

            <div className="found-item-grid">
              <div className="found-item-input">
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

              <div className="found-item-input">
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
            </div>

            <div className="section-title">
              <h3>Required Uploads</h3>
            </div>

            <div className="upload-grid">
              <div className="upload-box">
                <label htmlFor="foundItemImage">
                  <FaUpload className="upload-icon" />
                  Upload Found Item Picture
                </label>

                <input
                  type="file"
                  id="foundItemImage"
                  name="foundItemImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />

                {formData.foundItemImage && (
                  <p className="file-name">{formData.foundItemImage.name}</p>
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
              className="found-item-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Found Item Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoundItem;