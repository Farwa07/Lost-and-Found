const Report = require("../models/report");
const User = require("../models/user");
const ReportComplaint = require("../models/reportComplaint");
const Notification = require("../models/notification");
const AdminLog = require("../models/adminLog");
const ReportMatch = require("../models/reportMatch");

const MATCH_THRESHOLD = 55;

const createAdminLog = async (adminId, action, targetType, targetId, details = "") => {
  try {
    if (!adminId) return;
    await AdminLog.create({ adminId, action, targetType, targetId, details });
  } catch (error) {
    console.log("Admin log error:", error.message);
  }
};

const getId = (value) => String(value?._id || value || "");

const normalizeText = (value = "") => String(value || "").trim().toLowerCase();

const titleCaseStatus = (value = "") => {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const getReportTitle = (report = {}) =>
  report.itemName || report.missingPersonName || report.foundPersonName || report.title || "Report";

const getReportDescription = (report = {}) =>
  report.itemDescription || report.missingPersonDescription || report.foundPersonDescription || report.description || "";

const getReportLocation = (report = {}) =>
  report.lostLocation ||
  report.foundLocation ||
  report.missingPersonLastSeenLocation ||
  report.currentLocation ||
  report.location ||
  "";

const getReportDate = (report = {}) =>
  report.lostDate || report.foundDate || report.missingPersonLastSeenDate || report.createdAt || null;

const getReportImage = (report = {}) =>
  report.lostItemImage || report.foundItemImage || report.missingPersonImage || report.foundPersonImage || "";

const getReporterEmail = (report = {}) => report.reporterEmail || report.userId?.email || "";

const getReporterPhone = (report = {}) => report.reporterContactNumber || report.userId?.phone || "";

const getPersonAge = (report = {}) => {
  const rawAge = report.missingPersonAge || report.estimatedAge;
  const age = Number(rawAge);
  return Number.isFinite(age) ? age : null;
};

const getPersonGender = (report = {}) =>
  report.missingPersonGender || report.foundPersonGender || report.gender || "";

const wordsFrom = (text = "") =>
  normalizeText(text)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3);

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "near",
  "from",
  "lost",
  "found",
  "missing",
  "person",
  "child",
  "boy",
  "girl",
  "male",
  "female",
  "wearing",
  "last",
  "seen",
]);

const GENERIC_LOCATION_WORDS = new Set([
  "near",
  "road",
  "street",
  "colony",
  "city",
  "area",
  "block",
  "sector",
  "home",
  "house",
  "town",
  "lahore",
  "gujranwala",
  "karachi",
  "islamabad",
  "rawalpindi",
  "faisalabad",
  "multan",
  "sialkot",
  "pakistan",
]);

const PLACEHOLDER_NAMES = new Set([
  "unknown",
  "naamaloam",
  "namaloom",
  "نامعلوم",
  "na maloom",
  "not known",
  "n/a",
  "na",
]);

const meaningfulWordsFrom = (text = "") =>
  wordsFrom(text).filter((word) => !STOP_WORDS.has(word));

const sharedWordScore = (left = "", right = "", maxScore = 15) => {
  const leftWords = [...new Set(meaningfulWordsFrom(left))];
  const rightWords = new Set(meaningfulWordsFrom(right));

  if (leftWords.length === 0 || rightWords.size === 0) return 0;

  const common = leftWords.filter((word) => rightWords.has(word)).length;
  return Math.min(common * 5, maxScore);
};

const sharedWordCount = (left = "", right = "") => {
  const leftWords = [...new Set(meaningfulWordsFrom(left))];
  const rightWords = new Set(meaningfulWordsFrom(right));
  return leftWords.filter((word) => rightWords.has(word)).length;
};

const locationWordsFrom = (text = "") =>
  wordsFrom(text).filter((word) => !GENERIC_LOCATION_WORDS.has(word));

const hasStrongLocationMatch = (left = "", right = "") => {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);
  if (!leftText || !rightText) return false;
  if (leftText === rightText) return true;

  const leftWords = [...new Set(locationWordsFrom(leftText))];
  const rightWords = new Set(locationWordsFrom(rightText));
  if (leftWords.length === 0 || rightWords.size === 0) return false;

  return leftWords.some((word) => rightWords.has(word));
};

const levenshteinDistance = (left = "", right = "") => {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array(b.length + 1).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
};

const textSimilarity = (left = "", right = "") => {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return 0;
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 0;
  return (longest - levenshteinDistance(a, b)) / longest;
};

