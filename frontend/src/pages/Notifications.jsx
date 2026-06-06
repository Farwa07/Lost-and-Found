import "./Notifications.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaBell,
  FaCheckCircle,
  FaClock,
  FaCommentDots,
  FaEnvelopeOpen,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaTimes,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";

const NOTIFICATIONS_KEY = "lostFoundNotifications";

const initialNotifications = [
  {
    id: "demo-1",
    reportId: 2,
    type: "Match",
    title: "Potential Match Found",
    message:
      "A found item report may match your lost wallet report. Admin is reviewing the details.",
    caseTitle: "Black Wallet",
    city: "Gujranwala",
    time: "10 minutes ago",
    isRead: false,
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "demo-2",
    reportId: 1,
    type: "Verification",
    title: "Report Verified",
    message:
      "Your missing person report has been verified by admin and is now visible to users.",
    caseTitle: "Ali Hassan",
    city: "Lahore",
    time: "1 hour ago",
    isRead: false,
    createdAt: "2026-05-20T09:00:00.000Z",
  },
  {
    id: "demo-3",
    reportId: 1,
    type: "Comment",
    title: "New Comment on Your Report",
    message:
      "A user commented: I saw a child with similar appearance near Anarkali yesterday evening.",
    caseTitle: "Ali Hassan",
    city: "Lahore",
    time: "2 hours ago",
    isRead: false,
    createdAt: "2026-05-20T08:00:00.000Z",
  },
  {
    id: "demo-4",
    reportId: null,
    type: "Alert",
    title: "Admin Alert",
    message:
      "Please update your report image. Clear images help admin verify cases quickly.",
    caseTitle: "System Update",
    city: "All Cities",
    time: "Yesterday",
    isRead: true,
    createdAt: "2026-05-19T08:00:00.000Z",
  },
  {
    id: "demo-5",
    reportId: 4,
    type: "Status",
    title: "Case Status Updated",
    message:
      "Your report status has been updated after review. Check your report details for more information.",
    caseTitle: "Unknown Child",
    city: "Karachi",
    time: "2 days ago",
    isRead: false,
    createdAt: "2026-05-18T08:00:00.000Z",
  },
];

const readNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialNotifications;
    }

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications));
    return initialNotifications;
  } catch {
    return initialNotifications;
  }
};

const writeNotifications = (nextNotifications) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
  window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
};

