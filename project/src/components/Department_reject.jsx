import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import { Card, CardContent, Typography } from "@mui/material";

import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components and plugin once
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the plugin here
);

function Department_reject() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [per, setper] = useState();
  const location = useLocation();
  const { clickedLabel, deptData, percentage1 } = location.state || {};

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploads, setUploads] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [tableData3, setTableData3] = useState([]);

  const [chartOptions, setChartOptions] = useState(null);
  const [chartOptions2, setChartOptions2] = useState(null);
  const [chartOptions3, setChartOptions3] = useState(null);
  const [chartOptions4, setChartOptions4] = useState(null);
  const [filter_on, setFilter_on] = useState(false);

  const [tableViewStatus, settableViewStatus] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [overAllData, setoverAllData] = useState(null);

  const [uniqueMonths, setUniqueMonths] = useState([]);
  const [monthPercentage, setMonthPercentage] = useState([]);
  const [activeIndex1, setActiveIndex1] = useState(null);

  // const [message, setMessage] = useState("");

  const toggleAccordion1 = (index) => {
    setActiveIndex1(activeIndex1 === index ? null : index);
  };

  const downloadExcel = (worksheet) => {
    const workbook = XLSX.utils.book_new();
    if (worksheet === "Top Rejected Sketches") {
      const worksheet1 = XLSX.utils.json_to_sheet(
        tableData1.map(([skch, count], index) => ({
          "SI no.": (currentPage1 - 1) * itemsPerPage + index + 1,
          "Sketch IDs": skch,
          "Number of Rejections": count,
        })),
        { header: ["SI no.", "Sketch IDs", "Number of Rejections"] }
      );
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet1,
        "Top Rejected Sketches"
      );
      XLSX.writeFile(workbook, `Top_Rejected_Sketches.xlsx`);
    } else if (worksheet === "Type of Reasons Rejections") {
      const worksheet2 = XLSX.utils.json_to_sheet(
        tableData2.map(([skch, count], index) => ({
          "SI no.": (currentPage2 - 1) * itemsPerPage2 + index + 1,
          Reasons: skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase(),
          "Number of Rejections": count,
        })),
        { header: ["SI no.", "Reasons", "Number of Rejections"] }
      );
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet2,
        "Type of Reasons Rejections"
      );
      XLSX.writeFile(workbook, `Type_of_Reasons_Rejections.xlsx`);
    } else if (worksheet === "Problems Arised Rejections") {
      const worksheet3 = XLSX.utils.json_to_sheet(
        tableData3.map(([skch, count], index) => ({
          "SI no.": (currentPage3 - 1) * itemsPerPage3 + index + 1,
          "Problem Arised":
            skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase(),
          "Number of Rejections": count,
        })),
        { header: ["SI no.", "Problem Arised", "Number of Rejections"] }
      );
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet3,
        "Problems Arised Rejections"
      );
      XLSX.writeFile(workbook, `Problems_Arised_Rejections.xlsx`);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchUploads();
  }, []);
  useEffect(() => {
    if (percentage1) {
      setper(percentage1);
    }
  }, [percentage1]);

  const colors = [
    "rgba(153, 102, 255, 0.2)",
    "rgba(54, 162, 235, 0.2)",
    "rgba(255, 99, 132, 0.2)",
    "rgba(255, 206, 86, 0.2)",
    "rgba(75, 192, 192, 0.2)",
    "rgba(255, 159, 64, 0.2)",
    "rgba(199, 199, 199, 0.2)",
    "rgba(255, 99, 132, 0.3)",
    "rgba(54, 162, 235, 0.3)",
    "rgba(255, 206, 86, 0.3)",
  ];

  const getBorderColors = (colors) => {
    return colors.map((color) => color.replace(/0\.\d+\)/, "1)"));
  };

  const fetchUploads = async () => {
    try {
      // const response = await axios.get(
      //   "http://localhost:5000/api/rejection/uploads"
      // );
      find_dept_percengtage();
      const data = deptData;
      setoverAllData(data);

      if (data && data.length > 0) {
        const totalDataCount = data.reduce((sum, item) => sum + item.COUNT, 0);

        const uniqueYears = [...new Set(data.map((item) => item.Yr))];
        const Yearcounts = uniqueYears.map((year) => {
          const yearData = data.filter((item) => item.Yr === year);
          return yearData.reduce((total, item) => total + item.COUNT, 0);
        });
        const borderColors = getBorderColors(colors);
        setChartData({
          labels: uniqueYears,
          datasets: [
            {
              label: "Counts by Year",
              data: Yearcounts,
              backgroundColor: colors.slice(0, Yearcounts.length),
              borderColor: borderColors.slice(0, Yearcounts.length),
              borderWidth: 1,
            },
          ],
        });

        // Setting unique Raised Departments and their counts
        const uniqueskch = [...new Set(data.map((item) => item.RaisedDept))];

        // Summing up the COUNT for each Raised Department
        const counts2 = uniqueskch.map((dept) => {
          const deptData = data.filter((item) => item.RaisedDept === dept);
          return deptData.reduce((total, item) => total + item.COUNT, 0);
        });

        // Combine departments and counts into an array of objects and sort by count
        const sortedDeptData = uniqueskch
          .map((dept, index) => ({
            dept,
            count: counts2[index],
          }))
          .sort((a, b) => b.count - a.count); // Sort in descending order of count

        // Extract sorted departments and counts
        const sortedDepts = sortedDeptData.map((item) => item.dept);
        const sorteddeptCounts = sortedDeptData.map((item) => item.count);

        // Setting the chart data
        setChartData2({
          labels: sortedDepts, // Sorted labels for Raised Departments
          datasets: [
            {
              label: "Based on the Raised Departments",
              data: sorteddeptCounts, // Sorted data for each department
              backgroundColor: colors.slice(0, sorteddeptCounts.length), // Dynamically set colors
              borderColor: borderColors.slice(0, sorteddeptCounts.length), // Dynamically set border colors
              borderWidth: 1,
            },
          ],
        });

        const uniqueMonths = [...new Set(data.map((item) => item.MONTH))];
        const counts = uniqueMonths.map((month) => {
          return uniqueYears.map((year) => {
            const filteredData = data.filter(
              (item) => item.Yr === year && item.MONTH === month
            );
            return filteredData.reduce((total, item) => total + item.COUNT, 0);
          });
        });
        // console.log("Counts:", counts);
        // console.log("Unique Months:", uniqueMonths);

        // const percentage = counts.map((countArr) =>{
        //       return ((countArr / totalDataCount) * 100).toFixed(2);
        // });
        // console.log("Percentage:", percentage);
        // setUniqueMonths(uniqueMonths);
        // setMonthPercentage(percentage);

        setChartData3({
          labels: uniqueMonths, // X-axis labels (Months)
          datasets: uniqueYears.map((year, index) => ({
            label: year,
            data: counts.map((countArr) => countArr[index]),
            fill: false,
            backgroundColor: colors.slice(0, uniqueYears.length)[index], // Colors for each year
            borderColor: borderColors.slice(0, uniqueYears.length)[index], // Borders for each year
            borderWidth: 1,
            tension: 0.1,
          })),
        });

        const uniquetypeOfReason = [
          ...new Set(
            data.map((reason) => reason.TypeOfReason.toLowerCase().trim())
          ),
        ];

        const reasonCount = uniquetypeOfReason.map((reason) => {
          const filteredData = data.filter(
            (item) => item.TypeOfReason.toLowerCase().trim() === reason
          );
          return filteredData.reduce((total, item) => total + item.COUNT, 0);
        });

        // Combine reasons and counts into an array of objects and sort by count
        const sortedData = uniquetypeOfReason
          .map((reason, index) => ({
            reason,
            count: reasonCount[index],
          }))
          .sort((a, b) => b.count - a.count); // Sort in descending order of count

        // Extract sorted reasons and counts
        const sortedReasons = sortedData.map((item) => item.reason);
        const sortedCounts = sortedData.map((item) => item.count);

        setChartData4({
          labels: sortedReasons, // Sorted labels (Type of Reason)
          datasets: [
            {
              label: "Based on the Raised Departments",
              data: sortedCounts, // Sorted counts
              backgroundColor: colors.slice(0, sortedReasons.length), // Assign background colors
              borderColor: borderColors.slice(0, sortedReasons.length), // Assign border colors
              borderWidth: 1,
            },
          ],
        });

        const commonOptions = {
          scales: {
            y: {
              ticks: {
                beginAtZero: true,
                precision: 0, // Ensure whole numbers on Y-axis
              },
            },
            x: {
              ticks: {
                precision: 0, // Ensure whole numbers on X-axis
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const value = tooltipItem.raw;
                  const percentage =
                    ((value / totalDataCount) * 100).toFixed(2) + "%";
                  return `${value} (${percentage})`;
                },
              },
            },
            datalabels: {
              display: true,
              formatter: (value, context) => {
                const percentage = ((value / totalDataCount) * 100).toFixed(2);
                return `${value} (${percentage}%)`;
              },
            },
          },
        };

        // Apply the common options to each chart
        setChartOptions(commonOptions);
        setChartOptions2(commonOptions);
        setChartOptions3(commonOptions);
        setChartOptions4(commonOptions);
      } else {
        console.warn("No data available");
      }

      /// Sketch table data
      const skchTableData = [...new Set(data.map((skch) => skch.SketchNo))];
      const skchCount = skchTableData.map((skch) => {
        const filteredData = data.filter((item) => item.SketchNo === skch);
        return filteredData.reduce((total, item) => total + item.COUNT, 0);
      });

      const result = Object.fromEntries(
        skchTableData.map((key, index) => [key, skchCount[index]])
      );

      const sortedEntries = Object.entries(result).sort(
        ([, a], [, b]) => b - a
      );

      const finalvalue = sortedEntries.slice(0, 25);

      // console.log("Top 25 Sorted Entries:", finalvalue);

      setTableData1(finalvalue);

      // Type of reason table
      const reasonTableData = [
        ...new Set(
          data.map((reason) => reason.TypeOfReason.toLowerCase().trim())
        ),
      ];
      const reasonTableCount = reasonTableData.map((reason) => {
        const filteredData = data.filter(
          (item) => item.TypeOfReason.toLowerCase().trim() === reason
        );
        return filteredData.reduce((total, item) => total + item.COUNT, 0);
      });

      const reasonTableresult = Object.fromEntries(
        reasonTableData.map((key, index) => [key, reasonTableCount[index]])
      );

      const reasonTablesortedEntries = Object.entries(reasonTableresult).sort(
        ([, a], [, b]) => b - a
      );

      // const reasonTablefinalvalue = reasonTablesortedEntries.slice(0, 25);

      setTableData2(reasonTablesortedEntries);
      // console.log("Top Entries:", tableData2);

      // Problem Arised Table
      const probTableData = [
        ...new Set(
          data.map((reason) => reason.ProblemArised2.toLowerCase().trim())
        ),
      ];
      const probTableCount = probTableData.map((reason) => {
        const filteredData = data.filter(
          (item) => item.ProblemArised2.toLowerCase().trim() === reason
        );
        return filteredData.reduce((total, item) => total + item.COUNT, 0);
      });

      const probTableresult = Object.fromEntries(
        probTableData.map((key, index) => [key, probTableCount[index]])
      );

      const probTablesortedEntries = Object.entries(probTableresult).sort(
        ([, a], [, b]) => b - a
      );

      // const reasonTablefinalvalue = reasonTablesortedEntries.slice(0, 25);

      setTableData3(probTablesortedEntries);
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  const find_dept_percengtage = async () => {
    const response = await axios.get(
      "http://localhost:8081/api/rejection/uploads"
    );
    let response_data = response.data.filter(
      (item) => item.ToDept === clickedLabel
    );
    const totalDataCount = response_data.reduce(
      (sum, item) => sum + item.COUNT,
      0
    );
    const uniqueMonths = [...new Set(response_data.map((item) => item.MONTH))];
    const uniqueYears = [...new Set(response_data.map((item) => item.Yr))];

    const counts = uniqueMonths.map((month) => {
      return uniqueYears.map((year) => {
        const filteredData = response_data.filter(
          (item) => item.Yr === year && item.MONTH === month
        );
        return filteredData.reduce((total, item) => total + item.COUNT, 0);
      });
    });

    console.log("Counts:", counts);
    console.log("Unique Months:", uniqueMonths);

    const percentage = counts.map((countArr) => {
      return ((countArr / totalDataCount) * 100).toFixed(2);
    });
    console.log("Percentage:", percentage);
    setUniqueMonths(uniqueMonths);
    setMonthPercentage(percentage);
  };
  // Sketch table data
  const [currentPage1, setCurrentPage1] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(tableData1.length / itemsPerPage);

  const currentData = tableData1.slice(
    (currentPage1 - 1) * itemsPerPage,
    currentPage1 * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage1(newPage);
    }
  };

  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage2 = 6;

  const totalPages2 = Math.ceil(tableData2.length / itemsPerPage2);

  const currentData2 = tableData2.slice(
    (currentPage2 - 1) * itemsPerPage2,
    currentPage2 * itemsPerPage2
  );

  const handlePageChange2 = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages2) {
      setCurrentPage2(newPage);
    }
  };

  const [currentPage3, setCurrentPage3] = useState(1);
  const itemsPerPage3 = 6;

  const totalPages3 = Math.ceil(tableData3.length / itemsPerPage3);

  const currentData3 = tableData3.slice(
    (currentPage3 - 1) * itemsPerPage3,
    currentPage3 * itemsPerPage3
  );

  const handlePageChange3 = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages3) {
      setCurrentPage3(newPage);
    }
  };

  const handleTableClick = (skch, overAllData, status) => {
    if (overAllData) {
      if (status === "Problem") {
        navigate("/rejections/problem_arised", {
          state: { skch, overAllData },
        });
        console.log(skch);
        console.log(overAllData);
      } else {
        navigate("/rejections/detailed_rejections", {
          state: { skch, overAllData, status },
        });
      }
    } else {
      console.log("Data is not available yet");
    }
  };

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div
      className={`min-h-screen w-full flex ${
        theme === "light"
          ? "bg-gray-100 text-gray-800"
          : "bg-gray-800 text-gray-200"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header
          onSearch={setSearch}
          theme={theme}
          dark={setTheme}
          on_filter={setFilter_on}
          filter={filter_on}
        />
        <main
          className={`flex-1 px-4 overflow-y-auto ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
          <div className="flex justify-between mx-4 mt-4">
            <h1 className="font-bold text-xl">
              Rejected Details of{" "}
              <span className="text-[#879FFF] text-2xl">{clickedLabel}</span>{" "}
              Department{" "}
            </h1>
          </div>

          <div
            className={`m-6 px-10 border rounded-lg shadow-lg max-w-[90%] md:max-w-lg lg:max-w-4xl xl:max-w-screen-lg 2xl:max-w-screen-8xl ${
              theme === "light"
                ? "bg-white border-gray-300"
                : "bg-slate-900 border-gray-800 text-slate-300"
            }`}
          >
            <div
              className={`border-b ${
                theme === "light" ? "border-slate-200" : "border-gray-700"
              }`}
            >
              <button
                onClick={() => toggleAccordion1(1)}
                className={`w-full flex justify-between items-center py-5 ${
                  theme === "light" ? "text-slate-800" : "text-slate-300"
                }`}
              >
                <span className="text-lg font-semibold">
                  Rejection Percentage of {clickedLabel} Department Based on
                  Months
                </span>
                <span
                  className={`transition-transform duration-300 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  {activeIndex1 === 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={`${
                  activeIndex1 === 1 ? "max-h-screen" : "max-h-0"
                } overflow-hidden transition-all duration-300 ease-in-out`}
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-6 gap-4">
                  {uniqueMonths.length > 0 ? (
                    uniqueMonths.map((month, index) => (
                      <div
                        key={index}
                        className={`shadow-md rounded-lg p-6 cursor-pointer ${
                          theme === "light"
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "bg-blue-900 border-2 border-blue-600"
                        }`}
                      >
                        <h2
                          className={`text-xl font-semibold mb-2 ${
                            theme === "light"
                              ? "text-gray-700"
                              : "text-slate-200"
                          }`}
                        >
                          {month}
                        </h2>
                        <p
                          className={`font-bold text-xl ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-400"
                          }`}
                        >
                          {monthPercentage[index]}%
                        </p>
                      </div>
                    ))
                  ) : (
                    <p
                      className={`text-lg font-bold ${
                        theme === "light" ? "text-red-500" : "text-red-400"
                      }`}
                    >
                      No data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          {/* <div className="p-4">
          <div><pre>{JSON.stringify(deptData, null, 2)}</pre></div>
        </div> */}

          <div className="flex">
            <div
              className={`w-full md:w-1/2 m-6 px-4 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <h1
                className={`text-lg font-semibold p-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Rejection Counts Based on Year
              </h1>
              <div
                className="flex-grow px-4 max-h-full"
                style={{ height: "300px" }}
              >
                {" "}
                {/* Set a height for the chart container */}
                {chartData ? (
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
                          backgroundColor: theme === "light" ? "white" : "gray",
                          titleColor: theme === "light" ? "black" : "white",
                          bodyColor: theme === "light" ? "black" : "white",
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Count By Months",
                            color: theme === "light" ? "#555" : "#bbb",
                            font: {
                              size: 14,
                            },
                          },
                          ticks: {
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Year",
                            color: theme === "light" ? "#555" : "#bbb",
                            font: {
                              size: 14,
                            },
                          },
                          ticks: {
                            autoSkip: true,
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p
                    className={`text-center ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Loading chart data...
                  </p>
                )}
              </div>
            </div>

            <div
              className={`w-1/2 m-6 px-10 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <h1
                className={`text-lg font-semibold p-2 pl-10 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Rejections Count by Department
              </h1>
              <div className="px-10">
                {chartData2 ? (
                  <Bar
                    data={chartData2}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: true,
                          labels: {
                            color: theme === "light" ? "black" : "white",
                          },
                        },
                        tooltip: {
                          backgroundColor: theme === "light" ? "white" : "gray",
                          titleColor: theme === "light" ? "black" : "white",
                          bodyColor: theme === "light" ? "black" : "white",
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Departments",
                            color: theme === "light" ? "#555" : "#bbb",
                            font: {
                              size: 14,
                            },
                          },
                          ticks: {
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Rejections",
                            color: theme === "light" ? "#555" : "#bbb",
                            font: {
                              size: 14,
                            },
                          },
                          ticks: {
                            autoSkip: true,
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p
                    className={`text-center ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Loading chart data...
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex">
            <div
              className={`w-1/2 m-6 px-10 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <h1
                className={`text-lg font-semibold p-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Rejections Count by Month
              </h1>
              <div className="chart-container" style={{ height: "300px" }}>
                {chartData3 ? (
                  <Line
                    data={chartData3}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
                          display: true, // Show legend
                          labels: {
                            color: theme === "light" ? "black" : "white",
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `${context.raw.toFixed(2)}`; // Custom tooltip formatting
                            },
                          },
                          backgroundColor: theme === "light" ? "white" : "gray",
                          titleColor: theme === "light" ? "black" : "white",
                          bodyColor: theme === "light" ? "black" : "white",
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Count By months", // X-axis title
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          beginAtZero: true,
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                          ticks: {
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Year", // Y-axis title
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          ticks: {
                            autoSkip: true,
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                      },
                    }}
                    plugins={[ChartDataLabels]}
                  />
                ) : (
                  <p
                    className={`text-center ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Loading chart data...
                  </p>
                )}
              </div>
            </div>
            <div
              className={`w-1/2 m-6 px-10 border rounded-lg shadow-lg ${
                theme === "light"
                  ? "bg-white border-gray-300"
                  : "bg-gray-900 border-gray-700"
              }`}
            >
              <h1
                className={`text-lg font-semibold p-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Reasons for Rejections
              </h1>
              <div className="chart-container">
                {chartData4 ? (
                  <Bar
                    data={chartData4}
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
                          backgroundColor: theme === "light" ? "white" : "gray",
                          titleColor: theme === "light" ? "black" : "white",
                          bodyColor: theme === "light" ? "black" : "white",
                        },
                      },
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: "Reasons",
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          beginAtZero: true,
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                          ticks: {
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Count",
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          ticks: {
                            autoSkip: true,
                            color: theme === "light" ? "#555" : "#bbb",
                          },
                          grid: {
                            display: true,
                            color: theme === "light" ? "#eee" : "#444",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p
                    className={`text-center ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Loading chart data...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div
            className={`m-6 px-10 border rounded-lg ${
              theme === "light"
                ? "border-gray-300 text-gray-800 bg-white"
                : "border-gray-900 bg-gray-900 text-gray-200"
            } shadow-lg`}
          >
            <h1 className="text-xl font-semibold pt-5">
              Detailed Top <span className="text-red-500">Rejections</span>{" "}
            </h1>

            {/* Accordion Sketches */}
            <div
              className={`border-b ${
                theme === "light" ? "border-gray-300" : "border-gray-500"
              }`}
            >
              <button
                onClick={() => toggleAccordion(1)}
                className="w-full flex justify-between items-center py-5 text-slate-800"
              >
                <span
                  className={`text-lg font-semibold ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  }`}
                >
                  Based on Sketches
                </span>
                <span
                  className={`transition-transform duration-300 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  {activeIndex === 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={`${
                  activeIndex === 1 ? "max-h-screen" : "max-h-0"
                } overflow-hidden transition-all duration-300 ease-in-out`}
              >
                {/* <div className="pb-5 text-sm text-slate-500">
            Material Tailwind is a framework that enhances Tailwind CSS with additional styles and components.
          </div> */}

                <div
                  className={`m-6 border rounded-lg ${
                    theme === "light"
                      ? "border-gray-300 bg-white"
                      : "border-gray-600 bg-gray-700"
                  } shadow-lg`}
                >
                  <div className="flex justify-between">
                    <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                      Top <span className="text-red-500">25</span> Rejected
                      Sketches
                    </h1>
                    <div className="m-4">
                      <button
                        className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
                        onClick={() => downloadExcel("Top Rejected Sketches")}
                      >
                        Download as Excel
                      </button>
                    </div>
                  </div>

                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr
                        className={`${
                          theme === "light"
                            ? "bg-gray-300 text-gray-700"
                            : "bg-gray-900 text-gray-200"
                        }`}
                      >
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          SI no.
                        </th>
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          Sketch IDs
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Number of Rejections
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Detailed View
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map(([skch, count], index) => (
                        <tr
                          key={index}
                          className={`transition-colors duration-200 ${
                            theme === "light"
                              ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                              : "bg-gray-800 even:bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {(currentPage1 - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {skch}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {count}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            <button
                              className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
                                theme === "light"
                                  ? "bg-blue-500 hover:bg-blue-700"
                                  : "bg-blue-600 hover:bg-blue-800"
                              }`}
                              onClick={() =>
                                handleTableClick(skch, overAllData, "Sketch")
                              }
                              disabled={!overAllData}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="flex justify-center space-x-2 m-4">
                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage1 === 1
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange(currentPage1 - 1)}
                      disabled={currentPage1 === 1}
                    >
                      Previous
                    </button>
                    <button
                      className={`text-base px-5 py-3 rounded-lg border ${
                        theme === "light"
                          ? "bg-gray-300"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {currentPage1}
                    </button>
                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage1 === totalPages
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange(currentPage1 + 1)}
                      disabled={currentPage1 === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Item 2 */}
            <div
              className={`border-b ${
                theme === "light" ? "border-slate-200" : "border-gray-500"
              }`}
            >
              <button
                onClick={() => toggleAccordion(2)}
                className={`w-full flex justify-between items-center py-5 ${
                  theme === "light" ? "text-slate-800" : "text-slate-300"
                }`}
              >
                <span className="text-lg font-semibold">
                  Based on Type of Reasons
                </span>
                <span
                  className={`transition-transform duration-300 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  {activeIndex === 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={`${
                  activeIndex === 2 ? "max-h-screen" : "max-h-0"
                } overflow-hidden transition-all duration-300 ease-in-out`}
              >
                <div
                  className={`m-6 border rounded-lg shadow-lg ${
                    theme === "light"
                      ? "bg-white border-gray-300"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <h1
                      className={`text-xl font-semibold p-2 pl-10 py-5 ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      }`}
                    >
                      Top <span className="text-red-500">Type of Reasons</span>{" "}
                      Rejections
                    </h1>
                    <div className="m-4">
                      <button
                        className={`px-5 py-3 rounded-lg font-semibold text-white ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-800"
                        }`}
                        onClick={() =>
                          downloadExcel("Type of Reasons Rejections")
                        }
                      >
                        Download as Excel
                      </button>
                    </div>
                  </div>
                  <table className="w-full table-auto text-sm">
                    <thead>
                      <tr
                        className={`${
                          theme === "light"
                            ? "bg-gray-300 text-gray-700"
                            : "bg-gray-900 text-gray-200"
                        }`}
                      >
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          SI no.
                        </th>
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          Reasons
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Number of Rejections
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Detailed View
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData2.map(([skch, count], index) => (
                        <tr
                          key={index}
                          className={`transition-colors duration-200 ${
                            theme === "light"
                              ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                              : "bg-gray-800 even:bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {(currentPage2 - 1) * itemsPerPage2 + index + 1}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {skch}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {count}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            <button
                              className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
                                theme === "light"
                                  ? "bg-blue-500 hover:bg-blue-700"
                                  : "bg-blue-600 hover:bg-blue-800"
                              }`}
                              onClick={() =>
                                handleTableClick(skch, overAllData, "Rejection")
                              }
                              disabled={!overAllData}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-center space-x-2 m-4">
                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage2 === 1
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange2(currentPage2 - 1)}
                      disabled={currentPage2 === 1}
                    >
                      Previous
                    </button>
                    <button
                      className={`text-base px-5 py-3 rounded-lg border ${
                        theme === "light"
                          ? "bg-gray-300"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {currentPage2}
                    </button>
                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage2 === totalPages2
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange2(currentPage2 + 1)}
                      disabled={currentPage2 === totalPages2}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Item 3 */}
            <div
              className={`border-b ${
                theme === "light" ? "border-slate-200" : "border-gray-500"
              }`}
            >
              <button
                onClick={() => toggleAccordion(3)}
                className={`w-full flex justify-between items-center py-5 ${
                  theme === "light" ? "text-slate-800" : "text-slate-300"
                }`}
              >
                <span className="text-lg font-semibold">
                  Based on Problem Arised
                </span>

                <span
                  className={`transition-transform duration-300 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  {activeIndex === 3 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                    </svg>
                  )}
                </span>
              </button>
              <div
                className={`${
                  activeIndex === 3 ? "max-h-screen" : "max-h-0"
                } overflow-hidden transition-all duration-300 ease-in-out`}
              >
                {/* <div className="pb-5 text-sm text-slate-500">
            Material Tailwind allows you to quickly build modern, responsive websites with a focus on design.
          </div> */}

                <div
                  className={`m-6 border rounded-lg shadow-lg ${
                    theme === "light"
                      ? "bg-white border-gray-300"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <div className="flex justify-between">
                    <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                      Top <span className="text-red-500">Problems Arised</span>{" "}
                      for Rejection
                    </h1>
                    <div className="m-4">
                      <button
                        className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
                        onClick={() =>
                          downloadExcel("Problems Arised Rejections")
                        }
                      >
                        Download as Excel
                      </button>
                    </div>
                  </div>

                  <table className="w-full table-auto text-sm ">
                    <thead>
                      <tr
                        className={`${
                          theme === "light"
                            ? "bg-gray-300 text-gray-700"
                            : "bg-gray-900 text-gray-200"
                        }`}
                      >
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          SI no.
                        </th>
                        <th className="px-6 py-3 text-center font-semibold text-base">
                          Problem Arised
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Number of Rejections
                        </th>
                        <th className="py-3 text-center font-semibold text-base">
                          Detailed View
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData3.map(([skch, count], index) => (
                        <tr
                          key={index}
                          className={`transition-colors duration-200 ${
                            theme === "light"
                              ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                              : "bg-gray-800 even:bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {(currentPage3 - 1) * itemsPerPage3 + index + 1}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {skch.charAt(0).toUpperCase() +
                              skch.slice(1).toLowerCase()}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            {count}
                          </td>
                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                            <button
                              className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
                                theme === "light"
                                  ? "bg-blue-500 hover:bg-blue-700"
                                  : "bg-blue-600 hover:bg-blue-800"
                              }`}
                              onClick={() =>
                                handleTableClick(skch, overAllData, "Problem")
                              }
                              disabled={!overAllData}
                            >
                              {" "}
                              View{" "}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Pagination Controls */}
                  <div className="flex justify-center space-x-2 m-4 ">
                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage3 === 1
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange3(currentPage3 - 1)}
                      disabled={currentPage3 === 1}
                    >
                      Previous
                    </button>

                    <button
                      className={`text-base px-5 py-3 rounded-lg border ${
                        theme === "light"
                          ? "bg-gray-300"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {currentPage3}
                    </button>

                    <button
                      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                        currentPage3 === totalPages3
                          ? theme === "light"
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : theme === "light"
                          ? "bg-gray-300 hover:bg-gray-400"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                      onClick={() => handlePageChange3(currentPage3 + 1)}
                      disabled={currentPage3 === totalPages3}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Department_reject;
