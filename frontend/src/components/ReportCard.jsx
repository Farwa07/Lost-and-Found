import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaShareAlt,
  FaUser,
  FaArrowRight,
} from "react-icons/fa";
import { getFallbackReportImage } from "../utils/reportMapper";
import { formatDisplayDate, getReportPath, shareReport } from "../utils/reportLinks";
import "./ReportCard.css";

const handleImageError = (event, category) => {
  const fallback = getFallbackReportImage(category);
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback;
  }
};

const getTypeClass = (type = "") => {
  const value = type.toLowerCase();
  if (value === "found") return "is-found";
  if (value === "missing") return "is-missing";
  return "is-lost";
};

// Card used on Home, Items and Persons. Expects a report normalized with
// normalizePublicReport / normalizeItemReport / normalizePersonReport.
export default function ReportCard({ report, headingLevel = 3 }) {
  const isItem = report.reportCategory === "Item";
  const path = getReportPath(report);
  const Heading = `h${headingLevel}`;
  const location = isItem
    ? report.location
    : report.type === "Found"
      ? report.foundLocation || report.location
      : report.lastSeenLocation || report.location;
  // Add the city only when the location text does not already mention it.
  const city = report.city !== "Unknown" ? report.city : "";
  const place =
    city && !String(location || "").toLowerCase().includes(city.toLowerCase())
      ? [location, city].filter(Boolean).join(", ")
      : location || city;
  const subtitle = isItem
    ? report.itemCategory || "Item"
    : [report.age && report.age !== "N/A" ? `${report.age} years` : "", report.gender]
        .filter(Boolean)
        .join(" · ") || "Person";

  return (
    <article className="rcard">
      <Link to={path} className="rcard__media" tabIndex={-1} aria-hidden="true">
        <img
          src={report.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => handleImageError(event, report.reportCategory)}
        />
        <span className={`rcard__badge ${getTypeClass(report.type)}`}>{report.type}</span>
        {report.caseStatus === "Solved" && (
          <span className="rcard__badge rcard__badge--solved">Solved</span>
        )}
      </Link>

      <div className="rcard__body">
        <p className="rcard__kind">
          {!isItem && <FaUser aria-hidden="true" />}
          {subtitle}
        </p>

        <Heading className="rcard__title">
          <Link to={path}>{report.title}</Link>
        </Heading>

        <ul className="rcard__meta">
          {place && (
            <li>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>{place}</span>
            </li>
          )}
          {report.date && (
            <li>
              <FaCalendarAlt aria-hidden="true" />
              <span>{formatDisplayDate(report.date)}</span>
            </li>
          )}
        </ul>

        <div className="rcard__actions">
          <Link to={path} className="rcard__details">
            View Details
            <FaArrowRight aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="rcard__share"
            onClick={() => shareReport(report)}
            aria-label={`Share ${report.title}`}
            title="Share"
          >
            <FaShareAlt aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ReportCardSkeleton() {
  return (
    <div className="rcard rcard--skeleton" aria-hidden="true">
      <div className="rcard__media" />
      <div className="rcard__body">
        <span className="rcard__line rcard__line--short" />
        <span className="rcard__line rcard__line--title" />
        <span className="rcard__line" />
        <span className="rcard__line rcard__line--short" />
      </div>
    </div>
  );
}
