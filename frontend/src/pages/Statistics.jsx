import "./Statistics.css";

import { useEffect, useMemo, useState } from "react";

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

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const REPORTS_KEY = "lostFoundReports";

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

const allMonths = monthOptions.filter((month) => month !== "All Months");

const monthShortNames = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
};

const safeParse = (value, fallback = []) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getMonthName = (dateValue) => {
  if (!dateValue) {
    return "Unknown";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", {
    month: "long",
  });
};

const normalizeReport = (report) => {
  const type = report.type || report.status || "Missing";

  return {
    ...report,
    id: report.id,
    type,
    status: type,
    category: report.category || "Person",
    title: report.title || report.name || report.itemName || "Untitled Report",
    city: report.city || "Unknown",
    date: report.date || report.lostDate || report.foundDate || "",
    month: getMonthName(report.date || report.lostDate || report.foundDate),
    age: report.age || "",
    itemCategory: report.itemCategory || report.category || "Other",
    adminStatus: report.adminStatus || "Pending Review",
    caseStatus: report.caseStatus || "Unsolved",
  };
};

const readReports = () => {
  const savedReports = safeParse(localStorage.getItem(REPORTS_KEY), []);

  return Array.isArray(savedReports)
    ? savedReports.map(normalizeReport)
    : [];
};

const isResolvedReport = (report) => {
  return (
    report.caseStatus === "Solved" ||
    report.caseStatus === "Closed" ||
    report.adminStatus === "Matched" ||
    report.adminStatus === "Resolved" ||
    report.matchId
  );
};

const getSuccessRate = (resolved, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((resolved / total) * 100);
};

const getYAxisMax = (values) => {
  const maxValue = Math.max(...values, 0);

  return Math.max(30, Math.ceil(maxValue / 5) * 5);
};

