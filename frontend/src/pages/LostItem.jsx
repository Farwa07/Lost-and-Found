import React, { useState } from "react";

import "./LostItem.css";

import {
  FaBoxOpen,
  FaUpload,
  FaIdCard,
} from "react-icons/fa";

const LostItem = () => {

  const [formData, setFormData] = useState({

    // Lost Item Details
    itemName: "",
    itemCategory: "",
    itemColor: "",
    itemBrand: "",
    lostLocation: "",
    lostDate: "",
    itemDescription: "",

    // Reporter Details
    reporterFullName: "",
    reporterContactNumber: "",
    reporterEmail: "",
    reporterAddress: "",

    // Uploads
    lostItemImage: null,
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

    <div className="lost-item-page">

      <div className="lost-item-overlay">

        <div className="lost-item-container">

          {/* HEADER */}

          <div className="lost-item-header">

            <FaBoxOpen className="lost-item-icon" />

            <h2>
              Report Lost Item
            </h2>

            <p>
              Provide complete details about the lost item to help others identify and return it safely.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* LOST ITEM DETAILS */}

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
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="lost-item-input">

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

              <div className="lost-item-input">

                <label>Item Color</label>

                <input
                  type="text"
                  name="itemColor"
                  placeholder="Enter item color"
                  onChange={handleChange}
                  pattern="[A-Za-z\s]+"
                  title="Only alphabets are allowed"
                  
                />

              </div>

              <div className="lost-item-input">

                <label>Item Brand</label>

                <input
                  type="text"
                  name="itemBrand"
                  placeholder="Enter item brand"
                  onChange={handleChange}
                 
                />

              </div>

              <div className="lost-item-input">

                <label>Lost Location</label>

                <input
                  type="text"
                  name="lostLocation"
                  placeholder="Where was the item lost?"
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="lost-item-input">

                <label>Lost Date</label>

                <input
                  type="date"
                  name="lostDate"
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
                onChange={handleChange}
                required
              ></textarea>

            </div>

            {/* REPORTER DETAILS */}

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

              {/* ITEM IMAGE */}

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

              </div>

              {/* ID CARD */}

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
              className="lost-item-submit-btn"
            >

              Submit Lost Item Report

            </button>

          </form>

        </div>

      </div>

    </div>

  );
};

export default LostItem;