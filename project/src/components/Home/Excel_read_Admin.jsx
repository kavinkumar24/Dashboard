import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import axios from "axios";
function Dashboard() {
  const [productionData, setProductionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // const [pendingData, setPendingData] = useState([]);
  const [departmentData, setDepartmentData] = useState({});
  // const[avg_prod,setAvg_prod] = useState(0);
  const [pendingDepartmentData, setPendingDepartmentData] = useState({});
  const [viewData, setviewData] = useState(false);
  const [search, setSearch] = useState("");
  // const navigate = useNavigate();
  const [skeleton, setSkeleton] = useState(true);
  const [filter_on, setFilter_on] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [sortConfig, setSortConfig] = useState({
    key: "Production Qty",
    direction: "ascending",
  });
  const [uploadTime_pending, setUploadTime_pending] = useState("");
  const [uploadTimeProduction, setUploadTimeProduction] = useState("");
  const [previousDate, setPreviousDate] = useState(null);
  const [previousDayData, setPreviousDayData] = useState([]); // For the previous day data
  const [usePreviousDay, setUsePreviousDay] = useState(false); // Track whether to use previous day's data

  const [previous_production, setPrevious_production] = useState({});
  const [previous_pending, setPrevious_pending] = useState({});
  const [twodays_production, setTwodays_production] = useState(null);
  const [twodays_pending, setTwodays_pending] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8081/filtered_production_data_previous").then(
      (res) => res.json()
    );
    if (typeof data === "object" && !Array.isArray(data)) {
      const groupedPendingData = Object.keys(data).reduce((acc, dept) => {
        acc[dept] = data[dept].total_qty || 0;
        return acc;
      }, {});
      setPrevious_pending(groupedPendingData);
    }
  }, []);

  const fetchPreviousDayData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/filtered_production_data_previous"
      );
      console.log("Previous Day Data:", response.data);

      // Check if response.data is an object and not an array
      if (
        typeof response.data === "object" &&
        response.data !== null &&
        !Array.isArray(response.data)
      ) {
        const groupedPreviousDayData = Object.keys(response.data).reduce(
          (acc, dept) => {
            // Check if department exists and has total_qty
            const totalQty = response.data[dept]?.total_qty || 0; // Fallback to 0 if total_qty is missing
            acc[dept] = totalQty;
            return acc;
          },
          {}
        );

        setPrevious_production(groupedPreviousDayData); // Update the state with the grouped data
        console.log("Grouped Previous Day Data:", groupedPreviousDayData);
      } else {
        console.log(
          "Previous Day Data is not in the expected format or is empty:",
          response.data
        );
      }

      // Update other states
      setPreviousDayData(response.data); // Update raw data state
      setUsePreviousDay(!usePreviousDay); // Indicate that the previous day's data should be shown
      const date = new Date();
      date.setDate(date.getDate() - 1); // Get the previous day's date
      setPreviousDate(date.toLocaleDateString());
    } catch (error) {
      console.error("Error fetching previous day data:", error);
    }
  };

  // Helper function to combine today's and yesterday's data
  const combineData = (todayData, yesterdayData) => {
    const combined = { ...todayData };

    Object.keys(yesterdayData).forEach((dept) => {
      if (combined[dept]) {
        combined[dept].total_qty += yesterdayData[dept]?.total_qty || 0;
      } else {
        combined[dept] = yesterdayData[dept];
      }
    });

    return combined;
  };
  useEffect(() => {
    const fetchUploadTime = async () => {
      try {
        const response = await axios.get("http://localhost:8081/upload_time");
        setUploadTime_pending(response.data.uploadTime_pending);
        setUploadTimeProduction(response.data.uploadTime_production);
      } catch (error) {
        console.error("Error fetching upload time:", error);
      }
    };

    fetchUploadTime();
  }, []);

  const handleFilter = async (newFilter) => {
    setFilter_on(newFilter); // Update the filter state

    // Apply filter to the data
    const filteredProductionData =
      productionData.filter(/* logic to filter productionData based on newFilter */);
    setFilteredData(filteredProductionData);
  };

  const handleDateRangeChange = async (fromDate, toDate) => {
    try {
      const response = await axios.get(
        "http://localhost:8081/filtered_production_data",
        {
          params: {
            startDate: fromDate,
            endDate: toDate,
          },
        }
      );
      setFilteredData(response.data); // Update the filteredData state
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8081/filtered_production_data")
      .then((response) => response.json())
      .then((data) => {
        const mappedData = {};

        // Iterate through each key in the data object
        for (const key in data) {
          // Skip the 'null' key and only map valid departments
          if (key !== "null") {
            mappedData[key] = data[key]?.total_qty || 0;
          }
        }

        setProductionData(mappedData);
        console.log("Production Data:", mappedData);
      })
      .catch((error) => {
        console.error("Error fetching production data:", error);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    setSkeleton(true);
    fetch("http://localhost:8081/filtered_pending_data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Pending Data:", data);

        if (typeof data === "object" && !Array.isArray(data)) {
          const groupedPendingData = Object.keys(data).reduce((acc, dept) => {
            acc[dept] = data[dept].total_qty || 0;
            return acc;
          }, {});

          setPendingDepartmentData(groupedPendingData);

          console.log("Grouped Pending Data:", groupedPendingData);
        } else {
          console.log(
            "Pending Data is not in expected format or is empty:",
            data
          );
        }
        setSkeleton(false);
      })
      .catch((err) => console.log("Error fetching pending data:", err));
  }, []);

  const sortedData = () => {
    const sortableItems = Object.keys(productionData).map((dept) => ({
      dept,
      productionQty: usePreviousDay
        ? previous_production[dept] || 0
        : productionData[dept] || 0,
      pendingQty: usePreviousDay
        ? previous_pending[dept] || 0
        : pendingDepartmentData[dept] || 0,
    }));

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };


  // Fetch production data for two days
  const twoDaysProductionData = async () => {
    try {
      const res = await fetch("http://localhost:8081/filtered_production_data_with_date");
      const data = await res.json();
      console.log("Production Data 2 days:", data);
      setTwodays_production(data);
    } catch (err) {
      console.error("Error fetching Production data:", err);
    }
  };
  
  // Fetch pending data for two days
  const twoDaysPendingData = async () => {
    try {
      const res = await fetch("http://localhost:8081/filtered_pending_data_with_date");
      const data = await res.json();
      console.log("Pending Data 2 days:", data);
      setTwodays_pending(data);
    } catch (err) {
      console.error("Error fetching pending data:", err);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    twoDaysProductionData();
    twoDaysPendingData();
  }, []);
  
  // Log updated state values when they change, but only after the data is loaded
  useEffect(() => {
    if (twodays_production) {
      console.log("Updated 2 days production data:", twodays_production);
    }
  }, [twodays_production]);
  
  useEffect(() => {
    if (twodays_pending) {
      console.log("Updated 2 days pending data:", twodays_pending);
    }
  }, [twodays_pending]);
  
  
  
  // Get today's date
