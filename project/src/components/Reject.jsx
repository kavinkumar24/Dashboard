import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import { IoCardOutline, IoFilterOutline } from "react-icons/io5";
import { Bar, Pie } from "react-chartjs-2";
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
import CustomMultiSelect from "./Custom/Mutliselect";
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
import { useRef } from "react";

function Reject() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [tableData3, setTableData3] = useState([]);

  const [tableViewStatus, settableViewStatus] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [overAllData, setoverAllData] = useState(null);

  const [startYear, setStartYear] = useState([]);
  const [startMonth, setStartMonth] = useState([]);
  const [startDay, setStartDay] = useState([]);

  const [endYear, setEndYear] = useState([]);
  const [endMonth, setEndMonth] = useState([]);
  const [endDay, setEndDay] = useState([]);

  const handleStartYearChange = (e) => setStartYear(e.target.value);
  const handleStartMonthChange = (e) => setStartMonth(e.target.value);
  const handleStartDayChange = (e) => setStartDay(e.target.value);

  const handleEndYearChange = (e) => setEndYear(e.target.value);
  const handleEndMonthChange = (e) => setEndMonth(e.target.value);
  const handleEndDayChange = (e) => setEndDay(e.target.value);
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const CustomInputDropdown = ({
    id,
    name,
    year,
    month,
    day,
    onYearChange,
    onMonthChange,
    onDayChange,
    onClose,
  }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // State to manage dropdown visibility
    const [isOpen, setIsOpen] = useState(false);

    // Toggle dropdown visibility
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (!event.target.closest(".custom-multi-select")) {
          setIsOpen(false);
          if (onClose) onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
        >
          Select Date
        </button>

        {isOpen && (
          <div className="absolute bg-white shadow-md rounded-lg mt-2 p-4">
            <div className="flex flex-col gap-2">
              {/* Year Dropdown */}
              <select
                value={year}
                onChange={onYearChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Month Dropdown */}
              <select
                value={month}
                onChange={onMonthChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Day Dropdown */}
              <select
                value={day}
                onChange={onDayChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Day</option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    );
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
      const response = await axios.get(
        "http://localhost:5000/api/rejection/uploads"
      );
      let data = response.data;

      // Filter data based on selected date range (startDate and endDate should be state variables)
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        console.log(parsedStartDate, parsedEndDate);

        data = data.filter((item) => {
          const itemDate = new Date(item.Date); // Parse item.Date in MM/DD/YY format
          return itemDate >= parsedStartDate && itemDate <= parsedEndDate;
        });
        setoverAllData(data);
      }

      setoverAllData(data);

      if (data && data.length > 0) {
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

        const uniqueskch = [...new Set(data.map((item) => item.ToDept))];
        const counts2 = uniqueskch.map((year) => {
          const yearData = data.filter((item) => item.ToDept === year);
          return yearData.reduce((total, item) => total + item.COUNT, 0);
        });
        setChartData2({
          labels: uniqueskch,
          datasets: [
            {
              label: "Based on the Rasied Departments",
              data: counts2,
              backgroundColor: colors.slice(0, counts2.length),
              borderColor: borderColors.slice(0, counts2.length),
              borderWidth: 1,
            },
          ],
        });

        // const uniqueYears = [...new Set(data.map(item => item.Yr))];
        const uniqueMonths = [...new Set(data.map((item) => item.MONTH))];

        const counts = uniqueYears.map((year) => {
          return uniqueMonths.map((month) => {
            const filteredData = data.filter(
              (item) => item.Yr === year && item.MONTH === month
            );
            return filteredData.reduce((total, item) => total + item.COUNT, 0);
          });
        });

        setChartData3({
          labels: uniqueYears, // X-axis labels
          datasets: uniqueMonths.map((month, index) => ({
            label: month,
            data: counts.map((countArr) => countArr[index]),
            fill: false,
            backgroundColor: colors.slice(0, uniqueMonths.length)[index], // Colors for each month
            borderColor: borderColors.slice(0, uniqueMonths.length)[index], // Borders for each month
            borderWidth: 1,
            tension: 0.1,
          })),
        });
      } else {
        console.warn("No data available");
      }

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

      // console.log(reasonCount);

      const borderColors = getBorderColors(colors);

      setChartData4({
        labels: uniquetypeOfReason,
        datasets: [
          {
            label: "Based on the Raised Departments",
            data: reasonCount,
            backgroundColor: colors.slice(0, uniquetypeOfReason.length), // Assign background colors
            borderColor: borderColors.slice(0, uniquetypeOfReason.length), // Assign border colors
            borderWidth: 1,
          },
        ],
      });

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
      console.log("Top Entries:", reasonTablesortedEntries);

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
      // console.log("Top Entries:", tableData2);
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };
  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 10, // Adjust as per your data
        title: {
          display: true,
          text: "Count by Month",
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Rejections Count by Year and Month",
      },
    },
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("file_ID", currentTime);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/rejection/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message || "File uploaded successfully!");
      fetchUploads();
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to upload file");
    }
  };

  const handleBarchange = (event, elements) => {
    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index;
      const clickedLabel = chartData2.labels[clickedElementIndex];

      console.log("Clicked Label:", clickedLabel);
      const deptData = overAllData.filter(
        (data) => data.ToDept === clickedLabel
      );
      navigate("/rejections/dept_rejections", {
        state: { clickedLabel, deptData },
      });
    } else {
      console.warn("No elements were clicked");
    }
  };

  const optionschart2 = {
    onClick: (event, elements) => handleBarchange(event, elements),
    scales: {
      x: {
        title: {
          display: true,
          text: "Department",
        },
      },
      y: {
        type: "linear",
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };
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
      navigate("/rejections/detailed_rejections", {
        state: { skch, overAllData, status },
      });
    } else {
      console.log("Data is not available yet");
    }

    console.log("overAllData ", overAllData);
  };

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilterClick = () => {
    setShowDatePickerModal(true); // Show the date picker modal
  };

  const handleCancelFilter = () => {
    setShowDatePickerModal(false);
  };

  const handleApplyFilter = () => {
    const newStartDate = `${startYear}-${startMonth}-${startDay}`;
    const newEndDate = `${endYear}-${endMonth}-${endDay}`;
  
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  
    console.log("Start Date:", newStartDate, "End Date:", newEndDate);
  
    setShowDatePickerModal(false);
  
    fetchUploads();
  };
  

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value); // Update end date state
  };

  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (dropdownType) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  return (
    <div
      className={`min-h-screen w-full flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />

        <div className="flex justify-between mx-4 mt-4">
          <h1 className="font-bold text-xl">Rejections Overview</h1>
          <div className="flex">
            <button
              onClick={handleFilterClick}
              className={`mr-3 py-2 px-4 font-bold text-sm text-white rounded-lg flex ${
                theme === "light"
                  ? "bg-blue-500 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-800"
              }`}
            >
              <IoFilterOutline
                size={20}
                className={`${
                  theme === "light" ? "text-gray-100" : "text-gray-100"
                } mr-2`}
              />
              Filter
            </button>

            <button
              className={`py-2 px-4 font-bold text-sm text-white rounded-lg ${
                theme === "light"
                  ? "bg-blue-500 hover:bg-blue-700"
                  : "bg-blue-600 hover:bg-blue-800"
              }`}
            >
              View Upload History
            </button>
          </div>

          {/* Date Picker Modal */}
          {showDatePickerModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[50%]">
                <h2 className="text-lg font-bold mb-4 text-center">
                  Select Date Range
                </h2>
                <div className="flex items-center justify-center mb-4">
                  {/* Custom Multi-Select Dropdown for Start Date */}

                  <CustomMultiSelect
                    theme={theme}
                    options={years}
                    selectedOptions={startYear}
                    setSelectedOptions={setStartYear}
                    label="Select Year"
                    isOpen={openDropdown === "year"}
                    onToggle={() => handleDropdownToggle("year")}
                    onClose={() => setOpenDropdown(null)}
                  />

                  <CustomMultiSelect
                    theme={theme}
                    options={months}
                    selectedOptions={startMonth}
                    setSelectedOptions={setStartMonth}
                    label="Select month"
                    isOpen={openDropdown === "month"}
                    onToggle={() => handleDropdownToggle("month")}
                    onClose={() => setOpenDropdown(null)}
                  />

                  <CustomMultiSelect
                    theme={theme}
                    options={days}
                    selectedOptions={startDay}
                    setSelectedOptions={setStartDay}
                    label="Select day"
                    isOpen={openDropdown === "day"}
                    onToggle={() => handleDropdownToggle("day")}
                    onClose={() => setOpenDropdown(null)}
                  />

                  <span className="mx-4 text-gray-500">to</span>

                  {/* Custom Multi-Select Dropdown for End Date */}
                  
                  <CustomMultiSelect
                    theme={theme}
                    options={years}
                    selectedOptions={endYear}
                    setSelectedOptions={setEndYear}
                    label="Select Year"
                    isOpen={openDropdown === "end_year"}
                    onToggle={() => handleDropdownToggle("end_year")}
                    onClose={() => setOpenDropdown(null)}
                  />

                  <CustomMultiSelect
                    theme={theme}
                    options={months}
                    selectedOptions={endMonth}
                    setSelectedOptions={setEndMonth}
                    label="Select month"
                    isOpen={openDropdown === "end_month"}
                    onToggle={() => handleDropdownToggle("end_month")}
                    onClose={() => setOpenDropdown(null)}
                  />
                  
                  <CustomMultiSelect
                    theme={theme}
                    options={days}
                    selectedOptions={endDay}
                    setSelectedOptions={setEndDay}
                    label="Select day"
                    isOpen={openDropdown === "end_day"}
                    onToggle={() => handleDropdownToggle("end_day")}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleCancelFilter}
                    className={`py-2 px-4 font-bold text-sm text-white rounded-lg ${
                      theme === "light"
                        ? "bg-gray-500 hover:bg-gray-700"
                        : "bg-gray-600 hover:bg-gray-800"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilter}
                    className={`py-2 px-4 font-bold text-sm text-white rounded-lg ${
                      theme === "light"
                        ? "bg-blue-500 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-800"
                    }`}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex">
          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
            <h1 className="text-lg font-semibold p-2 pl-10">
              Rejection Counts Based on Year
            </h1>
            <div className=" px-10">
              {chartData ? (
                <Bar data={chartData} />
              ) : (
                <p className="text-center text-gray-500">
                  Loading chart data...
                </p>
              )}
            </div>
          </div>

          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
            <h1 className="text-lg font-semibold p-2 pl-10">
              Rejections Count by Department
            </h1>
            <div className="px-10">
              {chartData2 ? (
                <Bar data={chartData2} options={optionschart2} />
              ) : (
                <p className="text-center text-gray-500">
                  Loading chart data...
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
            <h1 className="text-lg font-semibold p-2 pl-10">
              Rejections Count by Month
            </h1>

            <div className="chart-container" style={{ height: "310px" }}>
              {" "}
              {/* Add specific height for the chart container */}
              {chartData3 ? (
                <Bar
                  data={chartData3}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: {
                      datalabels: {
                        display: true,
                        align: "end",
                        anchor: "end",
                        formatter: (value) => `${value.toFixed(2)}`,
                        color: "black",
                        font: {
                          weight: "normal",
                        },
                      },
                      legend: {
                        display: true,
                        position: "top", // Position the legend at the top
                        labels: {
                          boxWidth: 15, // Customize the size of the legend box
                          padding: 10, // Add padding around legend items
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.raw.toFixed(2)}`;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Count By Months",
                          color: "#555", // X-axis title color
                          font: {
                            size: 14, // X-axis title font size
                          },
                        },
                        beginAtZero: true,
                        grid: {
                          display: true,
                          color: "#eee", // Light grid lines
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Year",
                          color: "#555", // Y-axis title color
                          font: {
                            size: 14, // Y-axis title font size
                          },
                        },
                        ticks: {
                          autoSkip: true,
                        },
                        grid: {
                          display: true,
                          color: "#eee", // Light grid lines
                        },
                      },
                    },
                  }}
                  plugins={[ChartDataLabels]}
                />
              ) : (
                <p className="text-gray-500 text-center">
                  Loading chart data...
                </p>
              )}
            </div>
          </div>

          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
            <h1 className="text-lg font-semibold p-2">
              Reasons for Rejections
            </h1>

            <div className="chart-container">
              {chartData4 ? (
                <Bar data={chartData4} />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
        </div>

        <div className="m-6 px-10 border rounded-lg border-gray-300 bg-white shadow-lg">
          <h1 className="text-xl font-semibold pt-5">
            Detailed Top <span className="text-red-500">Rejections</span>{" "}
          </h1>

          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleAccordion(1)}
              className="w-full flex justify-between items-center py-5 text-slate-800"
            >
              <span className="text-lg font-semibold">Based on Sketches</span>
              <span className="text-slate-800 transition-transform duration-300">
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

              <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Top <span className="text-red-500">25</span> Rejected Sketches
                </h1>

                <table className="w-full table-auto text-sm ">
                  <thead>
                    <tr className="bg-gray-300 text-gray-700 ">
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
                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
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
                      currentPage1 === 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => handlePageChange(currentPage1 - 1)}
                    disabled={currentPage1 === 1}
                  >
                    Previous
                  </button>

                  <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                    {currentPage1}
                  </button>

                  <button
                    className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                      currentPage1 === totalPages
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
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
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleAccordion(2)}
              className="w-full flex justify-between items-center py-5 text-slate-800"
            >
              <span className="text-lg font-semibold">
                Based on Type of Reasons
              </span>

              <span className="text-slate-800 transition-transform duration-300">
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
              {/* Table View */}

              <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Top <span className="text-red-500"> Type of Reasons</span>{" "}
                  Rejections
                </h1>

                <table className="w-full table-auto text-sm ">
                  <thead>
                    <tr className="bg-gray-300 text-gray-700 ">
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
                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {(currentPage2 - 1) * itemsPerPage2 + index + 1}
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
                              handleTableClick(skch, overAllData, "Rejection")
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

                <div className="flex justify-center space-x-2 m-4 ">
                  <button
                    className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                      currentPage2 === 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => handlePageChange2(currentPage2 - 1)}
                    disabled={currentPage2 === 1}
                  >
                    Previous
                  </button>

                  <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                    {currentPage2}
                  </button>

                  <button
                    className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                      currentPage2 === totalPages2
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
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

          <div className="border-b border-slate-200 ">
            <button
              onClick={() => toggleAccordion(3)}
              className="w-full flex justify-between items-center py-5 text-slate-800"
            >
              <span className="text-lg font-semibold">
                Based on Problem Arised
              </span>

              <span className="text-slate-800 transition-transform duration-300">
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

              <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Top <span className="text-red-500">Problems Arised</span> for
                  Rejection
                </h1>

                <table className="w-full table-auto text-sm ">
                  <thead>
                    <tr className="bg-gray-300 text-gray-700 ">
                      <th className="px-6 py-3 text-center font-semibold text-base">
                        SI no.
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-base">
                        Problem Arised
                      </th>
                      <th className="py-3 text-center font-semibold text-base">
                        Number of Rejections
                      </th>
                      {/* <th className="py-3 text-center font-semibold text-base">Detailed View</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {currentData3.map(([skch, count], index) => (
                      <tr
                        key={index}
                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
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
                        {/* <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData, "Sketch")} disabled={!overAllData} > View </button>
          </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="flex justify-center space-x-2 m-4 ">
                  <button
                    className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                      currentPage3 === 1
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={() => handlePageChange3(currentPage3 - 1)}
                    disabled={currentPage3 === 1}
                  >
                    Previous
                  </button>

                  <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                    {currentPage3}
                  </button>

                  <button
                    className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                      currentPage3 === totalPages3
                        ? "bg-gray-200 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-gray-400"
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

        {/* //////////////////////////////// */}
      </div>
    </div>
  );
}

export default Reject;
