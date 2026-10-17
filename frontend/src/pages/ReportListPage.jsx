import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import ReportCard, { ReportCardSkeleton } from "../components/ReportCard";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSearch, FaRedo } from "react-icons/fa";

import "./ReportList.css";
import useDebouncedValue from "../hooks/useDebouncedValue";
import useCachedRequest from "../hooks/useCachedRequest";

// Shared list page for /items and /persons. Filters live in the URL
// (?q=&type=&city=&<extra filter>=) so results survive "Back" and can be shared.
//
// config: {
//   title, description, searchLabel, searchPlaceholder, noun: ["item", "items"],
//   actions: [{ to, label, variant: "lost" | "found" }],
//   typeOptions: ["Lost", "Found"],
//   extraFilter: { key, label, allLabel, options, apiParam, fromResponse? },
//   load: (apiParams) => Promise<response>, normalize: (report) => report,
// }
export default function ReportListPage({ config }) {
  const { extraFilter, noun } = config;
  const defaults = { q: "", type: "All", city: "All", [extraFilter.key]: "All", status: "All" };

  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, searchParams.get(key) || value])
  );

  const [searchText, setSearchText] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(searchText.trim());


  const updateFilter = (key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === defaults[key]) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  };

  // Push the debounced search text into the URL.
  useEffect(() => {
    if (debouncedSearch !== filters.q) updateFilter("q", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const extraValue = filters[extraFilter.key];

  const apiParams = {
    keyword: filters.q,
    reportType: filters.type,
    city: filters.city,
    [extraFilter.apiParam]: extraValue,
    caseStatus: filters.status,
  };

  // Cached per filter combination, so "Back" shows the same list instantly
  // and the browser can restore the scroll position.
  const { data, error, isLoading, reload } = useCachedRequest(
    `${config.title}:${JSON.stringify(apiParams)}`,
    () => config.load(apiParams)
  );

  const reports = (data?.reports || []).map(config.normalize);
  const cities = (data?.filters?.cities || []).filter(Boolean);
  const extraOptions = extraFilter.fromResponse && data
    ? [...new Set([...extraFilter.fromResponse(data).filter(Boolean), ...extraFilter.options])]
    : extraFilter.options;

  const hasFilters = Object.keys(defaults).some((key) => filters[key] !== defaults[key]);

  const resetFilters = () => {
    setSearchText("");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="rlist-page">
      <Navbar />

      <div className="rlist-layout">
        <Sidebar />

        <main className="rlist-main">
          <header className="rlist-header">
            <div>
              <h1>{config.title}</h1>
              <p>{config.description}</p>
            </div>

            <div className="rlist-actions">
              {config.actions.map((action) => (
                <Link key={action.to} className={`rlist-btn rlist-btn--${action.variant}`} to={action.to}>
                  {action.label}
                </Link>
              ))}
            </div>
          </header>

          <div className="rlist-tabs" role="group" aria-label="Case type">
            {["All", ...config.typeOptions].map((type) => (
              <button
                key={type}
                type="button"
                className={`rlist-tab ${filters.type === type ? "is-active" : ""} is-${type.toLowerCase()}`}
                aria-pressed={filters.type === type}
                onClick={() => updateFilter("type", type)}
              >
                {type === "All" ? `All ${noun[1]}` : type}
              </button>
            ))}
          </div>

          <section className="rlist-filters" aria-label={`Filter ${noun[1]}`}>
            <label className="rlist-search">
              <FaSearch aria-hidden="true" />
              <span className="visually-hidden">{config.searchLabel}</span>
              <input
                type="search"
                placeholder={config.searchPlaceholder}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>


            <label>
              <span className="visually-hidden">City</span>
              <select value={filters.city} onChange={(e) => updateFilter("city", e.target.value)}>
                <option value="All">All Cities</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="visually-hidden">{extraFilter.label}</span>
              <select value={extraValue} onChange={(e) => updateFilter(extraFilter.key, e.target.value)}>
                <option value="All">{extraFilter.allLabel}</option>
                {extraOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="visually-hidden">Case status</span>
              <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
                <option value="All">All statuses</option>
                <option value="Unsolved">Unsolved</option>
                <option value="Solved">Solved</option>
              </select>
            </label>

            <button
              type="button"
              className="rlist-reset"
              onClick={resetFilters}
              disabled={!hasFilters && !searchText}
            >
              <FaRedo aria-hidden="true" />
              Reset
            </button>
          </section>

          {!isLoading && !error && (
            <p className="rlist-count" aria-live="polite">
              {reports.length === 1 ? `1 ${noun[0]} found` : `${reports.length} ${noun[1]} found`}
            </p>
          )}

          <div className="report-grid">
            {isLoading &&
              Array.from({ length: 6 }, (_, index) => <ReportCardSkeleton key={index} />)}

            {!isLoading && error && (
              <div className="report-empty" role="alert">
                <h3>Could not load {noun[1]}</h3>
                <p>{error}</p>
                <button type="button" onClick={reload}>
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !error && reports.length === 0 && (
              <div className="report-empty">
                <h3>No {noun[1]} match your search</h3>
                <p>Try another name, city or filter, or clear the filters.</p>
                {hasFilters && (
                  <button type="button" onClick={resetFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {!isLoading &&
              !error &&
              reports.map((report) => <ReportCard key={report.id} report={report} />)}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
