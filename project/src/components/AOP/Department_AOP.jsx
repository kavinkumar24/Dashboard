import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import axios from "axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import Datepicker from "react-tailwindcss-datepicker";

const DEFAULT_DEPARTMENTS = ["CAD", "CAM", "MFD", "PD-TEXTURING", "PHOTO"];
const ALLOWED_PROJECTS = [
  "CASTING",
  "DIRECT CASTING",
  "THIN CASTING",
  "ISHTAA",
  "EKTARA",
  "MANGALSUTRA",
  "IMPREZ",
  "LASER CUT",
  "STAMPING",
  "NXT",
  "INDIANIA",
  "ELECTRO FORMING",
  "FUSION",
  "RUMI",
  "KALAKRITI",
  "UNIKRAFT",
  "TURKISH",
  "MARIYA",
  "ILA BANGLES",
  "MMD",
  "EMERALD GEMSTONE JEW",
  "HAND MADE",
  "DIAMOND",
  "PLATINUM",
  "AVANA",
  "CHAIN",
  "CHAIN MIX",
  "COP UTENSIL",
  "EF IDOL",
  "EFSJ",
  "EXPORT-FO",
  "SIL CASTING",
  "SIL CHAIN",
  "SIL HOME DECOR",
  "SIL INDIANIA",
  "SIL MMD",
  "SIL PAYAL",
  "SIL SOLID IDOL",
  "SIL UTENSIL",
  "SJ-RUMI",
];

