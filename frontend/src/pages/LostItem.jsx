import React, { useState } from "react";
import "./LostItem.css";

import {
  FaBoxOpen,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const LostItem = () => {
  const initialState = {
    itemName: "",
    itemCategory: "",
    itemColor: "",
    itemBrand: "",
    lostLocation: "",
    lostDate: "",
    itemDescription: "",

    reporterFullName: "",
    reporterContactNumber: "",
    reporterEmail: "",
    reporterAddress: "",

    lostItemImage: null,
    reporterIdCardImage: null,
  };

  const [formData, setFormData] = useState(initialState);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Lost Item Report:", formData);

    alert("Lost Item Report Submitted Successfully!");

    setFormData(initialState);
    e.target.reset();
  };

  return (
    <div className="lost-item-page">
      <div className="lost-item-overlay">
        <div className="lost-item-container">
          <div className="lost-item-header">
            <FaBoxOpen className="lost-item-icon" />

            <h2>Report Lost Item</h2>

            <p>
              Provide complete details about the lost item to help others
              identify and return it safely.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-title">
              <h3>Lost Item Details</h3>
            </div>

            <div className="lost-item-grid">
              <div className="lost-item-input">
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

              <div className="lost-item-input">
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
                  <option>Laptop</option>
                  <option>Documents</option>
                  <option>Keys</option>
                  <option>Bag</option>
                  <option>Watch</option>
                  <option>Accessories</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="lost-item-input">
                <label>Item Color (Optional)</label>

                <input
                  type="text"
                  name="itemColor"
                  placeholder="Enter item color"
                  value={formData.itemColor}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                />
              </div>

              <div className="lost-item-input">
                <label>Item Brand (Optional)</label>

                <input
                  type="text"
                  name="itemBrand"
                  placeholder="Enter item brand"
                  value={formData.itemBrand}
                  onChange={handleChange}
                />
              </div>

              <div className="lost-item-input">
                <label>Lost Location</label>

                <input
                  type="text"
                  name="lostLocation"
                  placeholder="Where was the item lost?"
                  value={formData.lostLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lost-item-input">
                <label>Lost Date</label>

                <input
                  type="date"
                  name="lostDate"
                  value={formData.lostDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="lost-item-input full-width">
              <label>Item Description</label>

              <textarea
                rows="5"
                name="itemDescription"
                placeholder="Mention item condition, unique marks, serial number or any important details."
                value={formData.itemDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="section-title">
              <h3>Reporter Details</h3>
            </div>

            <div className="lost-item-grid">
              <div className="lost-item-input">
                <label>Reporter Full Name</label>

                <input
                  type="text"
                  name="reporterFullName"
                  placeholder="Enter full name"
                  value={formData.reporterFullName}
                  onChange={handleChange}
                  pattern="[A-Za-z\s]{3,}"
                  title="Only alphabets are allowed"
                  required
                />
              </div>

              <div className="lost-item-input">
                <label>Reporter Contact Number</label>

                <input
                  type="tel"
                  name="reporterContactNumber"
                  placeholder="03XXXXXXXXX"
                  value={formData.reporterContactNumber}
                  onChange={handleChange}
                  pattern="[0-9]{11}"
                  maxLength="11"
                  title="Enter valid 11 digit number"
                  required
                />
              </div>

              <div className="lost-item-input">
                <label>Reporter Email</label>

                <input
                  type="email"
                  name="reporterEmail"
                  placeholder="Enter email address"
                  value={formData.reporterEmail}
                  onChange={handleChange}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                  title="Enter valid email"
                  required
                />
              </div>

              <div className="lost-item-input">
                <label>Reporter Address</label>

                <textarea
                  rows="4"
                  name="reporterAddress"
                  placeholder="Enter complete address"
                  value={formData.reporterAddress}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="section-title">
              <h3>Required Uploads</h3>
            </div>

            <div className="upload-grid">
              <div className="upload-box">
                <label htmlFor="lostItemImage">
                  <FaUpload className="upload-icon" />
                  Upload Lost Item Picture
                </label>

                <input
                  type="file"
                  id="lostItemImage"
                  name="lostItemImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />

                {formData.lostItemImage && (
                  <p className="file-name">
                    {formData.lostItemImage.name}
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
            </div>

            <button type="submit" className="lost-item-submit-btn">
              Submit Lost Item Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LostItem;