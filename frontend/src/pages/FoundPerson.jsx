import React, { useState } from "react";
import "./FoundPerson.css";

import {
  FaSearchLocation,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const REPORTS_KEY = "lostFoundReports";

const cityOptions = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Gujranwala",
  "Sialkot",
  "Faisalabad",
  "Multan",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Hyderabad",
];

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

const inferCity = (...values) => {
  const combinedValue = values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchedCity = cityOptions.find((city) =>
    combinedValue.includes(city.toLowerCase())
  );

  if (matchedCity) {
    return matchedCity;
  }

  const locationValue = values.find(Boolean) || "";
  const locationParts = locationValue
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return locationParts.length > 1
    ? locationParts[locationParts.length - 1]
    : "Unknown";
};

const createReportId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const FoundPerson = () => {
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
    reporterRelationship: "",

    foundPersonImage: null,
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
    const file = e.target.files[0];

    setFormData({
      ...formData,
      [e.target.name]: file,
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
      const reportImage = await fileToBase64(formData.foundPersonImage);

      const foundTitle = formData.foundPersonName.trim()
        ? formData.foundPersonName.trim()
        : "Unknown Person";

      const newReport = {
        id: createReportId(),
        type: "Found",
        status: "Found",
        category: "Person",
        title: foundTitle,
        age: formData.estimatedAge,
        gender: formData.foundPersonGender,
        itemCategory: "",
        color: "",
        brand: "",
        city: inferCity(formData.foundLocation, formData.currentLocation),
        location: formData.foundLocation.trim(),
        currentLocation: formData.currentLocation.trim(),
        date: formData.foundDate,
        adminStatus: "Pending Review",
        caseStatus: "Unsolved",
        description: formData.foundPersonDescription.trim(),
        reporterName: formData.reporterFullName.trim(),
        reporterContact: formData.reporterContactNumber.trim(),
        reporterEmail: currentUser?.email || "",
        reporterAddress: currentUser?.address || currentUser?.city || "",
        relation: formData.reporterRelationship.trim(),
        image: reportImage,
        ownerName: currentUser?.fullName || formData.reporterFullName.trim(),
        ownerEmail: currentUser?.email || "",
        ownerId: currentUser?.id || currentUser?.email || "",
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

      console.log("Found Person Report Saved:", newReport);

      alert(
        "Found Person Report Submitted Successfully! It is now pending admin review."
      );

      setFormData(initialState);
      e.target.reset();
    } catch (error) {
      console.error("Found Person Submit Error:", error);
      alert("Something went wrong while saving the report. Please try again.");
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
                  <p className="file-name">{formData.reporterIdCardImage.name}</p>
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