import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from "react-select";

function Party_visit_view() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const loggedInEmail = localStorage.getItem("Email");
  const userRole = localStorage.getItem("role");
  const [briefOptions, setBriefOptions] = useState([]);
  const [selectedBriefs, setSelectedBriefs] = useState({});
  const [weights, setWeights] = useState({});
  const [activeRow, setActiveRow] = useState(null); // Track the active row
  const [filter_on, setFilter_on] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  const handleQuantityChange = async (e, slNo) => {
    const newQuantity = e.target.value;

    try {
      const response = await fetch(
        `http://localhost:8081/api/update_party_visit_quantity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ SL_NO: slNo, Quantity: newQuantity }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const updatedData = await response.json();
      setData((prevData) =>
        prevData.map((item) =>
          item.SL_NO === slNo ? { ...item, Quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          `http://localhost:8081/api/delete-party-visit/${taskId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          window.location.reload();
        } else if (!response.ok) {
          throw new Error("Failed to delete task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleBriefSelect = async (selectedOption, index) => {
    const value = selectedOption ? selectedOption.value : "";

    setSelectedBriefs((prev) => {
      const newState = { ...prev, [index]: value };
      console.log("Updated selectedBriefs:", newState);
      return newState;
    });

    if (value) {
      try {
        const response = await fetch(
          "http://localhost:8081/api/update_party_visit_brief",

          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              SL_NO: index,
              Brief_no: value,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update brief");
        }
      } catch (error) {
        console.error("Error updating brief in database:", error);
      }
    }
  };

  const handleStatusChange = async (selectedOption, slNo) => {
    const newStatus = selectedOption.value;
    let completeDate = null;

    if (newStatus === "completed") {
      completeDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    }

    const briefIndex = filteredData.findIndex((item) => item.SL_NO === slNo);
    const briefNo = selectedBriefs[briefIndex];

    try {
      const response = await fetch(
        `http://localhost:8081/api/update_party_visit_status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            SL_NO: slNo,
            Status_data: newStatus,
            Complete_date: completeDate || null,
            Brief_no: briefNo,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setActiveRow(slNo);

      setData((prevData) =>
        prevData.map((item) =>
          item.SL_NO === slNo
            ? {
                ...item,
                Status_data: newStatus,
                Complete_date: completeDate || item.Complete_date,
                Brief_no: briefNo,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "light" ? "white" : "#374151", // Dark background
      border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #4a5568",
      color: theme === "light" ? "black" : "white",
      boxShadow: "none",
      "&:hover": {
        border: theme === "light" ? "1px solid #a0aec0" : "1px solid #a0aec0",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "light" ? "black" : "white",
    }),
    option: (provided, state) => ({
      ...provided,
      borderBottom: "1px dotted blue",
      color: state.isSelected ? "white" : theme === "light" ? "black" : "white",
      backgroundColor: state.isSelected
        ? theme === "light"
          ? "#3b82f6"
          : "#1e3a8a" // Dark selected color
        : state.isFocused
        ? theme === "light"
          ? "#e2e8f0"
          : "#4a5568" // Dark focused color
        : theme === "light"
        ? "white"
        : "#0f172a", // Dark default background
    }),
  };

  const statusOptions = [
    { value: "in progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancel" },
  ];

  useEffect(() => {
    const fetchBriefOptions = async () => {
      try {
        const response = await fetch(
          "http://localhost:8081/api/descenTask_Brief"
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();
        const briefNumOptions = result.map((item) => ({
          value: item["Brief number"],
          label: item["Brief number"],
        }));

        setBriefOptions(briefNumOptions);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/party_visit");
        const result = await response.json();

        // Set data and also extract selected briefs
        setData(result);
        const briefs = {};
        result.forEach((item) => {
          if (item.Brief_no) {
            briefs[item.SL_NO] = item.Brief_no; // Store the selected brief for each SL_NO
          }
        });
        setSelectedBriefs(briefs);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchBriefOptions();
    fetchData();
  }, []);

  const filteredData =
    userRole === "admin"
      ? data
      : data.filter((item) =>
          item.Assign_Person.split(",").some(
            (email) => email.trim() === loggedInEmail
          )
        );

  return (
    <div
      className={`min-h-screen min-w-full flex flex-col md:flex-row ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-gray-800 text-gray-100"
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
           <div
  className={`flex flex-col p-5 relative shadow-xl rounded-lg w-full mx-5 my-5 ${
    theme === "light" ? "bg-white" : "bg-gray-900"
  } max-w-[90%] md:max-w-lg lg:max-w-lg xl:max-w-screen-xl 2xl:max-w-screen-6xl lg:ml-16 xl:ml-16 2xl:ml-10`}
>
            <h2
              className={`text-2xl font-semibold mb-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-100"
              }`}
            >
              View Party Visit
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead
                  className={theme === "light" ? "bg-gray-200" : "bg-gray-800"}
                >
                  <tr>
                    {[
                      "SL NO",
                      "Visit Date",
                      "Party Name",
                      "Description",
                      "Assigned Person",
                      "Status",
                      "Brief",
                      "Quantity",
                      "Complete Date",
                      "Order rec Wt",
                      "Image",
                      userRole == "admin" ? "Delete" : "",
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-2 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          theme === "light" ? "text-gray-500" : "text-gray-200"
                        }`}
                        style={header === "Brief" ? { width: "180px" } : {}}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    theme === "light"
                      ? "bg-white divide-gray-200"
                      : "bg-gray-700 text-slate-100 divide-gray-600"
                  }`}
                >
                  {filteredData.map((item, index) => {
                    const isAssignedPerson = item.Assign_Person.split(",").some(
                      (email) => email.trim() === loggedInEmail
                    );
                    const isRowEditable =
                      activeRow === null || activeRow === item.SL_NO;

                    return (
                      <tr
                        key={item.SL_NO}
                        className={`${
                          index % 2 === 0
                            ? theme === "light"
                              ? "bg-gray-100"
                              : "bg-gray-700"
                            : theme === "light"
                            ? "bg-white"
                            : "bg-gray-800"
                        }`}
                      >
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.SL_NO}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.visit_date}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.Party_Name}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.Description}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.Assign_Person.split(",").map((email, idx) => (
                            <div key={idx}>{email.trim()}</div>
                          ))}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {isAssignedPerson ? (
                            <div className="w-40">
                              {item.Status_data === "completed" ||
                              item.Status_data === "cancelled" ? (
                                <span
                                  className={`px-4 py-2 rounded ${
                                    item.Status_data === "completed"
                                      ? "bg-green-400 text-black"
                                      : "bg-red-500 text-gray-100"
                                  }`}
                                >
                                  {item.Status_data}
                                </span>
                              ) : (
                                <Select
                                  styles={{
                                    ...customStyles,
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  options={statusOptions}
                                  value={statusOptions.find(
                                    (option) =>
                                      option.value === item.Status_data
                                  )}
                                  onChange={(option) =>
                                    handleStatusChange(option, item.SL_NO)
                                  }
                                  className="z-50"
                                  menuPortalTarget={document.body}
                                  isDisabled={!isRowEditable}
                                />
                              )}
                            </div>
                          ) : (
                            <span>
                              <span
                                className={`px-4 py-2 rounded ${
                                  item.Status_data === "in progress"
                                    ? "bg-yellow-300 text-gray-800"
                                    : item.Status_data === "completed"
                                    ? "bg-green-400 text-gray-800"
                                    : item.Status_data === "cancelled"
                                    ? "bg-red-500 text-gray-100"
                                    : ""
                                }`}
                              >
                                {item.Status_data}
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-10 py-4 text-center whitespace-nowrap">
                          <div className="w-56 -ml-24">
                            {isAssignedPerson ? (
                              <Select
                                options={briefOptions}
                                styles={{
                                  ...customStyles,
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                value={
                                  briefOptions.find(
                                    (option) =>
                                      option.value ===
                                      selectedBriefs[item.SL_NO]
                                  ) || null
                                }
                                onChange={(selectedOption) =>
                                  handleBriefSelect(selectedOption, item.SL_NO)
                                }
                                isClearable
                                isDisabled={selectedBriefs[item.SL_NO]}
                                className={`ml-10 z-50 ${
                                  theme === "light"
                                    ? "border-gray-300 text-black"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                } w-full`}
                                menuPortalTarget={document.body}
                              />
                            ) : (
                              <span>{item.Brief_no}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          <input
                            type="number"
                            value={item.Quantity}
                            onChange={
                              isAssignedPerson
                                ? (e) => handleQuantityChange(e, item.SL_NO)
                                : null
                            }
                            className={`border p-1 w-full ${
                              theme === "light"
                                ? "border-gray-300 bg-white text-black"
                                : "border-gray-600 bg-gray-700 text-white"
                            }`}
                            disabled={!isAssignedPerson}
                          />
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.Complete_date
                            ? item.Complete_date.slice(0, 10)
                            : "N/A"}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {weights[index] || 0}
                        </td>
                        <td className="px-2 py-4 text-center whitespace-nowrap">
                          {item.image_link ? (
                            <a
                              href={item.image_link}
                              className={`underline ${
                                theme === "light"
                                  ? "text-blue-600"
                                  : "text-blue-200"
                              }`}
                            >
                              View image
                            </a>
                          ) : (
                            <span
                              className={`text-gray-500 ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-300"
                              }`}
                            >
                              N/A
                            </span>
                          )}
                        </td>
                        {userRole === "admin" && (
                          <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                            <button
                              onClick={() => handleDeleteTask(item.SL_NO)}
                              className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Party_visit_view;
