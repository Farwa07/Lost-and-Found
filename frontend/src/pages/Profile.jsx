import "./Profile.css";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaCamera,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUser,
  FaEdit,
  FaCheckCircle,
  FaFileAlt,
  FaBell,
  FaShieldAlt,
  FaTrash,
} from "react-icons/fa";

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profileImage, setProfileImage] = useState("");

  const [message, setMessage] = useState("");

  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "johndoe@gmail.com",
    phone: "+92 300 1234567",
    city: "Gujranwala",
    address: "Satellite Town, Gujranwala",
    bio: "I am using Lost & Found to report and track missing persons and lost items.",
  });

  useEffect(() => {
    const savedImage = localStorage.getItem("lostFoundProfileImage");
    const savedProfile = localStorage.getItem("lostFoundProfileData");

    if (savedImage) {
      setProfileImage(savedImage);
    }

    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  const updateSidebarProfile = () => {
    window.dispatchEvent(new Event("profileUpdated"));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageBase64 = reader.result;

      setProfileImage(imageBase64);

      localStorage.setItem("lostFoundProfileImage", imageBase64);

      setMessage("Profile picture updated successfully.");

      updateSidebarProfile();
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setProfileImage("");

    localStorage.removeItem("lostFoundProfileImage");

    setMessage("Profile picture removed successfully.");

    updateSidebarProfile();
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("lostFoundProfileData", JSON.stringify(profileData));

    setMessage("Profile updated successfully.");

    updateSidebarProfile();
  };

  return (
    <div className="profile">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="profile__container">
        <Sidebar open={sidebarOpen} />

        <main className="profile__main">
          <section className="profile-hero">
            <div>
              <h1>My Profile</h1>

              <p>
                Manage your personal information, contact details and display
                picture.
              </p>
            </div>

            <div className="profile-hero__badge">
              <FaShieldAlt />
              Verified User
            </div>
          </section>

          <section className="profile-content">
            <div className="profile-card profile-card--left">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <span>
                      {profileData.fullName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="profile-image-actions">
                  <label className="profile-upload-btn">
                    <FaCamera />
                    {profileImage ? "Change DP" : "Upload DP"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>

                  {profileImage && (
                    <button
                      type="button"
                      className="profile-remove-btn"
                      onClick={handleRemoveImage}
                    >
                      <FaTrash />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <h2>{profileData.fullName}</h2>

              <p className="profile-role">Lost & Found Member</p>

              <div className="profile-info-list">
                <p>
                  <FaEnvelope />
                  {profileData.email}
                </p>

                <p>
                  <FaPhoneAlt />
                  {profileData.phone}
                </p>

                <p>
                  <FaMapMarkerAlt />
                  {profileData.city}
                </p>
              </div>

              <div className="profile-stats">
                <div>
                  <h3>12</h3>
                  <p>Reports</p>
                </div>

                <div>
                  <h3>04</h3>
                  <p>Matched</p>
                </div>

                <div>
                  <h3>03</h3>
                  <p>Pending</p>
                </div>
              </div>
            </div>

            <div className="profile-card profile-card--right">
              <div className="profile-section-heading">
                <div>
                  <h2>Edit Profile</h2>

                  <p>Update your account details</p>
                </div>

                <FaEdit />
              </div>

              {message && (
                <div className="profile-message">
                  <FaCheckCircle />
                  {message}
                </div>
              )}

              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="profile-form__grid">
                  <div className="profile-field">
                    <label>Full Name</label>

                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>Email Address</label>

                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>Phone Number</label>

                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label>City</label>

                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      required
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Address</label>

                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                </div>

                <div className="profile-field">
                  <label>Bio</label>

                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Write something about yourself"
                  ></textarea>
                </div>

                <button className="profile-save-btn" type="submit">
                  Save Changes
                </button>
              </form>
            </div>
          </section>

          <section className="profile-quick">
            <div className="profile-quick-card">
              <div className="profile-quick-icon">
                <FaFileAlt />
              </div>

              <div>
                <h3>My Reports</h3>

                <p>View and manage your submitted lost and found reports.</p>
              </div>
            </div>

            <div className="profile-quick-card">
              <div className="profile-quick-icon">
                <FaBell />
              </div>

              <div>
                <h3>Notifications</h3>

                <p>Check case updates, admin alerts and possible matches.</p>
              </div>
            </div>

            <div className="profile-quick-card">
              <div className="profile-quick-icon">
                <FaUser />
              </div>

              <div>
                <h3>Account Security</h3>

                <p>Keep your account information secure and updated.</p>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}