export default function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("persons");
  const [city, setCity] = useState("All Cities");
  const [month, setMonth] = useState("All Months");
  const [reports, setReports] = useState([]);
  const [showAllRows, setShowAllRows] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const syncReports = () => {
      setReports(readReports());
    };

    syncReports();

    window.addEventListener("storage", syncReports);
    window.addEventListener("lostFoundReportsUpdated", syncReports);

    return () => {
      window.removeEventListener("storage", syncReports);
      window.removeEventListener("lostFoundReportsUpdated", syncReports);
    };
  }, []);

  const currentReports = useMemo(() => {
    return reports
      .filter((report) =>
        activeTab === "persons"
          ? report.category === "Person"
          : report.category === "Item"
      )
      .filter((report) => report.adminStatus !== "Rejected");
  }, [reports, activeTab]);

  const cityOptions = useMemo(() => {
    const dynamicCities = [
      ...new Set(currentReports.map((report) => report.city).filter(Boolean)),
    ].sort();

    return ["All Cities", ...dynamicCities];
  }, [currentReports]);

  const filteredReports = useMemo(() => {
    return currentReports.filter((report) => {
      const cityMatch = city === "All Cities" || report.city === city;
      const monthMatch = month === "All Months" || report.month === month;

      return cityMatch && monthMatch;
    });
  }, [currentReports, city, month]);

  const mainType = activeTab === "persons" ? "Missing" : "Lost";
  const mainLabel = activeTab === "persons" ? "Missing" : "Lost";
  const foundLabel = "Found";
  const resolvedLabel = "Resolved";

  const totalMain = filteredReports.filter(
    (report) => report.type === mainType
  ).length;

  const totalFound = filteredReports.filter(
    (report) => report.type === "Found"
  ).length;

  const totalResolved = filteredReports.filter(isResolvedReport).length;
  const totalCases = filteredReports.length;
  const successRate = getSuccessRate(totalResolved, totalCases);

  const chartMonths = month === "All Months" ? allMonths : [month];

  const monthlyTrendData = useMemo(() => {
    return chartMonths.map((monthName) => {
      const records = currentReports.filter((report) => {
        const cityMatch = city === "All Cities" || report.city === city;

        return report.month === monthName && cityMatch;
      });

      return {
        month: monthShortNames[monthName] || monthName,
        fullMonth: monthName,
        main: records.filter((report) => report.type === mainType).length,
        found: records.filter((report) => report.type === "Found").length,
        resolved: records.filter(isResolvedReport).length,
      };
    });
  }, [chartMonths, currentReports, city, mainType]);

  const yAxisMax = getYAxisMax(
    monthlyTrendData.flatMap((item) => [
      item.main,
      item.found,
      item.resolved,
    ])
  );

  const lineChartData = {
    labels: monthlyTrendData.map((item) => item.month),
    datasets: [
      {
        label: mainLabel,
        data: monthlyTrendData.map((item) => item.main),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#ef4444",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.35,
      },
      {
        label: foundLabel,
        data: monthlyTrendData.map((item) => item.found),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#10b981",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.35,
      },
      {
        label: resolvedLabel,
        data: monthlyTrendData.map((item) => item.resolved),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.35,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 18,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#d1d5db",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0]?.dataIndex || 0;
            return monthlyTrendData[index]?.month || "";
          },
          label: (context) => {
            return `${context.dataset.label.toLowerCase()} : ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "#e5e7eb",
          borderDash: [4, 4],
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      y: {
  beginAtZero: true,
  max: yAxisMax,
  ticks: {
    stepSize: 5,
    precision: 0,
    color: "#64748b",
    font: {
      size: 13,
      weight: "600",
    },
  },
  grid: {
    color: "#d1d5db",
    borderDash: [4, 4],
  },
},
    },
  };

  const pieChartData = {
    labels: [mainLabel, foundLabel, resolvedLabel],
    datasets: [
      {
        data: [totalMain, totalFound, totalResolved],
        backgroundColor: ["#ef4444", "#10b981", "#3b82f6"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          padding: 18,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "#ffffff",
        titleColor: "#111827",
        bodyColor: "#111827",
        borderColor: "#d1d5db",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce(
              (sum, value) => sum + value,
              0
            );

            const value = context.parsed || 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;

            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const hasPieData = totalMain + totalFound + totalResolved > 0;

  const cityWiseCases = useMemo(() => {
    const grouped = {};

    currentReports.forEach((report) => {
      const cityMatch = city === "All Cities" || report.city === city;
      const monthMatch = month === "All Months" || report.month === month;

      if (!cityMatch || !monthMatch) {
        return;
      }

      if (!grouped[report.city]) {
        grouped[report.city] = 0;
      }

      grouped[report.city] += 1;
    });

    return Object.entries(grouped)
      .map(([cityName, total]) => ({
        city: cityName,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [currentReports, city, month]);

  const maxCityValue = Math.max(
    ...cityWiseCases.map((item) => item.total),
    1
  );

  const detailedStats = useMemo(() => {
    const grouped = {};

    filteredReports.forEach((report) => {
      const key = `${report.city}-${report.month}`;

      if (!grouped[key]) {
        grouped[key] = {
          city: report.city,
          month: report.month,
          main: 0,
          found: 0,
          resolved: 0,
          total: 0,
        };
      }

      if (report.type === mainType) {
        grouped[key].main += 1;
      }

      if (report.type === "Found") {
        grouped[key].found += 1;
      }

      if (isResolvedReport(report)) {
        grouped[key].resolved += 1;
      }

      grouped[key].total += 1;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.city === b.city) {
        return allMonths.indexOf(a.month) - allMonths.indexOf(b.month);
      }

      return a.city.localeCompare(b.city);
    });
  }, [filteredReports, mainType]);

  const visibleRows = showAllRows
    ? detailedStats
    : detailedStats.slice(0, 8);

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
              <p>Real-time analytics based on submitted reports</p>
            </div>
          </section>

          <section className="statistics__tabs">
            <button
              className={activeTab === "persons" ? "active" : ""}
              onClick={() => {
                setActiveTab("persons");
                setCity("All Cities");
                setMonth("All Months");
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
                setCity("All Cities");
                setMonth("All Months");
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
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
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
                  <option key={monthName} value={monthName}>
                    {monthName}
                  </option>
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

              <p>
                {activeTab === "persons" ? "Missing Persons" : "Lost Items"}
              </p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon green">
                  {activeTab === "persons" ? <FaUsers /> : <FaBoxOpen />}
                </span>

                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{totalFound}</h2>

              <p>
                {activeTab === "persons" ? "Found Persons" : "Found Items"}
              </p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon blue">
                  <FaCheckCircle />
                </span>

                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{totalResolved}</h2>

              <p>
                {activeTab === "persons"
                  ? "Resolved Persons"
                  : "Resolved Items"}
              </p>
            </div>

            <div className="statistics__card">
              <div className="statistics__cardTop">
                <span className="statistics__cardIcon purple">
                  <FaChartBar />
                </span>

                <FaArrowUp className="statistics__up" />
              </div>

              <h2>{successRate}%</h2>

              <p>Success Rate</p>
            </div>
          </section>

          <section className="statistics__graphs">
            <div className="statistics__graphCard">
              <div className="statistics__graphHeader">
                <h2>Monthly Trends</h2>

                <p>
                  {activeTab === "persons"
                    ? "Missing, found and resolved persons"
                    : "Lost, found and resolved items"}
                </p>
              </div>

              <div className="statistics__chartBox">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>

            <div className="statistics__graphCard">
              <div className="statistics__graphHeader">
                <h2>Status Distribution</h2>

                <p>
                  {activeTab === "persons"
                    ? "Missing, found and resolved persons"
                    : "Lost, found and resolved items"}
                </p>
              </div>

              <div className="statistics__pieBox">
                {hasPieData ? (
                  <Pie data={pieChartData} options={pieChartOptions} />
                ) : (
                  <div className="statistics__empty">
                    No status distribution data available.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="statistics__citySection">
            <div className="statistics__sectionHeader">
              <div>
                <h2>City Wise Cases</h2>

                <p>Total cases by city according to selected report type</p>
              </div>
            </div>

            <div className="statistics__cityList">
              {cityWiseCases.length > 0 ? (
                cityWiseCases.map((item) => (
                  <div className="statistics__cityRow" key={item.city}>
                    <span>{item.city}</span>

                    <div className="statistics__cityBar">
                      <div
                        style={{
                          width: `${(item.total / maxCityValue) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <strong>{item.total}</strong>
                  </div>
                ))
              ) : (
                <div className="statistics__empty">
                  No city data available.
                </div>
              )}
            </div>
          </section>

          <section className="statistics__tableSection">
            <div className="statistics__sectionHeader statistics__tableHeader">
              <div>
                <h2>Detailed Statistics</h2>

                <p>City and month wise report summary</p>
              </div>

              {detailedStats.length > 8 && (
                <button
                  type="button"
                  className="statistics__showBtn"
                  onClick={() => setShowAllRows((prev) => !prev)}
                >
                  {showAllRows ? "Show Less" : "Show More"}
                </button>
              )}
            </div>

            {visibleRows.length > 0 ? (
              <div className="statistics__tableWrap">
                <table className="statistics__table">
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Month</th>
                      <th>{mainLabel}</th>
                      <th>Found</th>
                      <th>Resolved</th>
                      <th>Total</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={`${row.city}-${row.month}`}>
                        <td>{row.city}</td>
                        <td>{row.month}</td>
                        <td>{row.main}</td>
                        <td>{row.found}</td>
                        <td>{row.resolved}</td>
                        <td>{row.total}</td>
                        <td>{getSuccessRate(row.resolved, row.total)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="statistics__empty">
                No statistics found for selected filters.
              </div>
            )}
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}