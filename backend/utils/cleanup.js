const Report = require("../models/report");
const User = require("../models/user");
const Comment = require("../models/comment");
const Notification = require("../models/notification");
const ReportComplaint = require("../models/reportComplaint");
const ReportMatch = require("../models/reportMatch");
const { removeStoredFiles, getReportFiles } = require("./uploads");

// Deletes reports together with everything that points at them:
// comments, notifications, complaints, matches and the uploaded files.
const deleteReportsCascade = async (reportIds = []) => {
  if (reportIds.length === 0) return;

  const reports = await Report.find({ _id: { $in: reportIds } });
  if (reports.length === 0) return;

  const ids = reports.map((report) => report._id);

  const matches = await ReportMatch.find({
    $or: [{ lostReportId: { $in: ids } }, { foundReportId: { $in: ids } }],
  }).select("_id");
  const matchIds = matches.map((match) => match._id);

  await Promise.all([
    Comment.deleteMany({ reportId: { $in: ids } }),
    Notification.deleteMany({
      $or: [{ reportId: { $in: ids } }, { matchId: { $in: matchIds } }],
    }),
    ReportComplaint.deleteMany({ reportId: { $in: ids } }),
    ReportMatch.deleteMany({ _id: { $in: matchIds } }),
    // The other side of a match should no longer point at a deleted report.
    Report.updateMany(
      { matchedWith: { $in: ids } },
      { matchedWith: null, matchId: null }
    ),
  ]);

  await Report.deleteMany({ _id: { $in: ids } });

  await removeStoredFiles(reports.flatMap(getReportFiles));
};

// Deletes a user account and all of the user's data.
const deleteUserCascade = async (user) => {
  const userId = user._id;

  const userReports = await Report.find({ userId }).select("_id");
  await deleteReportsCascade(userReports.map((report) => report._id));

  // Flags this user raised on other reports.
  const flaggedReports = await Report.find({ "flags.userId": userId }).select("_id flags");
  await Promise.all(
    flaggedReports.map((report) => {
      const remaining = report.flags.filter(
        (flag) => String(flag.userId) !== String(userId)
      );
      return Report.updateOne(
        { _id: report._id },
        { flags: remaining, flagCount: remaining.length }
      );
    })
  );

  await Promise.all([
    Comment.deleteMany({ userId }),
    Comment.updateMany(
      { "replies.userId": userId },
      { $pull: { replies: { userId } } }
    ),
    Notification.deleteMany({ userId }),
    ReportComplaint.deleteMany({ userId }),
  ]);

  await User.findByIdAndDelete(userId);

  await removeStoredFiles([user.profileImage]);
};

module.exports = {
  deleteReportsCascade,
  deleteUserCascade,
};
