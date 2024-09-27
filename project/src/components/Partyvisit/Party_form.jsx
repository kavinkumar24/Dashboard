import React from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";
import Select from "react-select";

function Party_form() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [no_of_qty, setNo_of_qty] = useState("");
  const [status_data, setStatus_data] = useState("");
  const [assignTo, setassignTo] = useState("");
  const [description, setDescription] = useState("");
  const [visit_date, setVisit_date] = useState("");
  const [partyname, setPartyname] = useState("");
  const [axBriefMapping, setAxBriefMapping] = useState({});
  const [briefOptions, setBriefOptions] = useState([]);
  const [ax_brief_data, setAx_brief_data] = useState("");
  useEffect(() => {
    const fetchBriefOptions = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/pending");
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        const briefNumOptions = result.map((item) => ({
          value: item.BRIEFNUM1,
          label: item.BRIEFNUM1,
        }));
        const briefMapping = {};
        result.forEach((item) => {
          briefMapping[item.BRIEFNUM1] = {
            designspecs: item.designspecs,
            pltcodes: item.pltcodes,
            sketchnums: item.sketchnums,
          };
        });
        setAxBriefMapping(briefMapping);
        setBriefOptions(briefNumOptions);
      } catch (error) {
        console.error(error);
      } finally {
        // setLoading(false);
      }
    };

    fetchBriefOptions();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "light" ? "white" : "#374151",
      padding: "5px 10px",
      border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #4a5568",
      color: theme === "light" ? "black" : "white",
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
          : "#1e3a8a"
        : state.isFocused
        ? theme === "light"
          ? "#e2e8f0"
          : "#4a5568"
        : theme === "light"
        ? "white"
        : "#0f172a",
    }),
  };

  const status = [
    { value: "in progress", label: "In progress" },
    { value: "completed", label: "Completed" },
  ];

  const handleview = (event) => {
    event.preventDefault();
    console.log("Party Name: ", partyname);
    console.log("Visit Date: ", visit_date);
    console.log("Description: ", description);
    console.log("Assign To: ", assignTo);
    console.log("Status: ", status_data);
    console.log("No of Qty: ", no_of_qty);
    console.log("Ax Brief: ", ax_brief_data);
  };

  return (
    <div
      className={`min-h-screen lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <div
            className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            }`}
          >
            <h2
              className={`text-2xl font-semibold mb-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-100"
              }`}
            >
              Create Party Visit
            </h2>
            <div className="scrollbar-hide">
              <form>
                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="qty"
                  >
                    Party Name
                  </label>
                  <input
                    type="text"
                    id="qty"
                    value={partyname}
                    onChange={(e) => setPartyname(e.target.value)}
                    className={` appearance-none border-2 rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter Party name"
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="assignDate"
                  >
                    Visit Date
                  </label>
                  <input
                    type="date"
                    id="assignDate"
                    value={visit_date}
                    onChange={(e) => setVisit_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="qty"
                  >
                    Description
                  </label>
                  <textarea
                    type="text"
                    id="qty"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={` appearance-none border-2 rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter Party name"
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="targetDate"
                  >
                    Assign Person Email
                  </label>
                  <input
                    type="email"
                    id="assigneeEmail"
                    value={assignTo}
                    onChange={(e) => setassignTo(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter valid email ID"
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="priority"
                  >
                    Status
                  </label>

                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    options={status}
                    styles={customStyles}
                    value={status.find(
                      (option) => option.value === status_data
                    )}
                    onChange={(selectedOption) =>
                      setStatus_data(selectedOption?.value || "In progress")
                    }
                    required
                  />
                </div>
                <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="axBriefId"
                  >
                    Ax Brief
                  </label>
                  <Select
                    id="axBriefId"
                    styles={customStyles}
                    options={briefOptions}
                    value={briefOptions.find(
                      (option) => option.value === ax_brief_data?.value
                    )}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setAx_brief_data(axBriefMapping[selectedOption.value]);
                      } else {
                        setAx_brief_data(null); 
                      }
                    }}
                    isClearable
                    className={`ml-10 ${
                      theme === "light"
                        ? "border-gray-300 text-black"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-3/5`}
                    required
                  />
                </div>
                {/* {error && (
                <p className="text-red-500 text-xs italic">{error}</p>
              )} */}

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="qty"
                  >
                    No. of Qty
                  </label>
                  <input
                    type="text"
                    id="qty"
                    value={no_of_qty}
                    onChange={(e) => setNo_of_qty(e.target.value)}
                    className={` appearance-none border-2 rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter Quantity"
                    required
                  />
                </div>

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
                      theme === "light"
                        ? "bg-blue-500 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-800"
                    }`}
                    onClick={handleview}
                  >
                    Create New Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Party_form;