const today = new Date();
const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

// Get yesterday's date
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const yesterdayFormatted = `${String(yesterday.getDate()).padStart(2, '0')}/${String(yesterday.getMonth() + 1).padStart(2, '0')}/${yesterday.getFullYear()}`;

  
  const renderTable = () => (
    
    <div>
      {/* <div className="flex justify-center items-center h-full">
        <div
          className={`p-2 rounded-lg shadow-md flex flex-col justify-center items-center m-0 w-[50%] 
          ${
            theme === "light"
              ? "bg-white text-gray-700"
              : " bg-gray-900 text-gray-300"
          }`}
        >
          <button
            onClick={fetchPreviousDayData}
            className={`mb-4 w-full p-3 ${
              usePreviousDay ? "bg-gray-300" : "bg-none"
            }`}
          >
            Fetch Previous Day Data
          </button>

          {previousDate && ( // Render the date if it exists
            <h2
              className={`text-lg mb-2 ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}
            >
              Previous Day Data: {previousDate}
            </h2>
          )}

          <table
            className={`w-[100%] text-sm text-left 
            ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}
          >
            <thead
              className={`text-base uppercase 
              ${
                theme === "light"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              <tr>
                <th scope="col" className="px-2 py-3">
                  Warehouse
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 cursor-pointer"
                  onClick={() => handleSort("productionQty")}
                >
                  Production Qty
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 cursor-pointer"
                  onClick={() => handleSort("pendingQty")}
                >
                  Pending Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData()
                .filter((item) =>
                  search.toLowerCase() === ""
                    ? item.dept
                    : item.dept.toLowerCase().includes(search.toLowerCase())
                )
                .map((item, index) => (
                  <tr
                    key={item.dept}
                    className={`border-b border-solid 
                    ${
                      theme === "light"
                        ? index % 2 === 0
                          ? "bg-gray-200 text-gray-700 border-slate-200"
                          : "bg-white text-gray-700 border-slate-100"
                        : index % 2 === 0
                        ? "bg-gray-800 text-gray-300 border-slate-900"
                        : "bg-gray-900 text-gray-300 border-gray-500"
                    }`}
                  >
                    <td className="px-6 py-3">{item.dept}</td>
                    <td className="px-6 py-3">{item.productionQty}</td>
                    <td className="px-6 py-3">{item.pendingQty}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* //////////////////////////////////////// */}

      <div className="m-4 mt-7 border rounded-lg border-gray-300 bg-white shadow-lg">
        <div className="flex justify-between p-2 m-2">
          <h1 className="text-xl font-semibold pt-2">
            Production and Pending Data
          </h1>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-300 text-gray-700">
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Dept
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Align
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Capacity/Plan
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Total Pro
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Balance Pro
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Avg Pro QTY/Day
                </th>
                <th
                  colSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base text-red-600"
                >
                  {todayFormatted}
                </th>
                <th
                  colSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base text-red-600"
                >
                  {yesterdayFormatted}
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 px-4 py-2 text-center font-semibold text-base"
                >
                  Remarks
                </th>
              </tr>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-base">
                  Pro
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-base">
                  Pen
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-base">
                  Pro
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-base">
                  Pen
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-200 transition-colors duration-200`}
                >
                  <td className="border border-gray-300 px-4 py-2 text-center text-base font-medium">
                    {row.dept}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.align}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.capacity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.totalPro}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.balancePro}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.avgProPerDay}
                  </td>
                  <td className="border bg-green-200 border-gray-300 px-4 py-2 text-center text-base font-medium">
                    {row.protoday}
                  </td>
                  <td className="border bg-red-100 border-gray-300 px-4 py-2 text-center text-base font-medium">
                    {row.pentoday}
                  </td>
                  <td className="border bg-green-200 border-gray-300 px-4 py-2 text-center text-base font-medium">
                    {row.proprev}
                  </td>
                  <td className="border  bg-red-100 border-gray-300 px-4 py-2 text-center text-base font-medium">
                    {row.penprev}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-base">
                    {row.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {/* <div className="flex justify-center space-x-2 m-4">
    <button
      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
        currentPage1 === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
      }`}
      onClick={() => handlePageChange(currentPage1 - 1)}
      disabled={currentPage1 === 1}
    >
      Previous
    </button>

    <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">{currentPage1}</button>

    <button
      className={`text-base font-semibold px-5 py-3 rounded-lg border ${
        currentPage1 === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-300 hover:bg-gray-400'
      }`}
      onClick={() => handlePageChange(currentPage1 + 1)}
      disabled={currentPage1 === totalPages}
    >
      Next
    </button>
  </div> */}
      </div>
    </div>
  );




  const renderCards = () => {
    const departments = Object.keys(productionData).filter((dept) =>
      search.toLowerCase() === ""
        ? dept
        : dept.toLowerCase().includes(search.toLowerCase())
    );

    return departments.map((dept) => {
      const productionQty = productionData[dept];
      const pendingQty = pendingDepartmentData[dept] || 0;
      const avgProduction =
        productionQty > 0
          ? (((productionQty + pendingQty) / productionQty) * 1).toFixed(1)
          : "N/A";
      const Target = 100;
      const efficiency = (productionQty / Target).toFixed(2);
      return (
        <div
          key={dept}
          className={`p-4 rounded-lg shadow-md flex flex-col justify-between 
          ${theme === "light" ? "bg-white" : "bg-slate-600"}`}
          style={{ minWidth: "150px", minHeight: "180px" }}
        >
          <h2
            className={`font-bold text-lg uppercase text-center rounded-md shadow-md 
            ${
              theme === "light"
                ? "bg-gray-200 text-gray-700"
                : "bg-slate-900 text-gray-100"
            }`}
          >
            {dept}
          </h2>

          <div className="flex mt-3 space-x-2 justify-between">
            <Link to={`/department/${dept}/production`} className="w-1/2">
              <div
                className={`rounded-lg shadow-md  border-solid border  w-[100%] mr-1 hover:scale-95
                ${
                  theme === "light"
                    ? "bg-[#c1fbce92] border-[rgba(0,255,55,0.62)]"
                    : "bg-gray-800 border-[#0e902a] text-green-300 shadow-xl shadow-gray-700 hover:shadow-none"
                }`}
              >
                <p className="font-normal text-sm text-center p-2">
                  Production: <span className="font-bold">{productionQty}</span>
                </p>
              </div>
            </Link>
            <Link to={`/department/${dept}/pending`} className="w-1/2">
              <div
                className={`rounded-lg shadow-md border-solid border  w-[100%] ml-1 hover:scale-95
                ${
                  theme === "light"
                    ? "bg-[#feffd1] border-[#e5ff00]"
                    : "bg-gray-800 border-[#7d8808] text-amber-300 shadow-xl shadow-gray-700 hover:shadow-none"
                }`}
              >
                <p className="font-normal text-sm text-center p-2">
                  Pending: <span className="font-bold">{pendingQty}</span>
                </p>
              </div>
            </Link>
          </div>

          <div className="flex justify-between mt-3">
            <div
              className={`rounded-lg shadow-md  border-solid border  w-[80%] mr-1 h-7
              ${
                theme === "light"
                  ? "bg-[#fbc6c191] border-[#ff00009e]"
                  : "bg-gray-800 border-[#7a0e0e] text-red-300"
              }
              `}
            >
              <p className="font-normal text-sm text-center py-1">
                Target: <span className="font-bold">100</span>
              </p>
            </div>
            <div
              className={`rounded-lg shadow-md  border-solid border  w-[80%] ml-1 h-7
              ${
                theme === "light"
                  ? "bg-cyan-50 border-cyan-500"
                  : "bg-gray-800 border-cyan-700 text-cyan-300"
              }
              `}
            >
              <p className="font-normal text-sm text-center p-1">
                Avg Prod: <span className="font-bold">{avgProduction}</span>
              </p>
            </div>
          </div>

          <div className="flex mt-3 justify-center">
            <div
              className={`rounded-lg shadow-md  border-solid border  w-full
              ${
                theme === "light"
                  ? "bg-fuchsia-100 border-fuchsia-500"
                  : "bg-gray-800 border-fuchsia-700 text-fuchsia-300"
              }
              `}
            >
              <p className="font-normal text-sm text-center p-2">
                Efficiency: <span className="font-bold">{efficiency}</span>
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  const departments = Object.keys(productionData).filter((dept) =>
    search.toLowerCase() === ""
      ? dept
      : dept.toLowerCase().includes(search.toLowerCase())
  );

  const tableData = departments.map((dept) => {
    const productionQty = productionData[dept];
    const pendingQty = pendingDepartmentData[dept] || 0;
    const avgProduction =
      productionQty > 0
        ? (((productionQty + pendingQty) / productionQty) * 1).toFixed(1)
        : "N/A";
    const Target = 100;
    const efficiency = (productionQty / Target).toFixed(2);
  

    const toDayProduction = twodays_production && twodays_production.today && twodays_production.today[dept] || 0;
    const toDayPending = twodays_pending && twodays_pending.today && twodays_pending.today[dept] || 0;
    const prevDayProduction = twodays_production && twodays_production.previous_day && twodays_production.previous_day[dept] || 0;
    const prevDayPending = twodays_pending && twodays_pending.previous_day && twodays_pending.previous_day[dept] || 0;


    //    const todayProduction = 0;
    // const prevDayProduction = 0;
    return {
      dept,
      align: efficiency,
      capacity: Target,
      totalPro: productionQty,
      balancePro: pendingQty,
      avgProPerDay: avgProduction,
      protoday: toDayProduction,
      pentoday: toDayPending,
      proprev: prevDayProduction,
      penprev: prevDayPending,
      remarks: "N/A",
    };
  });

  
  return (
    <div
      className={` w-[100%] min-h-screen flex overflow-auto ${
        theme === "light" ? "bg-gray-100 " : "bg-gray-800 "
      } `}
    >
      {/* Sidebar */}
      <Sidebar theme={theme} />
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header
          onSearch={setSearch}
          onView={setviewData}
          view={viewData}
          theme={theme}
          dark={setTheme}
          on_filter={setFilter_on}
          filter={filter_on}
          onDateRangeChange={handleDateRangeChange}
        />
        <main
          className={`flex-1 px-4 overflow-y-auto ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
          <div
            className={`p-2 ${
              theme === "light" ? "text-gray-700" : "bg-gray-700 text-gray-300"
            }`}
          >
            <p className="text-sm text-left mb-2">Last Updated</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {" "}
              {/* Reduced gap size */}
              <div className="bg-white rounded-lg shadow px-2 py-2 text-center max-w-xs">
                <div className="flex items-center justify-center gap-2">
                  {" "}
                  {/* Flex and gap for same line */}
                  <h3 className="font-thin text-sm whitespace-nowrap">
                    Pending
                  </h3>
                  <p className="text-sm font-bold">{uploadTime_pending}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow px-2 py-2 text-center max-w-xs">
                <div className="flex items-center justify-center gap-2">
                  {" "}
                  {/* Flex and gap for same line */}
                  <h3 className="font-thin text-sm whitespace-nowrap">
                    Production
                  </h3>
                  <p className="text-sm font-bold">{uploadTimeProduction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Cards */}
          <div
            className={`${
              viewData
                ? "relative overflow-x-auto"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2"
            }`}
          >
            {viewData
              ? renderTable(departmentData, pendingDepartmentData)
              : renderCards(departmentData, pendingDepartmentData)}
          </div>
        </main>
      </div>

      {/* View Switcher */}
    </div>
  );
}

export default Dashboard;