const isPlaceholderName = (name = "") => {
  const normalized = normalizeText(name);
  return !normalized || PLACEHOLDER_NAMES.has(normalized);
};

const getNameMatch = (left = "", right = "") => {
  const leftName = normalizeText(left);
  const rightName = normalizeText(right);

  if (isPlaceholderName(leftName) || isPlaceholderName(rightName)) {
    return { compatible: true, exact: false, similar: false, hasKnownNames: false };
  }

  if (leftName === rightName) {
    return { compatible: true, exact: true, similar: false, hasKnownNames: true };
  }

  const sharedNameWords = sharedWordCount(leftName, rightName);
  const similarEnough = textSimilarity(leftName, rightName) >= 0.72;

  return {
    compatible: sharedNameWords > 0 || similarEnough,
    exact: false,
    similar: sharedNameWords > 0 || similarEnough,
    hasKnownNames: true,
  };
};

const datesCloseEnough = (leftDate, rightDate, maxDays = 30) => {
  if (!leftDate || !rightDate) return false;
  const left = new Date(leftDate).getTime();
  const right = new Date(rightDate).getTime();
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  const diffDays = Math.abs(left - right) / (1000 * 60 * 60 * 24);
  return diffDays <= maxDays;
};

const calculatePersonMatchScore = (lostReport, foundReport) => {
  let score = 0;
  const reasons = [];
  const matchedFields = [];

  const addScore = (points, reason, field) => {
    score += points;
    reasons.push(reason);
    matchedFields.push(field);
  };

  const lostName = getReportTitle(lostReport);
  const foundName = getReportTitle(foundReport);
  const nameMatch = getNameMatch(lostName, foundName);

  // Important guard: if both reports have clear person names and names are different,
  // do not suggest the match only because age/gender/location/date are close.
  if (nameMatch.hasKnownNames && !nameMatch.compatible) {
    return { score: 0, reasons: [], matchedFields: [] };
  }

  addScore(10, "Same report category", "category");

  if (nameMatch.exact) {
    addScore(55, "Same person name", "title/name");
  } else if (nameMatch.similar) {
    addScore(35, "Similar person name", "title/name");
  }

  const lostGender = normalizeText(getPersonGender(lostReport));
  const foundGender = normalizeText(getPersonGender(foundReport));
  if (lostGender && foundGender && lostGender === foundGender) {
    addScore(12, "Same gender", "gender");
  }

  const lostAge = getPersonAge(lostReport);
  const foundAge = getPersonAge(foundReport);
  if (lostAge !== null && foundAge !== null) {
    const diff = Math.abs(lostAge - foundAge);
    if (diff === 0) addScore(12, "Same age", "age");
    else if (diff <= 3) addScore(8, "Close age", "age");
  }

  const lostCity = normalizeText(lostReport.city);
  const foundCity = normalizeText(foundReport.city);
  if (lostCity && foundCity && lostCity === foundCity) {
    addScore(8, "Same city", "city");
  }

  const lostLocation = getReportLocation(lostReport);
  const foundLocation = getReportLocation(foundReport);
  if (hasStrongLocationMatch(lostLocation, foundLocation)) {
    addScore(8, "Similar location", "location");
  }

  if (datesCloseEnough(getReportDate(lostReport), getReportDate(foundReport), 30)) {
    addScore(5, "Dates are close", "date");
  }

  const descriptionScore = sharedWordScore(
    getReportDescription(lostReport),
    getReportDescription(foundReport),
    10
  );
  if (descriptionScore > 0) {
    addScore(descriptionScore, "Similar description keywords", "description");
  }

  return {
    score: Math.min(score, 100),
    reasons: [...new Set(reasons)],
    matchedFields: [...new Set(matchedFields)],
  };
};

