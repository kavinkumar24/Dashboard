import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
function New_Design() {
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [orderData, setOrderData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [active, setActive] = useState(null);
  const itemsPerPage = 10;
  const [allCharts, setAllCharts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeIndex1, setActiveIndex1] = useState(null);
  const totalPages = Math.ceil(orderData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = orderData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    console.log(orderData);
  };
  const toggleAccordion1 = (index) => {
    setActiveIndex1(activeIndex1 === index ? null : index);
  };
  const handleFilter = () => {
    setIsLoading(true);
    setfilter(!filter);
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [purityChartData, setPurityChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [typeChartData, setTypeChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [zoneChartData, setZoneChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [colorChartData, setColorChartData] = useState({
    labels: [],
    datasets: [],
  });

  const [projectData, setProjectData] = useState({
    labels: [],
    datasets: [],
  });
  const [product, setProduct] = useState({
    labels: [],
    datasets: [],
  });


  const [totalWeight, setTotalWeight] = useState(0);
  const [yearlyData, setYearlyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});

  const [filter, setfilter] = useState(false);

  const convertWtToKg = (wt) => wt / 1000;
  const getYearlyData = (data) => {
    const yearlyData = data.reduce((acc, item) => {
      if (item["DD&month"]) {
        const year = new Date(item["DD&month"]).getFullYear();
        const wtKg = convertWtToKg(item.WT || 0);

        if (!acc[year]) {
          acc[year] = 0;
        }
        acc[year] += wtKg;
      }
      return acc;
    }, {});

    return Object.entries(yearlyData)
      .filter(([year, kg]) => kg > 0)
      .map(([year, kg]) => ({
        year,
        kg,
      }));
  };

  const monthNames = [
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

  const getMonthName = (monthIndex) => monthNames[monthIndex];

  const calculateTotalWeight = (data) => {
    const orderWeightMap = new Map();
    data.forEach((order) => {
      if (orderWeightMap.has(order.ORDERNO)) {
        const existingOrder = orderWeightMap.get(order.ORDERNO);
        if (order.WT > existingOrder.WT) {
          orderWeightMap.set(order.ORDERNO, order);
        }
      } else {
        orderWeightMap.set(order.ORDERNO, order);
      }
    });

    return Array.from(orderWeightMap.values());
  };

  const getPurityData = (data) => {
    const purityData = data.reduce((acc, item) => {
      const purity = item.Purity || "Unknown";
      const wtKg = convertWtToKg(item.WT || 0);

      if (!acc[purity]) {
        acc[purity] = 0;
      }
      acc[purity] += wtKg;

      return acc;
    }, {});

    const colors = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)",
      "rgba(199, 199, 199, 0.2)",
      "rgba(255, 99, 132, 0.3)",
      "rgba(54, 162, 235, 0.3)",
      "rgba(255, 206, 86, 0.3)",
    ];

    return Object.entries(purityData)
      .filter(([purity, kg]) => kg > 0)
      .map(([purity, kg], index) => ({
        purity,
        kg,
        color: colors[index % colors.length],
      }));
  };

  const getTypeData = (data) => {
    const typeData = data.reduce((acc, item) => {
      const type = item.TYPE || "Unknown";
      const wtKg = convertWtToKg(item.WT || 0);

      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += wtKg;

      return acc;
    }, {});

    return Object.entries(typeData)
      .filter(([type, kg]) => kg > 0)
      .map(([type, kg]) => ({
        type,
        kg,
      }));
  };

  const getZoneData = (data) => {
    const zoneData = data.reduce((acc, item) => {
      const zone = item.ZONE || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[zone]) {
        acc[zone] = 0;
      }
      acc[zone] += wtGrams;

      return acc;
    }, {});

    return Object.entries(zoneData)
      .filter(([zone, grams]) => grams > 0)
      .map(([zone, grams]) => ({
        zone,
        kg: grams / 1000,
      }));
  };

  const getProduct = (data) => {
    const product_data = data.reduce((acc, item) => {
      const product = item.PRODUCT || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[product]) {
        acc[product] = 0;
      }
      acc[product] += wtGrams;

      return acc;
    }, {});

    return Object.entries(product_data)
      .filter(([product, grams]) => grams > 0)
      .map(([product, grams]) => ({
        product,
        kg: grams / 1000,
      }));
  };


  
  useEffect(() => {
    fetch("http://localhost:8081/order_receive&new_design")
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
        setIsLoading(false);

        const allYears = new Set();
        const allMonths = new Set();
        const allDates = new Set();

        data.forEach((item) => {
          if (item["DD&month"]) {
            const date = new Date(item["DD&month"]);
            allYears.add(date.getFullYear());
            allMonths.add(date.getMonth() + 1);
            allDates.add(date.getDate());
          }
        });

        setYears(Array.from(allYears).sort((a, b) => b - a));
        setMonths(Array.from(allMonths).sort((a, b) => a - b));
        setDates(Array.from(allDates).sort((a, b) => a - b));

        const filteredData = data.filter((item) => {
          const itemDate = new Date(item["DD&month"]);

          const itemYear = itemDate.getFullYear();
          const itemMonth = itemDate.getMonth() + 1;
          const itemDateOnly = itemDate.getDate();

          return (
            (!selectedYear || itemYear === parseInt(selectedYear)) &&
            (!selectedMonth || itemMonth === parseInt(selectedMonth))
          );
        });

        const totalWeightFromAPI =
          filteredData.reduce((total, item) => total + (item.WT || 0), 0) /
          1000;
        setTotalWeight(totalWeightFromAPI);

        const monthData = filteredData.reduce((acc, item) => {
          const date = new Date(item["DD&month"]);
          const year = date.getFullYear();
          const monthIndex = date.getMonth();
          const yearMonth = `${year}, ${getMonthName(monthIndex)}`;
          if (!acc[yearMonth]) acc[yearMonth] = 0;
          acc[yearMonth] += item.WT || 0;
          return acc;
        }, {});

        const yearlyData = filteredData.reduce((acc, item) => {
          const year = new Date(item["DD&month"]).getFullYear();
          if (!acc[year]) acc[year] = 0;
          acc[year] += item.WT || 0;
          return acc;
        }, {});

        setYearlyData(yearlyData);
        setMonthlyData(monthData);

        setChartData({
          labels: getYearlyData(filteredData).map((entry) => entry.year),
          datasets: [
            {
              label: "KG Count per Year",
              data: getYearlyData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        const purityData = getPurityData(filteredData);

        setPurityChartData({
          labels: purityData.map((entry) => entry.purity),
          datasets: [
            {
              label: "KG Count by Purity",
              data: purityData.map((entry) => entry.kg),
              backgroundColor: purityData.map((entry) => entry.color),
              borderColor: purityData.map((entry) =>
                entry.color.replace("0.2", "1")
              ),
              borderWidth: 1,
            },
          ],
        });

        setTypeChartData({
          labels: getTypeData(filteredData).map((entry) => entry.type),
          datasets: [
            {
              label: "KG Count by Type",
              data: getTypeData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setZoneChartData({
          labels: getZoneData(filteredData).map((entry) => entry.zone),
          datasets: [
            {
              label: "KG Count by Zone",
              data: getZoneData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ],
        });
        
        setProduct({
          labels: getProduct(filteredData).map((entry) => entry.product),
          datasets: [
            {
              label: "KG Count by product",
              data: getProduct(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "#9900cc",
              borderWidth: 1,
            },
          ],
        });

        const sortedData = filteredData.sort((a, b) => b.WT - a.WT);
        const uniqueOrdersByWeight = calculateTotalWeight(sortedData);
        const top25Orders = uniqueOrdersByWeight
          .sort((a, b) => b["PHOTO NO 2"] - a["PHOTO NO 2"])
          .slice(0, 25);
        setOrderData(top25Orders);

        setAllCharts([
          chartData,
          purityChartData,
          typeChartData,
          zoneChartData,
        ]);
        console.log(selectedMonth, selectedYear);
        console.log("Filtered Data:", filteredData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [theme, filter]);

  return (
    <div
      className={`min-h-screen flex ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-gray-800 text-gray-100"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <div
          className={`p-4  m-6 ${
            theme === "light"
            ? "bg-white border-gray-300"
            : "bg-slate-900 border-zinc-800"
          } shadow-lg  flex justify-center items-center space-x-4 m-4 border rounded-lg`}
        >
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`p-2 border rounded ${
              theme == "light"
                ? "bg-white text-black border border-gray-200"
                : "bg-slate-900 text-gray-400 border-gray-600"
            } `}
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`p-2 border rounded ${
              theme == "light"
                ? "bg-white text-black border border-gray-200"
                : "bg-slate-900 text-gray-400 border-gray-600"
            } `}
          >
            <option value="">Select Month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <button
            onClick={handleFilter}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Filter
          </button>
        </div>
        <div
          className={`m-6 px-10 border rounded-lg ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-900 border-zinc-800"
          } shadow-lg`}
        >
          <button
            onClick={() => toggleAccordion(1)}
            className="w-full flex justify-between items-center py-5"
          >
            <span
              className={`text-lg font-semibold ${
                theme === "light" ? "text-slate-800" : "text-slate-300"
              }`}
            >
              Top <span className="text-red-500">25</span> Photo no
            </span>
            <span className="text-slate-800 transition-transform duration-300">
              {activeIndex === 1 ? (
                <FiMinusCircle
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              ) : (
                <IoIosAddCircleOutline
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              )}
            </span>
          </button>

          <div
            className={`${
              activeIndex === 1 ? "max-h-screen" : "max-h-0"
            } overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <div
              className={`m-6 border rounded-lg ${
                theme === "light"
                  ? "border-gray-300 bg-white"
                  : "border-slate-700 bg-slate-800"
              } shadow-lg`}
            >
              <table
                className={`w-full text-left table-auto text-sm ${
                  theme === "light"
                    ? "bg-white text-gray-800"
                    : "bg-slate-800 text-gray-300"
                }`}
              >
                <thead>
                  <tr
                    className={`${
                      theme === "light" ? "bg-gray-200" : "bg-slate-700"
                    }`}
                  >
                    <th className="p-2 border text-center">Photo No</th>
                    <th align="center" className="p-2 border text-center">
                      Project
                    </th>
                    <th className="p-2 border text-center">Weight in grams</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border text-center">{item["PHOTO NO 2"]}</td>
                      <td className="p-2 border text-center">{item.PROJECT}</td>
                      <td className="p-2 border text-center">{item.WT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-4 mb-4">
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageIndex + 1
                        ? "bg-blue-500 text-white"
                        : theme === "light"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => handlePageChange(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-40">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}
          <div
            className={`order-2 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md overflow-x-auto h-[400px]`}
          >
            {!isLoading && (
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      labels: {
                        color: theme === "light" ? "black" : "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `KG: ${context.raw.toFixed(2)}`;
                        },
                      },
                    },
                    datalabels: {
                      display: true,
                      align: "end",
                      anchor: "end",
                      formatter: (value) => value.toFixed(2),
                      color: theme === "light" ? "black" : "white",
                      font: {
                        weight: "normal",
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Year",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "KG Count",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                  },
                }}
                plugins={[ChartDataLabels]}
              />
            )}
          </div>

          <div
            className={`order-3 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md overflow-x-auto h-[400px]`}
          >
            {!isLoading && (
              <Bar
                data={purityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      labels: {
                        color: theme === "light" ? "black" : "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `KG: ${context.raw.toFixed(2)}`;
                        },
                      },
                    },
                    datalabels: {
                      display: true,
                      align: "end",
                      anchor: "end",
                      formatter: (value) => value.toFixed(2),
                      color: theme === "light" ? "black" : "white",
                      font: {
                        weight: "normal",
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Purity",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "KG Count",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                  },
                }}
                plugins={[ChartDataLabels]}
              />
            )}
          </div>

          <div
            className={`order-4 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            }  p-4 rounded shadow-md  h-[450px]`}
          >
            <h2
              className={`text-xl font-bold mb-4 mt-8 ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Order Weight by Zone
            </h2>
            <div className="w-full h-full">
              <Bar
                data={zoneChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    datalabels: {
                      display: true,
                      align: "end",
                      anchor: "end",
                      formatter: (value) => `${value.toFixed(2)}`,
                      color: theme === "light" ? "black" : "white",
                      font: {
                        weight: "normal",
                      },
                    },
                    legend: {
                      display: true,
                      labels: {
                        color: theme === "light" ? "black" : "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `KG: ${context.raw.toFixed(2)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Zone",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "KG Count",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                  },
                }}
                plugins={[ChartDataLabels]}
              />
            </div>

            
          </div>

          <div
            className={`order-4 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            }  p-4 rounded shadow-md  h-[450px]`}
          >
            <h2
              className={`text-xl font-bold mb-4 mt-8 ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Product wise
            </h2>
            <div className="w-full h-full">
              <Bar
                data={product}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    datalabels: {
                      display: true,
                      align: "end",
                      anchor: "end",
                      formatter: (value) => `${value.toFixed(1)}`,
                      color: theme === "light" ? "black" : "white",
                      font: {
                        weight: "normal",
                      },
                    },
                    legend: {
                      display: true,
                      labels: {
                        color: theme === "light" ? "black" : "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `KG: ${context.raw.toFixed(2)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Product",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "KG Count",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                  },
                }}
                plugins={[ChartDataLabels]}
              />
            </div>

            
          </div>
        </main>
      </div>
    </div>
  );
}

export default New_Design;
