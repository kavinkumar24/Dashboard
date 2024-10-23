import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import Header from "../Header";
import Sidebar from "../Sidebar";
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
  const emailToMatch = localStorage.getItem("Email");

  const [userDepartments, setUserDepartments] = useState([]); // State to store the departments
  const [role, setRole] = useState("");

  const [userData, setUserData] = useState({
    emp_id: "",
    Email: "",
    role: "",
    departments: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const emailToMatch = localStorage.getItem("Email");
      try {
        const response = await fetch(
          "http://localhost:8081/api/user/loggedin/data",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const user = data.find((user) => user.Email === emailToMatch);

          if (user) {
            setUserData({
              emp_id: user.emp_id,
              Email: user.Email,
              role: user.role,
              departments: user.dept || [], // Use the parsed 'dept' array
            });
          }
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setUserDepartments(userData.departments);

    setRole(userData.role);
  }, [userData]);

  // Monitor userData changes

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
        const response = await axios.get(
          "http://localhost:8081/api/dept_targets"
        ); // Adjust the API endpoint
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

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [productionFiveDaysData, setProductionFiveDaysData] = useState([]);
  const [pendingFiveDaysData, setPendingFiveDaysData] = useState([]);
  const [IsFilterOn, setIsFilterOn] = useState(false);
  const [fiveDaysTableData, setFiveDaysTableData] = useState([]);

  const handleFilterTable = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in days
    const dayDifference = (end - start) / (1000 * 60 * 60 * 24);

    if (dayDifference === 4) {
      // Ensure exactly 5 days including start and end dates
      setError(""); // Clear any previous error

      try {
        // Call both endpoints
        const production = await axios.get(
          `http://localhost:8081/filtered_production_data_with_dates`,
          {
            params: { startDate, endDate },
          }
        );
        const pending = await axios.get(
          `http://localhost:8081/filtered_pending_data_with_dates`,
          {
            params: { startDate, endDate },
          }
        );
        console.log("Data fetched successfully!");
        console.log(
          "Data fetched successfully! Production data:",
          production.data
        );
        console.log("Data fetched successfully! Pending data:", pending.data);
        setProductionFiveDaysData(production.data);
        setPendingFiveDaysData(pending.data);
        // alert('Data fetched successfully!');
        setIsFilterOn(true);
      } catch (err) {
        console.error(err);
        alert("Error fetching data.");
      }
    } else {
      setError("Please select a date range of exactly 5 days.");
    }
  };

  const handleFilterTableCancel = () => {
    setIsFilterOn(false);
    setStartDate("");
    setEndDate("");
  };
  useEffect(() => {
    const tableData = departments.map((dept) => {
      // Retrieve production and pending quantities for the 5 days
      const day1Pro = productionFiveDaysData.day1
        ? productionFiveDaysData.day1[dept] || 0
        : 0;
      const day2Pro = productionFiveDaysData.day2
        ? productionFiveDaysData.day2[dept] || 0
        : 0;
      const day3Pro = productionFiveDaysData.day3
        ? productionFiveDaysData.day3[dept] || 0
        : 0;
      const day4Pro = productionFiveDaysData.day4
        ? productionFiveDaysData.day4[dept] || 0
        : 0;
      const day5Pro = productionFiveDaysData.day5
        ? productionFiveDaysData.day5[dept] || 0
        : 0;

      const day1Pen = pendingFiveDaysData.day1
        ? pendingFiveDaysData.day1[dept] || 0
        : 0;
      const day2Pen = pendingFiveDaysData.day2
        ? pendingFiveDaysData.day2[dept] || 0
        : 0;
      const day3Pen = pendingFiveDaysData.day3
        ? pendingFiveDaysData.day3[dept] || 0
        : 0;
      const day4Pen = pendingFiveDaysData.day4
        ? pendingFiveDaysData.day4[dept] || 0
        : 0;
      const day5Pen = pendingFiveDaysData.day5
        ? pendingFiveDaysData.day5[dept] || 0
        : 0;

      const totalPro = day1Pro + day2Pro + day3Pro + day4Pro + day5Pro;
      const totalPen = day1Pen + day2Pen + day3Pen + day4Pen + day5Pen;

      const avgProduction = totalPro > 0 ? (totalPro / 5).toFixed(1) : "N/A";

      // Retrieve target values from local storage or use default
      const storedTargets =
        JSON.parse(localStorage.getItem("targetValues")) || {};

      const Target =
      deptTarg.find((item) => item.department_name === dept)?.target || 0;
      const efficiency = ((totalPro / Target) * 100).toFixed(2);

      return {
        dept,
        align: efficiency,
        capacity: Target,
        totalPro: totalPro,
        balancePro: totalPen,
        avgProPerDay: avgProduction,
        day1Pro: day1Pro,
        day1Pen: day1Pen,
        day2Pro: day2Pro,
        day2Pen: day2Pen,
        day3Pro: day3Pro,
        day3Pen: day3Pen,
        day4Pro: day4Pro,
        day4Pen: day4Pen,
        day5Pro: day5Pro,
        day5Pen: day5Pen,
        remarks: "N/A",
      };
    });
    setFiveDaysTableData(tableData);
  }, [productionFiveDaysData, pendingFiveDaysData]);

  // /////////////////////////////////////////////////

  const getDateArray = (start, end) => {
    const arr = [];
    const dt = new Date(start);
    while (dt <= new Date(end)) {
      let nextDay = new Date(dt);
      nextDay.setDate(nextDay.getDate() - 1);
      if (nextDay.getDay() !== 0) {
        // Skip Sundays
        // Push next day's date
        arr.push(nextDay.toISOString().split("T")[0]); // Format date as 'YYYY-MM-DD'
      }
      dt.setDate(dt.getDate() + 1);
    }
    // console.log("Date Array:", arr);
    // setDateArray(arr);
    return arr;
  };

  const renderTable = () => (
    <div>
      <div className="flex flex-row gap-4 items-end justify-end">
        <div className="flex space-x-4">
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        <button
          onClick={handleFilterTable}
          className="bg-blue-100 text-blue-500 border font-semibold border-blue-500 px-4 py-2 rounded-md mt-4 hover:bg-blue-200"
        >
          Filter Data
        </button>
        {IsFilterOn && (
          <button
            onClick={handleFilterTableCancel}
            className="bg-red-100 text-red-500 border font-semibold border-red-500 px-4 py-2 rounded-md mt-4 hover:bg-red-200"
          >
            Remove Filter
          </button>
        )}
      </div>
      {error && <p className="text-red-500 mt-2 text-right">{error}</p>}
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="flex gap-4">
          <select
            className="border p-2 rounded"
            value={month1}
            onChange={(e) => setMonth1(e.target.value)}
          >
            <option value="">Select Month 1</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded"
            value={month2}
            onChange={(e) => setMonth2(e.target.value)}
          >
            <option value="">Select Month 2</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 rounded"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        <button
          className="bg-blue-500 text-white py-2 px-4 rounded"
          onClick={fetchData}
        >
          Fetch Data
        </button>

        <button
          className="bg-green-500 text-white py-2 px-4 rounded mt-4"
          onClick={downloadExcel2months}
          disabled={!data || !pendingData2months} // Disable if no data
        >
          Download as Excel
        </button>
      </div>
      {!IsFilterOn ? (
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
                    Avg Pro QTY/Day
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
                      {(total_qty_dep &&
                    (
                      total_qty_dep[row.dept].total_qty / new Date().getDate()
                    ).toFixed(0)) ||
                    0}
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
        </div>
      ) : (
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
                Production and Pending Data For 5 Days{" "}
                <span className="text-red-500">{`${startDate}`}</span> to{" "}
                <span className="text-red-500">{`${endDate}`}</span>
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
                      } px-2 py-2 text-center font-semibold text-base text-wrap`}
                    >
                      Total Pro
                    </th>

                 

                    {getDateArray(startDate, endDate).map((date, index) => (
                      <th
                        key={index}
                        colSpan="2"
                        className={`border ${
                          theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                        } px-2 py-2 text-center font-semibold text-base text-red-500`}
                      >
                        {date}
                      </th>
                    ))}
                  </tr>
                  <tr
                    className={`${
                      theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                    }`}
                  >
                    {getDateArray(startDate, endDate).map((_, index) => (
                      <>
                        <th
                          key={`pro-${index}`}
                          className={`border ${
                            theme === "dark"
                              ? "border-gray-600"
                              : "border-gray-300"
                          } px-2 py-2 text-center font-semibold text-base`}
                        >
                          Pro
                        </th>
                        <th
                          key={`pen-${index}`}
                          className={`border ${
                            theme === "dark"
                              ? "border-gray-600"
                              : "border-gray-300"
                          } px-2 py-2 text-center font-semibold text-base`}
                        >
                          Pen
                        </th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fiveDaysTableData.map((row, index) => (
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
                          theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                        } px-2 py-2 text-center text-base font-medium`}
                      >
                        {row.dept}
                      </td>
                      <td
                        className={`border ${
                          theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                        } px-2 py-2 text-center text-base`}
                      >
                        {row.align}%
                      </td>
                      <td
                        className={`border ${
                          theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                        } px-2 py-2 text-center text-base`}
                      >
                        {row.capacity}
                      </td>
                      <td
                        className={`border ${
                          theme === "dark"
                            ? "border-gray-600"
                            : "border-gray-300"
                        } px-2 py-2 text-center text-base`}
                      >
                        {row.totalPro}
                      </td>

                   
                      {getDateArray(startDate, endDate).map((_, dayIndex) => (
                        <>
                          <td
                            key={`pro-day-${dayIndex}`}
                            className={`border ${
                              theme === "dark"
                                ? dayIndex % 2 === 0
                                  ? "border-gray-600 bg-green-700 text-gray-200"
                                  : "border-gray-600 bg-green-800 text-gray-300"
                                : dayIndex % 2 === 0
                                ? "border-gray-300 bg-green-200"
                                : "border-gray-300 bg-indigo-100"
                            } px-2 py-2 text-center text-base font-medium`}
                          >
                            {row[`day${dayIndex + 1}Pro`] || 0}
                          </td>
                          <td
                            key={`pen-day-${dayIndex}`}
                            className={`border ${
                              theme === "dark"
                                ? dayIndex % 2 === 0
                                  ? "border-gray-600 bg-yellow-600 text-gray-200"
                                  : "border-gray-600 bg-yellow-700 text-gray-300"
                                : dayIndex % 2 === 0
                                ? "border-gray-300 bg-green-200"
                                : "border-gray-300 bg-indigo-100"
                            } px-2 py-2 text-center text-base font-medium`}
                          >
                            {row[`day${dayIndex + 1}Pen`] || 0}
                          </td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const [targets, setTargets] = useState({});
  const [deptTarg, setDeptTarg] = useState([]);
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/dept_targets"
        );
        console.log("Targets response:", response.data);
        setDeptTarg(response.data);

        if (typeof response.data === "string") {
          try {
            // Try to parse JSON
            const jsonData = JSON.parse(response.data);
            if (Array.isArray(jsonData)) {
              const targetValues = jsonData.reduce(
                (acc, { department_name, target }) => {
                  acc[department_name] = target;
                  return acc;
                },
                {}
              );
              setTargets(targetValues);
            } else {
              console.error("Expected array, got:", jsonData);
            }
          } catch (e) {
            console.error("Error parsing JSON:", e);
          }
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching targets:", error);
      }
    };

    fetchTargets();
  }, []);

  const renderCards = () => {
    if (loading) {
      return (
        <div className="flex flex-row">
          <div
            role="status"
            className="space-y-2.5 animate-pulse max-w-lg lg:max-w-4xl xl:max-w-6xl"
          >
            <div className="flex items-center w-full">
              <div
                className={`h-2.5 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-32 lg:w-64 xl:w-80`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-24 lg:w-40 xl:w-56`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
            </div>

            <div className="flex items-center w-full max-w-[480px] lg:max-w-[800px] xl:max-w-[1000px]">
              <div
                className={`h-2.5 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-24 lg:w-40 xl:w-56`}
              ></div>
            </div>

            <div className="flex items-center w-full max-w-[400px] lg:max-w-[700px] xl:max-w-[900px]">
              <div
                className={`h-2.5 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-80 lg:w-96 xl:w-[400px]`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
            </div>

            <div className="flex items-center w-full max-w-[480px] lg:max-w-[800px] xl:max-w-[1000px]">
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-24 lg:w-40 xl:w-56`}
              ></div>
            </div>

            <div className="flex items-center w-full max-w-[440px] lg:max-w-[750px] xl:max-w-[900px]">
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-32 lg:w-48 xl:w-64`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-24 lg:w-40 xl:w-56`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-full`}
              ></div>
            </div>

            <div className="flex items-center w-full max-w-[360px] lg:max-w-[600px] xl:max-w-[800px]">
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-200" : "bg-gray-700"
                } w-80 lg:w-96 xl:w-[400px]`}
              ></div>
              <div
                className={`h-2.5 ms-2 rounded-full ${
                  theme === "light" ? "bg-gray-300" : "bg-gray-600"
                } w-full`}
              ></div>
            </div>

            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
    }
    // Get departments based on user role
    const departments = Object.keys(productionData)
      .filter((dept) => {
        // If the user is 'user', filter based on userDepartments
        return true; // Allow all departments for non-user roles
      })
      .filter((dept) =>
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

      const departmentTarget = targetValues.find(
        (item) => item.department_name === dept
      );
      const target = departmentTarget ? departmentTarget.target : 100; // Default to 100 if not found

      const efficiency = ((productionQty / target) * 100).toFixed(2);

      const handleTargetChange = async () => {
        const newTarget = prompt("Enter new target:", target);

        if (newTarget !== null) {
          const numericTarget = Number(newTarget);

          // Validate if the input is a number
          if (isNaN(numericTarget) || numericTarget < 0) {
            alert("Please enter a valid number for the target.");
            return;
          }

          const updatedTargets = targetValues.map((item) =>
            item.department_name === dept
              ? { ...item, target: numericTarget }
              : item
          );

          setTargetValues(updatedTargets);

          try {
            await axios.post("http://localhost:8081/api/depart_targets", {
              department_name: dept,
              target: numericTarget,
            });
          } catch (error) {
            console.error("Error updating target:", error);
          }
        }
      };

      return (
        <div
          key={dept}
          className={`p-4 rounded-lg shadow-md flex flex-col justify-between ${
            theme === "light" ? "bg-white" : "bg-slate-600"
          }`}
          style={{ minWidth: "150px", minHeight: "180px" }}
        >
          <h2
            className={`font-bold text-lg uppercase text-center rounded-md shadow-md ${
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
                className={`rounded-lg shadow-md border-solid border w-[100%] mr-1 hover:scale-95 ${
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
                className={`rounded-lg shadow-md border-solid border w-[100%] ml-1 hover:scale-95 ${
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
              className={`rounded-lg shadow-md border-solid border w-[80%] mr-1 h-7 ${
                theme === "light"
                  ? "bg-[#fbc6c191] border-[#ff00009e]"
                  : "bg-gray-800 border-[#7a0e0e] text-red-300"
              }`}
            >
              <p className="font-normal text-sm text-center py-1">
                Target: <span className="font-bold">{target}</span>
                <FaEdit
                  className="inline-block ml-2 cursor-pointer"
                  onClick={handleTargetChange}
                />
              </p>
            </div>
            <div
              className={`rounded-lg shadow-md border-solid border w-[80%] ml-1 h-7 ${
                theme === "light"
                  ? "bg-cyan-50 border-cyan-500"
                  : "bg-gray-800 border-cyan-700 text-cyan-300"
              }`}
            >
              <p className="font-normal text-sm text-center p-1">
                Avg Prod: <span className="font-bold">

                {(total_qty_dep &&
                    (
                      total_qty_dep[dept].total_qty / new Date().getDate()
                    ).toFixed(0)) ||
                    0}
                </span>
              </p>
            </div>
          </div>
          <div className="flex mt-3 justify-center">
            <div
              className={`rounded-lg shadow-md border-solid border w-full ${
                theme === "light"
                  ? "bg-fuchsia-100 border-fuchsia-500"
                  : "bg-gray-800 border-fuchsia-700 text-fuchsia-300"
              }`}
            >
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

  const [total_qty_dep, setTotal_qty_dep] = useState();
  useEffect(() => {
    const fetchProductionData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/total_qty_dept"
        );
        setTotal_qty_dep(response.data);
      } catch (error) {
        console.error("Error fetching production data:", error);
      }
    };

    fetchProductionData();
    console.log("hgckjch", total_qty_dep);
  }, []);

  const tableData = departments
    .filter((dept) => {
      return true;
    })
    .map((dept) => {
      const productionQty =
        (total_qty_dep && total_qty_dep[dept]?.total_qty) || 0; // Check if total_qty_dep exists
      const pendingQty = pendingDepartmentData?.[dept] || 0;
      const avgProduction =
        productionQty > 0
          ? (((productionQty + pendingQty) / productionQty) * 1).toFixed(1)
          : "N/A";
      const Target =
        deptTarg.find((item) => item.department_name === dept)?.target || 0;
      const efficiency =
        Target > 0 ? ((productionQty / Target) * 100).toFixed(2) : "N/A";

      const toDayProduction = twodays_production?.today?.[dept] || 0;
      const toDayPending = twodays_pending?.today?.[dept] || 0;
      const prevDayProduction = twodays_production?.previous_day?.[dept] || 0;
      const prevDayPending = twodays_pending?.previous_day?.[dept] || 0;

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

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const [month1, setMonth1] = useState("");
  const [month2, setMonth2] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState({});
  const [pendingData2months, setPendingData2months] = useState({});
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/filtered_production_data_with_months",
        {
          params: { month1, month2, year },
        }
      );
      setData(response.data);
      const response2 = await axios.get(
        "http://localhost:8081/filtered_pending_data_with_months",
        {
          params: { month1, month2, year },
        }
      );
      setPendingData2months(response2.data);

      console.log("jfyhuduy7", response2.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [departmentMappings, setDepartmentMappings] = useState(null);

  useEffect(() => {
    // Fetch department mappings on component mount
    const fetchDepartmentMappings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8081/api/department-mappings"
        );
        setDepartmentMappings(response.data);
      } catch (error) {
        console.error("Error fetching department mappings:", error);
      }
    };

    fetchDepartmentMappings();
  }, []);

  const downloadExcel2months = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    const headers = ["Department"];

    Object.keys(data).forEach((date) => {
      headers.push(`${date} Pro`, `${date} Pen`);
    });

    const rows = [];

    // Adding headers
    rows.push(headers);

    Object.keys(departmentMappings).forEach((group) => {
      const row = [group];

      Object.keys(data).forEach((date) => {
        const deptProduction = data[date].find(
          (deptEntry) => Object.keys(deptEntry)[0] === group
        );
        const productionQty = deptProduction ? deptProduction[group] : 0;

        const pendingEntries = pendingData2months[date];
        const pendingQty =
          pendingEntries && group in pendingEntries ? pendingEntries[group] : 0;

        row.push(productionQty, pendingQty);
      });

      rows.push(row);
    });

    // Create a worksheet from the rows
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Data");

    // Export to file
    XLSX.writeFile(wb, "production_data.xlsx");
  };

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
          className={`flex-1 px-4 overflow-y-auto overflow-hidden ${
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
              <div
                className={`rounded-lg float-right shadow px-2 py-2 text-center w-sm ${
                  theme === "light" ? "bg-white" : "bg-gray-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {" "}
                  {/* Flex and gap for same line */}
                  <h3 className={`font-semibold text-base whitespace-nowrap  ${theme==='light'?'text-blue-500':'text-blue-200'}`}>
                  {monthNames[new Date().getMonth()]} <span className={` ${theme==='light'?'text-gray-500':'text-gray-200' }`}>Month</span>
                  </h3>
                  
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
