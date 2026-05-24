import React, { useState } from "react";

import "./FoundItem.css";

import {
  FaBoxOpen,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const FoundItem = () => {

  const [formData, setFormData] = useState({

    // Found Item Details
    itemName: "",
    itemCategory: "",
    itemColor: "",
    itemBrand: "",
    foundLocation: "",
    foundDate: "",
    currentLocation: "",
    itemDescription: "",

    // Reporter Details
    reporterFullName: "",
    reporterContactNumber: "",
    reporterEmail: "",
    reporterAddress: "",

    // Uploads
    foundItemImage: null,
    reporterIdCardImage: null,

  });

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

  const handleSubmit = (e) => {

    e.preventDefault();

    console.log(formData);

  };

  return (

    <div className="found-item-page">

      <div className="found-item-overlay">

        <div className="found-item-container">

          {/* HEADER */}

          <div className="found-item-header">

            <FaBoxOpen className="found-item-icon" />

            <h2>
              Report Found Item
            </h2>

            <p>
              Submit details about the found item to help reconnect it with the rightful owner.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* FOUND ITEM DETAILS */}

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
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="found-item-input">

                <label>Item Category</label>

                <select
                  name="itemCategory"
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Category
                  </option>

                  <option>Mobile</option>
                  <option>Wallet</option>
                  <option>Laptop</option>
                  <option>Documents</option>
                  <option>Keys</option>
                  <option>Bag</option>
                  <option>Watch</option>
                  <option>Other</option>

                </select>

              </div>

              <div className="found-item-input">

                <label>Item Color (Optional)</label>

                <input
                  type="text"
                  name="itemColor"
                  placeholder="Enter item color"
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                />

              </div>

              <div className="found-item-input">

                <label>Item Brand (Optional)</label>

                <input
                  type="text"
                  name="itemBrand"
                  placeholder="Enter item brand"
                  onChange={handleChange}
                />

              </div>

              <div className="found-item-input">

                <label>Found Location</label>

                <input
                  type="text"
                  name="foundLocation"
                  placeholder="Where was the item found?"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="found-item-input">

                <label>Found Date</label>

                <input
                  type="date"
                  name="foundDate"
                  onChange={handleChange}
                  required
                />

              </div>

            </div>

            <div className="found-item-input full-width">

              <label>Current Item Location</label>

              <textarea
                rows="4"
                name="currentLocation"
                placeholder="Enter where the item is currently kept"
                onChange={handleChange}
                required
              ></textarea>

            </div>

            <div className="found-item-input full-width">

              <label>Item Description</label>

              <textarea
                rows="5"
                name="itemDescription"
                placeholder="Mention item condition, unique marks or important details."
                onChange={handleChange}
                required
              ></textarea>

            </div>

            {/* REPORTER DETAILS */}

            <div className="section-title">
              <h3>Reporter Details</h3>
            </div>

            <div className="found-item-grid">

              <div className="found-item-input">

                <label>Reporter Full Name</label>

                <input
                  type="text"
                  name="reporterFullName"
                  placeholder="Enter full name"
                  onChange={handleChange}
                  pattern="[A-Za-z\s]{3,}"
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
                  onChange={handleChange}
                  pattern="[0-9]{11}"
                  maxLength="11"
                  title="Enter valid 11 digit number"
                  required
                />

              </div>

              <div className="found-item-input">

                <label>Reporter Email</label>

                <input
                  type="email"
                  name="reporterEmail"
                  placeholder="Enter email address"
                  onChange={handleChange}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                  title="Enter valid email"
                  required
                />

              </div>

              <div className="found-item-input">

                <label>Reporter Address</label>

                <textarea
                  rows="4"
                  name="reporterAddress"
                  placeholder="Enter complete address"
                  onChange={handleChange}
                  required
                ></textarea>

              </div>

            </div>

            {/* UPLOADS */}

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

              </div>

            </div>

            <button
              type="submit"
              className="found-item-submit-btn"
            >

              Submit Found Item Report

            </button>

          </form>

        </div>

      </div>

    </div>

  );
};

export default FoundItem;