const Notification = require("../models/notification");
const ReportMatch = require("../models/reportMatch");

const normalizeType = (value = "") => String(value).trim().toLowerCase();

const buildNotificationQuery = (req) => {
  const query = { userId: req.user.id };
  const type = normalizeType(req.query.type);

  if (req.query.unread === "true") {
    query.isRead = false;
  }

  if (type && type !== "all") {
    if (type === "match") query.type = "Match";
    if (type === "verification") query.type = { $in: ["Verification", "Status"] };
    if (type === "comment") query.type = "Comment";
    if (type === "alert") query.type = "Alert";
    if (type === "status") query.type = "Status";
  }

  return query;
};

const addMatchActionUrl = async (notification) => {
  const item = notification.toObject ? notification.toObject() : { ...notification };

  if (item.type !== "Match") {
    return item;
  }

  if (item.matchId) {
    item.actionUrl = item.actionUrl || `/match-alert/${item.matchId}`;
    return item;
  }

  if (!item.reportId) {
    return item;
  }

  const match = await ReportMatch.findOne({
    status: "confirmed",
    $or: [{ lostReportId: item.reportId }, { foundReportId: item.reportId }],
  }).select("_id");

  if (match) {
    item.matchId = match._id;
    item.actionUrl = `/match-alert/${match._id}`;
  }

  return item;
};

// GET MY NOTIFICATIONS
const getNotifications = async (req, res) => {
  try {
    const query = buildNotificationQuery(req);

    const notificationsRaw = await Notification.find(query).sort({ createdAt: -1 });
    const notifications = await Promise.all(notificationsRaw.map(addMatchActionUrl));

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET NOTIFICATION COUNTS FOR SIDEBAR/BADGE
const getNotificationSummary = async (req, res) => {
  try {
    const [total, unread, matches, verification] = await Promise.all([
      Notification.countDocuments({ userId: req.user.id }),
      Notification.countDocuments({ userId: req.user.id, isRead: false }),
      Notification.countDocuments({ userId: req.user.id, type: "Match" }),
      Notification.countDocuments({
        userId: req.user.id,
        type: { $in: ["Verification", "Status"] },
      }),
    ]);

    res.status(200).json({
      message: "Notification summary fetched successfully",
      summary: { total, unread, matches, verification },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// MARK NOTIFICATION AS READ
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const normalizedNotification = await addMatchActionUrl(notification);

    res.status(200).json({
      message: "Notification marked as read",
      notification: normalizedNotification,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE SINGLE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// CLEAR ALL NOTIFICATIONS
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.user.id,
    });

    res.status(200).json({
      message: "All notifications cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
};
