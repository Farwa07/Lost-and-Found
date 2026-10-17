import ReportListPage from "./ReportListPage";
import { getPublicItemReports } from "../api/reportApi";
import { normalizeItemReport } from "../utils/reportMapper";

const ITEM_CATEGORIES = ["Mobile", "Wallet", "Bag", "Laptop", "Keys", "Watch", "Documents", "Jewelry", "Other"];

const config = {
  title: "Lost & Found Items",
  description: "Search phones, wallets, bags, documents and other items reported across Pakistan.",
  searchLabel: "Search items",
  searchPlaceholder: "Search by item name, brand, city...",
  noun: ["item", "items"],
  actions: [
    { to: "/report-lost-item", label: "Report Lost Item", variant: "lost" },
    { to: "/report-found-item", label: "Report Found Item", variant: "found" },
  ],
  typeOptions: ["Lost", "Found"],
  extraFilter: {
    key: "category",
    label: "Category",
    allLabel: "All Categories",
    apiParam: "itemCategory",
    options: ITEM_CATEGORIES,
    fromResponse: (response) => response?.filters?.categories || [],
  },
  load: getPublicItemReports,
  normalize: normalizeItemReport,
};

export default function Items() {
  return <ReportListPage config={config} />;
}
