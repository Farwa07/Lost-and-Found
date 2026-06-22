import "./Notifications.css";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import {
  clearAllNotifications,
  deleteNotification as deleteNotificationApi,
  getNotifications,
  markNotificationAsRead,
} from "../api/notificationApi";
import { getMatchByReportId } from "../api/matchApi";

const getRelativeTime = (createdAt, fallback = "") => {
  if (!createdAt) {
    return fallback || "Just now";
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return fallback || "Just now";
  }

  const diffMs = Date.now() - createdDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return createdDate.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  return String(value);
};

const normalizeNotification = (notification) => {
  const type = notification.type || "Alert";

  return {
    ...notification,
    id: getId(notification._id || notification.id),
    reportId: getId(notification.reportId),
    matchId: getId(notification.matchId),
    type,
    title: notification.title || "Admin Alert",
    message: notification.message || "You have a new notification.",
    caseTitle: notification.caseTitle || "System Update",
    city: notification.city || "All Cities",
    actionUrl: notification.actionUrl || "",
    isRead: Boolean(notification.isRead),
    createdAt: notification.createdAt || notification.time || new Date().toISOString(),
  };
};

const filterToQuery = (filter) => {
  if (filter === "unread") return { unread: "true" };
  if (filter === "match") return { type: "match" };
  if (filter === "verification") return { type: "verification" };
  return {};
};

