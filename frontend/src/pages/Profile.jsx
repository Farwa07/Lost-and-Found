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

import { getProfile, updateProfile, updateProfileImage } from "../api/authApi";
import { getMyReports } from "../api/reportApi";

const CURRENT_USER_KEY = "lostFoundCurrentUser";

const defaultProfileData = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  bio: "",
  role: "user",
  profileImage: "",
};

const normalizeReportStatus = (value = "") => {
  return String(value).trim().toLowerCase();
};

const getReportsArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.reports)) {
    return response.reports;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const getUserFromResponse = (response) => {
  return response?.user || response?.data || response || null;
};

const buildProfileData = (user) => {
  return {
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    address: user?.address || "",
    bio:
      user?.bio ||
      "I am using Lost & Found to report and track missing persons and lost items.",
    role: user?.role || "user",
    profileImage: user?.profileImage || "",
  };
};

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      const profileResponse = await getProfile();
      const user = getUserFromResponse(profileResponse);
      const nextProfileData = buildProfileData(user);

      setProfileData(nextProfileData);
      setProfileImage(nextProfileData.profileImage || "");

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

      const reportsResponse = await getMyReports();
      setReports(getReportsArray(reportsResponse));
    } catch (error) {
      console.error("Profile Load Error:", error);
      setMessage(error.message || "Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    window.addEventListener("authChanged", loadProfile);
    window.addEventListener("profileUpdated", loadProfile);

    return () => {
      window.removeEventListener("authChanged", loadProfile);
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, []);

  const profileStats = useMemo(() => {
    return {
      total: reports.length,

      matched: reports.filter((report) => {
        const status = normalizeReportStatus(
          report.status || report.adminStatus || report.caseStatus
        );

        return (
          status === "matched" ||
          status === "solved" ||
          Boolean(report.matchId) ||
          Boolean(report.matchedWith)
        );
      }).length,

      pending: reports.filter((report) => {
        const status = normalizeReportStatus(report.status || report.adminStatus);

        return status === "pending" || status === "pending review";
      }).length,
    };
  }, [reports]);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const syncCurrentUser = (user) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }

    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("profileUpdated"));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Image size should be less than 2MB.");
      e.target.value = "";
      return;
    }

    try {
      setIsImageUploading(true);

      const imageFormData = new FormData();
      imageFormData.append("profileImage", file);

      const response = await updateProfileImage(imageFormData);
      const user = getUserFromResponse(response?.user ? response : response);
      const imageUrl =
        response?.profileImage || user?.profileImage || profileData.profileImage;

      setProfileImage(imageUrl || "");
      setProfileData((previousData) => ({
        ...previousData,
        profileImage: imageUrl || "",
      }));

      if (response?.user) {
        syncCurrentUser(response.user);
      }

      showMessage(response?.message || "Profile picture updated successfully.");
    } catch (error) {
      console.error("Profile Image Upload Error:", error);
      alert(error.message || "Failed to upload profile picture.");
    } finally {
      setIsImageUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsImageUploading(true);

      const response = await updateProfile({
        profileImage: "",
      });

      const user = getUserFromResponse(response);
      const nextProfileData = buildProfileData(user);

      setProfileData(nextProfileData);
      setProfileImage("");

      syncCurrentUser(user);

      showMessage("Profile picture removed successfully.");
    } catch (error) {
      console.error("Profile Image Remove Error:", error);
      alert(error.message || "Failed to remove profile picture.");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        fullName: profileData.fullName.trim(),
        phone: profileData.phone.trim(),
        city: profileData.city.trim(),
        address: profileData.address.trim(),
        bio: profileData.bio.trim(),
      };

      const response = await updateProfile(payload);
      const user = getUserFromResponse(response);
      const nextProfileData = buildProfileData(user);

      setProfileData(nextProfileData);
      setProfileImage(nextProfileData.profileImage || "");

      syncCurrentUser(user);

      showMessage(response?.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Profile Update Error:", error);
      alert(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = profileData.fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isAdmin = profileData.role === "admin" || profileData.role === "Admin";

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
              {isAdmin ? "Admin User" : "Verified User"}
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
                    {isImageUploading
                      ? "Uploading..."
                      : profileImage
                      ? "Change DP"
                      : "Upload DP"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isImageUploading}
                    />
                  </label>

                  {profileImage && (
                    <button
                      type="button"
                      className="profile-remove-btn"
                      onClick={handleRemoveImage}
                      disabled={isImageUploading}
                    >
                      <FaTrash />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <h2>{profileData.fullName || "User"}</h2>

              <p className="profile-role">
                {isAdmin ? "Lost & Found Administrator" : "Lost & Found Member"}
              </p>

              <div className="profile-info-list">
                <p>
                  <FaEnvelope />
                  {profileData.email || "N/A"}
                </p>

                <p>
                  <FaPhoneAlt />
                  {profileData.phone || "N/A"}
                </p>

                <p>
                  <FaMapMarkerAlt />
                  {profileData.city || "N/A"}
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

              {isLoading ? (
                <div className="profile-message">
                  <FaCheckCircle />
                  Loading profile...
                </div>
              ) : (
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
                        placeholder="Enter email"
                        readOnly
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

                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}