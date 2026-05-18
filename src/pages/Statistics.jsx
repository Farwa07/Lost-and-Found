import "./Statistics.css";
import {
  FaUsers,
  FaBoxOpen,
  FaCheckCircle,
  FaChartLine,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

export default function Statistics() {
  const monthlyData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 70 },
    { month: "Mar", value: 55 },
    { month: "Apr", value: 95 },
    { month: "May", value: 80 },
    { month: "Jun", value: 110 },
  ];

  const recentStats = [
    {
      title: "Missing Persons",
      value: "1,245",
      icon: <FaUsers />,
    },
    {
      title: "Found Items",
      value: "932",
      icon: <FaBoxOpen />,
    },
    {
      title: "Recovered Cases",
      value: "786",
      icon: <FaCheckCircle />,
    },
    {
      title: "Active Reports",
      value: "328",
      icon: <FaChartLine />,
    },
  ];

  const cityStats = [
    { city: "Lahore", reports: 320 },
    { city: "Karachi", reports: 280 },
    { city: "Islamabad", reports: 180 },
    { city: "Faisalabad", reports: 150 },
  ];

  return (
    <div className="statistics-page">
      {/* HERO */}
      <section className="stats-hero">
        <div className="stats-hero-content">
          <span className="stats-badge">Statistics & Analysis</span>

          <h1>
            Lost & Found <span>Insights</span>
          </h1>

          <p>
            Explore system analytics, recovery trends, monthly activity and
            statistics related to missing persons and lost items.
          </p>
        </div>
      </section>

      {/* CARDS */}
      <section className="stats-cards">
        {recentStats.map((item, index) => (
          <div className="stats-card" key={index}>
            <div className="stats-icon">{item.icon}</div>

            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ANALYTICS */}
      <section className="analytics-section">
        {/* CHART */}
        <div className="chart-card">
          <div className="section-heading">
            <h2>Monthly Report Analysis</h2>
            <p>Reports submitted during recent months</p>
          </div>

          <div className="chart-wrapper">
            {monthlyData.map((item, index) => (
              <div className="bar-item" key={index}>
                <div
                  className="bar"
                  style={{ height: `${item.value * 2}px` }}
                ></div>

                <span>{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIDE STATS */}
        <div className="quick-stats">
          <div className="quick-card">
            <div className="quick-icon">
              <FaMapMarkerAlt />
            </div>

            <div>
              <h3>Top Reporting City</h3>
              <p>Lahore</p>
            </div>
          </div>

          <div className="quick-card">
            <div className="quick-icon">
              <FaClock />
            </div>

            <div>
              <h3>Average Recovery Time</h3>
              <p>4 Days</p>
            </div>
          </div>
        </div>
      </section>

      {/* CITY TABLE */}
      <section className="city-section">
        <div className="section-heading">
          <h2>City Wise Reports</h2>
          <p>Overview of reports submitted from different cities</p>
        </div>

        <div className="city-table">
          {cityStats.map((item, index) => (
            <div className="table-row" key={index}>
              <div className="city-name">{item.city}</div>

              <div className="progress-area">
                <div
                  className="progress-fill"
                  style={{ width: `${item.reports / 4}%` }}
                ></div>
              </div>

              <div className="report-count">{item.reports}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="stats-footer">
        <h2>Helping Communities Recover Faster</h2>

        <p>
          Our platform provides organized reporting and statistical insights to
          reconnect people with lost persons and belongings.
        </p>

        <button>Explore Reports</button>
      </section>
    </div>
  );
}