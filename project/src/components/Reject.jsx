import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
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
// ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

function Reject() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploads, setUploads] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [chartData2, setChartData2] = useState(null);
  const [chartData3, setChartData3] = useState(null);
  const [chartData4, setChartData4] = useState(null);
  const [tableData, setTableData] = useState([]);

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

  const fetchUploads = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/rejection/uploads"
      );
      const data = response.data;
      setoverAllData(data);

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
              label: "Based on the Rasied Departments",
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
            backgroundColor: backgroundColors.slice(0, uniquetypeOfReason.length), // Use only needed colors
            borderColor: "#8679f7",
            borderWidth: 1,
          },
        ],
      });

      const skchTableData = [...new Set(data.map((skch)=>skch.SketchNo))]
      const skchCount = skchTableData.map((skch)=>{
        const filteredData = data.filter((item)=> item.SketchNo === skch);
        return filteredData.reduce((total,item)=>total+item.COUNT,0);
      })
      
      const result = Object.fromEntries(skchTableData.map((key, index) => [key, skchCount[index]]));

const sortedEntries = Object.entries(result).sort(([, a], [, b]) => b - a);

const finalvalue = sortedEntries.slice(0, 25);

console.log("Top 25 Sorted Entries:", finalvalue);


      setTableData(finalvalue)
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
      const clickedElementIndex = elements[0].index; // Get the index of the clicked bar
      const clickedLabel = chartData2.labels[clickedElementIndex]; // Get the label of the clicked bar
  
      console.log("Clicked Label:", clickedLabel);

      const deptData = overAllData.filter((data)=>data.ToDept === clickedLabel)
      // Navigate to another page, passing the clicked label
      navigate('/dep_rejections',{
        state:{clickedLabel,deptData},
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  // Get the data for the current page
  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Function to handle page changes

  

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
          <h1 className="font-bold text-xl">Rejections Overview</h1>
          <button
            className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            View Uploaded History
          </button>
        </div>

        <div className="upload-container pt-10">
          <label
            htmlFor="uploadFile1"
            className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 mb-2 fill-gray-500"
              viewBox="0 0 32 32"
            >
              <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
              <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
            </svg>
            Import New Rejection file
            <input
              type="file"
              id="uploadFile1"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileChange}
            />
            <p className="text-xs font-medium text-gray-400 mt-2">
              .xlsx file formats are only allowed.
            </p>
          </label>
          {message && <p className="my-2 text-green-500">{message}</p>}
          <p className="mt-2 text-gray-500 text-center">{currentTime}</p>
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
          <div className="bg-white w-1/2 m-6 px-10">
          <h1 className="text-lg font-semibold p-2">Rejections Count by Month</h1>
            
            <div className="chart-container">
              {chartData3 ? (
                <Bar data={chartData3}  />
              ) : (
                <p>Loading chart data...</p>
              )}
            </div>
          </div>
          <div className="bg-white w-1/2 m-6 px-10">
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
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{(currentPage - 1) * itemsPerPage + index + 1}</td>
          <td className="px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base">{skch}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{count}</td>
          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
            <button  className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`} onClick={() => handleTableClick(skch, overAllData)} disabled={!overAllData} > View </button>
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

      </div>
    </div>
  );
}

export default Reject;
