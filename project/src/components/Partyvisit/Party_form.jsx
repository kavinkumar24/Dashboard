import React from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import "./Datepicker.css";

import { light } from "@mui/material/styles/createPalette";

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
  const[imagelink, setImagelink] = useState("")

  const [ax_brief_data, setAx_brief_data] = useState("");
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [assignToCount, setAssignToCount] = useState(1); // Number of assignees
  const [assignToEmails, setAssignToEmails] = useState([""]);

 

  const handleaxbriefselect = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setAx_brief_data(value);
  };

  const customDatePickerStyles =
    theme === "light"
      ? "bg-white text-gray-700 border-gray-300"
      : "bg-red-200 text-gray-100 border-gray-600";

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

  const handleview = async (event) => {
    event.preventDefault();

    const data = {
      party_name: partyname,
      visit_date: visit_date,
      description: description,
      assign_person: assignToEmails,
      status_data: status_data,
      image_link:imagelink
    };

    try {
      // Fetch production data to get the Out Date
      const productionResponse = await fetch(
        "http://localhost:8081/api/production_data"
      );
      if (!productionResponse.ok) {
        throw new Error("Failed to fetch production data");
      }

      const productionData = await productionResponse.json();

      // Find the relevant entry based on the brief_no
      const matchingEntries = productionData.filter(
        (item) => item["Brief No"] === ax_brief_data
      );
      const complete_date =
        matchingEntries.length > 0 ? matchingEntries[0]["Out Date"] : null;

      if (!complete_date) {
        toast.warn(
          "No Out Date found for the selected Brief No, using Visit Date as Complete Date."
        );
        data.complete_date = visit_date;
      } else {
        data.complete_date = complete_date;

        // Sum CW Qty for all matching entries
        const totalCWQty = matchingEntries.reduce(
          (sum, item) => sum + (item["CW Qty"] || 0),
          0
        );
        data.order_rev_wt = totalCWQty.toString(); // Store the sum as a string
        console.log(totalCWQty);
      }

      // Send POST request to create Party Visit
      const response = await fetch("http://localhost:8081/api/party-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      toast.success("Party visit created");

      // Reset all state variables to their initial values
      setPartyname("");
      setVisit_date("");
      setDescription("");
      setassignTo("");
      setStatus_data(null);
      setAx_brief_data(null);
      setNo_of_qty("");
    } catch (error) {
      console.error("Error storing data:", error);
      toast.error("Error storing data");
    }
  };

  const handleAssignToCountChange = (selectedOption) => {
    const count = selectedOption.value;
    setAssignToCount(count);
    setAssignToEmails(Array(count).fill("")); // Reset email inputs
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...assignToEmails];
    updatedEmails[index] = value;
    setAssignToEmails(updatedEmails);
  };

  return (
    <div
      className={`min-h-screen lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      <ToastContainer />
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

                  {/* <Datepicker
  primaryColor={"fuchsia"}
  useRange={false}
  asSingle={true}
  value={value}
  onChange={(newValue) => setValue(newValue)}
  inputClassName={`border rounded ml-10 w-full py-4 px-3 leading-tight focus:outline-none focus:shadow-outline absolute  ${
    theme === "light" ? "bg-white text-gray-900 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"
  }`}
  classNames={customDatePickerStyles}
  className={theme === "light" ? "react-datepicker bg-slate-50" : "react-datepicker react-datepicker"}
/> */}
                </div>

                <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="axBriefId"
                  >
                    No of assignee
                  </label>
                  <Select
                    styles={customStyles}
                    options={[1, 2, 3, 4, 5, 6].map((num) => ({
                      value: num,
                      label: num,
                    }))}
                    onChange={handleAssignToCountChange}
                    className={`ml-10 ${
                      theme === "light"
                        ? "border-gray-300 text-black"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-3/5`}
                  />
                </div>

                {Array.from({ length: assignToCount }).map((_, index) => (
                      <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5" key={index}>
                  
                    <label
                      className={`block text-base font-bold mb-2 ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    >
                      Assign Person {index + 1} Email
                    </label>
                    
                    <input
                      type="email"
                      value={assignToEmails[index] || ""}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-gray-700 text-gray-100 border-gray-600"
                      }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                      placeholder="Enter valid email ID"
                      required
                    />
                  </div>
                ))}

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
                    value={
                      status.find((option) => option.value === status_data) ||
                      null
                    } // Set to null if no match
                    onChange={
                      (selectedOption) =>
                        setStatus_data(
                          selectedOption ? selectedOption.value : null
                        ) // Set to null if cleared
                    }
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
                    Image link (Drive)
                  </label>
                  <input
                    type="text"
                    id="qty"
                    value={imagelink}
                    onChange={(e) => setImagelink(e.target.value)}
                    className={` appearance-none border-2 rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter image link"
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
                    Create New Party
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