const calculateItemMatchScore = (lostReport, foundReport) => {
  let score = 0;
  const reasons = [];
  const matchedFields = [];

  const addScore = (points, reason, field) => {
    score += points;
    reasons.push(reason);
    matchedFields.push(field);
  };

  addScore(10, "Same report category", "category");

  const lostTitle = getReportTitle(lostReport);
  const foundTitle = getReportTitle(foundReport);
  const lostTitleNormalized = normalizeText(lostTitle);
  const foundTitleNormalized = normalizeText(foundTitle);

  if (lostTitleNormalized && foundTitleNormalized && lostTitleNormalized === foundTitleNormalized) {
    addScore(25, "Same title/name", "title/name");
  } else {
    const titleScore = sharedWordScore(lostTitle, foundTitle, 15);
    if (titleScore > 0) addScore(titleScore, "Similar title/name keywords", "title/name");
  }

  const lostItemCategory = normalizeText(lostReport.itemCategory);
  const foundItemCategory = normalizeText(foundReport.itemCategory);
  if (lostItemCategory && foundItemCategory && lostItemCategory === foundItemCategory) {
    addScore(15, "Same item category", "itemCategory");
  }

  const lostColor = normalizeText(lostReport.itemColor);
  const foundColor = normalizeText(foundReport.itemColor);
  if (lostColor && foundColor && lostColor === foundColor) {
    addScore(10, "Same color", "color");
  }

  const lostBrand = normalizeText(lostReport.itemBrand);
  const foundBrand = normalizeText(foundReport.itemBrand);
  if (lostBrand && foundBrand && lostBrand === foundBrand) {
    addScore(10, "Same brand", "brand");
  }

  const lostCity = normalizeText(lostReport.city);
  const foundCity = normalizeText(foundReport.city);
  if (lostCity && foundCity && lostCity === foundCity) {
    addScore(8, "Same city", "city");
  }

  if (hasStrongLocationMatch(getReportLocation(lostReport), getReportLocation(foundReport))) {
    addScore(7, "Similar location", "location");
  }

  if (datesCloseEnough(getReportDate(lostReport), getReportDate(foundReport), 30)) {
    addScore(5, "Dates are close", "date");
  }

  const descriptionScore = sharedWordScore(
    getReportDescription(lostReport),
    getReportDescription(foundReport),
    10
  );
  if (descriptionScore > 0) {
    addScore(descriptionScore, "Similar description keywords", "description");
  }

  return {
    score: Math.min(score, 100),
    reasons: [...new Set(reasons)],
    matchedFields: [...new Set(matchedFields)],
  };
};

const calculateMatchScore = (lostReport, foundReport) => {
  const category = normalizeText(lostReport.category);
  if (category !== normalizeText(foundReport.category)) {
    return { score: 0, reasons: [], matchedFields: [] };
  }

  if (category === "person") {
    return calculatePersonMatchScore(lostReport, foundReport);
  }

  if (category === "item") {
    return calculateItemMatchScore(lostReport, foundReport);
  }

  return { score: 0, reasons: [], matchedFields: [] };
};

const shouldResurfaceDismissedMatch = (lostReport, foundReport, score, matchedFields = []) => {
  const category = normalizeText(lostReport.category);
  if (score < MATCH_THRESHOLD) return false;

  // When the matching algorithm is improved, a previously dismissed suggestion with
  // a strong identity field should be allowed to appear again for admin review.
  if (category === "person") {
    return matchedFields.includes("title/name") && matchedFields.includes("gender") && matchedFields.includes("age");
  }

  if (category === "item") {
    return matchedFields.includes("title/name") && (
      matchedFields.includes("itemCategory") ||
      matchedFields.includes("color") ||
      matchedFields.includes("brand")
    );
  }

  return false;
};

const syncConfirmedMatchReports = async (match) => {
  if (!match || match.status !== "confirmed") return;

  const lostReportId = getId(match.lostReportId);
  const foundReportId = getId(match.foundReportId);
  if (!lostReportId || !foundReportId) return;

  const matchedAt = match.confirmedAt || match.updatedAt || new Date();
  const baseUpdate = {
    status: "matched",
    caseStatus: "Solved",
    isVerified: true,
    matchId: match._id,
    matchScore: match.score || 0,
    matchedFields: match.matchedFields || [],
    matchedAt,
    matchedBy: match.confirmedBy || null,
  };

  await Promise.all([
    Report.findByIdAndUpdate(
      lostReportId,
      { ...baseUpdate, matchedWith: foundReportId },
      { new: true, runValidators: true }
    ),
    Report.findByIdAndUpdate(
      foundReportId,
      { ...baseUpdate, matchedWith: lostReportId },
      { new: true, runValidators: true }
    ),
  ]);
};

const syncAllConfirmedMatchReports = async () => {
  const confirmedMatches = await ReportMatch.find({ status: "confirmed" });
  for (const match of confirmedMatches) {
    await syncConfirmedMatchReports(match);
  }
};