function Department_AOP() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [overall_dept_table, setoverall_dept_table] = useState([]);

  const [totalWeeklyPercentage, setTotalWeeklyPercentage] = useState(0);
  const [productionData, setProductionData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [pendingSumData, setPendingSumData] = useState([]);
  const [rawFilteredData, setRawFilteredData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [selectedDeptName, setSelectedDeptName] = useState("CAD");
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("role") || "user";
  });
  const [targets, setTargets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [total, setTotal] = useState(0);
  const [calender, setcalender] = useState(false);
  const [filter_on, setFilter_on] = useState(false);
  const [achieved, setAchieved] = useState({});
  const [AllowedProjects, setAllowedProjects] = useState(ALLOWED_PROJECTS);
  const [sortedAllowedTargets, setSortedAllowedTargets] =
    useState(ALLOWED_PROJECTS);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleCardClick = (deptName) => {
    setisloading(true);

    setTimeout(() => {
      setisloading(false);
    }, 3000);
    if (deptName) {
      setSelectedDeptName(deptName);
      updateTableData();
      fetchAndProcessData();
    }
  };
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const handleFilter = () => {
    setcalender(!calender);
    console.log(value.startDate);
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "light" ? "white" : "#334155",
      padding: "5px 10px",
      border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #4a5568",
      boxShadow: "0 2px 4px rgba(0,0,0,.2)",
    }),
    option: (provided, state) => ({
      ...provided,
      borderBottom: "1px dotted blue",
      color: state.isSelected ? "white" : theme === "light" ? "black" : "white",
      backgroundColor: state.isSelected
        ? "red"
        : theme === "light"
        ? "white"
        : "#64748b",
    }),
  };
  let totalPercentage = 0;
  useEffect(() => {
    const fetchData = async () => {
      setisloading(true);

      const defaultDepartments = DEFAULT_DEPARTMENTS.map((dept) => ({
        name: dept,
      }));
      setDepartments(defaultDepartments);

      try {
        const [
          pendingDataResponse,
          pendingSumResponse,
          departmentMappingsResponse,
          targetsResponse,
          productionDataResponse,
        ] = await Promise.all([
          fetch("http://localhost:8081/api/pending_data"),
          fetch("http://localhost:8081/api/pending-sum"),
          fetch("http://localhost:8081/api/department-mappings"),
          fetch("http://localhost:8081/api/targets"),
          fetch("http://localhost:8081/api/production_data"),
        ]);

        const pendingData = await pendingDataResponse.json();
        console.log("Pending Data Response:", pendingData);
        setPendingData(pendingData);

        const pendingSumData = await pendingSumResponse.json();
        console.log("Pending Sum Data:", pendingSumData);
        setPendingSumData(pendingSumData);

        const departmentMappings = await departmentMappingsResponse.json();
        console.log("Department Mappings Response:", departmentMappings);
        setDepartmentMappings(departmentMappings);

        const targetsData = await targetsResponse.json();
        console.log("Targets Data:", targetsData);
        const targetsMap = targetsData.reduce((acc, item) => {
          acc[item["Project"].toUpperCase()] = item.target;
          return acc;
        }, {});
        setTargets(targetsMap);

        const productionData = await productionDataResponse.json();
        console.log("Production Data Response:", productionData);
        setProductionData(productionData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setisloading(false);
      }
    };

    fetchData();
  }, []);

  const getWeekOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const weekOfMonth = Math.ceil((date.getDate() + firstDay.getDay()) / 7);
    return weekOfMonth;
  };

  const fetchData = async (selectedDeptName) => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/raw_filtered_production_data"
      );
      const data = await response.json();
      console.log("Raw Filtered Production Data:", data);

      const departmentMapping = departmentMappings[selectedDeptName] || {};
      const photoMapping = departmentMappings["PHOTO"] || {};
      const fromDepartments = departmentMapping.from || [];
      const toDepartments = departmentMapping.to || [];
      const photoFromDepartments = photoMapping.from || [];
      const photoToDepartments = photoMapping.to || [];

      const achievedCounts = ALLOWED_PROJECTS.reduce((acc, project) => {
        acc[project.toUpperCase()] = 0; // Initialize each project count to 0
        return acc;
      }, {});

      data.forEach((item) => {
        const fromDept = item["From Dept"]?.toUpperCase() || "";
        const toDept = item["To Dept"]?.toUpperCase() || "";
        const project = item["Project"]?.toUpperCase() || ""; // Get the project name

        // Check if the fromDept and toDept match the selected department mappings
        const isMatchingDept =
          fromDepartments.includes(fromDept) && toDepartments.includes(toDept);

        // Check if the fromDept and toDept match the PHOTO mappings
        const isMatchingPhoto =
          photoFromDepartments.includes(fromDept) &&
          photoToDepartments.includes(toDept);

        // Calculate the week number based on uploadedDateTime
        const uploadedDate = new Date(item.uploadedDateTime);
        const weekNumber = getWeekOfMonth(uploadedDate);

        // If either department mapping matches, check allowed projects
        if (
          (isMatchingDept || isMatchingPhoto) &&
          ALLOWED_PROJECTS.includes(project)
        ) {
          achievedCounts[project] += 1;
          // You can also store the week number if needed for further processing
          item.weekNumber = weekNumber;
        }
      });

      console.log("Achieved Counts:", achievedCounts);
      setAchieved(achievedCounts); // Update the achieved state
      setRawFilteredData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [rawFilteredPendingData, setRawFilteredPendingData] = useState([]);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateTableData();
  }, [
    rawFilteredPendingData,
    selectedDeptName,
    selectedDepartments,
    pendingData,
    pendingSumData,
    departmentMappings,
    targets,
    value.startDate,
    value.endDate,
    achieved,
  ]);

  useEffect(() => {
    fetchAndProcessData();
    fetchData();
  }, [selectedDeptName, departmentMappings]);

  const departmentOptions = ALLOWED_PROJECTS.map((dept) => ({
    value: dept.toUpperCase(),
    label: dept,
  }));

  function fetchAndProcessData() {
    fetch("http://localhost:8081/api/raw_filtered_pending_data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Raw Filtered Pending Data:", data);

        if (selectedDeptName && departmentMappings[selectedDeptName]) {
          const deptMapping = departmentMappings[selectedDeptName];
          console.log("Department Mapping:", deptMapping);

          if (deptMapping && deptMapping.from) {
            const toDeptSet = new Set(
              deptMapping.from.map((dept) => dept.toUpperCase())
            );

            // Filter the data based on TODEPT and selected department
            const filteredData = data.filter((item) =>
              toDeptSet.has(item.TODEPT?.toUpperCase() || "")
            );

            console.log("Filtered Pending Data:", filteredData);
            // Group the filtered data by department
            const groupedData = groupDataByDept(filteredData);
            console.log("Grouped Data by Department:", groupedData);

            // Update state with grouped data
            setRawFilteredPendingData(groupedData);
          } else {
            setRawFilteredPendingData({});
          }
        } else {
          setRawFilteredPendingData({});
        }
      })
      .catch((error) => {
        console.error("Error fetching raw filtered pending data:", error);
      });
  }

  const [getMonth, setMonth] = useState(0);
  const groupDataByDept = (data) => {
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        const dept = (item.TODEPT || "Unknown").toUpperCase(); // Ensure you're using TODEPT
        const pltcode = item.pltcode || item.PLTCODE1 || "Unknown";

        if (!acc[dept]) {
          acc[dept] = { quantity: 0, pltcodes: {} };
        }

        acc[dept].quantity += Number(item.JCPDSCWQTY1) || 0;

        if (!acc[dept].pltcodes[pltcode]) {
          acc[dept].pltcodes[pltcode] = 0;
        }
        acc[dept].pltcodes[pltcode] += 1;

        return acc;
      }, {});
    } else {
      console.error("Invalid data format for grouping:", data);
      return {};
    }
  };

  const aggregatePendingData = (groupedData) => {
    const aggregatedData = {};

    for (const dept in groupedData) {
      const { pltcodes, quantity } = groupedData[dept];

      // Aggregate the total quantity for each pltcode
      for (const pltcode in pltcodes) {
        const pltcodeQuantity = pltcodes[pltcode];

        if (!aggregatedData[pltcode]) {
          aggregatedData[pltcode] = 0;
        }

        aggregatedData[pltcode] += pltcodeQuantity; // Sum the quantities
      }
    }

    return aggregatedData;
  };
  const updateTableData = async () => {
    const getWeekNumberInMonth = (dateInput) => {
      let date = dateInput.getDate();
      let day = dateInput.getDay();
      let currentWeek = Math.ceil((date + 6 - day) / 7);
      return currentWeek;
    };

    const weekNumber = getWeekNumberInMonth(new Date());
    console.log("Week Number:", weekNumber); // Output the current week number of the month

    // Normalize pending data
    const normalizedData = pendingData.map((item) => ({
      ...item,
      PLTCODE1: item.PLTCODE1?.toUpperCase() || "",
      Wip:
        pendingSumData.find((p) => p.PLTCODE1 === item.PLTCODE1)
          ?.total_quantity || 0,
    }));

    // Check if a department is selected
    if (!selectedDeptName) {
      setTableData([]);
      return;
    }

    const deptMapping = departmentMappings[selectedDeptName];
    if (deptMapping && deptMapping.to) {
      const fromDeptSet = new Set(
        deptMapping.from.map((dept) => dept.toUpperCase())
      );
      const toDeptSet = new Set(
        deptMapping.to.map((dept) => dept.toUpperCase())
      );

      const projectTotals = rawFilteredData.reduce((acc, item) => {
        const fromDept = item["From Dept"]?.toUpperCase() || "";
        const toDept = item["To Dept"]?.toUpperCase() || "";

        if (fromDeptSet.has(fromDept) && toDeptSet.has(toDept)) {
          const project = item.Project || "Unknown Project";
          acc[project] = (acc[project] || 0) + 1;
        }

        return acc;
      }, {});

      const pltcodePendingData = aggregatePendingData(rawFilteredPendingData);

      const filteredPendingData = normalizedData.filter((item) => {
        return (
          toDeptSet.has(item.TODEPT?.toUpperCase() || "") &&
          (selectedDepartments.length === 0 ||
            selectedDepartments.includes(item.PLTCODE1?.toUpperCase()))
        );
      });

      const pltcodeCounts = filteredPendingData.reduce((acc, item) => {
        const pltcode = item.PLTCODE1;
        if (!acc[pltcode]) {
          acc[pltcode] = { count: 0, totalJCPDSCWQTY1: 0, totalWIP: 0 };
        }
        acc[pltcode].count += 1;
        acc[pltcode].totalJCPDSCWQTY1 += item.JCPDSCWQTY1 || 0;
        acc[pltcode].totalWIP = item.Wip;
        return acc;
      }, {});

      const achievedCounts = achieved;

      let existingData = [];
      try {
        const existingResponse = await fetch(
          "http://localhost:8081/aop/WeeklyData"
        );
        if (!existingResponse.ok) {
          throw new Error("Failed to fetch existing data from the database");
        }
        existingData = await existingResponse.json();
        console.log("Existing Data:", existingData);
      } catch (error) {
        console.error("Error fetching existing data:", error);
      }

      if (!Array.isArray(existingData)) {
        console.error("existingData is not an array:", existingData);
        existingData = [];
      }

      let weeklyData = [];
      try {
        const weeklyResponse = await fetch(
          "http://localhost:8081/aop/WeeklyData"
        );
        if (!weeklyResponse.ok) {
          throw new Error("Failed to fetch weekly data");
        }
        weeklyData = await weeklyResponse.json();
        if (weeklyData[selectedDeptName]) {
          const departmentData = weeklyData[selectedDeptName];

          departmentData.forEach((item) => {
            const monthName = item.Month_data;
            if (monthName != null) {
              setMonth(monthName);
            }
          });
        } else {
          console.log(
            `No data available for selected department: ${selectedDeptName}`
          );
        }
      } catch (error) {
        console.error("Error fetching weekly data:", error);
      }
      const updatedTableData = AllowedProjects.map((project) => {
        const pltcode = project.toUpperCase();
        const totalJCPDSCWQTY1 = pltcodePendingData[pltcode] || 0;
        const target = Math.round(groupedData[pltcode]) || 0;
        const achieved = achievedCounts[pltcode] || 0;

        // Add console logs to debug the target and achieved values
        console.log(
          "Project:",
          pltcode,
          "Target:",
          target,
          "Achieved:",
          achieved
        );

        if (target === 0) return null;

        const pending = Math.max(0, target - achieved); // Ensure pending isn't negative
        const weekCounts = projectTotals[pltcode] || 0;

        // Fetch the weekly data for the selected department and pltcode
        const deptData = weeklyData[selectedDeptName] || [];
        const weeklyDataEntry = deptData.find(
          (entry) => entry.PLTCODE1 === pltcode
        );

        // Default weekly data structure, in case no data exists
        const weekData = weeklyDataEntry
          ? {
              Week1: weeklyDataEntry.data[0]?.Week1 || 0,
              Week2: weeklyDataEntry.data[0]?.Week2 || 0,
              Week3: weeklyDataEntry.data[0]?.Week3 || 0,
              Week4: weeklyDataEntry.data[0]?.Week4 || 0,
              com: weeklyDataEntry.data[0]?.Completed || 0,
            }
          : {
              Week1: 0,
              Week2: 0,
              Week3: 0,
              Week4: 0,
              com: 0,
            };

        // Summing the total weekly achievements
        const totalWeeklyAchieved =
          weekData.Week1 + weekData.Week2 + weekData.Week3 + weekData.Week4;

        // Calculate the weekly percentage achieved for the current week
        const currentWeekAchieved = weekData[`Week${weekNumber}`] || 0;
        const weeklyPercentageAchieved =
          target > 0 ? (currentWeekAchieved / target) * 100 : 0;

        const monthlyPercentageAchieved =
          target > 0 ? (totalWeeklyAchieved / target) * 100 : 0;

        // Cap percentages at 100%
        const cappedWeeklyPercentage = Math.min(weeklyPercentageAchieved, 100);
        const cappedMonthlyPercentage = Math.min(
          monthlyPercentageAchieved,
          100
        );

        // Calculate the completed percentage based on total project counts
        let completedPercentage = Math.round((weekCounts * 100) / target);
        if (completedPercentage > 100) {
          completedPercentage = 100; // Cap at 100%
        }

        return {
          PLTCODE1: pltcode,
          TotalJCPDSCWQTY1: totalJCPDSCWQTY1,
          Target: target,
          Achieved: achieved,
          Pending: pending, // Ensure pending is calculated properly
          PercentageAchieved: cappedWeeklyPercentage,
          MonthlyPercentage: cappedMonthlyPercentage,
          Wip: pltcodeCounts[pltcode]?.totalWIP || 0,
          completed: weekData.com,
          CompletedPercentage: completedPercentage,
          Dept: selectedDeptName,
          weeklyPercentageAchieved: cappedWeeklyPercentage,
          ...weekData, // Include week data in the return object
        };
      })

        .filter((data) => data !== null) // Filter out null values (where target was zero)
        .sort((a, b) => a.PLTCODE1.localeCompare(b.PLTCODE1));

      // // Sum of all percentages and average calculation
      // const totalWeeklyPercentageAchieved = updatedTableData.reduce(
      //   (acc, data) => {
      //     const weeklyAchieved = data.weeklyPercentageAchieved || 0;
      //     return acc + weeklyAchieved;
      //   },
      //   0
      // );

      // setTotalWeeklyPercentage(totalWeeklyPercentageAchieved);

      // Sum of all percentages and average calculation
      const { total, count } = updatedTableData.reduce(
        (acc, data) => {
          const weeklyAchieved = data.weeklyPercentageAchieved || 0;

          if (weeklyAchieved > 0) {
            acc.total += weeklyAchieved; // Sum up the total
            acc.count += 1; // Increment count for non-zero values
          }

          return acc;
        },
        { total: 0, count: 0 } // Initial accumulator
      );

      // Calculate average if count is greater than 0
      const averageWeeklyPercentageAchieved = count > 0 ? total / count : 0;

      // Set the average in state
      setTotalWeeklyPercentage(averageWeeklyPercentageAchieved);

      // Calculate weekly and monthly percentages
      const { totalWeekly, countWeekly, totalMonthly, countMonthly } =
        updatedTableData.reduce(
          (acc, data) => {
            const weeklyAchieved = data.weeklyPercentageAchieved || 0;
            const monthlyAchieved = data.MonthlyPercentage || 0;

            // Sum up for weekly percentages
            if (weeklyAchieved > 0) {
              acc.totalWeekly += weeklyAchieved; // Sum up the weekly percentage
              acc.countWeekly += 1; // Increment count for non-zero weekly values
            }

            // Sum up for monthly percentages
            if (monthlyAchieved > 0) {
              acc.totalMonthly += monthlyAchieved; // Sum up the monthly percentage
              acc.countMonthly += 1; // Increment count for non-zero monthly values
            }

            return acc;
          },
          {
            totalWeekly: 0,
            countWeekly: 0,
            totalMonthly: 0,
            countMonthly: 0, // Initial accumulator for monthly data
          }
        );

      // Calculate average monthly percentage if count is greater than 0
      const averageMonthlyPercentageAchieved_month =
        countMonthly > 0 ? totalMonthly / countMonthly : 0;

      // Set the averages in state
      setTotalWeeklyPercentage(averageWeeklyPercentageAchieved);
      setTotal(averageMonthlyPercentageAchieved_month);

      console.log(
        "Average Weekly Percentage Achieved:",
        averageWeeklyPercentageAchieved
      );
      console.log(
        "Average Monthly Percentage Achieved:",
        averageMonthlyPercentageAchieved_month
      );
      // Set the average percentage
      setTableData(updatedTableData);
    } else {
      setTableData([]);
    }
  };

  const handleDepartmentChange = (selectedOptions) => {
    if (selectedOptions.length === 0) {
      setSelectedDepartments([]);
      setSortedAllowedTargets(ALLOWED_PROJECTS);
      setAllowedProjects(ALLOWED_PROJECTS);
      updateTableData();
      return;
    }
    const selectedValues = selectedOptions.map((option) => option.value);
    // setSortedAllowedTargets(selectedValues);
    setSelectedDepartments(selectedValues);

    const updatedAllowedProjects = selectedValues.length
      ? ALLOWED_PROJECTS.filter((pltcode) => selectedValues.includes(pltcode))
      : ALLOWED_PROJECTS;

    setAllowedProjects(updatedAllowedProjects);
    fetchAndProcessData();
    updateTableData();
  };

  useEffect(() => {
    fetch("http://localhost:8081/api/targets")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched successfully:", data);
        const targetMap = {};
        data.forEach((item) => {
          const project = item["Project"]?.toUpperCase();
          const total = item.Total || 0;

          if (project) {
            targetMap[project] = (targetMap[project] || 0) + total;
          }
        });

        console.log("Grouped Data:", targetMap);
        setGroupedData(targetMap);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const [count, setCount] = useState(1);
  const handleDownload = (department) => {
    setCount(count + 1);
    const localcount_download = localStorage.setItem("download_count", count);
    const headers = [
      [
        "Project wise",
        "Target",
        "AOP Achieved",
        "",
        "Assignment AOP",
        "Weekly Achieved Production",
        "",
        "",
        "",
        `"Department": ${department}`,
        "Percentage",
      ],
      ["", "", "", "", "", "Week1", "Week2", "Week3", "Week4", "", ""],
      ["", "", "Achieved", "Pending", "Wip", "", "", "", "", "", "", ""],
    ];


    
    // Separate row with "Overall AOP Percentage"
    const overallPercentageRow = [
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `Overall AOP Percentage: ${total.toFixed(1)}%`,
      "",
    ];
    const departmentData = tableData.filter(
      (row) => row.department === department
    );

    const data = tableData.map((row) => [
      row.PLTCODE1,
      row.Target,
      achieved[row.PLTCODE1] || "-",
      row.Pending || "-",
      row.Wip || "nil",
      row.Week1,
      row.Week2 || "-",
      row.Week3 || "-",
      row.Week4 || "-",
      row.TotalJCPDSCWQTY1,
      row.weeklyPercentageAchieved.toFixed(1) || "-",
    ]);

    const ws = XLSX.utils.aoa_to_sheet(headers.concat([overallPercentageRow], data), {
      header: headers[0],
    });

    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");

    XLSX.writeFile(wb, `${department}_AOP_data.xlsx`);

    if (localcount_download === 5) {
      alert("You have reached the maximum download limit for the day");
    }
  };


  // useEffect(() => {
  //   const checkPopupAndDownload = async () => {
  //     const lastDownloadDate = localStorage.getItem("lastDownloadDate");
  //     const now = new Date();

  //     // Check for last shown date
  //     const lastShownDate = localStorage.getItem("lastShownDate");
  //     const twoMonthsLater = new Date();

  //     if (lastShownDate) {
  //       twoMonthsLater.setMonth(new Date(lastShownDate).getMonth() + 2);
  //     } else {
  //       localStorage.setItem("lastShownDate", now.toISOString());
  //     }

  //     if (now >= twoMonthsLater) {
  //       setIsPopupVisible(true);
  //       localStorage.setItem("lastShownDate", now.toISOString()); // Update the last shown date
  //     }

  //     // Check if a month has passed since the last download
  //     if (lastDownloadDate) {
  //       const lastDownload = new Date(lastDownloadDate);
  //       if (
  //         lastDownload.getMonth() !== now.getMonth() ||
  //         lastDownload.getFullYear() !== now.getFullYear()
  //       ) {
  //         // Trigger auto-download if the user is an admin
  //         if (userRole === "admin") {
  //           await fetch("http://localhost:8081/clear-weekly-data", {
  //             method: "POST",
  //           });

  //           const monthName = now.toLocaleString("default", { month: "long" });
  //           const year = now.getFullYear();
  //           // handleDownload(monthName, year);

  //           // Update the last download date
  //           localStorage.setItem("lastDownloadDate", now.toISOString());
  //         }
  //       }
  //     } else {
  //       if (userRole === "admin") {
  //         await fetch("http://localhost:8081/clear-weekly-data", {
  //           method: "POST",
  //         });

  //         const monthName = now.toLocaleString("default", { month: "long" });
  //         const year = now.getFullYear();
  //         // handleDownload(monthName, year);

  //         // Set last download date
  //         localStorage.setItem("lastDownloadDate", now.toISOString());
  //       }
  //     }
  //   };

  //   checkPopupAndDownload();
  // }, []);

  const handleZero = async () => {
    localStorage.setItem("download_count", 0);
    const response = await fetch("http://localhost:8081/clear-weekly-data", {
      method: "POST",
    });
    if (response.ok) {
      alert("Weekly data cleared successfully");
      window.location.reload();
    } else {
      alert("Failed to clear weekly data");
    }
  };

  const handleRowClick = (pltcode) => {
    navigate(`/product-details/${pltcode}/${selectedDeptName}`);
  };
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleClosePopup = () => {
    setIsPopupVisible(false);
    // Update lastShownDate in localStorage
    localStorage.setItem("lastShownDate", new Date().toISOString());
  };

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Get current date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get last download date from localStorage
    const lastDownloadDate = localStorage.getItem("lastDownloadDate");
    const lastDownload = lastDownloadDate ? new Date(lastDownloadDate) : null;

    // Show the button if today is the 1st of the month or if no download has been done this month
    if (
      today.getDate() === 1 &&
      (!lastDownload ||
        lastDownload.getMonth() !== currentMonth ||
        lastDownload.getFullYear() !== currentYear)
    ) {
      setShowButton(true);
    }
  }, []);
  return (
    <div
      className={`min-h-screen min-w-full flex flex-col md:flex-row ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-gray-800 text-gray-100"
      }`}
    >
      <Sidebar theme={theme} className="w-1/6 h-screen p-0" />

      <div className="flex-1 flex flex-col p-0">
        <Header
          theme={theme}
          dark={setTheme}
          className="p-0 m-0"
          on_filter={setFilter_on}
          filter={filter_on}
        />

        <main
          className={`flex-1 p-0 overflow-y-auto overflow-hidden ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
          {isloading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-9">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}
          <button
            className="bg-blue-500 rounded-lg px-2 py-2 ml-4 text-white"
            onClick={() => navigate("/AOP/design_center")}
          >
            Design Center{" "}
          </button>
          <div className="p-4 max-w-[100%] md:max-w-full lg:max-w-full">
            <Select
              isMulti
              options={departmentOptions}
              onChange={handleDepartmentChange}
              placeholder="Select Projects"
              className="basic-single"
              classNamePrefix="select"
              styles={customStyles}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-x-4 gap-y-4 p-6 overflow-hidden">
            {departments.map((dept, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(dept.name)}
                className={`border w-[100%] md:w-full lg:w-full scale-100 p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform cursor-pointer ${
                  selectedDeptName === dept.name
                    ? `md:scale-105 ${
                        theme === "light"
                          ? "bg-blue-100 border-blue-300"
                          : "bg-blue-900 border-blue-500"
                      }`
                    : theme === "light"
                    ? "bg-white border-gray-300"
                    : "bg-gray-700 border-gray-600"
                }`}
              >
                <h2 className="text-lg font-semibold">{dept.name}</h2>
              </div>
            ))}
          </div>

          {/* Target Button */}
          <div className="flex flex-1 ml-20 space-x-2 mr-14 justify-start ">
            {((userRole === 'admin') &&(localStorage.getItem("download_count")>= 5)) && (
              <button
                className="mt-4 relative top-2 px-4 py-2  bg-red-500 text-white rounded-md"
                onClick={handleZero}
              >
                Set Zero
              </button>
            )}

            {selectedDeptName && (
              <button
                className="mt-4 px-4 py-2 relative top-2 bg-green-500 text-white rounded-md"
                onClick={() => handleDownload(selectedDeptName)}
              >
                Download {selectedDeptName} Data
              </button>
            )}
            {calender && (
              <div className="mt-4 px-4 py-2 h-4 m-2">
                <Datepicker
                  value={value}
                  inputClassName={`border h-10 rounded ml-10 w-96  py-4 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                    theme === "light"
                      ? "bg-white text-gray-900 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  onChange={(newValue) => setValue(newValue)}
                />
              </div>
            )}
          </div>

          {/* Display Table */}
          {/* Display Table */}
          <div
            className={`flex flex-col p-5 relative shadow-xl rounded-lg mx-10 my-5 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } max-w-[90%] md:max-w-lg lg:max-w-4xl xl:max-w-screen-lg 2xl:max-w-screen-8xl`}
          >
            {selectedDeptName && (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Department: {selectedDeptName}
                </h2>
                <div className="flex  flex-1 justify-between">
                  <h2 className="text-sm font-normal mb-4 p-1">
                    Weekly Percentage: {totalWeeklyPercentage.toFixed(0)}%
                  </h2>
                  <h2 className="text-sm font-normal mb-4 p-1">
                    <span className="text-blue-500 text-lg font-bold">
                      {getMonth}{" "}
                    </span>
                    Monthly Percentage: {total.toFixed(2)}%
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table
                    className={`min-w-full divide-y ${
                      theme === "light" ? "divide-gray-200" : "divide-gray-700"
                    } table-auto`}
                  >
                    <thead
                      className={`${
                        theme === "light" ? "bg-gray-200" : "bg-gray-700"
                      } text-white`}
                    >
                      <tr>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Project wise
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Project wise Target
                        </th>
                        <th
                          colSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          AOP Achieved
                        </th>
                        <th
                          colSpan="1"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Assignment AOP
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          {selectedDeptName}
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          {selectedDeptName} Completed
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Weekly Percentage
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Week1
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Week2
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Week3
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-300"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Week4
                        </th>
                      </tr>
                      <tr>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Achieved
                        </th>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          Pending
                        </th>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300 border-gray-600"
                          }`}
                        >
                          WIP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <tr
                          key={index}
                          onClick={() => handleRowClick(row.PLTCODE1)}
                          className={`hover:transition cursor-pointer ${
                            index % 2 === 0
                              ? theme === "light"
                                ? "bg-gray-100 hover:bg-gray-400 hover:text-white"
                                : "bg-gray-600 hover:bg-gray-900"
                              : theme === "light"
                              ? "bg-white hover:bg-gray-400 hover:text-white"
                              : "bg-gray-800 hover:bg-gray-900"
                          }`}
                        >
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.PLTCODE1}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Target}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {achieved[row.PLTCODE1] || 0}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Pending}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Wip ? row.Wip : 0}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.TotalJCPDSCWQTY1}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.completed}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.weeklyPercentageAchieved.toFixed(2)}%
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Week1}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Week2}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Week3}
                          </td>
                          <td
                            className={`px-6 py-4 border-b ${
                              theme === "dark" ? "border-gray-600" : ""
                            }`}
                          >
                            {row.Week4}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Department_AOP;
