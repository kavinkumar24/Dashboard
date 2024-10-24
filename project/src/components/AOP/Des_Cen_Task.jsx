import axios from "axios";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Header from "../Header";
import Sidebar from "../Sidebar";
function Des_Cen_Task() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen_total, setIsModalOpen_total] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [currentCenter, setCurrentCenter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Change as needed
  const [filter_on, setFilter_on] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/desCenTask");
      const result = {};

      response.data.forEach((item) => {
        const designCenter = item["Design center"];
        if (!result[designCenter]) {
          result[designCenter] = {
            name: designCenter,
            assignedProjects: 0,
            pendingProjects: 0,
            assignedQty: 0,
            pendingQty: 0,
            waitingSelectionBrief: 0,
            waitingSelectionBriefPending: 0,
          };
        }

        result[designCenter].assignedProjects += 1;

        if (item.Received === "No" || item.Received === "no") {
          result[designCenter].pendingProjects += 1;
        }

        result[designCenter].assignedQty += item["No Of Design"];

        if (item.Received === "No" || item.Received === "no") {
          result[designCenter].pendingQty += item["No Of Design"];
        }

        if (
          (item.Received === "Yes" || item.Received === "yes") &&
          item.Completed === null &&
          (item.Confirmed === "Yes" || item.Confirmed === "yes")
        ) {
          result[designCenter].waitingSelectionBrief += 1;
        }
        if (
          (item.Received === "Yes" || item.Received === "yes") &&
          item.Completed !== null &&
          (item.Confirmed === "Yes" || item.Confirmed === "yes")
        ) {
          result[designCenter].waitingSelectionBriefPending += 1;
        }

        // console.log("result", result);
      });

      const totalresult = Object.values(result).reduce(
        (totals, item) => {
          totals.assignedProjects += item.assignedProjects;
          totals.pendingProjects += item.pendingProjects;
          totals.assignedQty += item.assignedQty;
          totals.pendingQty += item.pendingQty;
          totals.waitingSelectionBrief += item.waitingSelectionBrief;
          totals.waitingSelectionBriefPending +=
            item.waitingSelectionBriefPending;
          return totals;
        },
        {
          assignedProjects: 0,
          pendingProjects: 0,
          assignedQty: 0,
          pendingQty: 0,
          waitingSelectionBrief: 0,
          waitingSelectionBriefPending: 0,
        }
      );

      const totalData = [{ ...totalresult, name: "TOTAL" }];
      setTotal(totalData);
      setData(Object.values(result));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [modal_total_data, setModal_total_data] = useState([]);
  const [currentItems_total, setCurrentItems_total] = useState([]);

  const openModal_overall = async (center) => {
    setCurrentCenter(center);
    const response = await axios.get("http://localhost:8081/api/desCenTask");

    console.log("API Response:", response.data);

    // Group data by Design Center
    const groupedData = response.data.reduce((acc, item) => {
      const centerName = item["Design center"].toUpperCase();
      if (!acc[centerName]) {
        acc[centerName] = [];
      }
      acc[centerName].push(item);
      return acc;
    }, {});

    console.log("Grouped Data:", groupedData); // Verify if it contains the current center

    // Set current items for the modal
    const currentData = groupedData[center.toUpperCase()] || [];
    setCurrentItems_total(currentData); // Set the state with the current center data

    setIsModalOpen_total(true);
  };

  const openModal = async (center) => {
    setCurrentCenter(center);
    try {
      let table_data = [];

      if (center === "TOTAL") {
        // Fetch data for all centers
        const response = await axios.get(
          "http://localhost:8081/api/desCenTask"
        );
        const result = {};

        response.data.forEach((item) => {
          const designCenter = item["Design center"];
          if (!result[designCenter]) {
            result[designCenter] = {
              name: designCenter,
              assignedProjects: 0,
              assignedQty: 0,
              pendingProjects: 0,
              pendingQty: 0,
              waitingSelectionBrief: 0,
              waitingSelectionBriefPending: 0,
            };
          }

          result[designCenter].assignedProjects += 1;
          if (item.Received === "No" || item.Received === "no") {
            result[designCenter].pendingProjects += 1;
          }
          result[designCenter].assignedQty += item["No Of Design"];
          if (item.Received === "No" || item.Received === "no") {
            result[designCenter].pendingQty += item["No Of Design"];
          }
          if (
            (item.Received === "Yes" || item.Received === "yes") &&
            item.Completed === null &&
            (item.Confirmed === "Yes" || item.Confirmed === "yes")
          ) {
            result[designCenter].waitingSelectionBrief += 1;
          }
          if (
            (item.Received === "Yes" || item.Received === "yes") &&
            item.Completed !== null &&
            (item.Confirmed === "Yes" || item.Confirmed === "yes")
          ) {
            result[designCenter].waitingSelectionBriefPending += 1;
          }
        });

        // Prepare data for the modal
        table_data = Object.values(result);
      } else {
        // Fetch detailed data for the specific center
        const response = await axios.get(
          "http://localhost:8081/api/desCenTask"
        );
        console.log("response", response);
        table_data = response.data
          .filter(
            (item) =>
              item["Design center"].toUpperCase() === center.toUpperCase()
          )
          .map((item) => {
            const completedDate =
              item.Completed !== null ? new Date(item.Completed) : undefined;
            const documentDate = new Date(item["Document date"]);
            const deadlineDate = new Date(item["Deadline date"]);
            console.log("completedDate", completedDate);
            let percentage = 0;

            if (!completedDate || isNaN(documentDate) || isNaN(deadlineDate)) {
              percentage = 0;
            } else {
              if (completedDate) {
                percentage = 100;
              } else if (
                completedDate > documentDate &&
                completedDate < deadlineDate
              ) {
                percentage = 100;
              } else if (completedDate > deadlineDate) {
                percentage = 0;
              } else {
                const totalDays = Math.ceil(
                  (deadlineDate - documentDate) / (1000 * 60 * 60 * 24)
                );
                console.log("totalDays", totalDays);

                if (totalDays === 0) {
                  percentage = 0; // Prevent division by zero
                } else {
                  const remainingDays = Math.ceil(
                    (deadlineDate - completedDate) / (1000 * 60 * 60 * 24)
                  );
                  percentage = ((totalDays - remainingDays) / totalDays) * 100;
                }
              }
            }

            console.log("percentage", percentage);

            return {
              ...item,
              percentage: percentage.toFixed(2), // Keep two decimal points
            };
          });
      }

      setModalData(table_data);
      console.log("table_data", table_data);
      setCurrentPage(1); // Reset to first page when opening modal
    } catch (error) {
      console.error("Error fetching modal data:", error);
    }
    setIsModalOpen(true);
    document.body.classList.add("overflow-y-hidden");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove("overflow-y-hidden");
  };
  const closeModal_total = () => {
    setIsModalOpen_total(false);
    document.body.classList.remove("overflow-y-hidden");
  };

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Paginate modal data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const indexOfLastItem_total = currentPage * itemsPerPage;
  const indexOfFirstItem_total = indexOfLastItem_total - itemsPerPage;
  const currentItems = modalData.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination Controls
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(modalData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const downloadExcel = () => {
    // Convert modalData into a sheet
    const worksheet = XLSX.utils.json_to_sheet(modalData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate the Excel file and download it
    XLSX.writeFile(workbook, `Design_Center_Details_of_${currentCenter}.xlsx`);
  };

  return (
    <>
      <div
        className={`min-h-screen w-full flex ${
          theme === "light"
            ? "bg-gray-100 text-gray-800"
            : "bg-gray-900 text-gray-200"
        }`}
      >
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header
            onSearch={setSearch}
            theme={theme}
            dark={setTheme}
            on_filter={setFilter_on}
            filter={filter_on}
          />
          <main
            className={`flex-1 px-4 overflow-y-auto ${
              filter_on === true ? "opacity-10" : "opacity-100"
            }`}
          >
            <h1
              className={`font-bold text-xl mx-4 mt-4 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Design Center Tasks Overview
            </h1>

            {/* ********** For Total Data Only */}
            <div
              className={`grid grid-cols-3 gap-4 mx-4 my-4 ${
                theme === "light" ? "bg-gray-100" : ""
              }`}
            >
              {total.map((center) => (
                <div
                  className={` p-4 rounded-lg shadow-md ${
                    theme === "light" ? "bg-white" : "bg-gray-700"
                  }`}
                  key={center.name}
                  onClick={() => openModal_overall(center.name)}
                >
                  <h3
                    className={`text-lg font-bold ${
                      theme === "light" ? "text-blue-700" : "text-blue-400"
                    }`}
                  >
                    {center.name}
                  </h3>
                  <table
                    className={`table-auto w-full ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    <thead>
                      <tr
                        className={`${theme === "light" ? "" : "bg-gray-700"}`}
                      >
                        <th></th>
                        <th className="text-left pr-5">Assigned</th>
                        <th className="text-left">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold py-3">No. of Projects</td>
                        <td>{center.assignedProjects}</td>
                        <td>{center.pendingProjects}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-3">Assigned Qty</td>
                        <td>{center.assignedQty}</td>
                        <td>{center.pendingQty}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-3">
                          Waiting for Selection Brief
                        </td>
                        <td>{center.waitingSelectionBrief}</td>
                        <td>{center.waitingSelectionBriefPending}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* ********** For Total Data Only end *************/}

            <h1
              className={`font-bold text-xl mx-4 mt-4 ${
                theme === "light" ? "text-gray-800" : "text-gray-200"
              }`}
            >
              Detailed Task View of all the{" "}
              <span className="text-[#879FFF]">Centers</span>
            </h1>
            <div
              className={`grid grid-cols-3 gap-4 mx-4 my-4 ${
                theme === "light" ? "bg-gray-100" : ""
              }`}
            >
              {data.map((center) => (
                <div
                  className={` p-4 rounded-lg shadow-md ${
                    theme === "light"
                      ? "bg-white hover:bg-slate-100 hover:border hover:border-blue-300 hover:scale-95  hover:duration-300 ease-in-out hover:transition cursor-pointer"
                      : "bg-gray-700 hover:bg-slate-900 hover:border hover:border-blue-300 hover:scale-95  hover:duration-300 ease-in-out hover:transition cursor-pointer"
                  }`}
                  key={center.name}
                  onClick={() => openModal(center.name)}
                >
                  <h3
                    className={`text-lg font-bold ${
                      theme === "light" ? "text-blue-700" : "text-blue-400"
                    }`}
                  >
                    {center.name.toUpperCase()}
                  </h3>
                  <table
                    className={`table-auto w-full ${
                      theme === "light" ? "text-gray-800" : "text-gray-200"
                    }`}
                  >
                    <thead>
                      <tr
                        className={`${theme === "light" ? "" : "bg-gray-700"}`}
                      >
                        <th></th>
                        <th className="text-left pr-5">Assigned</th>
                        <th className="text-left">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold py-3">No. of Projects</td>
                        <td>{center.assignedProjects}</td>
                        <td>{center.pendingProjects}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-3">Assigned Qty</td>
                        <td>{center.assignedQty}</td>
                        <td>{center.pendingQty}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-3">
                          Waiting for Selection Brief
                        </td>
                        <td>{center.waitingSelectionBrief}</td>
                        <td>{center.waitingSelectionBriefPending}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div
                id="modelConfirm"
                className={`fixed z-50 inset-0 ${
                  theme === "light"
                    ? "bg-gray-900 bg-opacity-60"
                    : "bg-gray-900 bg-opacity-80"
                } overflow-auto h-full w-full px-4`}
              >
                <div
                  className={`relative top-20 mx-auto shadow-xl rounded-md ${
                    theme === "light" ? "bg-white" : "bg-gray-800"
                  } max-w-7xl p-4`}
                >
                  <div className="flex justify-end p-2">
                    <button
                      onClick={closeModal}
                      type="button"
                      className={`text-gray-400 ${
                        theme === "light"
                          ? "bg-transparent hover:bg-gray-200 hover:text-gray-900"
                          : "bg-transparent hover:bg-gray-600 hover:text-gray-300"
                      } rounded-lg text-sm p-1.5 ml-auto inline-flex items-center`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </button>
                  </div>

                  <div className="p-6 text-center ">
                    <div
                      className={`border rounded-lg pb-1 ${
                        theme === "light"
                          ? "border-gray-300 bg-white"
                          : "border-gray-600 bg-gray-500"
                      }  shadow-lg`}
                    >
                      <div className="flex justify-between">
                        <h1
                          className={`text-xl font-semibold p-2 pl-10 py-5 ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-200"
                          }`}
                        >
                          Details for{" "}
                          <span className="text-[#879FFF]">
                            {currentCenter}
                          </span>
                        </h1>
                        <div className="m-4">
                          <button
                            className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
                            onClick={downloadExcel}
                          >
                            Download as Excel
                          </button>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table
                          className={`w-full table-auto text-sm ${
                            theme === "light"
                              ? "text-gray-800"
                              : "text-gray-200"
                          }`}
                        >
                          <thead>
                            <tr
                              className={`${
                                theme === "light"
                                  ? "bg-gray-300 text-gray-700"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                SI no.
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Jewel sub type
                              </th>
                              <th className="py-3 text-center font-semibold text-base">
                                Design specification
                              </th>
                              <th className="py-3 text-center font-semibold text-base">
                                No of Design
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Sub Category
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Assign Employee
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Document Date
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Deadline date
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Confirmed
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Recevied
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Completed
                              </th>
                              <th className="py-3 px-4 text-center font-semibold text-base">
                                Percentage
                              </th>{" "}
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems.map((item, index) => (
                              <tr
                                key={index}
                                className={`transition-colors duration-200 ${
                                  theme === "light"
                                    ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                                    : "bg-gray-800 even:bg-gray-700 hover:bg-gray-600"
                                }`}
                              >
                                <td className="py-4 text-center">
                                  {indexOfFirstItem + index + 1}
                                </td>
                                <td className="py-4 text-center">
                                  {item["Jewel sub type"]}
                                </td>
                                <td className="py-4 text-center">
                                  {item["Design specification"]}
                                </td>
                                <td className="py-4 text-center">
                                  {item["No Of Design"]}
                                </td>
                                <td className="py-4 text-center">
                                  {item["Sub category"]}
                                </td>

                                <td className="py-4 text-center">
                                  {item["Employe Name"]}
                                </td>

                                <td className="py-4 text-center">
                                  {new Date(
                                    item["Document date"]
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                  })}
                                </td>

                                <td className="py-4 text-center">
                                  {new Date(
                                    item["Deadline date"]
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                  })}
                                </td>

                                <td className="py-4 text-center">
                                  {item["Confirmed"]}
                                </td>
                                <td className="py-4 text-center">
                                  {item["Received"]}
                                </td>

                                <td
                                  className={`py-4 text-center ${
                                    item["Completed"] ? "font-extrabold" : ""
                                  }`}
                                >
                                  {item["Completed"]
                                    ? new Date(
                                        item["Completed"]
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "numeric",
                                        day: "numeric",
                                      })
                                    : "Not Completed"}
                                </td>

                                <td className="py-4 text-center">
                                  {item.percentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      <div
                        className={`flex justify-center space-x-2 m-4 ${
                          theme === "light" ? "text-gray-800" : "text-gray-200"
                        }`}
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`text-base font-semibold px-5 py-3 rounded-lg  ${
                            currentPage === 1
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          } ${
                            theme === "light"
                              ? "bg-gray-300 hover:bg-gray-400"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          Previous
                        </button>
                        <div
                          className={`text-base px-5 py-3 rounded-lg  ${
                            theme === "light" ? "bg-gray-300" : "bg-gray-700"
                          }`}
                        >
                          Page {currentPage} of {pageNumbers.length}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pageNumbers.length}
                          className={`text-base font-semibold px-5 py-3 rounded-lg  ${
                            currentPage === pageNumbers.length
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          } ${
                            theme === "light"
                              ? "bg-gray-300 hover:bg-gray-400"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Des_Cen_Task;