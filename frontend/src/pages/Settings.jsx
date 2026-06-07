import "./Settings.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaBell,
  FaCheckCircle,
  FaCog,
  FaCommentDots,
  FaDownload,
  FaEnvelope,
  FaKey,
  FaLock,
  FaMapMarkerAlt,
  FaRedo,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";

const SETTINGS_KEY = "lostFoundSettings";
const REGISTERED_USER_KEY = "lostFoundRegisteredUser";
const CURRENT_USER_KEY = "lostFoundCurrentUser";
const AUTH_TOKEN_KEY = "lostFoundAuthToken";
const PROFILE_DATA_KEY = "lostFoundProfileData";
const PROFILE_IMAGE_KEY = "lostFoundProfileImage";
const USERS_KEY = "lostFoundUsers";
const REPORTS_KEY = "lostFoundReports";

const defaultSettings = {
  emailNotifications: true,
  matchAlerts: true,
  commentAlerts: true,
  verificationAlerts: true,
  weeklySummary: false,
  showPhoneNumber: true,
  allowPostSharing: true,
  defaultCity: "Gujranwala",
  defaultReportType: "Person",
};

const safeParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email = "") => {
  return String(email).trim().toLowerCase();
};

const getCurrentUserFromStorage = () => {
  const currentUser = safeParse(localStorage.getItem(CURRENT_USER_KEY));
  const registeredUser = safeParse(localStorage.getItem(REGISTERED_USER_KEY));

  return currentUser || registeredUser || null;
};

const getRegisteredUser = () => {
  return safeParse(localStorage.getItem(REGISTERED_USER_KEY));
};

const getUsers = () => {
  const users = safeParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(users) ? users : [];
};

const getReports = () => {
  const reports = safeParse(localStorage.getItem(REPORTS_KEY), []);
  return Array.isArray(reports) ? reports : [];
};

