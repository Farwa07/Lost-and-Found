import "./Statistics.css";
import {
  FaUsers,
  FaUserCheck,
  FaHandshake,
  FaChartPie,
  FaChevronDown,
} from "react-icons/fa";

export default function Statistics() {
  const lineData = [
    { month: "Jan", missing: 12, found: 8, resolved: 6 },
    { month: "Feb", missing: 15, found: 11, resolved: 9 },
    { month: "Mar", missing: 18, found: 14, resolved: 12 },
    { month: "Apr", missing: 10, found: 7, resolved: 5 },
  ];

  const ageData = [
    { age: "0-12", value: 15 },
    { age: "13-18", value: 22 },
    { age: "19-35", value: 35 },
    { age: "36-60", value: 28 },
    { age: "60+", value: 18 },
  ];

  return (
    <div className="statistics-page">

      {/* HEADER */}
      <div className="stats-header">
        <div>
          <h1>Statistics & Analytics</h1>
          <p>Comprehensive reports and data visualization</p>
        </div>

        <div className="stats-tabs">
          <button className="active-btn">Persons Statistics</button>
          <button>Items Statistics</button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="stats-filters">
        <div className="filter-box">
          <span>All Cities</span>
          <FaChevronDown />
        </div>

        <div className="filter-box">
          <span>All Months</span>
          <FaChevronDown />
        </div>
      </div>

      {/* CARDS */}
      <div className="stats-cards">

        <div className="stats-card">
          <div className="card-icon red">
            <FaUsers />
          </div>

          <div className="growth">↗</div>

          <h2>55</h2>
          <p>Missing Persons</p>
        </div>

        <div className="stats-card">
          <div className="card-icon green">
            <FaUserCheck />
          </div>

          <div className="growth">↗</div>

          <h2>40</h2>
          <p>Found Persons</p>
        </div>

        <div className="stats-card">
          <div className="card-icon blue">
            <FaHandshake />
          </div>

          <div className="growth">↗</div>

          <h2>32</h2>
          <p>Reunited</p>
        </div>

        <div className="stats-card">
          <div className="card-icon purple">
            <FaChartPie />
          </div>

          <div className="growth">73%</div>

          <h2>73%</h2>
          <p>Success Rate</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">

        {/* LINE CHART */}
        <div className="chart-card">
          <h3>Monthly Trends</h3>

          <div className="line-chart">

            <div className="graph-lines">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <svg viewBox="0 0 400 200" className="chart-svg">

              {/* RED */}
              <polyline
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                points="20,120 120,90 220,60 320,110"
              />

              {/* GREEN */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                points="20,145 120,120 220,95 320,135"
              />

              {/* BLUE */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points="20,165 120,140 220,115 320,160"
              />

              {/* DOTS */}
              <circle cx="20" cy="120" r="4" fill="#ef4444" />
              <circle cx="120" cy="90" r="4" fill="#ef4444" />
              <circle cx="220" cy="60" r="4" fill="#ef4444" />
              <circle cx="320" cy="110" r="4" fill="#ef4444" />

              <circle cx="20" cy="145" r="4" fill="#10b981" />
              <circle cx="120" cy="120" r="4" fill="#10b981" />
              <circle cx="220" cy="95" r="4" fill="#10b981" />
              <circle cx="320" cy="135" r="4" fill="#10b981" />

              <circle cx="20" cy="165" r="4" fill="#3b82f6" />
              <circle cx="120" cy="140" r="4" fill="#3b82f6" />
              <circle cx="220" cy="115" r="4" fill="#3b82f6" />
              <circle cx="320" cy="160" r="4" fill="#3b82f6" />
            </svg>

            <div className="months">
              {lineData.map((item, index) => (
                <span key={index}>{item.month}</span>
              ))}
            </div>

            <div className="chart-labels">
              <span className="red-text">● missing</span>
              <span className="green-text">● found</span>
              <span className="blue-text">● resolved</span>
            </div>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="chart-card">
          <h3>Status Distribution</h3>

          <div className="pie-wrapper">

            <div className="pie-chart"></div>

            <div className="pie-label red-label">
              Missing 43%
            </div>

            <div className="pie-label green-label">
              Found 31%
            </div>

            <div className="pie-label blue-label">
              Resolved 25%
            </div>

          </div>
        </div>

      </div>

      {/* BAR CHART */}
      <div className="chart-card age-chart-card">
        <h3>Age Group Distribution</h3>

        <div className="bar-chart">

          {ageData.map((item, index) => (
            <div className="bar-group" key={index}>

              <div
                className="bar-column"
                style={{ height: `${item.value * 6}px` }}
              >
                <span>{item.value}</span>
              </div>

              <p>{item.age}</p>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
}