export default function Notifications() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const loadNotifications = useCallback(async (filter = activeFilter) => {
    try {
      setIsLoading(true);
      setError("");

      const [allResponse, filteredResponse] = await Promise.all([
        getNotifications(),
        getNotifications(filterToQuery(filter)),
      ]);

      const nextAll = (allResponse.notifications || []).map(normalizeNotification);
      const nextFiltered = (filteredResponse.notifications || []).map(normalizeNotification);

      setAllNotifications(nextAll);
      setNotifications(filter === "all" ? nextAll : nextFiltered);
    } catch (err) {
      setError(err.message || "Notifications could not be loaded.");
      setAllNotifications([]);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadNotifications("all");
  }, [loadNotifications]);

  const counts = useMemo(() => {
    return {
      total: allNotifications.length,
      unread: allNotifications.filter((notification) => !notification.isRead).length,
      match: allNotifications.filter(
        (notification) => String(notification.type).toLowerCase() === "match"
      ).length,
      verification: allNotifications.filter((notification) =>
        ["verification", "status"].includes(String(notification.type).toLowerCase())
      ).length,
    };
  }, [allNotifications]);

  const setFilter = (filter) => {
    setActiveFilter(filter);
    loadNotifications(filter);
  };

  const refreshAfterChange = async () => {
    await loadNotifications(activeFilter);
    window.dispatchEvent(new Event("lostFoundNotificationsUpdated"));
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      await refreshAfterChange();
    } catch (err) {
      alert(err.message || "Notification could not be marked as read.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationApi(id);
      if (selectedNotification?.id === id) {
        setSelectedNotification(null);
      }
      await refreshAfterChange();
    } catch (err) {
      alert(err.message || "Notification could not be deleted.");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setShowConfirmPopup(false);
      setSelectedNotification(null);
      await refreshAfterChange();
    } catch (err) {
      alert(err.message || "Notifications could not be cleared.");
    }
  };

  const findMatchUrlFromReport = async (reportId) => {
    if (!reportId) return "";

    const response = await getMatchByReportId(reportId);
    const matchId = response.match?._id || response.match?.id;
    return matchId ? `/match-alert/${matchId}` : "";
  };

  const openNotification = async (notification) => {
    const updatedNotification = { ...notification, isRead: true };

    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
        await refreshAfterChange();
      }

      const type = String(notification.type || "").toLowerCase();

      if (type === "match") {
        if (notification.actionUrl && notification.actionUrl.includes("/match-alert/")) {
          navigate(notification.actionUrl);
          return;
        }

        if (notification.matchId) {
          navigate(`/match-alert/${notification.matchId}`);
          return;
        }

        if (notification.reportId) {
          const matchUrl = await findMatchUrlFromReport(notification.reportId);

          if (matchUrl) {
            navigate(matchUrl);
            return;
          }
        }

        setSelectedNotification({
          ...updatedNotification,
          extraMessage:
            "This match alert is not linked with a confirmed comparison yet. Ask admin to confirm the match again.",
        });
        return;
      }

      if (type === "comment") {
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
          return;
        }

        if (notification.reportId) {
          navigate(`/reports?reportId=${notification.reportId}&openComments=true`);
          return;
        }

        setSelectedNotification(updatedNotification);
        return;
      }

      if (["verification", "status", "alert"].includes(type)) {
        if (notification.reportId) {
          navigate(`/reports?reportId=${notification.reportId}`);
          return;
        }

        setSelectedNotification(updatedNotification);
        return;
      }

      if (notification.actionUrl) {
        navigate(notification.actionUrl);
        return;
      }

      if (notification.reportId) {
        navigate(`/reports?reportId=${notification.reportId}`);
        return;
      }

      setSelectedNotification(updatedNotification);
    } catch (err) {
      setSelectedNotification({
        ...updatedNotification,
        extraMessage: err.message || "Notification action could not be opened.",
      });
    }
  };

  const getNotificationIcon = (type) => {
    const normalizedType = String(type || "").toLowerCase();

    if (normalizedType === "match") return <FaUserCheck />;
    if (normalizedType === "verification") return <FaShieldAlt />;
    if (normalizedType === "comment") return <FaCommentDots />;
    if (normalizedType === "alert") return <FaExclamationTriangle />;

    return <FaCheckCircle />;
  };

  const renderSummaryCard = (filter, icon, count, label) => (
    <button
      type="button"
      className={`notifications-summary-card ${activeFilter === filter ? "notifications-summary-card--active" : ""}`}
      onClick={() => setFilter(filter)}
    >
      <div className="notifications-summary-icon">{icon}</div>

      <div>
        <h3>{count}</h3>
        <p>{label}</p>
      </div>
    </button>
  );

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
              {counts.unread} Unread
            </div>
          </section>

          <section className="notifications-summary">
            {renderSummaryCard("all", <FaBell />, counts.total, "Total Notifications")}
            {renderSummaryCard("unread", <FaEnvelopeOpen />, counts.unread, "Unread")}
            {renderSummaryCard("match", <FaUserCheck />, counts.match, "Match Alerts")}
            {renderSummaryCard("verification", <FaShieldAlt />, counts.verification, "Verification")}
          </section>

          <section className="notifications-top-actions">
            <button
              className="notifications-clear-all-btn"
              onClick={() => setShowConfirmPopup(true)}
              disabled={allNotifications.length === 0}
            >
              <FaTrash />
              Clear All Notifications
            </button>
          </section>

          <section className="notifications-list">
            {isLoading ? (
              <div className="notifications-empty">
                <FaBell />
                <h2>Loading notifications...</h2>
                <p>Please wait while updates are loaded from backend.</p>
              </div>
            ) : error ? (
              <div className="notifications-empty">
                <FaExclamationTriangle />
                <h2>Notifications could not load</h2>
                <p>{error}</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  className={`notification-card ${!notification.isRead ? "notification-card--unread" : ""}`}
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
                        <span className="notification-type">{notification.type}</span>
                        <h2>{notification.title}</h2>
                      </div>

                      {!notification.isRead && <span className="notification-unread-dot"></span>}
                    </div>

                    <p className="notification-message">{notification.message}</p>

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
                        {getRelativeTime(notification.createdAt, notification.time)}
                      </span>
                    </div>

                    <div className="notification-card__actions" onClick={(e) => e.stopPropagation()}>
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
                  comments, verification updates and match alerts will appear here.
                </p>
              </div>
            )}
          </section>

          {selectedNotification && (
            <div className="notifications-detail-overlay" onClick={() => setSelectedNotification(null)}>
              <div className="notifications-detail-box" onClick={(e) => e.stopPropagation()}>
                <button className="notifications-detail-close" onClick={() => setSelectedNotification(null)}>
                  <FaTimes />
                </button>

                <div
                  className={`notifications-detail-icon notification-card__icon--${String(
                    selectedNotification.type || "alert"
                  ).toLowerCase()}`}
                >
                  {getNotificationIcon(selectedNotification.type)}
                </div>

                <span className="notification-type">{selectedNotification.type}</span>
                <h2>{selectedNotification.title}</h2>
                <p>{selectedNotification.message}</p>

                {selectedNotification.extraMessage && (
                  <p className="notifications-detail-note">{selectedNotification.extraMessage}</p>
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
                    {getRelativeTime(selectedNotification.createdAt, selectedNotification.time)}
                  </span>
                </div>

                <button className="notifications-detail-ok" onClick={() => setSelectedNotification(null)}>
                  Okay
                </button>
              </div>
            </div>
          )}

          {showConfirmPopup && (
            <div className="notifications-confirm-overlay">
              <div className="notifications-confirm-box">
                <button className="notifications-confirm-close" onClick={() => setShowConfirmPopup(false)}>
                  <FaTimes />
                </button>

                <div className="notifications-confirm-icon">
                  <FaTrash />
                </div>

                <h2>Clear All Notifications?</h2>
                <p>This will remove all notifications from your account.</p>

                <div className="notifications-confirm-actions">
                  <button className="notifications-cancel-btn" onClick={() => setShowConfirmPopup(false)}>
                    Cancel
                  </button>

                  <button className="notifications-delete-confirm-btn" onClick={handleClearAll}>
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
