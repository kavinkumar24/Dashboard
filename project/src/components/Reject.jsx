import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import { IoCardOutline, IoFilterOutline } from "react-icons/io5";
import { Bar, Pie, Line } from "react-chartjs-2";
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
import * as XLSX from "xlsx";
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

import RangeSlider from "./Range_Slider/RangeSlider";

function Reject() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState(null);
  const [chartOptions2, setChartOptions2] = useState(null);
  const [chartOptions3, setChartOptions3] = useState(null);
  const [chartOptions4, setChartOptions4] = useState(null);

  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [tableData1, setTableData1] = useState([]);
  const [tableData2, setTableData2] = useState([]);
  const [tableData3, setTableData3] = useState([]);

  // const [tableViewStatus, settableViewStatus] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [overAllData, setoverAllData] = useState(null);

  // const[filter,setfilter]=useState(false)



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
        "http://localhost:8081/api/rejection/uploads"
      );
      let data = response.data;

      // Apply the filter only if both startDate and endDate are set
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
    
        console.log(parsedStartDate, parsedEndDate);
    
        data = data.filter((item) => {
          const itemDate = new Date(item.Date); // Parse item.Date in MM/DD/YY format
          return itemDate >= parsedStartDate && itemDate <= parsedEndDate;
        });

        console.log(data);
        if(data.length <=0) {
          setMessage("No data Available For the Selected range");
        }
      }
    
      setoverAllData(data);
      setFilterApplied(false);  
      
      if (data) {
        // Calculate total counts for percentage calculations
        setMessage("");
        const totalDataCount = data.reduce((sum, item) => sum + item.COUNT, 0);
      
        // Unique Years and their counts
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
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      
        // Departments and their counts
        const uniqueskch = [...new Set(data.map((item) => item.ToDept))];
        const counts2 = uniqueskch.map((dept) => {
          const deptData = data.filter((item) => item.ToDept === dept);
          return deptData.reduce((total, item) => total + item.COUNT, 0);
        });
      
        setChartData2({
          labels: uniqueskch,
          datasets: [
            {
              label: "Based on the Raised Departments",
              data: counts2,
              backgroundColor: colors.slice(0, counts2.length),
              borderColor: borderColors.slice(0, counts2.length),
              borderWidth: 1,
            },
          ],
        });
      
// Months and their counts by year
const uniqueMonths = [...new Set(data.map((item) => item.MONTH))];
const counts = uniqueMonths.map((month) => {
  return uniqueYears.map((year) => {
    const filteredData = data.filter(
      (item) => item.Yr === year && item.MONTH === month
    );
    return filteredData.reduce((total, item) => total + item.COUNT, 0);
  });
});

// Calculate total count for each month across all years
const monthlyTotals = uniqueMonths.map((month) => {
  return uniqueYears.reduce((total, year) => {
    const filteredData = data.filter(
      (item) => item.Yr === year && item.MONTH === month
    );
    return total + filteredData.reduce((sum, item) => sum + item.COUNT, 0);
  }, 0);
});

// Calculate total data count across all months and years
const totalMonthDataCount = data.reduce((sum, item) => sum + item.COUNT, 0);

// Calculate percentages for each month
const percentages = monthlyTotals.map(monthTotal => {
  return ((monthTotal / totalMonthDataCount) * 100).toFixed(2);
});

console.log("Monthly Totals:", percentages);

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
  ...new Set(data.map((reason) => reason.TypeOfReason.toLowerCase().trim())),
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

      
        // Common chart options with percentage and whole number ticks
        const commonOptions = {
          scales: {
            // y: {
            //   ticks: {
            //     beginAtZero: true,
            //     precision: 0, // Ensure whole numbers on Y-axis
            //   },
            // },
            // x: {
            //   ticks: {
            //     precision: 0, // Ensure whole numbers on X-axis
            //   },
            // },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const value = tooltipItem.raw;
                  const percentage = ((value / totalDataCount) * 100).toFixed(2) + "%";
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
  
 

const downloadExcel = (worksheet) => {
  const workbook = XLSX.utils.book_new();
  if(worksheet === "Top Rejected Sketches"){
    const worksheet1 = XLSX.utils.json_to_sheet(tableData1.map(([skch, count], index) => ({
      'SI no.': (currentPage1 - 1) * itemsPerPage + index + 1,
      'Sketch IDs': skch,
      'Number of Rejections': count,
    })), { header: ['SI no.', 'Sketch IDs', 'Number of Rejections'] });
    XLSX.utils.book_append_sheet(workbook, worksheet1, "Top Rejected Sketches");
    XLSX.writeFile(workbook, `Top_Rejected_Sketches.xlsx`);
  }
else if(worksheet === "Type of Reasons Rejections"){
  const worksheet2 = XLSX.utils.json_to_sheet(tableData2.map(([skch, count], index) => ({
    'SI no.': (currentPage2 - 1) * itemsPerPage2 + index + 1,
    'Reasons': skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase(),
    'Number of Rejections': count,

  })), { header: ['SI no.', 'Reasons', 'Number of Rejections'] });
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Type of Reasons Rejections");
  XLSX.writeFile(workbook, `Type_of_Reasons_Rejections.xlsx`);
}
else if(worksheet === "Problems Arised Rejections"){
  const worksheet3 = XLSX.utils.json_to_sheet(tableData3.map(([skch, count], index) => ({
    'SI no.': (currentPage3 - 1) * itemsPerPage3 + index + 1,
    'Problem Arised': skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase(),
    'Number of Rejections': count,

  })), { header: ['SI no.', 'Problem Arised', 'Number of Rejections'] });
  XLSX.utils.book_append_sheet(workbook, worksheet3, "Problems Arised Rejections");
  XLSX.writeFile(workbook, `Problems_Arised_Rejections.xlsx`);
}
  
};


  const handlePieChange = (event, elements) => {
    if (elements.length > 0) {
      const clickedElementIndex = elements[0].index; // Get the clicked slice's index
      const clickedLabel = chartData2.labels[clickedElementIndex]; // Get the label of the clicked slice
  
      console.log("Clicked Label:", clickedLabel);
  
      // Filter the data based on the clicked label
      const deptData = overAllData.filter(
        (data) => data.ToDept === clickedLabel
      );

      const totalDataCount = overAllData.reduce((sum, item) => sum + item.COUNT, 0);
      const deptDataPer = deptData.reduce((sum, item) => sum + item.COUNT, 0);

      const percentage1 = ((deptDataPer / totalDataCount) * 100).toFixed(2) + "%";

      console.log(percentage1);
      // Navigate to the desired route with state
      navigate("/rejections/dept_rejections", {
        state: { clickedLabel, deptData , percentage1},
      });
    } else {
      console.warn("No elements were clicked");
    }
  };
  

  const optionschartPie = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            // Customize tooltip if needed
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    onClick: (event, elements) => handlePieChange(event, elements),
    maintainAspectRatio: false,
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
      if(status === "Problem"){
        navigate("/rejections/problem_arised", {
          state: { skch, overAllData},
        });
        console.log(skch);
        console.log(overAllData);
      }
      else {
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

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState({ from: 1, to: 31 });
  const [monthRange, setMonthRange] = useState({ from: 1, to: 12 });
  const [yearRange, setYearRange] = useState({ from: 2000, to: 2024 });
  const [filterApplied, setFilterApplied] = useState(false);
  
  useEffect(() => {
    if (filterApplied) {
      fetchUploads(); // Only fetch when filter is applied
    }
  }, [filterApplied]);
  
  const handleFilterClick = () => {
    setShowDatePickerModal(true); // Show the date picker modal
  };
  
  const handleCancelFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterApplied(false);
    setShowDatePickerModal(false);
    
  };
  

  const handleRangeChange = useCallback((rangeType, fromValue, toValue) => {
    if (rangeType === 'date') {
      setDateRange({from: fromValue, to: toValue });
    } else if (rangeType === 'month') {
      setMonthRange({from: fromValue, to: toValue });
    } else if (rangeType === 'year') {
      setYearRange({ from: fromValue, to: toValue });
    }
  }, []);
  
  
  const handleApplyFilter = () => {
    const newStartDate = `${yearRange.from}-${monthRange.from}-${dateRange.from}`;
    const newEndDate = `${yearRange.to}-${monthRange.to}-${dateRange.to}`;
  
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  
    setFilterApplied(true); // Mark filter as applied
    console.log("Start Date:", newStartDate, "End Date:", newEndDate);
    
    setShowDatePickerModal(false);
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

          </div>

          {/* Date Picker Modal */}
          {showDatePickerModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
              <div className="bg-white w-96 mx-auto pl-10 py-4 rounded-xl">
                <p className="font-bold">Date range</p>
                <RangeSlider
                  min={0}
                  max={31}
                  onRangeChange={(from, to) => handleRangeChange("date", from, to)}
                />
                <p className="font-bold">Month range</p>
                <RangeSlider
                  min={0}
                  max={12}
                  onRangeChange={(from, to) => handleRangeChange("month", from, to)}
                />
                <p className="font-bold">Year range</p>
                <RangeSlider
                  min={1999}
                  max={2024}
                  onRangeChange={(from, to) => handleRangeChange("year", from, to)}
                />

                <div>
                  <h4 className="font-bold">Selected Ranges:</h4>
                  <p>{dateRange.from}/{monthRange.from}/{yearRange.from} - {dateRange.to}/{monthRange.to}/{yearRange.to}</p>
                </div>

                <div className="flex justify-between mt-4 mr-10">
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
        {message !=="" ?<p>{message}</p>: 
        <div>
        <div className="flex">
          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
            <h1 className="text-lg font-semibold p-2 pl-10">
              Rejection Counts Based on Year
            </h1>
            <div className=" px-10">
              {chartData ? (
                <Bar data={chartData} options={chartOptions}/>
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
              <div style={{ height: "300px",marginBottom: "20px"}}> {/* Set your desired dimensions */}
                <Pie data={chartData2} options={{ 
                  ...optionschartPie, 
                  ...chartOptions2,
                  maintainAspectRatio: false // Disable aspect ratio for custom size
                }} />
              </div>
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
                        formatter: (value, context) => {
                          const totalDataCount = overAllData.reduce((sum, item) => sum + item.COUNT, 0);
                          const percentage = ((value / totalDataCount) * 100).toFixed(2);
                          return `${value} (${percentage}%)`;
                        },
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
                          const totalDataCount = overAllData.reduce((sum, item) => sum + item.COUNT, 0);
                            // const percentage = ((value / totalDataCount) * 100).toFixed(2) + "%";
                            const value = context.raw;
                            const percentage = ((value / totalDataCount) * 100).toFixed(2) + "%";
                            return `${context.raw.toFixed(2)} ${percentage}`;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Months",
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
                          text: "Count",
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
                <Bar data={chartData4} options={chartOptions4}/>
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
                <div className="flex justify-between">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Top <span className="text-red-500">25</span> Rejected Sketches
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
                <div className="flex justify-between">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Top <span className="text-red-500"> Type of Reasons</span>{" "}
                  Rejections
                </h1>
                <div className="m-4">
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
              onClick={() => downloadExcel("Type of Reasons Rejections")}
            >
              Download as Excel
            </button>
            </div>
                </div>

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
                      <th className="py-3 text-center font-semibold text-base">Detailed View</th>
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
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData, "Problem")} disabled={!overAllData} > View </button>
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
        </div> 
      }

      </div>
    </div>
  );
}

export default Reject;
