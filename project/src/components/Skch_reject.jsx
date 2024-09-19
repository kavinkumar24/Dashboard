import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

import ChartDataLabels from "chartjs-plugin-datalabels";

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


function Skch_reject() {
  const location = useLocation();
  const { skch, overAllData, status } = location.state || {};
  const [search, setSearch] = useState(null);
  const [theme, setTheme] = useState("light");
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [chartData5, setChartData5] = useState(null);
  const [chartData6, setChartData6] = useState(null);
  const [tableData, setTableData] = useState([]);

  
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
    return colors.map(color => color.replace(/0\.\d+\)/, '1)'));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      // Filtering data based on status
      let filteredData;
      if (status === "Sketch") {
        filteredData = overAllData.filter(data => data.SketchNo === skch);
      } else if (status === "Rejection") {
        filteredData = overAllData.filter(data => data.TypeOfReason.toLowerCase().trim() === skch);
      }

      // setData(filteredData || []);
      console.log(filteredData);
      setTableData(filteredData || []);
      if (filteredData.length > 0) {
        generateChartData(filteredData);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching uploads:", error);
    }
  };

  
  // Function to generate chart data
  const generateChartData = (data) => {
    const borderColors = getBorderColors(colors);

    const uniqueYears = [...new Set(data.map(item => item.Yr))];
    const Yearcounts = uniqueYears.map(year => {
      const yearData = data.filter(item => item.Yr === year);
      return yearData.reduce((total, item) => total + item.COUNT, 0);
    });

    setChartData({
      labels: uniqueYears,
      datasets: [{
        label: "Counts by Year",
        data: Yearcounts,
        backgroundColor: colors.slice(0, Yearcounts.length),
        borderColor: borderColors.slice(0, Yearcounts.length),
        borderWidth: 1,
      }],
    });

    const uniqueDepts = [...new Set(data.map(item => item.ToDept))];
    const DeptCounts = uniqueDepts.map(dept => {
      const deptData = data.filter(item => item.ToDept === dept);
      return deptData.reduce((total, item) => total + item.COUNT, 0);
    });

    setChartData2({
      labels: uniqueDepts,
      datasets: [{
        label: "Counts by To Dept",
        data: DeptCounts,
        backgroundColor: colors.slice(0, DeptCounts.length),
        borderColor: borderColors.slice(0, DeptCounts.length),
        borderWidth: 1,
      }],
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
    const uniqueReasons = [...new Set(data.map(item => item.TypeOfReason.toLowerCase().trim()))];
    const reasonCounts = uniqueReasons.map(reason => {
      const filteredData = data.filter(item => item.TypeOfReason.toLowerCase().trim() === reason);
      return filteredData.reduce((total, item) => total + item.COUNT, 0);
    });

    setChartData4({
      labels: uniqueReasons,
      datasets: [{
        label: "Counts by Reason",
        data: reasonCounts,
        backgroundColor: colors.slice(0, uniqueReasons.length),  
        borderColor: borderColors.slice(0, uniqueReasons.length),
        borderWidth: 1,
      }],
    });

    const uniqueRaisedDept = [...new Set(data.map(item => item.RaisedDept))];
    const raisedDeptCounts = uniqueRaisedDept.map(dept => {
      const filteredData = data.filter(item => item.RaisedDept === dept);
      return filteredData.reduce((total, item) => total + item.COUNT, 0);
    });
    
    setChartData5({
      labels: uniqueRaisedDept, // X-axis labels (Raised Departments)
      datasets: [{
        label: "Counts by Raised Dept",
        data: raisedDeptCounts, // Y-axis data (Counts)
        fill: false, // No fill under the line
        backgroundColor: "rgba(54, 162, 235, 0.2)",  
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2, // Line width
        tension: 0.1, // Curved line for smoothness
      }],
    });
    

    const uniqueProblemArised = [...new Set(data.map(item => item.ProblemArised2))];
    const problemArisedCounts = uniqueProblemArised.map(problem => {
      const filteredData = data.filter(item => item.ProblemArised2 === problem);
      return filteredData.reduce((total, item) => total + item.COUNT, 0);
    });
    
    // Combine problems and counts into an array of objects and sort by count
    const sortedProblemData = uniqueProblemArised
      .map((problem, index) => ({
        problem,
        count: problemArisedCounts[index],
      }))
      .sort((a, b) => b.count - a.count); // Sort in descending order
    
    // Extract sorted problems and counts
    const sortedProblems = sortedProblemData.map(item => item.problem);
    const sortedCounts = sortedProblemData.map(item => item.count);
    
    setChartData6({
      labels: sortedProblems, // Sorted labels for Problem Arised
      datasets: [{
        label: "Counts by Problem Arised",
        data: sortedCounts, // Sorted counts
        backgroundColor: colors.slice(0, sortedProblems.length),  
        borderColor: borderColors.slice(0, sortedProblems.length),
        borderWidth: 1,
      }],
    });
    
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF(); // Create a new jsPDF instance

    // Capture the main div containing the charts and tables
    const content = document.querySelector('#pdf-content'); // This ID should wrap your entire content

    // Convert the content to canvas
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');

    // Add the image to the PDF
    const imgWidth = 190; // Adjust width to fit the page
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

    // Save the PDF
    doc.save(`${skch}_data.pdf`);
  };

  const [currentPage, setCurrentPage1] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage1(newPage);
    }
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
<div id="pdf-content"> 
        <div className="flex justify-between mx-4 mt-4">
          {status === "Sketch" ? 
          <h1 className="font-bold text-xl">
          Overview of Rejected Sketch ID - <span className='text-[#879FFF] text-2xl'>{skch}</span>
        </h1>
          : 
          <h1 className="font-bold text-xl">
          Overview of Rejected Type of Reason - <span className='text-[#879FFF] text-2xl'>{skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase()}</span>
        </h1>}
          
          <button
            className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
            onClick={handleExportPDF}
          >
            Export the Data
          </button>
        </div>


        <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">

        {status === "Sketch" ? 
        <h1 className="text-lg font-semibold p-2 pl-10 py-5">Detailed View of Sketch ID <span className='text-red-400'>{skch}</span></h1>
          :  
          <h1 className="text-lg font-semibold p-2 pl-10 py-5">Detailed View of Type Of Reason <span className='text-red-400 text-xl'>{skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase()}</span></h1>
        }


        <table className="w-full table-auto text-sm ">
    <thead> 
      <tr className="bg-gray-300 text-gray-700">
        <th className="py-3 text-center font-semibold text-base">SI no</th>
        <th className="py-3 text-center font-semibold text-base">RaisedDate</th>
        <th className="py-3 text-center font-semibold text-base">RaisedDept</th>
        <th className="py-3 text-center font-semibold text-base">ToDept</th>
        {status === "Sketch"? <th className="py-3 text-center font-semibold text-base">TypeOfReason</th> : <th className="py-3 text-center font-semibold text-base">Sketch ID</th>}
        <th className="py-3 text-center font-semibold text-base">ProblemArised</th>
      </tr>
    </thead>
    <tbody>
      {currentData.map((item, index) => (
        <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200">
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {item.RaisedDate}
          </td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {item.RaisedDept}
          </td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {item.ToDept}
          </td>
          {status === "Sketch" ? 
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
          {item.TypeOfReason}
        </td>
        :
        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {item.SketchNo}
          </td>
        }
          
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            {item.ProblemArised}
          </td>
        </tr>
      ))}
    </tbody>
  </table> 
  {/* Pagination Controls */}
  <div className="flex justify-center space-x-2 m-4 ">
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        
      
          <button
            className="text-base px-5 py-3 rounded-lg border bg-gray-300"
          >
            {currentPage}
          </button>
      
        
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
</div>



        <div className="flex">
          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2 pl-10">Rejection Counts Based on Year</h1>
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

          <div className="bg-white w-1/2 mx-auto my-6 mr-6 border border-gray-300 rounded-lg shadow-lg">
  <h1 className="text-xl font-bold text-left text-gray-700 mb-4 px-6">Rejections Count by Month</h1>
  
  <div className="px-6 " style={{ height: '300px' }}>
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
              color: "black",
              font: {
                weight: "normal",
              },
            },
            legend: {
              display: true,
              position: "top",
              labels: {
                boxWidth: 15,
                padding: 10,
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
                color: "#555",
                font: {
                  size: 14,
                },
              },
              beginAtZero: true,
              grid: {
                display: true,
                color: "#eee",
              },
            },
            y: {
              title: {
                display: true,
                text: "Year",
                color: "#555",
                font: {
                  size: 14,
                },
              },
              ticks: {
                autoSkip: true,
              },
              grid: {
                display: true,
                color: "#eee",
              },
            },
          },
        }}
        plugins={[ChartDataLabels]}
      />
    ) : (
      <p className="text-gray-500 text-center">Loading chart data...</p>
    )}
  </div>
