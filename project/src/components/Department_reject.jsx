import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import axios from "axios";
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

  const location = useLocation();
  const { clickedLabel,deptData } = location.state || {};

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

  const [tableViewStatus, settableViewStatus]= useState('');

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [overAllData, setoverAllData] = useState(null)

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
    return colors.map(color => color.replace(/0\.\d+\)/, '1)'));
  };


  const fetchUploads = async () => {
    try {
      // const response = await axios.get(
      //   "http://localhost:5000/api/rejection/uploads"
      // );
      const data = deptData;
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

              // Setting unique Raised Departments and their counts
        const uniqueskch = [...new Set(data.map((item) => item.RaisedDept))];

        // Summing up the COUNT for each Raised Department
        const counts2 = uniqueskch.map((dept) => {
          const deptData = data.filter((item) => item.RaisedDept === dept);
          return deptData.reduce((total, item) => total + item.COUNT, 0);
        });

        // Setting the chart data
        setChartData2({
          labels: uniqueskch, // Labels for Raised Departments
          datasets: [
            {
              label: "Based on the Raised Departments",
              data: counts2, // Data for each department
              backgroundColor: colors.slice(0, counts2.length), // Dynamically set colors
              borderColor: borderColors.slice(0, counts2.length), // Dynamically set border colors
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
            backgroundColor: colors.slice(0, uniqueMonths.length)[index],
              borderColor: borderColors.slice(0, uniqueMonths.length)[index],
              borderWidth: 1,
            tension: 0.1,
          })),
        });
      } else {
        console.warn("No data available");
      }

      const uniquetypeOfReason = [...new Set(data.map((reason)=>reason.TypeOfReason.toLowerCase().trim()))]


      const reasonCount = uniquetypeOfReason.map((reason)=>{
        const filteredData = data.filter((item)=>item.TypeOfReason.toLowerCase().trim() === reason);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })

      // console.log(reasonCount);

      const borderColors = getBorderColors(colors);     
      setChartData4({
        labels: uniquetypeOfReason,
        datasets: [
          {
            label: "Based on the Rasied Departments",
            data: reasonCount,
            backgroundColor: colors.slice(0, uniquetypeOfReason.length),  
            borderColor: borderColors.slice(0, uniquetypeOfReason.length), 
            borderWidth: 1,
          },
        ],
      });

      /// Sketch table data
      const skchTableData = [...new Set(data.map((skch)=>skch.SketchNo))]
      const skchCount = skchTableData.map((skch)=>{
        const filteredData = data.filter((item)=> item.SketchNo === skch);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })
      
      const result = Object.fromEntries(skchTableData.map((key, index) => [key, skchCount[index]]));

      const sortedEntries = Object.entries(result).sort(([, a], [, b]) => b - a);

      const finalvalue = sortedEntries.slice(0, 25);

      // console.log("Top 25 Sorted Entries:", finalvalue);


      setTableData1(finalvalue)

      // Type of reason table
      const reasonTableData = [...new Set(data.map((reason)=>reason.TypeOfReason.toLowerCase().trim()))]
      const reasonTableCount = reasonTableData.map((reason)=>{
        const filteredData = data.filter((item)=> item.TypeOfReason.toLowerCase().trim() === reason);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })
      
      const reasonTableresult = Object.fromEntries(reasonTableData.map((key, index) => [key, reasonTableCount[index]]));

      const reasonTablesortedEntries = Object.entries(reasonTableresult).sort(([, a], [, b]) => b - a);

      // const reasonTablefinalvalue = reasonTablesortedEntries.slice(0, 25);

      setTableData2(reasonTablesortedEntries)
      // console.log("Top Entries:", tableData2);

       // Problem Arised Table
       const probTableData = [...new Set(data.map((reason)=>reason.ProblemArised2.toLowerCase().trim()))]
       const probTableCount = probTableData.map((reason)=>{
         const filteredData = data.filter((item)=> item.ProblemArised2.toLowerCase().trim() === reason);
         return filteredData.reduce((total,item)=>total+item.COUNT,0);
       })
       
       const probTableresult = Object.fromEntries(probTableData.map((key, index) => [key, probTableCount[index]]));
 
       const probTablesortedEntries = Object.entries(probTableresult).sort(([, a], [, b]) => b - a);
 
       // const reasonTablefinalvalue = reasonTablesortedEntries.slice(0, 25);
 
       setTableData3(probTablesortedEntries)


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

 
  const optionschart2 = {
    
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
    }};

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
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
          <h1 className="font-bold text-xl">Rejected Details of <span className='text-[#879FFF] text-2xl'>{clickedLabel}</span> Department</h1>
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

        {/* Main content */}
        {/* <div className="p-4">
          <div><pre>{JSON.stringify(deptData, null, 2)}</pre></div>
        </div> */}

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

          <div className="bg-white w-1/2 m-6 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2 pl-10">Rejections Count by Department</h1>
            <div className="px-10">
              {chartData2 ? (
                <Bar data={chartData2} options={optionschart2}/>
              ) : (
                <p className="text-center text-gray-500">
                  Loading chart data...
                </p>
              )}
            </div>
            
          </div>
        </div>
        <div className="flex">
          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Rejections Count by Month</h1>
            
            <div className="chart-container "style={{ height: '300px' }}>
            {chartData3 ? (
    <Bar
      data={chartData3}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', 
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
            display: true,  // Show legend
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.raw.toFixed(2)}`;  // Custom tooltip formatting
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Count By months",  // X-axis title
            },
            beginAtZero: true,
            grid: {
              display: true,
            },
          },
          y: {
            title: {
              display: true,
              text: "Year",  // Y-axis title
            },
            ticks: {
              autoSkip: true,
            },
            grid: {
              display: true,
            },
          },
        },
      }}
      plugins={[ChartDataLabels]}
    />
  ) : (
    <p>Loading chart data...</p>
  )}
            </div>
          </div>
          <div className="bg-white w-1/2 m-6 px-10 border rounded-lg border-gray-300 shadow-lg">
          <h1 className="text-lg font-semibold p-2">Reasons for Rejections</h1>
          {/* <div className="chart-container">
              {chartData4 ? (
                <Pie data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div> */}
            <div className="chart-container">
              {chartData4 ? (
                <Bar data={chartData4}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
        </div>
        <div className="m-6 px-10 border rounded-lg border-gray-300 bg-white shadow-lg">
<h1 className="text-xl font-semibold pt-5">Detailed Top <span className="text-red-500">Rejections</span> </h1>

       {/* Accordion Sketches */}
       <div className="border-b border-slate-200">
        <button
          onClick={() => toggleAccordion(1)}
          className="w-full flex justify-between items-center py-5 text-slate-800"
        >
          <span className="text-lg font-semibold">Based on Sketches</span>
          <span className="text-slate-800 transition-transform duration-300">
            {activeIndex === 1 ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
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
        <h1 className="text-xl font-semibold p-2 pl-10 py-5">Top <span className="text-red-500">25</span> Rejected Sketches</h1>

  <table className="w-full table-auto text-sm ">
    <thead >
      <tr className="bg-gray-300 text-gray-700 ">
        <th className="px-6 py-3 text-center font-semibold text-base">SI no.</th>
        <th className="px-6 py-3 text-center font-semibold text-base">Sketch IDs</th>
        <th className="py-3 text-center font-semibold text-base">Number of Rejections</th>
        <th className="py-3 text-center font-semibold text-base">Detailed View</th>
      </tr>
    </thead>
    <tbody>
      {currentData.map(([skch, count], index) => (
        <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200" >
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{(currentPage1 - 1) * itemsPerPage + index + 1}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{skch}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData, "Sketch")} disabled={!overAllData} > View </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>  
  {/* Pagination Controls */}
  <div className="flex justify-center space-x-2 m-4 ">
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage1 === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={() => handlePageChange(currentPage1 - 1)}
          disabled={currentPage1 === 1}
        >
          Previous
        </button>
        
      
          <button
            className="text-base px-5 py-3 rounded-lg border bg-gray-300"
          >
            {currentPage1}
          </button>
      
        
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage1 === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
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
        <span className="text-lg font-semibold">Based on Type of Reasons</span>

          <span className="text-slate-800 transition-transform duration-300">
            {activeIndex === 2 ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
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
        <h1 className="text-xl font-semibold p-2 pl-10 py-5">Top <span className="text-red-500"> Type of Reasons</span> Rejections</h1>

  <table className="w-full table-auto text-sm ">
    <thead >
      <tr className="bg-gray-300 text-gray-700 ">
        <th className="px-6 py-3 text-center font-semibold text-base">SI no.</th>
        <th className="px-6 py-3 text-center font-semibold text-base">Reasons</th>
        <th className="py-3 text-center font-semibold text-base">Number of Rejections</th>
        <th className="py-3 text-center font-semibold text-base">Detailed View</th>
      </tr>
    </thead>
    <tbody>
      {currentData2.map(([skch, count], index) => (
        <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200" >
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{(currentPage2 - 1) * itemsPerPage2 + index + 1}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{skch}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData, "Rejection")} disabled={!overAllData} > View </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>  

  <div className="flex justify-center space-x-2 m-4 ">
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage2 === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={() => handlePageChange2(currentPage2 - 1)}
          disabled={currentPage2 === 1}
        >
          Previous
        </button>
        
      
          <button
            className="text-base px-5 py-3 rounded-lg border bg-gray-300"
          >
            {currentPage2}
          </button>
      
        
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage2 === totalPages2 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
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
        <span className="text-lg font-semibold">Based on Problem Arised</span>

          <span className="text-slate-800 transition-transform duration-300">
            {activeIndex === 3 ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
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
        <h1 className="text-xl font-semibold p-2 pl-10 py-5">Top <span className="text-red-500">Problems Arised</span> for Rejection</h1>

  <table className="w-full table-auto text-sm ">
    <thead >
      <tr className="bg-gray-300 text-gray-700 ">
        <th className="px-6 py-3 text-center font-semibold text-base">SI no.</th>
        <th className="px-6 py-3 text-center font-semibold text-base">Problem Arised</th>
        <th className="py-3 text-center font-semibold text-base">Number of Rejections</th>
        <th className="py-3 text-center font-semibold text-base">Detailed View</th>
      </tr>
    </thead>
    <tbody>
      {currentData3.map(([skch, count], index) => (
        <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200" >
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{(currentPage3 - 1) * itemsPerPage3 + index + 1}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{skch.charAt(0).toUpperCase() + skch.slice(1).toLowerCase()}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData, "Problem")}  disabled={!overAllData} > View </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>  
  {/* Pagination Controls */}
  <div className="flex justify-center space-x-2 m-4 ">
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage3 === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
          onClick={() => handlePageChange3(currentPage3 - 1)}
          disabled={currentPage3 === 1}
        >
          Previous
        </button>
        
      
          <button
            className="text-base px-5 py-3 rounded-lg border bg-gray-300"
          >
            {currentPage3}
          </button>
      
        
        <button
          className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage3 === totalPages3 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'}`}
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
    </div>
  );
}

export default Department_reject;
