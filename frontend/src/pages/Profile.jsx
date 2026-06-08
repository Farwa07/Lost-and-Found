import "./Profile.css";

import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaCamera,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaCheckCircle,                                              
  FaShieldAlt,
  FaTrash,
} from "react-icons/fa";

const REPORTS_KEY = "lostFoundReports";
const PROFILE_IMAGE_KEY = "lostFoundProfileImage";
const PROFILE_DATA_KEY = "lostFoundProfileData";
const CURRENT_USER_KEY = "lostFoundCurrentUser";
const REGISTERED_USER_KEY = "lostFoundRegisteredUser";
const USERS_KEY = "lostFoundUsers";

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalize = (value = "") => {
  return String(value).trim().toLowerCase();
};

const getCurrentUser = () => {
  const currentUser = safeParse(localStorage.getItem(CURRENT_USER_KEY));
  const registeredUser = safeParse(localStorage.getItem(REGISTERED_USER_KEY));
  const profileData = safeParse(localStorage.getItem(PROFILE_DATA_KEY));

  return currentUser || registeredUser || profileData || null;
};

const getInitialProfileData = () => {
  const savedProfile = safeParse(localStorage.getItem(PROFILE_DATA_KEY));
  const currentUser = getCurrentUser();

  return {
    fullName:
      savedProfile?.fullName ||
      savedProfile?.name ||
      currentUser?.fullName ||
      currentUser?.name ||
      "John Doe",
    email:
      savedProfile?.email ||
      currentUser?.email ||
      "johndoe@gmail.com",
    phone:
      savedProfile?.phone ||
      currentUser?.phone ||
      "+92 300 1234567",
    city: savedProfile?.city || currentUser?.city || "Gujranwala",
    address:
      savedProfile?.address ||
      currentUser?.address ||
      "Satellite Town, Gujranwala",
    bio:
      savedProfile?.bio ||
      "I am using Lost & Found to report and track missing persons and lost items.",
    role:
      savedProfile?.role ||
      currentUser?.role ||
      "Registered User",
  };
};

const readReports = () => {
  const reports = safeParse(localStorage.getItem(REPORTS_KEY), []);
  return Array.isArray(reports) ? reports : [];
};

const isOwnReport = (report, profileData) => {
  const userEmail = normalize(profileData.email);
  const userName = normalize(profileData.fullName);

  const ownerEmail = normalize(report.ownerEmail);
  const reporterEmail = normalize(report.reporterEmail);
  const ownerName = normalize(report.ownerName);
  const reporterName = normalize(report.reporterName || report.reporterFullName);

  if (userEmail && (ownerEmail === userEmail || reporterEmail === userEmail)) {
    return true;
  }

  if (userName && (ownerName === userName || reporterName === userName)) {
    return true;
  }

  return false;
};

const updateStoredUserData = (profileData) => {
  const currentUser = safeParse(localStorage.getItem(CURRENT_USER_KEY));
  const registeredUser = safeParse(localStorage.getItem(REGISTERED_USER_KEY));
  const users = safeParse(localStorage.getItem(USERS_KEY), []);

  const updatedPublicUser = {
    ...(currentUser || {}),
    fullName: profileData.fullName,
    email: normalize(profileData.email),
    phone: profileData.phone,
    role: profileData.role || currentUser?.role || registeredUser?.role || "Registered User",
    city: profileData.city,
    address: profileData.address,
  };

  const updatedRegisteredUser = {
    ...(registeredUser || updatedPublicUser),
    fullName: profileData.fullName,
    email: normalize(profileData.email),
    phone: profileData.phone,
    role: profileData.role || registeredUser?.role || currentUser?.role || "Registered User",
    city: profileData.city,
    address: profileData.address,
  };

  if (currentUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedPublicUser));
  }

  if (registeredUser) {
    localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(updatedRegisteredUser));
  }

  if (Array.isArray(users) && users.length > 0) {
    const nextUsers = users.map((user) => {
      const sameUser =
        normalize(user.email) === normalize(currentUser?.email || registeredUser?.email || profileData.email);

      if (!sameUser) {
        return user;
      }

      return {
        ...user,
        fullName: profileData.fullName,
        email: normalize(profileData.email),
        phone: profileData.phone,
        role: profileData.role || user.role || "Registered User",
        city: profileData.city,
        address: profileData.address,
      };
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  }

  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("profileUpdated"));
};

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState(() => getInitialProfileData());
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadProfile = () => {
      const savedImage = localStorage.getItem(PROFILE_IMAGE_KEY);
      const latestProfile = getInitialProfileData();

      setProfileImage(savedImage || "");
      setProfileData(latestProfile);
      setReports(readReports());
    };

    loadProfile();

    window.addEventListener("storage", loadProfile);
    window.addEventListener("authChanged", loadProfile);
    window.addEventListener("profileUpdated", loadProfile);
    window.addEventListener("lostFoundReportsUpdated", loadProfile);

    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("authChanged", loadProfile);
      window.removeEventListener("profileUpdated", loadProfile);
      window.removeEventListener("lostFoundReportsUpdated", loadProfile);
    };
  }, []);

  const ownReports = useMemo(() => {
    return reports.filter((report) => isOwnReport(report, profileData));
  }, [reports, profileData]);

  const profileStats = useMemo(() => {
    return {
      total: ownReports.length,
      matched: ownReports.filter(
        (report) =>
          report.adminStatus === "Matched" ||
          report.matchDecision === "Confirmed" ||
          report.matchId
      ).length,
      pending: ownReports.filter((report) =>
        ["Pending", "Pending Review"].includes(report.adminStatus)
      ).length,
    };
  }, [ownReports]);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageBase64 = reader.result;

      setProfileImage(imageBase64);
      localStorage.setItem(PROFILE_IMAGE_KEY, imageBase64);

      showMessage("Profile picture updated successfully.");

      window.dispatchEvent(new Event("profileUpdated"));
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    localStorage.removeItem(PROFILE_IMAGE_KEY);

    showMessage("Profile picture removed successfully.");

    window.dispatchEvent(new Event("profileUpdated"));
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

    const cleanProfile = {
      ...profileData,
      fullName: profileData.fullName.trim(),
      email: normalize(profileData.email),
      phone: profileData.phone.trim(),
      city: profileData.city.trim(),
      address: profileData.address.trim(),
      bio: profileData.bio.trim(),
      role: profileData.role || "Registered User",
    };

    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(cleanProfile));

    setProfileData(cleanProfile);
    updateStoredUserData(cleanProfile);

    showMessage("Profile updated successfully.");
  };

  const initials = profileData.fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
              {profileData.role === "Admin" ? "Admin User" : "Verified User"}
            </div>
          </section>

          <section className="profile-content">
            <div className="profile-card profile-card--left">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <span>{initials || "U"}</span>
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

              <p className="profile-role">
                {profileData.role === "Admin"
                  ? "Lost & Found Administrator"
                  : "Lost & Found Member"}
              </p>

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
                  <h3>{String(profileStats.total).padStart(2, "0")}</h3>
                  <p>Reports</p>
                </div>

                <div>
                  <h3>{String(profileStats.matched).padStart(2, "0")}</h3>
                  <p>Matched</p>
                </div>

                <div>
                  <h3>{String(profileStats.pending).padStart(2, "0")}</h3>
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
                      placeholder="Enter email"
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
                    required
                  />
                </div>

                <div className="profile-field">
                  <label>Bio</label>

                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    placeholder="Write short bio"
                  ></textarea>
                </div>

                <button type="submit" className="profile-save-btn">
                  Save Changes
                </button>
              </form>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}