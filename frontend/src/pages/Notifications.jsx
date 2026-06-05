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
    id: 1,
    reportId: 2,
    type: "Match",
    title: "Potential Match Found",
    message:
      "A found item report may match your lost wallet report. Admin is reviewing the details.",
    caseTitle: "Black Wallet",
    city: "Gujranwala",
    time: "10 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    reportId: 1,
    type: "Verification",
    title: "Report Verified",
    message:
      "Your missing person report has been verified by admin and is now visible to users.",
    caseTitle: "Ali Hassan",
    city: "Lahore",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: 3,
    reportId: 1,
    type: "Comment",
    title: "New Comment on Your Report",
    message:
      "A user commented: I saw a child with similar appearance near Anarkali yesterday evening.",
    caseTitle: "Ali Hassan",
    city: "Lahore",
    time: "2 hours ago",
    isRead: false,
  },
  {
    id: 4,
    reportId: 2,
    type: "Comment",
    title: "Someone Asked for More Details",
    message:
      "A user commented: Can you please share the exact time when the wallet was lost?",
    caseTitle: "Black Wallet",
    city: "Gujranwala",
    time: "3 hours ago",
    isRead: true,
  },
  {
    id: 5,
    reportId: 3,
    type: "Comment",
    title: "New Helpful Comment",
    message:
      "A user commented: I found a similar Samsung mobile near Paris Road. Please contact with proof.",
    caseTitle: "Samsung Mobile",
    city: "Sialkot",
    time: "5 hours ago",
    isRead: false,
  },
  {
    id: 6,
    reportId: 6,
    type: "Alert",
    title: "Admin Alert",
    message:
      "Please update your report image. Clear images help admin verify cases quickly.",
    caseTitle: "Dell Laptop Bag",
    city: "Faisalabad",
    time: "Yesterday",
    isRead: true,
  },
  {
    id: 7,
    reportId: 4,
    type: "Status",
    title: "Case Status Updated",
    message:
      "Your report status has been updated after review. Check your report details for more information.",
    caseTitle: "Unknown Child",
    city: "Karachi",
    time: "2 days ago",
    isRead: false,
  },
  {
    id: 8,
    reportId: 5,
    type: "Match",
    title: "Match Confirmation Required",
    message:
      "Admin has found a possible match. Please check your report and contact support if needed.",
    caseTitle: "School Backpack",
    city: "Lahore",
    time: "3 days ago",
    isRead: true,
  },
];

const readNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch {
    return initialNotifications;
  }
};

const saveNotifications = (nextNotifications) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
};

export default function Notifications() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);

    if (!saved) {
      saveNotifications(initialNotifications);
      setNotifications(initialNotifications);
    } else {
      setNotifications(readNotifications());
    }

    const syncNotifications = () => {
      setNotifications(readNotifications());
    };

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

  const updateNotifications = (nextNotifications) => {
    setNotifications(nextNotifications);
    saveNotifications(nextNotifications);
    window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
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

    updateNotifications(nextNotifications);

    if (notification.type === "Match" && notification.matchId) {
      navigate(`/match-alert/${notification.matchId}`);
      return;
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      return;
    }

    if (notification.reportId) {
      navigate(`/reports?reportId=${notification.reportId}`);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const matchCount = useMemo(() => {
    return notifications.filter((notification) => notification.type === "Match")
      .length;
  }, [notifications]);

  const markAsRead = (id) => {
    updateNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    updateNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const handleClearAll = () => {
    updateNotifications([]);
    setShowConfirmPopup(false);
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
                      notification.type
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
                        {notification.caseTitle}
                      </span>

                      <span>
                        <FaMapMarkerAlt />
                        {notification.city}
                      </span>

                      <span>
                        <FaClock />
                        {notification.time || "Just now"}
                      </span>
                    </div>

                    <div className="notification-card__actions">
                      {notification.type === "Match" && notification.matchId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openNotification(notification);
                          }}
                        >
                          <FaUserCheck />
                          View Match Details
                        </button>
                      )}

                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <FaCheckCircle />
                          Mark as Read
                        </button>
                      )}

                      <button
                        className="notification-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
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

                <h2>No Notifications Found</h2>

                <p>You do not have any notifications right now.</p>
              </div>
            )}
          </section>

          {showConfirmPopup && (
            <div
              className="notifications-confirm-overlay"
              onClick={() => setShowConfirmPopup(false)}
            >
              <div
                className="notifications-confirm-box"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="notifications-confirm-close"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  <FaTimes />
                </button>

                <div className="notifications-confirm-icon">
                  <FaExclamationTriangle />
                </div>

                <h2>Clear All Notifications?</h2>

                <p>
                  Are you sure you want to delete all notifications? This action
                  cannot be undone.
                </p>

                <div className="notifications-confirm-actions">
                  <button
                    className="notifications-cancel-btn"
                    onClick={() => setShowConfirmPopup(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="notifications-confirm-btn"
                    onClick={handleClearAll}
                  >
                    Yes, Clear All
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