const createMatchNotification = async (userId, report, match, otherReport) => {
  if (!userId) return;

  const reportTitle = getReportTitle(report);
  const otherTitle = getReportTitle(otherReport);

  await Notification.create({
    userId,
    reportId: report._id,
    matchId: match._id,
    type: "Match",
    title: "Match Confirmed",
    message: `A possible match has been confirmed for your report "${reportTitle}" with "${otherTitle}".`,
    caseTitle: reportTitle,
    city: report.city || otherReport.city || "All Cities",
    actionUrl: `/match-alert/${match._id}`,
  });
};

const getAdminReports = async (req, res) => {
  try {
    await syncAllConfirmedMatchReports();

    const reports = await Report.find()
      .populate("userId", "fullName email phone role status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Admin reports fetched successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "verified", "matched", "closed", "rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, isVerified: ["verified", "matched"].includes(status) },
      { new: true, runValidators: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.userId && ["verified", "rejected", "matched"].includes(status)) {
      let notificationTitle = "Report Status Updated";
      let notificationMessage = `Your report status has been updated to ${status}.`;
      let type = "Status";

      if (status === "verified") {
        type = "Verification";
        notificationTitle = "Report Verified";
        notificationMessage = `Admin has verified your report "${getReportTitle(report)}".`;
      }

      if (status === "rejected") {
        notificationTitle = "Report Rejected";
        notificationMessage = `Admin has rejected your report "${getReportTitle(report)}".`;
      }

      if (status === "matched") {
        notificationTitle = "Report Matched";
        notificationMessage = `Admin has marked your report "${getReportTitle(report)}" as matched.`;
      }

      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        type,
        title: notificationTitle,
        message: notificationMessage,
        caseTitle: getReportTitle(report),
        city: report.city || "All Cities",
        actionUrl: `/reports?reportId=${report._id}`,
      });
    }

    await createAdminLog(
      req.user?.id || req.user?._id,
      `Report status updated to ${status}`,
      "report",
      report._id,
      `Admin updated report status to ${status}`
    );

    res.status(200).json({ message: "Report status updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReportCaseStatus = async (req, res) => {
  try {
    const { caseStatus } = req.body;
    const allowedCaseStatuses = ["Unsolved", "Solved", "Closed"];

    if (!allowedCaseStatuses.includes(caseStatus)) {
      return res.status(400).json({ message: "Invalid case status value" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { caseStatus },
      { new: true, runValidators: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });

    if (report.userId) {
      await Notification.create({
        userId: report.userId,
        reportId: report._id,
        type: "Status",
        title: "Case Status Updated",
        message: `Your report "${getReportTitle(report)}" case status is now ${caseStatus}.`,
        caseTitle: getReportTitle(report),
        city: report.city || "All Cities",
        actionUrl: `/reports?reportId=${report._id}`,
      });
    }

    await createAdminLog(
      req.user?.id || req.user?._id,
      `Case status updated to ${caseStatus}`,
      "report",
      report._id,
      `Admin updated report case status to ${caseStatus}`
    );

    res.status(200).json({ message: "Case status updated successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyReport = (req, res) => {
  req.body.status = "verified";
  return updateReportStatus(req, res);
};

const rejectReport = (req, res) => {
  req.body.status = "rejected";
  return updateReportStatus(req, res);
};

const deleteAdminReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    await ReportMatch.deleteMany({
      $or: [{ lostReportId: report._id }, { foundReportId: report._id }],
    });

    await createAdminLog(
      req.user?.id || req.user?._id,
      "Report deleted",
      "report",
      report._id,
      "Admin deleted a fake/inappropriate report"
    );

    res.status(200).json({ message: "Report deleted successfully by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearReportFlags = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { flags: [], flagCount: 0 },
      { new: true, runValidators: true }
    );

    if (!report) return res.status(404).json({ message: "Report not found" });

    await ReportComplaint.updateMany(
      { reportId: report._id, status: "pending" },
      { status: "reviewed" }
    );

    await createAdminLog(
      req.user?.id || req.user?._id,
      "Report flags cleared",
      "report",
      report._id,
      "Admin cleared flags after review"
    );

    res.status(200).json({ message: "Report flags cleared successfully", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetOtp -resetOtpExpire")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Users fetched successfully", count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["user", "admin"];
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role value" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select(
      "-password -resetOtp -resetOtpExpire"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    await createAdminLog(req.user?.id || req.user?._id, `User role updated to ${role}`, "user", user._id, `Admin changed user role to ${role}`);
    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Admin account cannot be deleted" });

    await User.findByIdAndDelete(req.params.id);
    await createAdminLog(req.user?.id || req.user?._id, "User deleted", "user", user._id, "Admin deleted a user account");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportComplaints = async (req, res) => {
  try {
    const complaints = await ReportComplaint.find()
      .populate("reportId")
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 });
    res.status(200).json({ message: "Complaints fetched successfully", count: complaints.length, complaints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "reviewed", "dismissed"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid complaint status" });

    const complaint = await ReportComplaint.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await createAdminLog(req.user?.id || req.user?._id, `Complaint status updated to ${status}`, "complaint", complaint._id, `Admin updated complaint status to ${status}`);
    res.status(200).json({ message: "Complaint status updated successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "blocked" }, { new: true, runValidators: true }).select(
      "-password -resetOtp -resetOtpExpire"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    await createAdminLog(req.user?.id || req.user?._id, "User blocked", "user", user._id, "Admin blocked a user");
    res.status(200).json({ message: "User blocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: "active" }, { new: true, runValidators: true }).select(
      "-password -resetOtp -resetOtpExpire"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    await createAdminLog(req.user?.id || req.user?._id, "User unblocked", "user", user._id, "Admin unblocked a user");
    res.status(200).json({ message: "User unblocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendAdminAlert = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const reportId = req.params.id;

    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (!report.userId) return res.status(400).json({ message: "This report has no user attached" });

    let notificationType = type || "Alert";
    let actionUrl = `/reports?reportId=${report._id}`;
    let matchId = null;

    if (notificationType === "Match") {
      const confirmedMatch = await ReportMatch.findOne({
        status: "confirmed",
        $or: [{ lostReportId: report._id }, { foundReportId: report._id }],
      }).select("_id");

      if (!confirmedMatch) {
        return res.status(400).json({
          message: "Match alert cannot be sent before confirming a real match",
        });
      }

      matchId = confirmedMatch._id;
      actionUrl = `/match-alert/${confirmedMatch._id}`;
    }

    const notification = await Notification.create({
      userId: report.userId,
      reportId: report._id,
      matchId,
      type: notificationType,
      title,
      message,
      caseTitle: getReportTitle(report),
      city: report.city || "Unknown",
      actionUrl,
    });

    await createAdminLog(req.user?.id || req.user?._id, "Admin alert sent", "alert", report._id, `Admin sent alert: ${title}`);
    res.status(201).json({ message: "Admin alert sent successfully", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendGeneralAlert = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });

    const users = await User.find({ role: "user", status: "active" });
    const notifications = users.map((user) => ({
      userId: user._id,
      type: type || "Alert",
      title,
      message,
      caseTitle: "System Alert",
      city: "All Cities",
      actionUrl: "/notifications",
    }));

    if (notifications.length > 0) await Notification.insertMany(notifications);
    await createAdminLog(req.user?.id || req.user?._id, "General alert sent", "alert", null, `Admin sent general alert to ${users.length} users`);
    res.status(201).json({ message: "General alert sent successfully", count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().populate("adminId", "fullName email role").sort({ createdAt: -1 });
    res.status(200).json({ message: "Admin logs fetched successfully", count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMatchSuggestions = async (req, res) => {
  try {
    await syncAllConfirmedMatchReports();

    const lostReports = await Report.find({
      reportType: "lost",
      status: "verified",
      caseStatus: { $ne: "Solved" },
    }).populate("userId", "fullName email phone role status");

    const foundReports = await Report.find({
      reportType: "found",
      status: "verified",
      caseStatus: { $ne: "Solved" },
    }).populate("userId", "fullName email phone role status");

    const suggestions = [];

    for (const lostReport of lostReports) {
      for (const foundReport of foundReports) {
        if (normalizeText(lostReport.category) !== normalizeText(foundReport.category)) continue;

        const { score, reasons, matchedFields } = calculateMatchScore(lostReport, foundReport);
        if (score < MATCH_THRESHOLD) continue;

        let match = await ReportMatch.findOne({
          lostReportId: lostReport._id,
          foundReportId: foundReport._id,
        });

        if (match?.status === "confirmed") {
          await syncConfirmedMatchReports(match);
          continue;
        }

        if (match?.status === "dismissed" && !shouldResurfaceDismissedMatch(lostReport, foundReport, score, matchedFields)) {
          continue;
        }

        if (!match) {
          match = await ReportMatch.create({
            lostReportId: lostReport._id,
            foundReportId: foundReport._id,
            score,
            reasons,
            matchedFields,
            threshold: MATCH_THRESHOLD,
            status: "suggested",
          });
        } else {
          match.score = score;
          match.reasons = reasons;
          match.matchedFields = matchedFields;
          match.threshold = MATCH_THRESHOLD;
          match.status = "suggested";
          await match.save();
        }

        suggestions.push({
          matchId: match._id,
          score: match.score,
          reasons: match.reasons,
          matchedFields: match.matchedFields,
          threshold: match.threshold,
          status: match.status,
          lostReport,
          foundReport,
        });
      }
    }

    suggestions.sort((left, right) => right.score - left.score);

    res.status(200).json({
      message: "Match suggestions fetched successfully",
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmMatch = async (req, res) => {
  try {
    const match = await ReportMatch.findById(req.params.matchId)
      .populate("lostReportId")
      .populate("foundReportId");

    if (!match) return res.status(404).json({ message: "Match not found" });
    if (match.status === "dismissed") return res.status(400).json({ message: "Dismissed match cannot be confirmed" });

    match.status = "confirmed";
    match.confirmedBy = req.user?.id || req.user?._id;
    match.confirmedAt = new Date();
    await match.save();

    await syncConfirmedMatchReports(match);

    const freshMatch = await ReportMatch.findById(match._id)
      .populate("lostReportId")
      .populate("foundReportId")
      .populate("confirmedBy", "fullName email role");

    await createMatchNotification(
      freshMatch.lostReportId.userId,
      freshMatch.lostReportId,
      freshMatch,
      freshMatch.foundReportId
    );

    await createMatchNotification(
      freshMatch.foundReportId.userId,
      freshMatch.foundReportId,
      freshMatch,
      freshMatch.lostReportId
    );

    await createAdminLog(
      req.user?.id || req.user?._id,
      "Match confirmed",
      "match",
      match._id,
      "Admin confirmed a match between lost/missing and found reports"
    );

    res.status(200).json({ message: "Match confirmed successfully", match: freshMatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const dismissMatch = async (req, res) => {
  try {
    const match = await ReportMatch.findByIdAndUpdate(
      req.params.matchId,
      { status: "dismissed" },
      { new: true, runValidators: true }
    );

    if (!match) return res.status(404).json({ message: "Match not found" });

    await createAdminLog(
      req.user?.id || req.user?._id,
      "Match dismissed",
      "match",
      match._id,
      "Admin dismissed a match suggestion"
    );

    res.status(200).json({ message: "Match dismissed successfully", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMatchById = async (req, res) => {
  try {
    const match = await ReportMatch.findById(req.params.matchId)
      .populate("lostReportId")
      .populate("foundReportId")
      .populate("confirmedBy", "fullName email role");

    if (!match) return res.status(404).json({ message: "Match not found" });

    if (match.status === "confirmed") {
      await syncConfirmedMatchReports(match);
    }

    const userId = getId(req.user?.id || req.user?._id);
    const role = req.user?.role;
    const lostOwnerId = getId(match.lostReportId?.userId);
    const foundOwnerId = getId(match.foundReportId?.userId);

    if (role !== "admin" && ![lostOwnerId, foundOwnerId].includes(userId)) {
      return res.status(403).json({ message: "You are not allowed to view this match" });
    }

    res.status(200).json({ message: "Match fetched successfully", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMatchByReportId = async (req, res) => {
  try {
    const match = await ReportMatch.findOne({
      status: "confirmed",
      $or: [{ lostReportId: req.params.reportId }, { foundReportId: req.params.reportId }],
    })
      .populate("lostReportId")
      .populate("foundReportId")
      .populate("confirmedBy", "fullName email role")
      .sort({ confirmedAt: -1, updatedAt: -1 });

    if (!match) return res.status(404).json({ message: "Match not found for this report" });

    await syncConfirmedMatchReports(match);
    res.status(200).json({ message: "Match fetched successfully", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminReports,
  updateReportStatus,
  updateReportCaseStatus,
  verifyReport,
  rejectReport,
  deleteAdminReport,
  clearReportFlags,
  getAdminUsers,
  updateUserRole,
  deleteAdminUser,
  getReportComplaints,
  updateComplaintStatus,
  blockUser,
  unblockUser,
  sendAdminAlert,
  sendGeneralAlert,
  getAdminLogs,
  getMatchSuggestions,
  confirmMatch,
  dismissMatch,
  getMatchById,
  getMatchByReportId,
};
