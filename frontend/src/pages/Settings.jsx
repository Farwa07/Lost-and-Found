import "./Settings.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  FaEye,
  FaKey,
  FaLock,
  FaMapMarkerAlt,
  FaRedo,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaTimes,
  FaTrash,
  FaUserShield,
} from "react-icons/fa";

const defaultSettings = {
  emailNotifications: true,
  matchAlerts: true,
  commentAlerts: true,
  verificationAlerts: true,
  weeklySummary: false,

  
  showPhoneNumber: true,
  allowPostSharing: true,
  allowPublicComments: true,

  defaultCity: "Gujranwala",
  defaultReportType: "Person",
};

export default function Settings() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem("lostFoundSettings");

    if (savedSettings) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(savedSettings),
        });
      } catch {
        setSettings(defaultSettings);
      }
    }
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
      settings.allowPublicComments,
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

    localStorage.setItem("lostFoundSettings", JSON.stringify(nextSettings));

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

  const getRegisteredUser = () => {
    try {
      const savedUser = localStorage.getItem("lostFoundRegisteredUser");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    const registeredUser = getRegisteredUser();

    if (!registeredUser) {
      alert("No account found. Please create an account first.");
      navigate("/signup");
      return;
    }

    if (registeredUser.password !== passwordData.currentPassword) {
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
      ...registeredUser,
      password: passwordData.newPassword,
    };

    localStorage.setItem(
      "lostFoundRegisteredUser",
      JSON.stringify(updatedUser)
    );

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    showMessage("Password changed successfully.");
  };

  const handleExportData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      registeredUser: getRegisteredUser(),
      profileData: JSON.parse(
        localStorage.getItem("lostFoundProfileData") || "null"
      ),
      settings,
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
    localStorage.removeItem("lostFoundAuthToken");
    localStorage.removeItem("lostFoundCurrentUser");

    window.dispatchEvent(new Event("authChanged"));

    setConfirmAction(null);

    alert("You have been logged out.");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem("lostFoundRegisteredUser");
    localStorage.removeItem("lostFoundCurrentUser");
    localStorage.removeItem("lostFoundAuthToken");
    localStorage.removeItem("lostFoundProfileData");
    localStorage.removeItem("lostFoundProfileImage");
    localStorage.removeItem("lostFoundSettings");

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
      text: "This will remove your account, profile picture, profile data and settings from frontend local storage.",
      buttonText: "Delete Account",
      action: handleDeleteAccount,
      danger: true,
    };
  };

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
                Manage your account preferences, notifications, privacy,
                security and report defaults.
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
                  "Notify when a possible match is found.",
                  <FaShieldAlt />
                )}

                {renderSwitch(
                  "commentAlerts",
                  "Comment Alerts",
                  "Notify when someone comments on your report.",
                  <FaCommentDots />
                )}

                {renderSwitch(
                  "verificationAlerts",
                  "Verification Alerts",
                  "Notify when admin verifies or rejects your report.",
                  <FaUserShield />
                )}

                {renderSwitch(
                  "weeklySummary",
                  "Weekly Summary",
                  "Receive weekly report activity summary.",
                  <FaBell />
                )}
              </div>
            </div>

            <div className="settings-card">
  <div className="settings-card__heading">
    <div>
      <h2>Privacy & Interaction</h2>
      <p>Manage contact visibility, sharing and comments.</p>
    </div>

    <FaLock />
  </div>

  <div className="settings-options-list">
    {renderSwitch(
      "showPhoneNumber",
      "Show Phone Number",
      "Allow users to see your contact number on reports.",
      <FaEye />
    )}

    {renderSwitch(
      "allowPostSharing",
      "Allow Post Sharing",
      "Let users copy and share your report details.",
      <FaShieldAlt />
    )}

    {renderSwitch(
      "allowPublicComments",
      "Allow Comments",
      "Let registered users comment on your reports.",
      <FaCommentDots />
    )}
  </div>
</div>

            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Report Defaults</h2>
                  <p>Save default values for future report forms.</p>
                </div>

                <FaMapMarkerAlt />
              </div>

              <div className="settings-form-grid">
                <div className="settings-field">
                  <label>Default City</label>

                  <input
                    type="text"
                    value={settings.defaultCity}
                    onChange={(e) =>
                      handleChange("defaultCity", e.target.value)
                    }
                    placeholder="Enter default city"
                  />
                </div>

                <div className="settings-field">
                  <label>Default Report Type</label>

                  <select
                    value={settings.defaultReportType}
                    onChange={(e) =>
                      handleChange("defaultReportType", e.target.value)
                    }
                  >
                    <option value="Person">Person</option>
                    <option value="Item">Item</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-card__heading">
                <div>
                  <h2>Change Password</h2>
                  <p>Update your password with strong validation.</p>
                </div>

                <FaKey />
              </div>

              <form
                className="settings-password-form"
                onSubmit={handlePasswordSubmit}
              >
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
                  <FaSave />
                  Update Password
                </button>
              </form>
            </div>

            <div className="settings-card settings-card--wide">
              <div className="settings-card__heading">
                <div>
                  <h2>Account Actions</h2>
                  <p>
                    Export data, reset preferences, logout or remove account
                    from frontend storage.
                  </p>
                </div>

                <FaShieldAlt />
              </div>

              <div className="settings-account-actions">
                <button
                  type="button"
                  className="settings-action-btn settings-action-btn--primary"
                  onClick={handleExportData}
                >
                  <FaDownload />
                  Export My Data
                </button>

                <button
                  type="button"
                  className="settings-action-btn"
                  onClick={() => setConfirmAction("reset")}
                >
                  <FaRedo />
                  Reset Settings
                </button>

                <button
                  type="button"
                  className="settings-action-btn"
                  onClick={() => setConfirmAction("logout")}
                >
                  <FaSignOutAlt />
                  Logout
                </button>

                <button
                  type="button"
                  className="settings-action-btn settings-action-btn--danger"
                  onClick={() => setConfirmAction("delete")}
                >
                  <FaTrash />
                  Delete Account
                </button>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>

      {confirmAction && (
        <div
          className="settings-confirm-overlay"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="settings-confirm-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="settings-confirm-close"
              onClick={() => setConfirmAction(null)}
            >
              <FaTimes />
            </button>

            <div
              className={`settings-confirm-icon ${
                getConfirmData().danger ? "settings-confirm-icon--danger" : ""
              }`}
            >
              {getConfirmData().icon}
            </div>

            <h2>{getConfirmData().title}</h2>

            <p>{getConfirmData().text}</p>

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
                className={`settings-confirm-btn ${
                  getConfirmData().danger ? "settings-confirm-btn--danger" : ""
                }`}
                onClick={getConfirmData().action}
              >
                {getConfirmData().buttonText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}