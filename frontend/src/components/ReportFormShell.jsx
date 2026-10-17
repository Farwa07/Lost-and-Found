import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./ReportFormShell.css";
import BackButton from "./BackButton";

// Navbar + sidebar frame around the report forms, with a link back to the list.
export default function ReportFormShell({ backTo, backLabel, children }) {
  return (
    <div className="form-shell">
      <Navbar />
      <div className="form-shell__body">
        <Sidebar />
        <div className="form-shell__content">
          {backTo && (
            <BackButton fallback={backTo} label={backLabel} className="form-shell__back" />
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
