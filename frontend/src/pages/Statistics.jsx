import "./Statistics.css";

import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import {
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowUp,
  FaCheckCircle,
} from "react-icons/fa";

export default function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("persons");
  const [city, setCity] = useState("All Cities");
  const [month, setMonth] = useState("All Months");
  const [tooltip, setTooltip] = useState(null);
  const [showAllRows, setShowAllRows] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const cityOptions = [
    "All Cities",
    "Lahore",
    "Karachi",
    "Islamabad",
    "Gujranwala",
    "Sialkot",
    "Faisalabad",
    "Multan",
    "Rawalpindi",
    "Peshawar",
    "Quetta",
  ];

  const monthOptions = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const cities = cityOptions.filter((item) => item !== "All Cities");
  const months = monthOptions.filter((item) => item !== "All Months");

  const personsData = [];

  cities.forEach((cityName, cityIndex) => {
    months.forEach((monthName, monthIndex) => {
      personsData.push({
        city: cityName,
        month: monthName,
        missing: 10 + cityIndex * 2 + monthIndex,
        found: 7 + cityIndex + monthIndex,
        resolved: 5 + cityIndex + Math.floor(monthIndex / 2),
      });
    });
  });

  const itemsData = [];

  cities.forEach((cityName, cityIndex) => {
    months.forEach((monthName, monthIndex) => {
      itemsData.push({
        city: cityName,
        month: monthName,
        lost: 25 + cityIndex * 3 + monthIndex * 2,
        found: 18 + cityIndex * 2 + monthIndex,
        returned: 12 + cityIndex + monthIndex,
      });
    });
  });

  const currentData = activeTab === "persons" ? personsData : itemsData;

  const filteredData = currentData.filter((item) => {
    return (
      (city === "All Cities" || item.city === city) &&
      (month === "All Months" || item.month === month)
    );
  });

  const visibleTableData = showAllRows
    ? filteredData
    : filteredData.slice(0, 8);

  const totalMain = filteredData.reduce((sum, item) => {
    return sum + (activeTab === "persons" ? item.missing : item.lost);
  }, 0);

  const totalFound = filteredData.reduce((sum, item) => sum + item.found, 0);

  const totalRecovered = filteredData.reduce((sum, item) => {
    return sum + (activeTab === "persons" ? item.resolved : item.returned);
  }, 0);

  const rate =
    totalMain > 0 ? Math.round((totalRecovered / totalMain) * 100) : 0;

  const monthlyChartData = months.map((monthName) => {
    const records = currentData.filter((item) => {
      return (
        item.month === monthName &&
        (city === "All Cities" || item.city === city)
      );
    });

    return {
      month: monthName,
      main: records.reduce(
        (sum, item) =>
          sum + (activeTab === "persons" ? item.missing : item.lost),
        0
      ),
      found: records.reduce((sum, item) => sum + item.found, 0),
      recovered: records.reduce(
        (sum, item) =>
          sum + (activeTab === "persons" ? item.resolved : item.returned),
        0
      ),
    };
  });

  const citySummaryData = cities.map((cityName) => {
    const records = currentData.filter((item) => item.city === cityName);

    return {
      city: cityName,
      total: records.reduce(
        (sum, item) =>
          sum + (activeTab === "persons" ? item.missing : item.lost),
        0
      ),
    };
  });

  const maxCityTotal =
    Math.max(...citySummaryData.map((item) => item.total)) || 1;

  const maxChartValue =
    Math.max(
      ...monthlyChartData.map((item) =>
        Math.max(item.main, item.found, item.recovered)
      )
    ) || 1;

  const makePoints = (key) => {
    return monthlyChartData
      .map((item, index) => {
        const x = 55 + index * 62;
        const y = 240 - (item[key] / maxChartValue) * 190;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const ageGroups =
    activeTab === "persons"
      ? [
          { label: "0-12", count: 15 },
          { label: "13-18", count: 22 },
          { label: "19-35", count: 36 },
          { label: "36-60", count: 29 },
          { label: "60+", count: 18 },
        ]
      : [
          { label: "Electronics", count: 36 },
          { label: "Bags", count: 25 },
          { label: "Wallets", count: 30 },
          { label: "Documents", count: 18 },
          { label: "Others", count: 22 },
        ];

  const maxAge = Math.max(...ageGroups.map((item) => item.count));

  return (
    <div className="statistics">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="statistics__layout">
        <Sidebar open={sidebarOpen} />

        <main className="statistics__main">
          <section className="statistics__header">
            <div className="statistics__headerIcon">
              <FaChartBar />
            </div>

            <div>
              <h1>Statistics & Analytics</h1>
              <p>Comprehensive reports and data visualization</p>
            </div>
          </section>

          <section className="statistics__tabs">
            <button
              className={activeTab === "persons" ? "active" : ""}
              onClick={() => {
                setActiveTab("persons");
                setShowAllRows(false);
              }}
            >
              <FaUsers />
              Persons Statistics
            </button>

            <button
              className={activeTab === "items" ? "active" : ""}
              onClick={() => {
                setActiveTab("items");
                setShowAllRows(false);
              }}
            >
              <FaBoxOpen />
              Items Statistics
            </button>
          </section>

          <section className="statistics__filters">
            <div className="statistics__filterBox">
              <FaMapMarkerAlt />

              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setShowAllRows(false);
                }}
              >
                {cityOptions.map((cityName) => (
                  <option key={cityName}>{cityName}</option>
                ))}
              </select>
            </div>

            <div className="statistics__filterBox">
              <FaCalendarAlt />

              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setShowAllRows(false);
                }}
              >
                {monthOptions.map((monthName) => (
                  <option key={monthName}>{monthName}</option>
                ))}
              </select>
            </div>
          </section>

          <section className="statistics__cards">
            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon red">
                  {activeTab === "persons" ? <FaUsers /> : <FaBoxOpen />}
                </span>
                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{totalMain}</h2>
              <p>{activeTab === "persons" ? "Missing Persons" : "Lost Items"}</p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon green">
                  {activeTab === "persons" ? <FaUsers /> : <FaBoxOpen />}
                </span>
                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{totalFound}</h2>
              <p>{activeTab === "persons" ? "Found Persons" : "Found Items"}</p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon blue">
                  <FaCheckCircle />
                </span>
                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{totalRecovered}</h2>
              <p>{activeTab === "persons" ? "Reunited" : "Returned"}</p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon purple">
                  <FaChartBar />
                </span>
                <span className="statistics__rate">{rate}%</span>
              </div>

              <h2>{rate}%</h2>
              <p>{activeTab === "persons" ? "Success Rate" : "Recovery Rate"}</p>
            </div>
          </section>

          <section className="statistics__visuals">
            <div className="statistics__chartBox">
              <h3>Monthly Trends</h3>

              <div className="lineChartWrap">
                {tooltip && (
                  <div
                    className="chartTooltip"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    <b>{tooltip.month}</b>
                    <span className="redText">
                      {activeTab === "persons" ? "Missing" : "Lost"}:{" "}
                      {tooltip.main}
                    </span>
                    <span className="greenText">Found: {tooltip.found}</span>
                    <span className="blueText">
                      {activeTab === "persons" ? "Resolved" : "Returned"}:{" "}
                      {tooltip.recovered}
                    </span>
                  </div>
                )}

                <svg viewBox="0 0 800 300" className="lineChart">
                  <line x1="55" y1="240" x2="750" y2="240" />
                  <line x1="55" y1="40" x2="55" y2="240" />

                  {[0, 1, 2, 3].map((num) => (
                    <line
                      key={num}
                      x1="55"
                      x2="750"
                      y1={240 - num * 55}
                      y2={240 - num * 55}
                      className="gridLine"
                    />
                  ))}

                  <polyline points={makePoints("main")} className="line redLine" />
                  <polyline points={makePoints("found")} className="line greenLine" />
                  <polyline
                    points={makePoints("recovered")}
                    className="line blueLine"
                  />

                  {monthlyChartData.map((item, index) => {
                    const x = 55 + index * 62;

                    return (
                      <g key={item.month}>
                        {["main", "found", "recovered"].map((key) => {
                          const y = 240 - (item[key] / maxChartValue) * 190;

                          return (
                            <circle
                              key={key}
                              cx={x}
                              cy={y}
                              r="5"
                              className={`dot ${key}DotStroke`}
                              onMouseEnter={() =>
                                setTooltip({
                                  ...item,
                                  x: Math.min(x + 8, 650),
                                  y: 60,
                                })
                              }
                              onMouseLeave={() => setTooltip(null)}
                            />
                          );
                        })}

                        <text x={x} y="275" textAnchor="middle">
                          {item.month.slice(0, 3)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="statistics__legend">
                <span>
                  <b className="redDot"></b>
                  {activeTab === "persons" ? "Missing" : "Lost"}
                </span>
                <span>
                  <b className="greenDot"></b>Found
                </span>
                <span>
                  <b className="blueDot"></b>
                  {activeTab === "persons" ? "Resolved" : "Returned"}
                </span>
              </div>
            </div>

            <div className="statistics__chartBox">
              <h3>City Wise Summary</h3>

              <div className="citySummaryCompact">
                {citySummaryData.map((item) => (
                  <div className="citySummaryRow" key={item.city}>
                    <span>{item.city}</span>

                    <div className="citySummaryBar">
                      <div
                        style={{
                          width: `${(item.total / maxCityTotal) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <b>{item.total}</b>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="statistics__chartBox ageBox">
            <h3>
              {activeTab === "persons"
                ? "Age Group Distribution"
                : "Item Category Distribution"}
            </h3>

            <div className="ageChart">
              {ageGroups.map((item) => (
                <div className="ageBarItem" key={item.label}>
                  <div
                    className="ageBar"
                    style={{ height: `${(item.count / maxAge) * 190}px` }}
                  >
                    <span className="agePopup">
                      <b>{item.label}</b>
                      count : {item.count}
                    </span>
                  </div>

                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="statistics__legend">
              <span>
                <b className="purpleDot"></b>count
              </span>
            </div>
          </section>

          <section className="statistics__tableBox">
            <div className="statistics__tableHeader">
              <div>
                <h3>Detailed Statistics</h3>
                <p>
                  Showing {visibleTableData.length} of {filteredData.length} records
                </p>
              </div>

              {filteredData.length > 8 && (
                <button
                  className="statistics__showBtn"
                  onClick={() => setShowAllRows(!showAllRows)}
                >
                  {showAllRows ? "Show Less" : "Show More"}
                </button>
              )}
            </div>

            <table>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Month</th>
                  <th>{activeTab === "persons" ? "Missing" : "Lost"}</th>
                  <th>Found</th>
                  <th>{activeTab === "persons" ? "Resolved" : "Returned"}</th>
                  <th>Rate</th>
                </tr>
              </thead>

              <tbody>
                {visibleTableData.map((item, index) => {
                  const firstValue =
                    activeTab === "persons" ? item.missing : item.lost;

                  const lastValue =
                    activeTab === "persons" ? item.resolved : item.returned;

                  const rowRate =
                    firstValue > 0
                      ? Math.round((lastValue / firstValue) * 100)
                      : 0;

                  return (
                    <tr key={index}>
                      <td>{item.city}</td>
                      <td>{item.month}</td>
                      <td>{firstValue}</td>
                      <td>{item.found}</td>
                      <td>{lastValue}</td>
                      <td>{rowRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}