export default function Notifications() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const syncNotifications = () => {
      setNotifications(readNotifications());
    };

    syncNotifications();

    window.addEventListener("storage", syncNotifications);
    window.addEventListener("lostFoundNotificationsUpdated", syncNotifications);

    return () => {
      window.removeEventListener("storage", syncNotifications);
      window.removeEventListener(
        "lostFoundNotificationsUpdated",
        syncNotifications
      );
    };
  }, []);

  const saveNotifications = (nextNotifications) => {
    setNotifications(nextNotifications);
    writeNotifications(nextNotifications);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  const matchCount = useMemo(() => {
    return notifications.filter((notification) => notification.type === "Match")
      .length;
  }, [notifications]);

  const markAsRead = (id) => {
    const nextNotifications = notifications.map((notification) =>
      notification.id === id
        ? {
            ...notification,
            isRead: true,
          }
        : notification
    );

    saveNotifications(nextNotifications);
  };

  const deleteNotification = (id) => {
    const nextNotifications = notifications.filter(
      (notification) => notification.id !== id
    );

    saveNotifications(nextNotifications);

    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const handleClearAll = () => {
    saveNotifications([]);
    setShowConfirmPopup(false);
    setSelectedNotification(null);
  };

 const openNotification = (notification) => {
  const nextNotifications = notifications.map((item) =>
    item.id === notification.id
      ? {
          ...item,
          isRead: true,
        }
      : item
  );

  setNotifications(nextNotifications);
  localStorage.setItem(
    "lostFoundNotifications",
    JSON.stringify(nextNotifications)
  );

  const type = String(notification.type || "").toLowerCase();

  if (type === "match") {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    if (notification.matchId) {
      navigate(`/match-alert/${notification.matchId}`);
      return;
    }

    alert(
      "This match alert has no confirmed match data yet. Confirm the match from Admin Panel first."
    );
    return;
  }

  if (type === "comment") {
    if (notification.reportId) {
      navigate(`/reports?reportId=${notification.reportId}&openComments=true`);
      return;
    }

    alert(notification.message);
    return;
  }

  if (type === "verification" || type === "status") {
    if (notification.reportId) {
      navigate(`/reports?reportId=${notification.reportId}`);
      return;
    }

    alert(notification.message);
    return;
  }

  if (type === "alert") {
    if (notification.reportId) {
      navigate(`/reports?reportId=${notification.reportId}`);
      return;
    }

    alert(notification.message);
    return;
  }

  if (notification.reportId) {
    navigate(`/reports?reportId=${notification.reportId}`);
    return;
  }

  alert(notification.message);
};

  const getNotificationIcon = (type) => {
    if (type === "Match") {
      return <FaUserCheck />;
    }

    if (type === "Verification") {
      return <FaShieldAlt />;
    }

    if (type === "Comment") {
      return <FaCommentDots />;
    }

    if (type === "Alert") {
      return <FaExclamationTriangle />;
    }

    return <FaCheckCircle />;
  };

  return (
    <div className="notifications-page">
      <Navbar toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="notifications__container">
        <Sidebar open={sidebarOpen} />

        <main className="notifications__main">
          <section className="notifications-hero">
            <div>
              <h1>Notifications</h1>

              <p>
                View all updates related to your reports, comments, matches and
                admin verification.
              </p>
            </div>

            <div className="notifications-hero__badge">
              <FaBell />
              {unreadCount} Unread
            </div>
          </section>

          <section className="notifications-summary">
            <div className="notifications-summary-card">
              <div className="notifications-summary-icon">
                <FaBell />
              </div>

              <div>
                <h3>{notifications.length}</h3>
                <p>Total Notifications</p>
              </div>
            </div>

            <div className="notifications-summary-card">
              <div className="notifications-summary-icon">
                <FaEnvelopeOpen />
              </div>

              <div>
                <h3>{unreadCount}</h3>
                <p>Unread</p>
              </div>
            </div>

            <div className="notifications-summary-card">
              <div className="notifications-summary-icon">
                <FaUserCheck />
              </div>

              <div>
                <h3>{matchCount}</h3>
                <p>Match Alerts</p>
              </div>
            </div>
          </section>

          <section className="notifications-top-actions">
            <button
              className="notifications-clear-all-btn"
              onClick={() => setShowConfirmPopup(true)}
              disabled={notifications.length === 0}
            >
              <FaTrash />
              Clear All Notifications
            </button>
          </section>

          <section className="notifications-list">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  className={`notification-card ${
                    !notification.isRead ? "notification-card--unread" : ""
                  }`}
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                >
                  <div
                    className={`notification-card__icon notification-card__icon--${String(
                      notification.type || "alert"
                    ).toLowerCase()}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-card__content">
                    <div className="notification-card__top">
                      <div>
                        <span className="notification-type">
                          {notification.type}
                        </span>

                        <h2>{notification.title}</h2>
                      </div>

                      {!notification.isRead && (
                        <span className="notification-unread-dot"></span>
                      )}
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="notification-meta">
                      <span>
                        <FaCheckCircle />
                        {notification.caseTitle || "System Update"}
                      </span>

                      <span>
                        <FaMapMarkerAlt />
                        {notification.city || "All Cities"}
                      </span>

                      <span>
                        <FaClock />
                        {notification.time || "Just now"}
                      </span>
                    </div>

                    <div
                      className="notification-card__actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!notification.isRead && (
                        <button onClick={() => markAsRead(notification.id)}>
                          <FaCheckCircle />
                          Mark as Read
                        </button>
                      )}

                      <button
                        className="notification-delete-btn"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <FaBell />

                <h2>No Notifications</h2>

                <p>
                  You do not have any notifications right now. Admin alerts,
                  comments, verification updates and match alerts will appear
                  here.
                </p>
              </div>
            )}
          </section>

          {selectedNotification && (
            <div
              className="notifications-detail-overlay"
              onClick={() => setSelectedNotification(null)}
            >
              <div
                className="notifications-detail-box"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="notifications-detail-close"
                  onClick={() => setSelectedNotification(null)}
                >
                  <FaTimes />
                </button>

                <div
                  className={`notifications-detail-icon notification-card__icon--${String(
                    selectedNotification.type || "alert"
                  ).toLowerCase()}`}
                >
                  {getNotificationIcon(selectedNotification.type)}
                </div>

                <span className="notification-type">
                  {selectedNotification.type}
                </span>

                <h2>{selectedNotification.title}</h2>

                <p>{selectedNotification.message}</p>

                {selectedNotification.extraMessage && (
                  <p className="notifications-detail-note">
                    {selectedNotification.extraMessage}
                  </p>
                )}

                <div className="notification-meta">
                  <span>
                    <FaCheckCircle />
                    {selectedNotification.caseTitle || "System Update"}
                  </span>

                  <span>
                    <FaMapMarkerAlt />
                    {selectedNotification.city || "All Cities"}
                  </span>

                  <span>
                    <FaClock />
                    {selectedNotification.time || "Just now"}
                  </span>
                </div>

                <button
                  className="notifications-detail-ok"
                  onClick={() => setSelectedNotification(null)}
                >
                  Okay
                </button>
              </div>
            </div>
          )}

          {showConfirmPopup && (
            <div className="notifications-confirm-overlay">
              <div className="notifications-confirm-box">
                <button
                  className="notifications-confirm-close"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  <FaTimes />
                </button>

                <div className="notifications-confirm-icon">
                  <FaTrash />
                </div>

                <h2>Clear All Notifications?</h2>

                <p>
                  This will remove all notifications from frontend localStorage.
                </p>

                <div className="notifications-confirm-actions">
                  <button
                    className="notifications-cancel-btn"
                    onClick={() => setShowConfirmPopup(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="notifications-delete-confirm-btn"
                    onClick={handleClearAll}
                  >
                    Clear All
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