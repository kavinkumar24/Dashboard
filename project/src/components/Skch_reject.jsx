import React, { useState, useEffect } from 'react';
import { useCallback,useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import Header from './Header';
import MultiRangeSlider from "./MultiRangeSlider";

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
  elements,
  ArcElement,
} from "chart.js";



ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


function Skch_reject() {
  const location = useLocation();
  const { skch, skchData } = location.state || {};

  const [theme, setTheme] = useState("light"); 
  const [search, setSearch] = useState("");
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [chartData5, setChartData5] = useState(null);
  const [chartData6, setChartData6] = useState(null);
  const [tableData, setTableData] = useState([]);
          

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
    //   const response = await axios.get(
    //     "http://localhost:5000/api/rejection/uploads"
    //   );
      const data = skchData;


      if (data && data.length > 0) {
        const uniqueYears = [...new Set(data.map((item) => item.Yr))];
        const Yearcounts = uniqueYears.map((year) => {
          const yearData = data.filter((item) => item.Yr === year);
          return yearData.reduce((total, item) => total + item.COUNT, 0);
        });

        setChartData({
          labels: uniqueYears,
          datasets: [
            {
              label: "Counts by Year",
              data: Yearcounts,
              backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
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
              label: "Based on the To Departments",
              data: counts2,
              backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
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
            backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
              borderWidth: 1,
            tension: 0.1,
          })),
        });
      } else {
        console.warn("No data available");
      }

      const uniquetypeOfReason = [...new Set(data.map((reason)=>reason.TypeOfReason.toLowerCase()))]


      const reasonCount = uniquetypeOfReason.map((reason)=>{
        const filteredData = data.filter((item)=>item.TypeOfReason.toLowerCase() === reason);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })

      console.log(reasonCount);

      const backgroundColors = [
        "#FF6384", // Red
        "#36A2EB", // Blue
        "#FFCE56", // Yellow
        "#4BC0C0", // Teal
        "#9966FF", // Purple
        "#FF9F40", // Orange
        "#7E57C2", // Deep Purple
        "#FF7043", // Deep Orange
        "#FF7043",
        "#FF7043",
        "#FF7043",
        "#FF7043",
      ];
      
      setChartData4({
        labels: uniquetypeOfReason,
        datasets: [
          {
            label: "Based on the Rasied Departments",
            data: reasonCount,
            backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
            borderWidth: 1,
          },
        ],
      });

      const uniqueRaisedDept = [...new Set(data.map((reason)=>reason.RaisedDept))]


      const RaisedDeptCount = uniqueRaisedDept.map((reason)=>{
        const filteredData = data.filter((item)=>item.RaisedDept === reason);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })
      setChartData5({
        labels: uniqueRaisedDept,
        datasets: [
          {
            label: "Based on the Rasied Departments",
            data: RaisedDeptCount,
            backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
            borderWidth: 1,
          },
        ],
      });

      const uniqueProblemArised2 = [...new Set(data.map((reason)=>reason.ProblemArised2))]


      const ProblemArised2Count = uniqueProblemArised2.map((reason)=>{
        const filteredData = data.filter((item)=>item.ProblemArised2 === reason);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })
      setChartData6({
        labels: uniqueProblemArised2,
        datasets: [
          {
            label: "Based on the Rasied Departments",
            data:ProblemArised2Count,
            backgroundColor: "#c3bdf7",
              borderColor: "#8679f7",
            borderWidth: 1,
          },
        ],
      });



    } catch (error) {
      console.error("Error fetching uploads:", error);
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Get the data for the current page
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleTableClick = (skch, overAllData) => {

    const skchData = overAllData.filter((data)=> data.SketchNo === skch);

    if (skchData) {
      navigate('/sketch_rejections', {
        state: { skch, skchData }
      });
      console.log(skchData)
    } else {
      console.log('Data is not available yet');
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
        
        <div className="flex justify-between mx-4 mt-4">
          <h1 className="font-bold text-xl">
            Rejected Sketch ID - <span className='text-[#879FFF] text-2xl'>{skch}</span>
          </h1>
          <button
            className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            Export the Data
          </button>
        </div>


        <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
        <h1 className="text-lg font-semibold p-2 pl-10 py-5">Detailed View of <span className='text-red-400'>{skch}</span></h1>

  <table className="w-full table-auto text-sm ">
    <thead >
      <tr className="bg-gray-300 text-gray-700 ">
      <th className="py-3 text-center font-semibold text-base">SI no</th>
        <th className="py-3 text-center font-semibold text-base">RaisedDate</th>
        <th className="py-3 text-center font-semibold text-base">RaisedDept</th>
        <th className="py-3 text-center font-semibold text-base">ToDept</th>
        <th className="py-3 text-center font-semibold text-base">TypeOfReason</th>
        <th className="py-3 text-center font-semibold text-base">ProblemArised</th>
      </tr>
    </thead>
    <tbody>
      {tableData.map(([skch, count], index) => (
        <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200" >
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{(currentPage - 1) * itemsPerPage + index + 1}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{skch}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          
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
          <div className="bg-white w-1/2 m-6 ">
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

          <div className="bg-white w-1/2 m-6 ">
          <h1 className="text-lg font-semibold p-2 pl-10">Rejections Count by Month</h1>
            <div className="px-10">
              {chartData3 ? (
                <Bar data={chartData3} />
              ) : (
                <p className="text-center text-gray-500">
                  Loading chart data...
                </p>
              )}
            </div>
            
          </div>
        </div>
        <div className="flex">
          <div className="bg-white w-1/2 m-6 px-10">
          <h1 className="text-lg font-semibold p-2">Rejections Count by To Department </h1>
            
            <div className="chart-container">
              {chartData2 ? (
                <Bar data={chartData2} options={optionschart2} />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
          <div className="bg-white w-1/2 m-6 px-10">
          <h1 className="text-lg font-semibold p-2">Rejections Count by Raised Department </h1>
          {/* <div className="chart-container">
              {chartData4 ? (
                <Pie data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div> */}
            <div className="chart-container">
              {chartData5 ? (
                <Bar data={chartData5}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="bg-white w-1/2 m-6 px-10">
          <h1 className="text-lg font-semibold p-2">Reasons for Rejection </h1>
            
            <div className="chart-container">
              {chartData4 ? (
                <Bar data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
          <div className="bg-white w-1/2 m-6 px-10">
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
  );
}

export default Skch_reject;
