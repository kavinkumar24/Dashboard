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
  const [productionData, setProductionData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [pendingSumData, setPendingSumData] = useState([]);
  const [rawFilteredData, setRawFilteredData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [selectedDeptName, setSelectedDeptName] = useState("CAD");

  const [targets, setTargets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isloading, setisloading] = useState(false);
  const [total, setTotal] = useState(0);
  const [calender, setcalender] = useState(false);
  const [filter_on, setFilter_on] = useState(false);
  const [achieved, setAchieved] = useState({});

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
    const defaultDepartments = DEFAULT_DEPARTMENTS.map((dept) => ({
      name: dept,
    }));
    setDepartments(defaultDepartments);

    fetch("http://localhost:8081/pending_data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Pending Data Response:", data);
        setPendingData(data);
      })
      .catch((error) => console.error("Error fetching pending data:", error));

    fetch("http://localhost:8081/pending-sum") // count of the projects pending [from Projects]
      .then((response) => response.json())
      .then((data) => {
        console.log("Pending Sum Data:", data);
        setPendingSumData(data);
      })
      .catch((error) =>
        console.error("Error fetching pending sum data:", error)
      );

    
    fetch("http://localhost:8081/department-mappings")
      .then((response) => response.json())
      .then((data) => {
        console.log("Department Mappings Response:", data);
        setDepartmentMappings(data);
      })
      .catch((error) =>
        console.error("Error fetching department mappings:", error)
      );

    fetch("http://localhost:8081/targets")
      .then((response) => response.json())
      .then((data) => {
        console.log("Targets Data:", data);
        const targetsMap = data.reduce((acc, item) => {
          acc[item["PROJECT-1"].toUpperCase()] = item.target;
          return acc;
        }, {});
        setTargets(targetsMap);
      })
      .catch((error) => console.error("Error fetching targets:", error));

    fetch("http://localhost:8081/production_data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Production Data Response:", data);
        setProductionData(data);
      })

      .catch((error) =>
        console.error("Error fetching production data:", error)
      );
  }, []);


  const fetchData = async (selectedDeptName) => {
    try {
      const response = await fetch("http://localhost:8081/raw_filtered_production_data");
      const data = await response.json();
      console.log("Raw Filtered Production Data:", data);
  
      const departmentMapping = departmentMappings[selectedDeptName] || {};
      const photoMapping = departmentMappings["PHOTO"] || {};
  
      // Extract from and to departments for the selected department and PHOTO
      const fromDepartments = departmentMapping.from || [];
      const toDepartments = departmentMapping.to || [];
      const photoFromDepartments = photoMapping.from || [];
      const photoToDepartments = photoMapping.to || [];
  
      // Initialize an object to hold counts for each allowed project
      const achievedCounts = ALLOWED_PROJECTS.reduce((acc, project) => {
        acc[project.toUpperCase()] = 0; // Initialize each project count to 0
        return acc;
      }, {});
  
      // Calculate achieved counts based on the selected department and PHOTO mappings
      data.forEach((item) => {
        const fromDept = item["From Dept"]?.toUpperCase() || "";
        const toDept = item["To Dept"]?.toUpperCase() || "";
        const project = item["Project"]?.toUpperCase() || ""; // Get the project name
  
        console.log("From Dept:", fromDept, "To Dept:", toDept, "Project:", project);
  
        // Check if the fromDept and toDept match the selected department mappings
        const isMatchingDept =
          fromDepartments.includes(fromDept) &&
          toDepartments.includes(toDept);
  
        // Check if the fromDept and toDept match the PHOTO mappings
        const isMatchingPhoto =
          photoFromDepartments.includes(fromDept) &&
          photoToDepartments.includes(toDept);
  
        // If either department mapping matches, check allowed projects
        if ((isMatchingDept || isMatchingPhoto) && 
            ALLOWED_PROJECTS.includes(project)) {
          achievedCounts[project] += item["CW Qty"] || 0; // Default to 0 if CW Qty is not present
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
  ]);

  useEffect(() => {
    fetchAndProcessData();
    fetchData()
  }, [selectedDeptName, departmentMappings]);

  const departmentOptions = ALLOWED_PROJECTS.map((dept) => ({
    value: dept.toUpperCase(),
    label: dept,
  }));

  function fetchAndProcessData() {
    fetch("http://localhost:8081/raw_filtered_pending_data")
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

  const updateTableData = () => {
    const normalizedData = pendingData.map((item) => ({
      ...item,
      PLTCODE1: item.PLTCODE1?.toUpperCase() || "",
      Wip: pendingSumData.find((p) => p.PLTCODE1 === item.PLTCODE1)?.total_quantity || 0,
    }));
  
    if (!selectedDeptName) {
      setTableData([]);
      return;
    }
  
    const deptMapping = departmentMappings[selectedDeptName];
    if (deptMapping && deptMapping.to) {
      const fromDeptSet = new Set(deptMapping.from.map((dept) => dept.toUpperCase()));
      const toDeptSet = new Set(deptMapping.to.map((dept) => dept.toUpperCase()));
  
      const projectTotals = rawFilteredData.reduce((acc, item) => {
        const fromDept = item["From Dept"]?.toUpperCase() || "";
        const toDept = item["To Dept"]?.toUpperCase() || "";
  
        if (fromDeptSet.has(fromDept) && toDeptSet.has(toDept)) {
          const project = item.Project || "Unknown Project";
          const cwQty = item["CW Qty"] || 0;
  
          if (!acc[project]) {
            acc[project] = 0;
          }
          acc[project] += cwQty;
        }
  
        return acc;
      }, {});
  
      const pltcodePendingData = aggregatePendingData(rawFilteredPendingData);
  
      const filteredPendingData = normalizedData.filter((item) => {
        return (
          toDeptSet.has(item.TODEPT?.toUpperCase() || "") &&
          (selectedDepartments.length === 0 || selectedDepartments.includes(item.PLTCODE1?.toUpperCase()))
        );
      });
  
      const pltcodeCounts = filteredPendingData.reduce((acc, item) => {
        if (!acc[item.PLTCODE1]) {
          acc[item.PLTCODE1] = { count: 0, totalJCPDSCWQTY1: 0, totalWIP: 0 };
        }
        acc[item.PLTCODE1].count += 1;
        acc[item.PLTCODE1].totalJCPDSCWQTY1 += item.JCPDSCWQTY1 || 0;
        acc[item.PLTCODE1].totalWIP = item.Wip;
        return acc;
      }, {});
  
      // Make sure to access `achieved` from state
      const achievedCounts = achieved; // Assuming `achieved` is your state variable holding the counts
  
      // Create the updated table data with allowed projects
      const updatedTableData = ALLOWED_PROJECTS.map((project) => {
        const pltcode = project.toUpperCase();
        const totalJCPDSCWQTY1 = pltcodePendingData[pltcode] || 0; // Use aggregated data
        const target = Math.round(groupedData[pltcode]) ? Math.round(groupedData[pltcode]) : 0;
  
        // Access achieved directly from state
        const achieved = achievedCounts[pltcode] || 0;
  
        // Calculate pending
        const pending = target - achieved; // This should now not be NaN
        const week1Count = projectTotals[pltcode] || 0;
        const percentageAchieved = target > 0 ? (week1Count / target) * 100 : 0;
  
        return {
          PLTCODE1: pltcode,
          TotalJCPDSCWQTY1: totalJCPDSCWQTY1,
          Target: target,
          Achieved: achieved,
          Pending: pending,
          PercentageAchieved: percentageAchieved,
          Wip: pltcodeCounts[pltcode]?.totalWIP || 0,
          AOP: target,
          Week1: week1Count,
        };
      }).sort((a, b) => a.PLTCODE1.localeCompare(b.PLTCODE1));
  
      // Calculate the total percentage
      const totalPercentage = updatedTableData.reduce(
        (acc, item) => acc + (parseFloat(item.PercentageAchieved) || 0),
        0
      );
  
      // Set the total
      setTotal(totalPercentage);
  
      // Update table data
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

    // setAllowedProjects(updatedAllowedProjects);
    fetchAndProcessData();
    updateTableData();
  };

  useEffect(() => {
    fetch("http://localhost:8081/api/target")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched successfully:", data);
        const targetMap = {};
        data.forEach((item) => {
          const project = item["PROJECT-1"]?.toUpperCase();
          const total = item.Total || 0;

          if (project) {
            targetMap[project] = (targetMap[project] || 0) + total;
          }
        });

        console.log("Grouped Data:", targetMap); // Log the final grouped data
        setGroupedData(targetMap);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handleDownload = () => {
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
        "Department",
        "Percentage",
      ],
      ["", "", "", "", "", "Week1", "Week2", "Week3", "Week4", "", ""],
      ["", "", "Achieved", "Pending", "Wip", "", "", "", "", "", "", ""],
    ];

    const data = tableData.map((row) => [
      row.PLTCODE1,
      row.Target,
      row.Achieved || "-",
      row.Pending || "-",
      row.Wip || "nil",
      row.Week1,
      row.Week2 || "-",
      row.Week3 || "-",
      row.Week4 || "-",
      row.TotalJCPDSCWQTY1,
      row.PercentageAchieved || "-",
    ]);

    const allData = headers.flat().concat(data);

    const ws = XLSX.utils.aoa_to_sheet(headers.concat(data), {
      header: headers[0],
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Table Data");

    XLSX.writeFile(wb, `${selectedDeptName}_AOP_data.xlsx`);
  };

  const handleRowClick = (pltcode) => {
    navigate(`/product-details/${pltcode}/${selectedDeptName}`);
  };

  return (
    <div
      className={`min-h-screen min-w-fit overflow-hidden flex ${
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
          className={`"flex-1 p-0 overflow-y-auto  ${
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
          <div className="p-4">
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

          <div className="grid grid-cols-5 gap-x-4 gap-y-4 p-6">
            {departments.map((dept, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(dept.name)}
                className={`border p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform cursor-pointer ${
                  selectedDeptName === dept.name
                    ? `scale-105 ${
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
          <div className="flex flex-1 justify-end space-x-2 mr-14 ">
            <button
              className="mt-4 relative top-2 px-4 py-2  bg-blue-500 text-white rounded-md"
              onClick={handleFilter}
            >
              Filter
            </button>

            {selectedDeptName && (
              <button
                className="mt-4 px-4 py-2 relative top-2  bg-green-500 text-white rounded-md"
                onClick={handleDownload}
              >
                Download Table Data
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
          <div
            className={`flex flex-col p-5 relative shadow-xl rounded-lg mx-14 my-5 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } max-w-full md:max-w-lg lg:max-w-xl xl:max-w-screen-lg 2xl:max-w-screen-7xl`}
          >
            {selectedDeptName && (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Department: {selectedDeptName}
                </h2>

                <h2 className="text-sm font-normal mb-4 p-1">
                  Percentage: {total.toFixed(2)}%
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-auto">
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
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Project wise
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Project wise Target
                        </th>
                        <th
                          colSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300"
                          }`}
                        >
                          AOP Achieved
                        </th>
                        <th
                          colSpan="1"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800 border-gray-400"
                              : "text-gray-300"
                          }`}
                        >
                          Assignment AOP
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          {selectedDeptName}
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Weekly Percentage
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Week1
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Week2
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Week3
                        </th>
                        <th
                          rowSpan="2"
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Week4
                        </th>
                      </tr>
                      <tr>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Achieved
                        </th>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
                          }`}
                        >
                          Pending
                        </th>
                        <th
                          className={`px-6 py-3 border-b ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-300"
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
                          <td className="px-6 py-4 border-b">{row.PLTCODE1}</td>
                          <td className="px-6 py-4 border-b">{row.Target}</td>
                            <td className="px-6 py-4 border-b">{achieved[row.PLTCODE1] || 0}</td>

                          <td className="px-6 py-4 border-b">{row.Pending}</td>
                          <td className="px-6 py-4 border-b">{row.Wip}</td>
                          <td className="px-6 py-4 border-b">
                            {row.TotalJCPDSCWQTY1}
                          </td>
                          <td className="px-6 py-4 border-b">
                            {row.PercentageAchieved.toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 border-b">{row.Week1}</td>
                          <td className="px-6 py-4 border-b">-</td>
                          <td className="px-6 py-4 border-b">-</td>
                          <td className="px-6 py-4 border-b">-</td>
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
