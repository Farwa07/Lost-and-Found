import React, { useState } from "react";

import "./FoundItem.css";

import {
  FaBoxOpen,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const REPORTS_KEY = "lostFoundReports";

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

const readReports = () => {
  try {
    const savedReports = localStorage.getItem(REPORTS_KEY);
    const parsedReports = savedReports ? JSON.parse(savedReports) : [];

    return Array.isArray(parsedReports) ? parsedReports : [];
  } catch {
    return [];
  }
};

const writeReports = (nextReports) => {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(nextReports));
  window.dispatchEvent(new Event("lostFoundReportsUpdated"));
};

const getCurrentUser = () => {
  try {
    const currentUser = localStorage.getItem("lostFoundCurrentUser");
    const registeredUser = localStorage.getItem("lostFoundRegisteredUser");

    if (currentUser) {
      return JSON.parse(currentUser);
    }

    if (registeredUser) {
      return JSON.parse(registeredUser);
    }

    return null;
  } catch {
    return null;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error("File could not be read"));
    };

    reader.readAsDataURL(file);
  });
};

const createReportId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const FoundItem = () => {
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

  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      setIsSubmitting(true);

      const currentUser = getCurrentUser();
      const reportImage = await fileToBase64(formData.foundItemImage);

      const newReport = {
        id: createReportId(),
        type: "Found",
        status: "Found",
        category: "Item",
        title: formData.itemName.trim(),
        age: "",
        gender: "",
        itemCategory: formData.itemCategory,
        color: formData.itemColor.trim(),
        brand: formData.itemBrand.trim(),
        city: inferCity(
          formData.foundLocation,
          formData.currentLocation,
          formData.reporterAddress
        ),
        location: formData.foundLocation.trim(),
        currentLocation: formData.currentLocation.trim(),
        date: formData.foundDate,
        adminStatus: "Pending Review",
        caseStatus: "Unsolved",
        description: formData.itemDescription.trim(),
        reporterName: formData.reporterFullName.trim(),
        reporterContact: formData.reporterContactNumber.trim(),
        reporterEmail: formData.reporterEmail.trim(),
        reporterAddress: formData.reporterAddress.trim(),
        relation: "",
        image: reportImage,
        ownerName: currentUser?.fullName || formData.reporterFullName.trim(),
        ownerEmail: currentUser?.email || formData.reporterEmail.trim(),
        ownerId:
          currentUser?.id ||
          currentUser?.email ||
          formData.reporterEmail.trim(),
        flags: [],
        flagCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
        reporterIdCardFileName: formData.reporterIdCardImage?.name || "",
        reportSource: "User Submitted",
      };

      const previousReports = readReports();
      const nextReports = [newReport, ...previousReports];

      writeReports(nextReports);

      console.log("Found Item Report Saved:", newReport);

      alert(
        "Found Item Report Submitted Successfully! It is now pending admin review."
      );

      setFormData(initialState);
      e.target.reset();
    } catch (error) {
      console.error("Found Item Submit Error:", error);
      alert("Something went wrong while saving the report. Please try again.");
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