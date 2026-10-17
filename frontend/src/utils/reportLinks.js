import { toast } from "./notify";

const isItem = (report = {}) =>
  String(report.reportCategory || report.category || "").toLowerCase() === "item";

// Public page of a report: /items/:id or /persons/:id
export const getReportPath = (report = {}) =>
  `/${isItem(report) ? "items" : "persons"}/${report.id || report._id}`;

export const getReportUrl = (report = {}) => `${window.location.origin}${getReportPath(report)}`;

// "2026-06-26" -> "26 Jun 2026"
export const formatDisplayDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const getReportHeadline = (report = {}) => {
  const type = report.type || "";
  const kind = isItem(report) ? "item" : "person";
  return `${type} ${kind}: ${report.title || report.name || ""}`.trim();
};

// Uses the native share sheet on phones and copies the link elsewhere.
export const shareReport = async (report = {}) => {
  const url = getReportUrl(report);
  const title = getReportHeadline(report);
  const place = report.city && report.city !== "Unknown" ? ` in ${report.city}` : "";
  const text = `${title}${place}. Please help by sharing.`;

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied. You can paste it anywhere to share.");
  } catch {
    toast.error("Unable to copy the link. Please copy it from the address bar.");
  }
};
