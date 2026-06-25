import "./Profile.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  FaSearchPlus,
  FaSearchMinus,
  FaEye,
  FaFileAlt,
  FaPeopleArrows,
  FaClock,
} from "react-icons/fa";

import { getProfile, updateProfile, updateProfileImage } from "../api/authApi";
import { getMyReports } from "../api/reportApi";

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

const normalizeReportStatus = (value = "") => String(value).trim().toLowerCase();

const getReportsArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.reports)) return response.reports;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getUserFromResponse = (response) => {
  return response?.user || response?.data || response || null;
};

const buildProfileData = (user) => ({
  fullName: user?.fullName || user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  city: user?.city || "",
  address: user?.address || "",
  bio: user?.bio || "",
  role: user?.role || "user",
  profileImage: user?.profileImage || "",
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const createCroppedImageFile = async ({ imageSrc, zoom, offsetX, offsetY }) => {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = 512;

  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);

  const baseScale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
  const finalScale = baseScale * zoom;
  const drawWidth = image.naturalWidth * finalScale;
  const drawHeight = image.naturalHeight * finalScale;
  const drawX = (size - drawWidth) / 2 + offsetX;
  const drawY = (size - drawHeight) / 2 + offsetY;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );

  return new File([blob], `profile-${Date.now()}.jpg`, {
    type: "image/jpeg",
  });
};

export default function Profile() {
  const navigate = useNavigate();
  const { updateUserInList } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState(null);

  const syncCurrentUser = (user) => {
    if (user) {
      updateUserInList({
        id: user.id || user._id,
        _id: user._id || user.id,
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        address: user.address || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
        role: user.role || "user",
        status: user.status || "active",
      });
    }

    window.dispatchEvent(new Event("profileUpdated"));
  };

  const loadProfile = async () => {
    try {
      setIsLoading(true);

      const profileResponse = await getProfile();
      const user = getUserFromResponse(profileResponse);
      const nextProfileData = buildProfileData(user);

      setProfileData(nextProfileData);
      setProfileImage(nextProfileData.profileImage || "");

      // Important: do not call syncCurrentUser() while loading profile.
      // updateUserInList dispatches authChanged/profileUpdated events.
      // If Profile listens to those events and loadProfile dispatches them again,
      // the page keeps reloading/blinking in a loop.

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
    window.setTimeout(() => setMessage(""), 3000);
  };

  const closeCropModal = () => {
    setCropImageSrc("");
    setSelectedImageFile(null);
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setSelectedImageFile(file);
      setCropImageSrc(dataUrl);
      setCropZoom(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
    } catch {
      showMessage("Unable to read selected image.");
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!selectedImageFile || !cropImageSrc) return;

    try {
      setIsImageUploading(true);

      const croppedFile = await createCroppedImageFile({
        imageSrc: cropImageSrc,
        zoom: cropZoom,
        offsetX: cropOffsetX,
        offsetY: cropOffsetY,
      });

      const imageFormData = new FormData();
      imageFormData.append("profileImage", croppedFile);

      const response = await updateProfileImage(imageFormData);
      const user = getUserFromResponse(response);
      const nextProfileData = buildProfileData(user);
      const imageUrl = response?.profileImage || nextProfileData.profileImage || "";

      setProfileImage(imageUrl);
      setProfileData({
        ...nextProfileData,
        profileImage: imageUrl,
      });

      syncCurrentUser({
        ...user,
        profileImage: imageUrl,
      });

      closeCropModal();
      showMessage(response?.message || "Profile picture updated successfully.");
    } catch (error) {
      console.error("Profile Image Upload Error:", error);
      alert(error.message || "Failed to upload profile picture.");
    } finally {
      setIsImageUploading(false);
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
      syncCurrentUser({
        ...user,
        profileImage: "",
      });

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

    if (isSaving) return;

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

  const handleStatClick = (filter) => {
    navigate(`/reports?profileFilter=${filter}`);
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
                <button
                  type="button"
                  className={`profile-avatar ${profileImage ? "profile-avatar--clickable" : ""}`}
                  onClick={() => profileImage && setIsImagePreviewOpen(true)}
                  title={profileImage ? "Click to view profile picture" : "Profile picture"}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <span>{initials || "U"}</span>
                  )}
                </button>

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
                <button
                  type="button"
                  className="profile-stat-btn"
                  onClick={() => handleStatClick("all")}
                  title="Open My Reports"
                >
                  <FaFileAlt />
                  <h3>{String(profileStats.total).padStart(2, "0")}</h3>
                  <p>Reports</p>
                </button>

                <button
                  type="button"
                  className="profile-stat-btn"
                  onClick={() => handleStatClick("matched")}
                  title="Open matched reports"
                >
                  <FaPeopleArrows />
                  <h3>{String(profileStats.matched).padStart(2, "0")}</h3>
                  <p>Matched</p>
                </button>

                <button
                  type="button"
                  className="profile-stat-btn"
                  onClick={() => handleStatClick("pending")}
                  title="Open pending reports"
                >
                  <FaClock />
                  <h3>{String(profileStats.pending).padStart(2, "0")}</h3>
                  <p>Pending</p>
                </button>
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

      {cropImageSrc && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
          <div className="profile-crop-modal">
            <button
              type="button"
              className="profile-modal-close"
              onClick={closeCropModal}
              aria-label="Close crop modal"
            >
              ×
            </button>

            <h2>Crop Profile Picture</h2>
            <p>Adjust the image so your face/object fits inside the circle.</p>

            <div className="profile-crop-frame">
              <img
                src={cropImageSrc}
                alt="Crop preview"
                style={{
                  transform: `translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropZoom})`,
                }}
              />
            </div>

            <div className="profile-crop-controls">
              <label>
                <span>
                  <FaSearchMinus /> Zoom <FaSearchPlus />
                </span>
                <input
                  type="range"
                  min="1"
                  max="2.4"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(Number(e.target.value))}
                />
              </label>

              <label>
                <span>Move Left / Right</span>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="2"
                  value={cropOffsetX}
                  onChange={(e) => setCropOffsetX(Number(e.target.value))}
                />
              </label>

              <label>
                <span>Move Up / Down</span>
                <input
                  type="range"
                  min="-120"
                  max="120"
                  step="2"
                  value={cropOffsetY}
                  onChange={(e) => setCropOffsetY(Number(e.target.value))}
                />
              </label>
            </div>

            <button
              type="button"
              className="profile-save-btn profile-crop-save"
              onClick={handleUploadCroppedImage}
              disabled={isImageUploading}
            >
              {isImageUploading ? "Uploading..." : "Upload Cropped DP"}
            </button>
          </div>
        </div>
      )}

      {isImagePreviewOpen && profileImage && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true">
          <div className="profile-image-preview-modal">
            <button
              type="button"
              className="profile-modal-close"
              onClick={() => setIsImagePreviewOpen(false)}
              aria-label="Close image preview"
            >
              ×
            </button>

            <img src={profileImage} alt="Profile full preview" />
          </div>
        </div>
      )}
    </div>
  );
}
