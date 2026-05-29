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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("persons");
  const [city, setCity] = useState("All Cities");
  const [month, setMonth] = useState("All Months");
  const [tooltip, setTooltip] = useState(null);

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

  const chartData =
    city === "All Cities"
      ? months.map((monthName) => {
          const records = currentData.filter((item) => item.month === monthName);

          return {
            month: monthName,
            missing: records.reduce(
              (sum, item) => sum + (activeTab === "persons" ? item.missing : item.lost),
              0
            ),
            found: records.reduce((sum, item) => sum + item.found, 0),
            resolved: records.reduce(
              (sum, item) => sum + (activeTab === "persons" ? item.resolved : item.returned),
              0
            ),
          };
        })
      : filteredData.map((item) => ({
          month: item.month,
          missing: activeTab === "persons" ? item.missing : item.lost,
          found: item.found,
          resolved: activeTab === "persons" ? item.resolved : item.returned,
        }));

  const totalMain = filteredData.reduce((sum, item) => {
    return sum + (activeTab === "persons" ? item.missing : item.lost);
  }, 0);

  const totalFound = filteredData.reduce((sum, item) => sum + item.found, 0);

  const totalRecovered = filteredData.reduce((sum, item) => {
    return sum + (activeTab === "persons" ? item.resolved : item.returned);
  }, 0);

  const rate = totalMain > 0 ? Math.round((totalRecovered / totalMain) * 100) : 0;

  const maxValue = Math.max(
    ...chartData.map((item) => Math.max(item.missing, item.found, item.resolved)),
    1
  );

  const getPoint = (value, index) => {
    const x = 60 + index * (720 / (chartData.length - 1 || 1));
    const y = 250 - (value / maxValue) * 210;
    return `${x},${y}`;
  };

  const missingPoints = chartData.map((item, index) => getPoint(item.missing, index)).join(" ");
  const foundPoints = chartData.map((item, index) => getPoint(item.found, index)).join(" ");
  const resolvedPoints = chartData.map((item, index) => getPoint(item.resolved, index)).join(" ");

  const ageGroups = [
    { label: "0-12", count: 15 },
    { label: "13-18", count: 22 },
    { label: "19-35", count: 36 },
    { label: "36-60", count: 29 },
    { label: "60+", count: 18 },
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
              onClick={() => setActiveTab("persons")}
            >
              <FaUsers />
              Persons Statistics
            </button>

            <button
              className={activeTab === "items" ? "active" : ""}
              onClick={() => setActiveTab("items")}
            >
              <FaBoxOpen />
              Items Statistics
            </button>
          </section>

          <section className="statistics__filters">
            <div className="statistics__filterBox">
              <FaMapMarkerAlt />
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {cityOptions.map((cityName) => (
                  <option key={cityName}>{cityName}</option>
                ))}
              </select>
            </div>

            <div className="statistics__filterBox">
              <FaCalendarAlt />
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
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
                    style={{
                      left: tooltip.x,
                      top: tooltip.y,
                    }}
                  >
                    <b>{tooltip.month}</b>
                    <span className="redText">
                      {activeTab === "persons" ? "missing" : "lost"} : {tooltip.missing}
                    </span>
                    <span className="greenText">found : {tooltip.found}</span>
                    <span className="blueText">
                      {activeTab === "persons" ? "resolved" : "returned"} : {tooltip.resolved}
                    </span>
                  </div>
                )}

                <svg viewBox="0 0 850 320" className="lineChart">
                  <line x1="60" y1="250" x2="800" y2="250" />
                  <line x1="60" y1="40" x2="60" y2="250" />

                  {[0, 1, 2, 3, 4].map((num) => (
                    <line
                      key={num}
                      x1="60"
                      x2="800"
                      y1={250 - num * 52}
                      y2={250 - num * 52}
                      className="gridLine"
                    />
                  ))}

                  <polyline points={missingPoints} className="line redLine" />
                  <polyline points={foundPoints} className="line greenLine" />
                  <polyline points={resolvedPoints} className="line blueLine" />

                  {chartData.map((item, index) => {
                    const x = 60 + index * (720 / (chartData.length - 1 || 1));

                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={250 - (item.missing / maxValue) * 210}
                          r="5"
                          className="dot redDotStroke"
                          onMouseEnter={() =>
                            setTooltip({
                              ...item,
                              x: x + 10,
                              y: 80,
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />

                        <circle
                          cx={x}
                          cy={250 - (item.found / maxValue) * 210}
                          r="5"
                          className="dot greenDotStroke"
                          onMouseEnter={() =>
                            setTooltip({
                              ...item,
                              x: x + 10,
                              y: 80,
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />

                        <circle
                          cx={x}
                          cy={250 - (item.resolved / maxValue) * 210}
                          r="5"
                          className="dot blueDotStroke"
                          onMouseEnter={() =>
                            setTooltip({
                              ...item,
                              x: x + 10,
                              y: 80,
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />

                        <text x={x} y="285" textAnchor="middle">
                          {item.month.slice(0, 3)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="statistics__legend">
                <span><b className="redDot"></b>{activeTab === "persons" ? "Missing" : "Lost"}</span>
                <span><b className="greenDot"></b>Found</span>
                <span><b className="blueDot"></b>{activeTab === "persons" ? "Resolved" : "Returned"}</span>
              </div>
            </div>

            <div className="statistics__chartBox">
              <h3>Status Distribution</h3>

              <div className="pieChart">
                <div className="pieCircle"></div>

                <span className="pieLabel redPie">
                  {activeTab === "persons" ? "Missing" : "Lost"} 43%
                </span>

                <span className="pieLabel greenPie">Found 31%</span>

                <span className="pieLabel bluePie">
                  {activeTab === "persons" ? "Resolved" : "Returned"} 25%
                </span>
              </div>
            </div>
          </section>

          <section className="statistics__chartBox ageBox">
            <h3>{activeTab === "persons" ? "Age Group Distribution" : "Item Category Distribution"}</h3>

            <div className="ageChart">
              {ageGroups.map((item, index) => (
                <div
                  className="ageBarItem"
                  key={index}
                  onMouseEnter={(e) =>
                    setTooltip({
                      month: item.label,
                      missing: item.count,
                      found: "",
                      resolved: "",
                      x: e.clientX - 100,
                      y: e.clientY - 150,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div
                    className="ageBar"
                    style={{
                      height: `${(item.count / maxAge) * 210}px`,
                    }}
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
              <span><b className="purpleDot"></b>count</span>
            </div>
          </section>

          <section className="statistics__tableBox">
            <h3>Detailed Statistics</h3>

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
                {filteredData.map((item, index) => {
                  const firstValue = activeTab === "persons" ? item.missing : item.lost;
                  const lastValue = activeTab === "persons" ? item.resolved : item.returned;
                  const rowRate = firstValue > 0 ? Math.round((lastValue / firstValue) * 100) : 0;

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