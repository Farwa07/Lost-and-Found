const DEFAULT_PERSON_IMAGE =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop";

const DEFAULT_ITEM_IMAGE =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1200&auto=format&fit=crop";

const adminStatusMap = {
  pending: "Pending Review",
  verified: "Verified",
  rejected: "Rejected",
  matched: "Matched",
  closed: "Closed",
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const getId = (report) => report?._id || report?.id || "";

const getReportTypeLabel = (report = {}) => {
  const reportType = String(report?.reportType || "").toLowerCase();
  const category = String(report?.category || "").toLowerCase();

  if (category === "person" && reportType === "lost") {
    return "Missing";
  }

  if (reportType === "lost") {
    return "Lost";
  }

  if (reportType === "found") {
    return "Found";
  }

  return report?.type || report?.status || "Found";
};

const getCategoryLabel = (report = {}) =>
  String(report?.category || "").toLowerCase() === "item" ? "Item" : "Person";

const getTitle = (report = {}) => {
  return (
    report?.itemName ||
    report?.missingPersonName ||
    report?.foundPersonName ||
    report?.title ||
    report?.name ||
    "Untitled Report"
  );
};

export const getReportImage = (report = {}) => {
  const image =
    report?.lostItemImage ||
    report?.foundItemImage ||
    report?.missingPersonImage ||
    report?.foundPersonImage ||
    report?.image ||
    "";

  if (image) {
    return image;
  }

  return getCategoryLabel(report) === "Person" ? DEFAULT_PERSON_IMAGE : DEFAULT_ITEM_IMAGE;
};

const getLocation = (report = {}) => {
  return (
    report?.lostLocation ||
    report?.foundLocation ||
    report?.missingPersonLastSeenLocation ||
    report?.lastSeenLocation ||
    report?.location ||
    ""
  );
};

const getDate = (report = {}) => {
  return formatDate(
    report?.lostDate ||
      report?.foundDate ||
      report?.missingPersonLastSeenDate ||
      report?.date ||
      report?.createdAt
  );
};

export const reportTypeToUiType = (report = {}) => getReportTypeLabel(report);

export const reportCategoryToUi = (category = "") =>
  String(category).toLowerCase() === "item" ? "Item" : "Person";

export const normalizePublicReport = (report = {}) => {
  const id = getId(report);
  const type = getReportTypeLabel(report);
  const category = getCategoryLabel(report);
  const title = getTitle(report);

  return {
    ...report,
    id,
    _id: id,
    viewId: id,
    type,
    status: type,
    category,
    reportCategory: category,
    title,
    itemName: report.itemName || title,
    name: report.missingPersonName || report.foundPersonName || report.name || title,
    itemCategory: report.itemCategory || "",
    color: report.itemColor || report.color || "",
    brand: report.itemBrand || report.brand || "",
    age: report.missingPersonAge || report.estimatedAge || report.age || "",
    gender:
      report.missingPersonGender || report.foundPersonGender || report.gender || "",
    city: report.city || "Unknown",
    location: getLocation(report),
    lastSeenLocation: report.missingPersonLastSeenLocation || report.lastSeenLocation || "",
    foundLocation: report.foundLocation || "",
    lostLocation: report.lostLocation || "",
    currentLocation: report.currentLocation || "",
    date: getDate(report),
    description:
      report.itemDescription ||
      report.missingPersonDescription ||
      report.foundPersonDescription ||
      report.description ||
      "",
    reporterName: report.reporterFullName || report.reporterName || "Unknown Reporter",
    reporterFullName:
      report.reporterFullName || report.reporterName || "Unknown Reporter",
    reporterContact: report.reporterContactNumber || report.reporterContact || "",
    reporterContactNumber:
      report.reporterContactNumber || report.reporterContact || "",
    reporterEmail: report.reporterEmail || "",
    reporterAddress: report.reporterAddress || "",
    relation: report.reporterRelationship || report.relation || "",
    reporterRelationship: report.reporterRelationship || report.relation || "",
    ownerName: report.ownerName || report.reporterFullName || report.reporterName || "",
    ownerEmail: report.ownerEmail || report.reporterEmail || "",
    ownerId: report.ownerId || report.userId || report.reporterEmail || "",
    image: getReportImage(report),
    comments: Array.isArray(report.comments) ? report.comments : [],
    adminStatus:
      adminStatusMap[String(report.status || "").toLowerCase()] ||
      report.adminStatus ||
      "Pending Review",
    caseStatus: report.caseStatus || "Unsolved",
    createdAt: report.createdAt || "",
    flags: Array.isArray(report.flags) ? report.flags : [],
    flagCount: Number(report.flagCount || (Array.isArray(report.flags) ? report.flags.length : 0)),
  };
};

export const normalizeItemReport = (report = {}) => {
  const normalized = normalizePublicReport(report);

  return {
    ...normalized,
    reportCategory: "Item",
    category: normalized.itemCategory || "Other",
    itemCategory: normalized.itemCategory || "Other",
    itemName: normalized.title,
  };
};

export const normalizePersonReport = (report = {}) => {
  const normalized = normalizePublicReport(report);

  return {
    ...normalized,
    name: normalized.title,
    age: normalized.age || "N/A",
    gender: normalized.gender || "Other",
    lastSeenLocation:
      normalized.lastSeenLocation ||
      (normalized.type === "Missing" ? normalized.location : ""),
    foundLocation:
      normalized.foundLocation ||
      (normalized.type === "Found" ? normalized.location : ""),
  };
};

// Old pages/components still import these names. Keep them as safe aliases.
export const mapBackendReportToUi = (report = {}) => normalizePublicReport(report);

export const mapBackendReportsToUi = (reports = []) =>
  (Array.isArray(reports) ? reports : []).map(mapBackendReportToUi);

export const mapUiReportToUpdatePayload = (report = {}) => {
  const payload = {
    city: report.city,
    caseStatus: report.caseStatus,
    reporterFullName: report.reporterName || report.reporterFullName,
    reporterContactNumber: report.reporterContact || report.reporterContactNumber,
    reporterEmail: report.reporterEmail,
    reporterAddress: report.reporterAddress,
  };

  if (report.reportCategory === "Item" || report.category === "Item" || report.itemCategory) {
    payload.itemName = report.title || report.itemName;
    payload.itemCategory = report.itemCategory;
    payload.itemColor = report.color;
    payload.itemBrand = report.brand;
    payload.itemDescription = report.description;

    if (report.type === "Found") {
      payload.foundLocation = report.location;
      payload.foundDate = report.date;
      payload.currentLocation = report.currentLocation;
    } else {
      payload.lostLocation = report.location;
      payload.lostDate = report.date;
    }
  } else if (report.type === "Found") {
    payload.foundPersonName = report.title || report.name;
    payload.estimatedAge = report.age;
    payload.foundPersonGender = report.gender;
    payload.foundLocation = report.location;
    payload.foundDate = report.date;
    payload.currentLocation = report.currentLocation;
    payload.foundPersonDescription = report.description;
    payload.reporterRelationship = report.relation || report.reporterRelationship;
  } else {
    payload.missingPersonName = report.title || report.name;
    payload.missingPersonAge = report.age;
    payload.missingPersonGender = report.gender;
    payload.missingPersonLastSeenLocation = report.location;
    payload.missingPersonLastSeenDate = report.date;
    payload.missingPersonDescription = report.description;
    payload.reporterRelationship = report.relation || report.reporterRelationship;
  }

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      delete payload[key];
    }
  });

  return payload;
};
