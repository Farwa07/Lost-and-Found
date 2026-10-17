import ReportListPage from "./ReportListPage";
import { getPublicPersonReports } from "../api/reportApi";
import { normalizePersonReport } from "../utils/reportMapper";

const config = {
  title: "Missing & Found Persons",
  description: "Help reunite families. Search missing and found person reports by name, city or gender.",
  searchLabel: "Search persons",
  searchPlaceholder: "Search by name, city or location...",
  noun: ["person", "persons"],
  actions: [
    { to: "/report-missing-person", label: "Report Missing Person", variant: "lost" },
    { to: "/report-found-person", label: "Report Found Person", variant: "found" },
  ],
  typeOptions: ["Missing", "Found"],
  extraFilter: {
    key: "gender",
    label: "Gender",
    allLabel: "All Genders",
    apiParam: "gender",
    options: ["Male", "Female", "Other"],
  },
  load: getPublicPersonReports,
  normalize: normalizePersonReport,
};

export default function Persons() {
  return <ReportListPage config={config} />;
}
