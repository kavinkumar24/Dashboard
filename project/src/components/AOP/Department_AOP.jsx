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
  const [departments, setDepartments] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [pendingSumData, setPendingSumData] = useState([]);
  const [rawFilteredData, setRawFilteredData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [selectedDeptName, setSelectedDeptName] = useState("CAD");
  const [showTargetPopup, setShowTargetPopup] = useState(false);
  const [targets, setTargets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [popupCurrentPage, setPopupCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [allowedProjects, setAllowedProjects] = useState(ALLOWED_PROJECTS);
  const [sortedAllowedTargets, setSortedAllowedTargets] =
    useState(ALLOWED_PROJECTS);
  const [isloading, setisloading] = useState(false);
  const [productionData, setProductionData] = useState([]);
  const [total, setTotal] = useState(0);
  const [calender, setcalender] = useState(false);
  const [filter_on, setFilter_on] = useState(false);


  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleCardClick = (deptName) => {
    if (deptName) {
      setSelectedDeptName(deptName);
      updateTableData();
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
    setisloading(true);
    setTimeout(() => {
      setisloading(false);
    }, 3000);
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

    fetch("http://localhost:8081/raw_filtered_production_data")
      .then((response) => response.json())
      .then((data) => {
        console.log("Raw Filtered Production Data:", data);
        setRawFilteredData(data);
      })
      .catch((error) =>
        console.error("Error fetching raw filtered production data:", error)
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
          acc[item.project.toUpperCase()] = item.target;
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

  useEffect(() => {
    updateTableData();
  }, [
    selectedDeptName,
    selectedDepartments,
    pendingData,
    pendingSumData,
    rawFilteredData,
    departmentMappings,
    targets,
    value.startDate,
    value.endDate,
  ]);

  const departmentOptions = ALLOWED_PROJECTS.map((dept) => ({
    value: dept.toUpperCase(),
    label: dept,
  }));

  const updateTableData = () => {
    const normalizedData = pendingData.map((item) => ({
      ...item,
      PLTCODE1: item.PLTCODE1?.toUpperCase() || "",
      Wip:
      pendingSumData.find((p) => p.PLTCODE1 === item.PLTCODE1)
      ?.total_quantity || 0,
    }));

    if (!selectedDeptName) {
      setTableData([]);
      return;
    }
    console.log(value.startDate, value.endDate);



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
          const cwQty = item["CW Qty"] || 0;

          if (!acc[project]) {
            acc[project] = 0;
          }
          acc[project] += cwQty;
        }

        return acc;
      }, {});

      const filteredPendingData = normalizedData.filter((item) => {
        return (
          deptMapping.to
            .map((dept) => dept.toUpperCase())
            .includes(item.TODEPT?.toUpperCase() || "") &&
          (selectedDepartments.length === 0 ||
            selectedDepartments.includes(item.PLTCODE1?.toUpperCase()))
        );
      });

      console.log("Filtered Pending Data:222222", filteredPendingData);

      const pltcodeCounts = filteredPendingData.reduce((acc, item) => {
        if (!acc[item.PLTCODE1]) {
          acc[item.PLTCODE1] = { count: 0, totalJCPDSCWQTY1: 0, totalWIP: 0 };
        }
        acc[item.PLTCODE1].count += 1;
        acc[item.PLTCODE1].totalJCPDSCWQTY1 += item.JCPDSCWQTY1 || 0;
        acc[item.PLTCODE1].totalWIP = item.Wip;
        return acc;
      }, {});

      // Use groupedData for targets
      const photoTotalQty =
        selectedDeptName.toUpperCase() === "PHOTO"
          ? filteredPendingData.reduce(
              (sum, item) => sum + (item.JCPDSCWQTY1 || 0),
              0
            )
          : 0;
          console.log("plt",pltcodeCounts)

          const filteredCounts = (value.startDate && value.endDate)
          ? Object.keys(pltcodeCounts).filter((pltcode) => {
              return normalizedData.some((item) => {
                const recvdDate = new Date(item.RECVDATE1);
                return item.PLTCODE1 === pltcode &&
                       recvdDate >= new Date(value.startDate) &&
                       recvdDate <= new Date(value.endDate);
              });
            })
          : Object.keys(pltcodeCounts);
          
          const updatedTableData = filteredCounts
            .map((pltcode) => {
              const totalJCPDSCWQTY1 = pltcodeCounts[pltcode].totalJCPDSCWQTY1;
              const target = groupedData[pltcode]?.total || 0;
              const achieved = selectedDeptName.toUpperCase() === "PHOTO" ? photoTotalQty : 0;
              const pending = target - achieved;
              const week1Count = projectTotals[pltcode] || 0;
              const percentageAchieved = target > 0 ? (week1Count / target) * 100 : 0;
          
              return {
                PLTCODE1: pltcode,
                TotalJCPDSCWQTY1: totalJCPDSCWQTY1,
                Target: target,
                Achieved: achieved,
                Pending: pending,
                PercentageAchieved: percentageAchieved,
                Wip: pltcodeCounts[pltcode].totalWIP,
                AOP: target,
                Week1: week1Count,
              };
            })
            .sort((a, b) => a.PLTCODE1.localeCompare(b.PLTCODE1));
          
          // Calculate total percentage for "PHOTO" department
          totalPercentage = updatedTableData.reduce(
            (acc, item) => acc + parseFloat(item.PercentageAchieved || 0),
            0
          );
          
          console.log("Total Percentage Achieved:", totalPercentage);
          setTotal(totalPercentage);
          setTableData(updatedTableData);
          

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
    setSortedAllowedTargets(selectedValues);
    setSelectedDepartments(selectedValues);

    const updatedAllowedProjects = selectedValues.length
      ? ALLOWED_PROJECTS.filter((pltcode) => selectedValues.includes(pltcode))
      : ALLOWED_PROJECTS;

    setAllowedProjects(updatedAllowedProjects);

    updateTableData();
  };

  const handleTargetClick = () => {
    setShowTargetPopup(true);
    setPopupCurrentPage(1);
  };

  const handleEditChange = (pltcode, value) => {
    setTargets((prevTargets) => ({
      ...prevTargets,
      [pltcode]: value,
    }));
  };

  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    fetch("http://localhost:8081/api/target")
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched successfully:", data);
        const grouped = data.reduce((acc, item) => {
          const project = item.Project;
          const total = item["Total"];

          if (!acc[project]) {
            acc[project] = { total: 0, products: [] };
          }

          acc[project].total += total;
          acc[project].products.push(item);
          return acc;
        }, {});

        for (const project in grouped) {
          grouped[project].total =
            Math.round(grouped[project].total * 100) / 100;
        }

        setGroupedData(grouped);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // const handleSave = () => {
  //   const dataToSave = Object.keys(targets).map((pltcode) => ({
  //     project: pltcode,
  //     target: targets[pltcode],
  //   }));

  //   fetch("http://localhost:8081/api/save-targets", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ targets: dataToSave }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Data saved successfully:", data);
  //       setShowTargetPopup(false);

  //       setTableData((prevTableData) =>
  //         prevTableData.map((row) => ({
  //           ...row,
  //           Target: targets[row.PLTCODE1] || "",
  //         }))
  //       );
  //     })
  //     .catch((error) => console.error("Error saving data:", error));
  // };

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
  const filteredTableData = selectedDeptName
    ? tableData.filter((item) => item.PLTCODE1 === selectedDeptName)
    : tableData;

  const popupStartIndex = (popupCurrentPage - 1) * itemsPerPage;
  const popupEndIndex = popupStartIndex + itemsPerPage;
  const allowedTargets = Object.keys(targets).filter((pltcode) =>
    ALLOWED_PROJECTS.includes(pltcode)
  );

  // let sortedAllowedTargets = allowedTargets.sort(
  //   (a, b) => ALLOWED_PROJECTS.indexOf(a) - ALLOWED_PROJECTS.indexOf(b)
  // );

  const handleRowClick = (pltcode) => {
    navigate(`/product-details/${pltcode}/${selectedDeptName}`);
  };
  const paginatedTargets = sortedAllowedTargets.slice(
    popupStartIndex,
    popupEndIndex
  );
  const handlePopupPageChange = (direction) => {
    setPopupCurrentPage((prevPage) => prevPage + direction);
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
        <Header theme={theme} dark={setTheme} className="p-0 m-0"  on_filter={setFilter_on}
          filter={filter_on} />

        <main className={`"flex-1 p-0 overflow-y-auto  ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}>
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
            {/* <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleTargetClick}
            >
              Set Target
            </button> */}

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
                          <td className="px-6 py-4 border-b">{row.Achieved}</td>
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

          {/* Target Popup */}
          {/* Target Popup */}
          {/* {showTargetPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
    <div className={`${theme==='light'?'bg-white':'bg-slate-900'}  p-6 rounded-lg shadow-lg w-11/12 max-w-lg max-h-[80vh] overflow-auto`}>
      <button onClick={() => setShowTargetPopup(false)} className="mr-0 float-right relative">X</button>
      <h3 className="text-xl font-semibold mb-4">Edit Targets</h3>
      <div>
        {sortedAllowedTargets.map((item, index) => (
          <div key={index} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              <div className="flex flex-1 justify-between">
                {item === selectedDeptName ? selectedDeptName : item}
                <input
                  type="text"
                  value={targets[item] || ""} // Ensure that you use the department `item` directly
                  onChange={(e) => handleEditChange(item, e.target.value)} // Pass the department `item` directly to handleEditChange
                  className={`ml-2 p-2 border ${theme==='light'?'bg-white border-gray-300':'bg-slate-700 border-gray-500'} rounded`}
                />
              </div>
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSave}
        >
          Save
        </button>
        <div className="flex items-center">
          <button className="px-4 py-2 bg-red-500 text-white rounded-md mr-2" onClick={() => setShowTargetPopup(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)} */}
        </main>
      </div>
    </div>
  );
}

export default Department_AOP;
