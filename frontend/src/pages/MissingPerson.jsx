import React, { useState } from "react";
import "./MissingPerson.css";
import {
  FaUserAlt,
  FaUpload,
  FaIdCard,
  FaFileAlt,
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
      const reportImage = await fileToBase64(formData.missingPersonImage);

      const newReport = {
        id: createReportId(),
        type: "Missing",
        status: "Missing",
        category: "Person",
        title: formData.missingPersonName.trim(),
        age: formData.missingPersonAge,
        gender: formData.missingPersonGender,
        itemCategory: "",
        color: "",
        brand: "",
        city: inferCity(formData.missingPersonLastSeenLocation),
        location: formData.missingPersonLastSeenLocation.trim(),
        currentLocation: "",
        date: formData.missingPersonLastSeenDate,
        adminStatus: "Pending Review",
        caseStatus: "Unsolved",
        description: formData.missingPersonDescription.trim(),
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
        firReportFileName: formData.firReportImage?.name || "",
        reportSource: "User Submitted",
      };

      const previousReports = readReports();
      const nextReports = [newReport, ...previousReports];

      writeReports(nextReports);

      console.log("Missing Person Report Saved:", newReport);

      alert(
        "Missing Person Report Submitted Successfully! It is now pending admin review."
      );

      setFormData(initialState);
      e.target.reset();
    } catch (error) {
      console.error("Missing Person Submit Error:", error);
      alert("Something went wrong while saving the report. Please try again.");
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