</div>

        </div>
        <div className="flex">
          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Rejections Count by To Department </h1>
            
            <div className="chart-container">
              {chartData2 ? (
                <Bar data={chartData2} />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Rejections Count by Raised Department </h1>
            <div className="chart-container">
              {chartData5 ? (
                <Line data={chartData5}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Reasons for Rejection </h1>
            
            <div className="chart-container">
              {chartData4 ? (
                <Bar data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div> */}
          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Problem Arised for Rejections</h1>
          {/* <div className="chart-container">
              {chartData4 ? (
                <Pie data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div> */}
            <div className="chart-container">
              {chartData6 ? (
                <Bar data={chartData6}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
        </div>

{/* //////////////////////////////////////////// */}

{/* <div className="flex flex-col items-center justify-center space-y-8 p-4">
      <MultiRangeSlider min={1} max={31} label="Day Range" />
      <MultiRangeSlider min={1} max={12} label="Month Range" />
      <MultiRangeSlider min={2000} max={2024} label="Year Range" />
    </div> */}

{/* /////////////////////////////////////////////// */}

        {/* Main content */}
        {/* <div className="p-4">
          <div><pre>{JSON.stringify(skchData, null, 2)}</pre></div>
        </div> */}
      </div>
    </div>
    </div>

  );
}

export default Skch_reject;
