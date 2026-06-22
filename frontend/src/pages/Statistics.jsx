import "./Statistics.css";

import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getStatistics } from "../api/statsApi";

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

const fallbackMonthOptions = [
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

const emptyStatistics = {
  cityOptions: ["All Cities"],
  monthOptions: fallbackMonthOptions,
  summary: {
    main: 0,
    found: 0,
    resolved: 0,
    total: 0,
    successRate: 0,
  },
  monthlyTrend: fallbackMonthOptions
    .filter((month) => month !== "All Months")
    .map((month) => ({
      month: month.slice(0, 3),
      fullMonth: month,
      main: 0,
      found: 0,
      resolved: 0,
    })),
  cityWiseCases: [],
  detailedStats: [],
};

export default function Statistics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("persons");
  const [city, setCity] = useState("All Cities");
  const [month, setMonth] = useState("All Months");
  const [statisticsData, setStatisticsData] = useState(emptyStatistics);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAllRows, setShowAllRows] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await getStatistics({
          type: activeTab,
          city,
          month,
        });

        if (!isMounted) {
          return;
        }

        setStatisticsData({
          ...emptyStatistics,
          ...data,
          summary: {
            ...emptyStatistics.summary,
            ...(data?.summary || {}),
          },
          cityOptions:
            Array.isArray(data?.cityOptions) && data.cityOptions.length > 0
              ? data.cityOptions
              : ["All Cities"],
          monthOptions:
            Array.isArray(data?.monthOptions) && data.monthOptions.length > 0
              ? data.monthOptions
              : fallbackMonthOptions,
          monthlyTrend: Array.isArray(data?.monthlyTrend)
            ? data.monthlyTrend
            : emptyStatistics.monthlyTrend,
          cityWiseCases: Array.isArray(data?.cityWiseCases)
            ? data.cityWiseCases
            : [],
          detailedStats: Array.isArray(data?.detailedStats)
            ? data.detailedStats
            : [],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error.message || "Statistics could not be loaded from backend."
        );
        setStatisticsData(emptyStatistics);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [activeTab, city, month]);

  const mainLabel = activeTab === "persons" ? "Missing" : "Lost";
  const foundLabel = "Found";
  const resolvedLabel = "Resolved";

  const totalMain = statisticsData.summary.main || 0;
  const totalFound = statisticsData.summary.found || 0;
  const totalResolved = statisticsData.summary.resolved || 0;
  const totalCases = statisticsData.summary.total || 0;
  const successRate = Number.isFinite(statisticsData.summary.successRate)
    ? statisticsData.summary.successRate
    : getSuccessRate(totalResolved, totalCases);

  const cityOptions = statisticsData.cityOptions || ["All Cities"];
  const monthOptions = statisticsData.monthOptions || fallbackMonthOptions;
  const monthlyTrendData = statisticsData.monthlyTrend || [];
  const cityWiseCases = statisticsData.cityWiseCases || [];
  const detailedStats = statisticsData.detailedStats || [];

  const yAxisMax = getYAxisMax(
    monthlyTrendData.flatMap((item) => [
      item.main || 0,
      item.found || 0,
      item.resolved || 0,
    ])
  );

  const lineChartData = {
    labels: monthlyTrendData.map((item) => item.month),
    datasets: [
      {
        label: mainLabel,
        data: monthlyTrendData.map((item) => item.main || 0),
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
        data: monthlyTrendData.map((item) => item.found || 0),
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
        data: monthlyTrendData.map((item) => item.resolved || 0),
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
            return monthlyTrendData[index]?.fullMonth || monthlyTrendData[index]?.month || "";
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
      },
    },
  };

  const hasPieData = [totalMain, totalFound, totalResolved].some(
    (value) => value > 0
  );

  const maxCityValue = useMemo(() => {
    return Math.max(...cityWiseCases.map((item) => item.total || 0), 1);
  }, [cityWiseCases]);

  const visibleRows = showAllRows ? detailedStats : detailedStats.slice(0, 8);

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

          {errorMessage && (
            <div className="statistics__empty">{errorMessage}</div>
          )}

          {isLoading && (
            <div className="statistics__empty">Loading statistics...</div>
          )}

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
                          width: `${((item.total || 0) / maxCityValue) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <strong>{item.total}</strong>
                  </div>
                ))
              ) : (
                <div className="statistics__empty">No city data available.</div>
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
                        <td>{row.successRate ?? getSuccessRate(row.resolved, row.total)}%</td>
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
