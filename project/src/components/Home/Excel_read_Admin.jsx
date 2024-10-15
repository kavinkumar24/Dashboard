import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { FiEdit2 } from "react-icons/fi";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
function Dashboard() {
  const [productionData, setProductionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [remarks, setRemarks] = useState({}); // To store remarks for each department

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
  const role = localStorage.getItem("role");
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
  const [show_text_Area, setShow_text_Area] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8081/api/filtered_production_data_previous").then(
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
        "http://localhost:8081/api/filtered_production_data_previous"
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

  const [targetValues, setTargetValues] = useState(null);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/dept_targets"); // Adjust the API endpoint
        const targets = response.data; 
        setTargetValues(targets);
        console.log("Fetched target values", targetValues); // Log the fetched targets directly
      } catch (error) {
        console.error("Error fetching targets:", error);
      }
    };
  
    fetchTargets();
  }, []);
  
  

  
  const saveTarget = async (dept, newTarget) => {
    try {
      // Check if the target exists
      const response = await axios.get(`/api/targets/${dept}`); // Adjust to your API
      if (response.data) {
        // If it exists, update it
        await axios.put(`/api/targets/${dept}`, { target: newTarget });
      } else {
        // If it doesn't exist, create it
        await axios.post("/api/targets", { dept, target: newTarget });
      }

      // Update state to reflect the change
      setTargetValues((prev) => ({
        ...prev,
        [dept]: newTarget,
      }));
    } catch (error) {
      console.error("Error saving target:", error);
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
        const response = await axios.get(
          "http://localhost:8081/api/upload_time"
        );
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
        "http://localhost:8081/api/filtered_production_data",
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
    fetch("http://localhost:8081/api/filtered_production_data")
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

  const handleShow_text_area = () => {
    setShow_text_Area(true);
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    setSkeleton(true);
    fetch("http://localhost:8081/api/filtered_pending_data")
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
      const res = await fetch(
        "http://localhost:8081/api/filtered_production_data_with_date"
      );
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
      const res = await fetch(
        "http://localhost:8081/api/filtered_pending_data_with_date"
      );
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

  const handleRemarksChange = (dept, value) => {
    setRemarks((prev) => ({ ...prev, [dept]: value })); // Update remarks for specific dept
  };

  const saveRemarks = async (dept) => {
    try {
      await axios.post("http://localhost:8081/api/save-remarks", {
        dept,
        remarks: remarks[dept],
      });
      alert("Remarks saved successfully");
    } catch (error) {
      console.error("Error saving remarks:", error);
    }
  };

  // Get today's date
  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

  const dayBeforeYesterday = new Date();
  dayBeforeYesterday.setDate(today.getDate() - 2); // Subtract 2 days

  const dayBeforeYesterdayFormatted = `${String(
    dayBeforeYesterday.getDate()
  ).padStart(2, "0")}/${String(dayBeforeYesterday.getMonth() + 1).padStart(
    2,
    "0"
  )}/${dayBeforeYesterday.getFullYear()}`;

  // Get yesterday's date
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayFormatted = `${String(yesterday.getDate()).padStart(
    2,
    "0"
  )}/${String(yesterday.getMonth() + 1).padStart(
    2,
    "0"
  )}/${yesterday.getFullYear()}`;
  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/remarks/data"
        );
        const remarksData = response.data.reduce((acc, row) => {
          acc[row.dept] = row.remarks;
          return acc;
        }, {});
        setRemarks(remarksData);
      } catch (error) {
        console.error("Error fetching remarks:", error);
      }
    };

    fetchRemarks();
  }, []);

  const renderTable = () => (
    <div>
      <div
        className={`m-4 mt-7 border rounded-lg ${
          theme === "dark"
            ? "border-gray-600 bg-gray-800"
            : "border-gray-300 bg-white"
        } shadow-lg`}
      >
        <div className="flex justify-between p-2 m-2">
          <h1
            className={`text-xl font-semibold pt-2 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
          >
            Production and Pending Data
          </h1>
        </div>
  
        <div className="overflow-x-auto">
          <table
            className={`min-w-full table-auto text-sm ${
              theme === "dark" ? "text-gray-200" : "text-gray-700"
            }`}
          >
            <thead>
              <tr
                className={`${
                  theme === "dark" ? "bg-gray-900" : "bg-gray-300"
                }`}
              >
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Dept
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Align
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Capacity/Plan
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Total Pro
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Balance Pro
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Avg Pro QTY/Day
                </th>
                <th
                  colSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base text-red-600`}
                >
                  {yesterdayFormatted}
                </th>
                <th
                  colSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base text-red-600`}
                >
                  {dayBeforeYesterdayFormatted}
                </th>
                <th
                  rowSpan="2"
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Remarks
                </th>
              </tr>
              <tr
                className={`${
                  theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                }`}
              >
                <th
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Pro
                </th>
                <th
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Pen
                </th>
                <th
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Pro
                </th>
                <th
                  className={`border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  } px-2 py-2 text-center font-semibold text-base`}
                >
                  Pen
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0
                      ? theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-800"
                        : "bg-white hover:bg-gray-200"
                      : theme === "dark"
                      ? "bg-gray-800"
                      : "bg-gray-50"
                  } transition-colors duration-200`}
                >
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base font-medium`}
                  >
                    {row.dept}
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base`}
                  >
                    {row.align}%
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base`}
                  >
                    {row.capacity}
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base`}
                  >
                    {row.totalPro}
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base`}
                  >
                    {row.balancePro}
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center text-base`}
                  >
                    {row.avgProPerDay}
                  </td>
                  <td
                    className={`border  ${
                      theme === "dark"
                        ? "border-gray-600 bg-green-700 text-gray-200"
                        : "border-gray-300 bg-green-200"
                    } px-2 py-2 text-center text-base font-medium`}
                  >
                    {row.protoday}
                  </td>
                  <td
                    className={`border  ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-200 bg-yellow-600"
                        : "border-gray-300 bg-yellow-100"
                    } px-2 py-2 text-center text-base font-medium`}
                  >
                    {row.pentoday}
                  </td>
                  <td
                    className={`border  ${
                      theme === "dark"
                        ? "border-gray-600 bg-green-700 text-gray-200"
                        : "border-gray-300 bg-green-200"
                    } px-2 py-2 text-center text-base font-medium`}
                  >
                    {row.proprev}
                  </td>
                  <td
                    className={`border  ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-200 bg-yellow-600"
                        : "border-gray-300 bg-yellow-100"
                    } px-2 py-2 text-center text-base font-medium`}
                  >
                    {row.penprev}
                  </td>
                  <td
                    className={`border ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    } px-2 py-2 text-center`}
                  >
                    {role === "admin" ? (
                      <div>
                        <FiEdit2 onClick={handleShow_text_area} />
                        {show_text_Area ? (
                          <textarea
                            className={`w-full h-10 p-2 rounded ${
                              theme === "dark"
                                ? "bg-gray-900 text-gray-200 border-gray-600"
                                : "bg-white text-black border-gray-300"
                            } resize-none`}
                            placeholder="Enter remarks..."
                            value={remarks[row.dept] || ""}
                            onChange={(e) =>
                              handleRemarksChange(row.dept, e.target.value)
                            }
                            onBlur={() => saveRemarks(row.dept)}
                          />
                        ) : (
                          <div
                            className={`w-full h-10 p-2 rounded ${
                              theme === "dark"
                                ? "bg-gray-800 text-gray-200 border-gray-600"
                                : "bg-gray-200 text-black border-gray-300"
                            }`}
                          >
                            {remarks[row.dept] || "N/A"}
                          </div>
                        )}
                      </div>
                    ) : null}
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
              currentPage1 === 1
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => handlePageChange(currentPage1 - 1)}
            disabled={currentPage1 === 1}
          >
            Previous
          </button>
  
          <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">{currentPage1}</button>
  
          <button
            className={`text-base font-semibold px-5 py-3 rounded-lg border ${
              currentPage1 === totalPages
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-gray-300 hover:bg-gray-400'
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
  




  const [targets, setTargets] = useState({});


  useEffect(() => {
    // Fetch targets from Dept_Target table
    const fetchTargets = async () => {
      try {
        const response = await axios.get("/api/dept_targets"); // Adjust the endpoint as necessary
        const targetValues = response.data.reduce((acc, { department_name, target }) => {
          acc[department_name] = target;
          return acc;
        }, {});
        setTargets(targetValues);
      } catch (error) {
        console.error("Error fetching targets:", error);
      }
    };

    fetchTargets();
  }, []);

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

          const departmentTarget = targetValues.find(item => item.department_name === dept);
          const target = departmentTarget ? departmentTarget.target : 100; // Default to 100 if not found
           // Use fetched target or default to 100

      const efficiency = ((productionQty / target) * 100).toFixed(2);

      const handleTargetChange = async () => {
        const newTarget = prompt("Enter new target:", target);
        
        if (newTarget !== null) {
          const numericTarget = Number(newTarget);
          
          // Validate if the input is a number
          if (isNaN(numericTarget) || numericTarget < 0) {
            alert("Please enter a valid number for the target.");
            return; // Exit the function if the input is not valid
          }
      
          const updatedTargets = targetValues.map(item => 
            item.department_name === dept ? { ...item, target: numericTarget } : item
          );
      
          setTargetValues(updatedTargets);
      
          try {
            await axios.post("http://localhost:8081/api/depart_targets", { department_name: dept, target: numericTarget });
          } catch (error) {
            console.error('Error updating target:', error);
          }
        }
      };
      
      
      
      return (
        <div key={dept} className={`p-4 rounded-lg shadow-md flex flex-col justify-between ${theme === "light" ? "bg-white" : "bg-slate-600"}`} style={{ minWidth: "150px", minHeight: "180px" }}>
          <h2 className={`font-bold text-lg uppercase text-center rounded-md shadow-md ${theme === "light" ? "bg-gray-200 text-gray-700" : "bg-slate-900 text-gray-100"}`}>
            {dept}
          </h2>
          <div className="flex mt-3 space-x-2 justify-between">
            <Link to={`/department/${dept}/production`} className="w-1/2">
              <div className={`rounded-lg shadow-md border-solid border w-[100%] mr-1 hover:scale-95 ${theme === "light" ? "bg-[#c1fbce92] border-[rgba(0,255,55,0.62)]" : "bg-gray-800 border-[#0e902a] text-green-300 shadow-xl shadow-gray-700 hover:shadow-none"}`}>
                <p className="font-normal text-sm text-center p-2">
                  Production: <span className="font-bold">{productionQty}</span>
                </p>
              </div>
            </Link>
            <Link to={`/department/${dept}/pending`} className="w-1/2">
              <div className={`rounded-lg shadow-md border-solid border w-[100%] ml-1 hover:scale-95 ${theme === "light" ? "bg-[#feffd1] border-[#e5ff00]" : "bg-gray-800 border-[#7d8808] text-amber-300 shadow-xl shadow-gray-700 hover:shadow-none"}`}>
                <p className="font-normal text-sm text-center p-2">
                  Pending: <span className="font-bold">{pendingQty}</span>
                </p>
              </div>
            </Link>
          </div>
          <div className="flex justify-between mt-3">
            <div className={`rounded-lg shadow-md border-solid border w-[80%] mr-1 h-7 ${theme === "light" ? "bg-[#fbc6c191] border-[#ff00009e]" : "bg-gray-800 border-[#7a0e0e] text-red-300"}`}>
              <p className="font-normal text-sm text-center py-1">
                Target: <span className="font-bold">{target}</span>
                <FaEdit className="inline-block ml-2 cursor-pointer" onClick={handleTargetChange} />
              </p>
            </div>
            <div className={`rounded-lg shadow-md border-solid border w-[80%] ml-1 h-7 ${theme === "light" ? "bg-cyan-50 border-cyan-500" : "bg-gray-800 border-cyan-700 text-cyan-300"}`}>
              <p className="font-normal text-sm text-center p-1">
                Avg Prod: <span className="font-bold">{avgProduction}</span>
              </p>
            </div>
          </div>
          <div className="flex mt-3 justify-center">
            <div className={`rounded-lg shadow-md border-solid border w-full ${theme === "light" ? "bg-fuchsia-100 border-fuchsia-500" : "bg-gray-800 border-fuchsia-700 text-fuchsia-300"}`}>
              <p className="font-normal text-sm text-center p-2">
                Efficiency: <span className="font-bold">{efficiency}%</span>
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
    const storedTargets =
      JSON.parse(localStorage.getItem("targetValues")) || {};
    const Target =targets[dept] || 100; 
    const efficiency = ((productionQty / Target) * 100).toFixed(2);


    const toDayProduction =
      (twodays_production &&
        twodays_production.today &&
        twodays_production.today[dept]) ||
      0;
    const toDayPending =
      (twodays_pending &&
        twodays_pending.today &&
        twodays_pending.today[dept]) ||
      0;
    const prevDayProduction =
      (twodays_production &&
        twodays_production.previous_day &&
        twodays_production.previous_day[dept]) ||
      0;
    const prevDayPending =
      (twodays_pending &&
        twodays_pending.previous_day &&
        twodays_pending.previous_day[dept]) ||
      0;

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
              theme === "light" ? "text-gray-700" : "bg-gray-800 text-gray-300"
            }`}
          >
            <p className="text-sm text-left mb-2">Last Updated</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {" "}
              {/* Reduced gap size */}
              <div
                className={`rounded-lg shadow px-2 py-2 text-center max-w-xs  ${
                  theme === "light" ? "bg-white" : "bg-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {" "}
                  {/* Flex and gap for same line */}
                  <h3 className="font-thin text-sm whitespace-nowrap">
                    Pending
                  </h3>
                  <p className="text-sm font-bold">{uploadTime_pending}</p>
                </div>
              </div>
              <div
                className={`rounded-lg shadow px-2 py-2 text-center max-w-xs ${
                  theme === "light" ? "bg-white" : "bg-gray-600"
                }`}
              >
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
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 mb-10"
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
