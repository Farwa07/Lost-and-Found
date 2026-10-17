import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { getFallbackReportImage } from "../utils/reportMapper";
import { formatDisplayDate, getReportPath } from "../utils/reportLinks";
import "./MatchPairCard.css";

const scoreLevel = (score) => {
  if (score >= 80) return "high";
  if (score >= 65) return "medium";
  return "low";
};

function MatchSide({ report, label, tone }) {
  const isPerson = report.reportCategory === "Person" || report.category === "Person";
  const facts = isPerson
    ? [
        report.age && report.age !== "N/A" ? `${report.age} years` : "",
        report.gender && report.gender !== "Other" ? report.gender : "",
      ]
    : [report.itemCategory, report.color, report.brand];

  return (
    <div className="mpair__side">
      <div className="mpair__media">
        <img
          src={report.image}
          alt=""
          loading="lazy"
          onError={(event) => {
            const fallback = getFallbackReportImage(isPerson ? "Person" : "Item");
            if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
          }}
        />
        <span className={`mpair__label is-${tone}`}>{label}</span>
      </div>

      <div className="mpair__info">
        <h3>
          <Link to={getReportPath(report)}>{report.title}</Link>
        </h3>

        {facts.filter(Boolean).length > 0 && (
          <p className="mpair__facts">{facts.filter(Boolean).join(" · ")}</p>
        )}

        <ul className="mpair__meta">
          {(report.location || report.city) && (
            <li>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>{[report.location, report.city].filter(Boolean).join(", ")}</span>
            </li>
          )}
          {report.date && (
            <li>
              <FaCalendarAlt aria-hidden="true" />
              <span>{formatDisplayDate(report.date)}</span>
            </li>
          )}
          {report.reporterName && (
            <li>
              <FaUser aria-hidden="true" />
              <span>{report.reporterName}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// A lost/missing report next to a found report with the similarity score.
// `reports` must be normalized with mapBackendReportToUi.
export default function MatchPairCard({ lostReport, foundReport, score, reasons = [], status, children }) {
  const lostLabel = lostReport.type === "Missing" ? "Missing" : "Lost";

  return (
    <article className="mpair">
      <header className="mpair__header">
        <div className={`mpair__score is-${scoreLevel(score)}`}>
          <strong>{score}%</strong>
          <span>similar</span>
        </div>
        {status && <div className="mpair__status">{status}</div>}
      </header>

      <div className="mpair__sides">
        <MatchSide report={lostReport} label={lostLabel} tone="lost" />
        <MatchSide report={foundReport} label="Found" tone="found" />
      </div>

      {reasons.length > 0 && (
        <ul className="mpair__reasons" aria-label="Why these reports match">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}

      {children && <div className="mpair__actions">{children}</div>}
    </article>
  );
}