const isOwnReport = (report, user) => {
  const userEmail = normalizeEmail(user?.email);
  const userName = String(user?.fullName || user?.name || "")
    .trim()
    .toLowerCase();

  const ownerEmail = normalizeEmail(report.ownerEmail);
  const reporterEmail = normalizeEmail(report.reporterEmail);
  const ownerName = String(report.ownerName || "").trim().toLowerCase();
  const reporterName = String(report.reporterName || report.reporterFullName || "")
    .trim()
    .toLowerCase();

  if (userEmail && (ownerEmail === userEmail || reporterEmail === userEmail)) {
    return true;
  }

  if (userName && (ownerName === userName || reporterName === userName)) {
    return true;
  }

  return false;
};

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUserFromStorage());

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = safeParse(localStorage.getItem(SETTINGS_KEY));

      setSettings({
        ...defaultSettings,
        ...(savedSettings || {}),
      });

      setCurrentUser(getCurrentUserFromStorage());
    };

    loadSettings();

    window.addEventListener("storage", loadSettings);
    window.addEventListener("authChanged", loadSettings);
    window.addEventListener("profileUpdated", loadSettings);

    return () => {
      window.removeEventListener("storage", loadSettings);
      window.removeEventListener("authChanged", loadSettings);
      window.removeEventListener("profileUpdated", loadSettings);
    };
  }, []);

  const activeSettingsCount = useMemo(() => {
    return [
      settings.emailNotifications,
      settings.matchAlerts,
      settings.commentAlerts,
      settings.verificationAlerts,
      settings.weeklySummary,
      settings.showPhoneNumber,
      settings.allowPostSharing,
    ].filter(Boolean).length;
  }, [settings]);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const saveSettings = (nextSettings, text = "Settings saved successfully.") => {
    setSettings(nextSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    showMessage(text);
  };

  const handleToggle = (key) => {
    saveSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleChange = (key, value) => {
    saveSettings({
      ...settings,
      [key]: value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const updatePasswordEverywhere = (updatedUser) => {
    const users = getUsers();

    const nextUsers = users.map((user) =>
      normalizeEmail(user.email) === normalizeEmail(updatedUser.email)
        ? {
            ...user,
            password: updatedUser.password,
          }
        : user
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    localStorage.setItem(REGISTERED_USER_KEY, JSON.stringify(updatedUser));

    window.dispatchEvent(new Event("authChanged"));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const registeredUser = getRegisteredUser();
    const users = getUsers();

    const activeEmail =
      currentUser?.email ||
      registeredUser?.email ||
      "";

    const userFromList = users.find(
      (user) => normalizeEmail(user.email) === normalizeEmail(activeEmail)
    );

    const targetUser = userFromList || registeredUser;

    if (!targetUser) {
      alert("No account found. Please create an account first.");
      navigate("/signup");
      return;
    }

    if (targetUser.password !== passwordData.currentPassword) {
      alert("Current password is incorrect.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(passwordData.newPassword)) {
      alert(
        "Password must contain uppercase, lowercase, number, special character and minimum 8 characters."
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    const updatedUser = {
      ...targetUser,
      password: passwordData.newPassword,
    };

    updatePasswordEverywhere(updatedUser);

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    showMessage("Password changed successfully.");
  };

  const handleExportData = () => {
    const user = getCurrentUserFromStorage();
    const reports = getReports();
    const ownReports = reports.filter((report) => isOwnReport(report, user));

    const exportData = {
      exportedAt: new Date().toISOString(),
      currentUser: user,
      registeredUser: getRegisteredUser(),
      profileData: safeParse(localStorage.getItem(PROFILE_DATA_KEY)),
      settings,
      myReportsCount: ownReports.length,
      myReports: ownReports,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "lost-found-user-data.json";
    link.click();

    URL.revokeObjectURL(url);

    showMessage("Your data file has been downloaded.");
  };

  const handleResetSettings = () => {
    saveSettings(defaultSettings, "Settings restored to default.");
    setConfirmAction(null);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      window.dispatchEvent(new Event("authChanged"));
    }

    setConfirmAction(null);

    alert("You have been logged out.");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    const activeUser = getCurrentUserFromStorage();

    if (activeUser?.role === "Admin") {
      alert("Demo admin account cannot be deleted from settings.");
      setConfirmAction(null);
      return;
    }

    const users = getUsers();

    const nextUsers = users.filter(
      (user) => normalizeEmail(user.email) !== normalizeEmail(activeUser?.email)
    );

    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

    localStorage.removeItem(REGISTERED_USER_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(PROFILE_DATA_KEY);
    localStorage.removeItem(PROFILE_IMAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);

    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("profileUpdated"));

    setConfirmAction(null);

    alert("Account deleted from frontend storage.");
    navigate("/signup");
  };

  const renderSwitch = (key, title, description, icon) => {
    return (
      <div className="settings-option">
        <div className="settings-option__icon">{icon}</div>

        <div className="settings-option__content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <button
          type="button"
          className={`settings-switch ${
            settings[key] ? "settings-switch--active" : ""
          }`}
          onClick={() => handleToggle(key)}
        >
          <span></span>
        </button>
      </div>
    );
  };

  const getConfirmData = () => {
    if (confirmAction === "reset") {
      return {
        icon: <FaRedo />,
        title: "Reset Settings?",
        text: "All preferences will be restored to default values.",
        buttonText: "Reset Settings",
        action: handleResetSettings,
        danger: false,
      };
    }

    if (confirmAction === "logout") {
      return {
        icon: <FaSignOutAlt />,
        title: "Logout Account?",
        text: "Your current session will be removed from this browser.",
        buttonText: "Logout",
        action: handleLogout,
        danger: false,
      };
    }

    return {
      icon: <FaTrash />,
      title: "Delete Account?",
      text: "This will remove your account, profile picture, profile data and settings from frontend localStorage.",
      buttonText: "Delete Account",
      action: handleDeleteAccount,
      danger: true,
    };
  };

  const confirmData = confirmAction ? getConfirmData() : null;

  return (
    <div className="settings-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="settings__container">
        <Sidebar open={sidebarOpen} />

        <main className="settings__main">
          <section className="settings-hero">
            <div>
              <h1>Settings</h1>

              <p>
                Manage your account preferences, notifications, security and
                report defaults.
              </p>
            </div>

            <div className="settings-hero__badge">
              <FaCog />
              {activeSettingsCount} Active Settings
            </div>
          </section>

          {message && (
            <div className="settings-message">
              <FaCheckCircle />
              {message}

              <button type="button" onClick={() => setMessage("")}>
                <FaTimes />
              </button>
            </div>
          )}

          <section className="settings-grid">
            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Notifications</h2>
                  <p>Control alerts about reports, comments and matches.</p>
                </div>

                <FaBell />
              </div>

              <div className="settings-options-list">
                {renderSwitch(
                  "emailNotifications",
                  "Email Notifications",
                  "Receive important updates by email.",
                  <FaEnvelope />
                )}

                {renderSwitch(
                  "matchAlerts",
                  "Match Alerts",
                  "Notify when a possible match is found or confirmed.",
                  <FaShieldAlt />
                )}

                {renderSwitch(
                  "commentAlerts",
                  "Comment Alerts",
                  "Notify when another user comments on your report.",
                  <FaCommentDots />
                )}

                {renderSwitch(
                  "verificationAlerts",
                  "Verification Alerts",
                  "Notify when admin verifies, rejects or updates your report.",
                  <FaUserShield />
                )}

                {renderSwitch(
                  "weeklySummary",
                  "Weekly Summary",
                  "Receive a weekly summary of your report activity.",
                  <FaBell />
                )}
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Privacy & Sharing</h2>
                  <p>Control basic public contact and sharing preferences.</p>
                </div>

                <FaLock />
              </div>

              <div className="settings-options-list">
                {renderSwitch(
                  "showPhoneNumber",
                  "Show Phone Number",
                  "Allow your contact number to appear on your own reports.",
                  <FaKey />
                )}

                {renderSwitch(
                  "allowPostSharing",
                  "Allow Post Sharing",
                  "Allow other users to share your public report details.",
                  <FaDownload />
                )}
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Report Defaults</h2>
                  <p>Set default values used while creating reports.</p>
                </div>

                <FaMapMarkerAlt />
              </div>

              <div className="settings-form">
                <div className="settings-field">
                  <label>Default City</label>

                  <input
                    type="text"
                    value={settings.defaultCity}
                    onChange={(e) => handleChange("defaultCity", e.target.value)}
                    placeholder="Enter default city"
                  />
                </div>

                <div className="settings-field">
                  <label>Default Report Category</label>

                  <select
                    value={settings.defaultReportType}
                    onChange={(e) =>
                      handleChange("defaultReportType", e.target.value)
                    }
                  >
                    <option>Person</option>
                    <option>Item</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Security</h2>
                  <p>Change your account password.</p>
                </div>

                <FaKey />
              </div>

              <form className="settings-form" onSubmit={handlePasswordSubmit}>
                <div className="settings-field">
                  <label>Current Password</label>

                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>New Password</label>

                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>Confirm New Password</label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button type="submit" className="settings-save-btn">
                  Change Password
                </button>
              </form>
            </div>

            <div className="settings-card settings-card--wide">
              <div className="settings-card__heading">
                <div>
                  <h2>Account Actions</h2>
                  <p>Export your data, reset settings or manage your session.</p>
                </div>

                <FaCog />
              </div>

              <div className="settings-actions">
                <button type="button" onClick={handleExportData}>
                  <FaDownload />
                  Export My Data
                </button>

                <button type="button" onClick={() => setConfirmAction("reset")}>
                  <FaRedo />
                  Reset Settings
                </button>

                <button type="button" onClick={() => setConfirmAction("logout")}>
                  <FaSignOutAlt />
                  Logout
                </button>

                <button
                  type="button"
                  className="settings-danger-btn"
                  onClick={() => setConfirmAction("delete")}
                >
                  <FaTrash />
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          {confirmAction && confirmData && (
            <div className="settings-confirm-overlay">
              <div className="settings-confirm-box">
                <button
                  type="button"
                  className="settings-confirm-close"
                  onClick={() => setConfirmAction(null)}
                >
                  <FaTimes />
                </button>

                <div
                  className={`settings-confirm-icon ${
                    confirmData.danger ? "settings-confirm-icon--danger" : ""
                  }`}
                >
                  {confirmData.icon}
                </div>

                <h2>{confirmData.title}</h2>

                <p>{confirmData.text}</p>

                <div className="settings-confirm-actions">
                  <button
                    type="button"
                    className="settings-cancel-btn"
                    onClick={() => setConfirmAction(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className={
                      confirmData.danger
                        ? "settings-delete-confirm-btn"
                        : "settings-confirm-btn"
                    }
                    onClick={confirmData.action}
                  >
                    {confirmData.buttonText}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Footer />
        </main>
      </div>
    </div>
  );
}