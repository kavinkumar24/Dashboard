import React from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import Datepicker from "react-tailwindcss-datepicker";
import "./Datepicker.css";

import { light } from "@mui/material/styles/createPalette";
import axios from "axios";


function Party_form() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [isloading, setIsloading] = useState(false);
  const [search, setSearch] = useState("");
  const [no_of_qty, setNo_of_qty] = useState("");
  const [status_data, setStatus_data] = useState("");
  const [assignTo, setassignTo] = useState("");
  const [description, setDescription] = useState("");
  const [visit_date, setVisit_date] = useState("");
  const [partyname, setPartyname] = useState("");
  const [imagelink, setImagelink] = useState("");
  const [fileName, setFileName] = useState("");

  const [ax_brief_data, setAx_brief_data] = useState("");
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const loggedemail = localStorage.getItem("Email");
  const [filter_on, setFilter_on] = useState(false);

  const [assignToCount, setAssignToCount] = useState(1); // Number of assignees
  const [assignToEmails, setAssignToEmails] = useState([""]);
  const [ref_images, setRef_images] = useState("no");
  const [image_upload, setImage_upload] = useState(false);

  const handle_images_upload = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setRef_images(value);
    if (value === "yes") {
      setImage_upload(true);
    } else {
      setImage_upload(false);
    }
  };
  const handleaxbriefselect = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setAx_brief_data(value);
  };
  const images = [
    {
      value: "yes",
      label: "Yes",
    },
    {
      value: "no",
      label: "No",
    },
  ];

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
      image_link: imagelink,
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
      setAssignToEmails([""]);
      setAssignToCount(0);

      try {
        const formData = new FormData();
        formData.append("loggedemail", loggedemail);
        formData.append("assignToPersonEmails", assignToEmails);
        formData.append("visit_date", visit_date);
        formData.append("partyname", partyname);
        formData.append("description", description);
        formData.append("status_data", status_data);
      
        if (selectedImage) {
          formData.append("image", selectedImage); 
        }
      
        const response = await axios.post(
          "http://localhost:8081/api/send-email/Party-visit",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      
        console.log(response);
        toast.success("Email sent successfully");
        setImage_upload(false);
      } catch (error) {
        console.error("Error sending email:", error);
        toast.error("Error sending email");
        setIsloading(false);
        setImage_upload(false);

      }
      
      
      setIsloading(false);
    } catch (error) {
      console.error("Error storing data:", error);
      toast.error("Error storing data");
      setIsloading(false);
    }
  };

  const [formData, setFormData] = useState(new FormData());

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
  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size <= 30 * 1024) {
        // 30KB limit
        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setFileName(file.name);

        // Add the image to FormData
        const newFormData = new FormData();
        newFormData.append("image", file);
        setFormData(newFormData);
      } else {
        alert("File size must be 30KB or less");
        event.target.value = null;
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setFileName("");
      }
    }
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFileName("");
    setImagePreviewUrl(false);
  };
  return (
    <div
      className={`min-h-screen lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
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
      <ToastContainer />
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
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }`}
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
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }`}
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
                    className={`mt-2 lg:mt-0 w-full lg:w-full  ${
                      theme === "light"
                        ? "border-gray-300 text-black "
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-full`}
                  />
                </div>

                {Array.from({ length: assignToCount }).map((_, index) => (
                  <div
                    className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5"
                    key={index}
                  >
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
                      className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                        theme === "light"
                          ? "bg-gray-100 text-gray-700 border-gray-300"
                          : "bg-gray-700 text-gray-100 border-gray-600"
                      }`}
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
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "bg-gray-100 text-gray-700 border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    }`}
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
                    className={`mt-2 lg:mt-0 w-full lg:w-full  ${
                      theme === "light"
                        ? "border-gray-300 text-black "
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-full`}
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
                    htmlFor="ref_images"
                  >
                    Image
                  </label>

                  <Select
                    className={`mt-2 lg:mt-0 w-full lg:w-full  ${
                      theme === "light"
                        ? "border-gray-300 text-black "
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-full`}
                    isClearable
                    options={images}
                    styles={customStyles}
                    value={images.find((option) => option.value === ref_images)}
                    onChange={handle_images_upload}
                    required
                  />
                </div>

                <div className="">
                  {image_upload && (
                    <div className="ml-20">
                      <label
                        htmlFor="uploadFile1"
                        className={`${
                          theme === "light"
                            ? "bg-white text-gray-500 border-gray-300"
                            : "bg-gray-800 text-gray-300 border-gray-600"
                        } font-semibold text-base rounded max-w-[60%] h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed mx-auto`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-11 mb-2 fill-gray-500"
                          viewBox="0 0 32 32"
                        >
                          <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                          <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                        </svg>
                        Import Reference Images
                        <input
                          type="file"
                          id="uploadFile1"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <p className="text-xs font-medium text-gray-400 mt-2">
                          .image only allowed under 30KB.
                        </p>
                      </label>

                      {selectedImage && (
                        <div className="mt-4 relative flex flex-col items-center w-40 mx-auto">
                          <img
                            src={imagePreviewUrl}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-1 right-1 bg-gray-500 h-5 w-5 text-white rounded-full flex items-center justify-center"
                            aria-label="Remove image"
                          >
                            &times;
                          </button>

                          <p className="mt-2 text-sm text-gray-500">
                            {fileName}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <br></br>
                </div>

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-full sm:w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
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
