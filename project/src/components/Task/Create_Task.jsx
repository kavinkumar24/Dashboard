import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from "react-select";
import axios from "axios";
function CreateTask() {
  const [axBriefMapping, setAxBriefMapping] = useState({});
  const [briefOptions, setBriefOptions] = useState([]);
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

  const [ax_brief, setAx_brief] = useState("");
  const [collection_name, setCollection_name] = useState("");
  const [project, setProject] = useState("");
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [error, setError] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [no_of_qty, setNo_of_qty] = useState("");
  const [priority, setPriority] = useState("medium");
  const [ref_images, setRef_images] = useState("no");
  const [assignTo, setassignTo] = useState(localStorage.getItem("Email") || "");
  const [person, setPerson] = useState("");
  const [hodemail, setHodemail] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [assign_date, setAssign_date] = useState("");
  const [target_date, setTarget_date] = useState("");
  const [search, setSearch] = useState("");
  const [sketch, setsketch] = useState(null);
  const [depart, setdepart] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [isloading, setIsloading] = useState(false);


  // const [sketchOptions, setSketchOptions] = useState([]);
  const [image_upload, setImage_upload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCheckboxChange = (event) => {
    if (!event.target.checked) {
      alert("You have unchecked the box!");
    }
    setIsChecked(event.target.checked);
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Check if file size is less than or equal to 30KB (30 * 1024 bytes)
      if (file.size <= 30 * 1024) {
        // Update the state with the selected image file and its preview URL
        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setFileName(file.name);
      } else {
        // Display an error message if the file is too large
        alert("File size must be 30KB or less");
        event.target.value = null; // Clear the input
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setFileName("");
      }
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFileName("");
    setImagePreviewUrl(false);
  };
  const handle_images_upload = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setRef_images(value);
    if (value === "yes") {
      setImage_upload(true);
    } else {
      setImage_upload(false);
    }
  };
  const handleAxBriefIdChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setAx_brief(value);
    console.log("brief id", value);

    const briefDetails = axBriefMapping[value];

    if (briefDetails) {
      setCollection_name(briefDetails.designspecs[0] || ""); // Access the first item in the designspecs array
      console.log("Collection Name:", briefDetails.designspecs[0]);
      setProject(briefDetails.pltcodes[0] || ""); // Access the first item in the pltcodes array
      console.log("brief", briefDetails);

      // Set the sketch options from sketchnums
      // setSketchOptions(
      //   briefDetails.sketchnums.map((num) => ({ value: num, label: num }))
      // );
      setIsAutoFilled(true);
      setError("");
    } else {
      setCollection_name("");
      setProject("");
      setIsAutoFilled(false);
      // setSketchOptions([]);
    }
  };

  const handledept = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setdepart(value);
  };

  const handlecreate_task = () => {
    console.log("Brief", ax_brief);
    console.log("collection name", collection_name);
    console.log("projects", project);
    console.log("sketh_num", sketch);
    console.log("assign date", assign_date);
    console.log("Target data", target_date);
    console.log(depart);
    console.log(assignTo);
    console.log(person);
    console.log(hodemail);
    console.log(priority);
    console.log(assignToPersonEmails,"kookoko")
    console.log(ref_images);
    console.log(isChecked);
  };


  const handleEmailChange = (index, value) => {
    const updatedEmails = [...assignToPersonEmails];
    updatedEmails[index] = value;
    setAssignToPersonEmails(updatedEmails);
  };

  // const remainingDays = calculateRemainingDays(target_date);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsloading(true);
    if (!isAutoFilled) {
      setError("Please enter a correct AX Brief ID");
      return;
    }

    const reader = new FileReader();
    const imageToRead = selectedImage || new Blob();
    reader.readAsArrayBuffer(imageToRead);

    reader.onloadend = async () => {
      const imageData = new Uint8Array(reader.result);
      const taskData = {
        ax_brief,
        collection_name,
        project,
        no_of_qty,
        assign_date,
        target_date,
        depart,
        assignTo,
        assignToPersonEmails,
        hodemail,
        priority,
        ref_images,
        isChecked,
        image: Array.from(imageData) || [],
      };

      console.log("Task Data:", taskData);

      try {
        const response = await fetch("http://localhost:8081/api/create-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error("Failed to create task");
        }

        const result = await response.json();
        console.log(result);
        alert("Task created successfully");
        setAx_brief("");
        setCollection_name("");
        setProject("");
        setsketch("");
        setNo_of_qty("");
        setAssign_date("");
        setTarget_date("");
        setdepart("");
        setassignTo("");
        setAssignToPersonEmails("");
        setHodemail("");
        setPriority("");
        setRef_images("");
        setIsChecked(false);
        setAssignToCount(0)
        setBriefOptions([]);
        setAxBriefMapping({});
        setPerson("");
        setFileName("");
        setImagePreviewUrl(null);
        setSelectedImage(null);
        setdepart(null);
        setPriority("");


        try{
          const response = await axios.post('http://localhost:8081/api/send-email', {
            assignToEmail: assignTo,
            assignToPersonEmails: assignToPersonEmails,
            hodemail: hodemail,
            ax_brief: ax_brief,
            collection_name: collection_name,
            project: project,
            no_of_qty: no_of_qty,
            assign_date: assign_date,
            target_date: target_date,
            priority: priority,
            
        });
        console.log(response)
      } catch (error) {
        console.error(error);
        setError("An error occurred while send emails");
      }
      setIsloading(false)
      }
      catch (error) {
        console.error(error);
        setError("An error occurred while creating the task");
        setIsloading(false)
      }

    };
  };

  const [assignToCount, setAssignToCount] = useState(1);
  const [assignToPersonEmails, setAssignToPersonEmails] = useState(Array(assignToCount).fill(""));
  const handleAssignToCountChange = (selectedOption) => {
    const count = selectedOption.value;
    setAssignToCount(count);
    setAssignToPersonEmails(Array(count).fill("")); 
  };
  const deptOptions = [
    { value: "cad", label: "CAD" },
    { value: "cam", label: "CAM" },
    { value: "casting", label: "CASTING" },
    { value: "upstream", label: "UPSTREAM" },
    { value: "downstream", label: "DOWNSTREAM" },
    { value: "design", label: "DESIGN" },
  ];
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];
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

  const [filter_on, setFilter_on] = useState(false);

  
  return (
    
    <div
      className={`min-h-screen w-full flex flex-col lg:flex-row ${
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
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
      <Header onSearch={setSearch} theme={theme} dark={setTheme} 
           on_filter={setFilter_on}
           filter={filter_on}
          
          />
      <main
          className={`flex-1 px-4 overflow-y-auto ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
         
          <div
            className={`p-5 relative shadow-xl rounded-lg mx-5 lg:mx-10 mb-10 lg:mb-20 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            }`}
          >
            <h2
              className={`text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 ${
                theme === "light" ? "text-gray-800" : "text-gray-100"
              }`}
            >
              Create a New Task
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  } w-full lg:w-1/5 px-2`}
                  htmlFor="axBriefId"
                >
                  Ax Brief
                </label>
                <Select
                  id="axBriefId"
                  styles={customStyles}
                  options={briefOptions}
                  value={briefOptions.find(
                    (option) => option.value === ax_brief
                  )}
                  onChange={handleAxBriefIdChange}
                  isClearable
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 ${
                    theme === "light"
                      ? "border-gray-300 text-black "
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  } w-full md:w-3/5`}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs italic">{error}</p>}
              {isAutoFilled && (
                <>
                  <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                    <label
                      className={`block text-base font-bold ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      }  w-full lg:w-1/5 px-2`}
                      htmlFor="axBriefId"
                    >
                      Collection Name
                    </label>
                    <p className="ml-10 text-blue-700 font-bold">
                      {collection_name}
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                    <label
                      className={`block text-base font-bold ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      }  w-full lg:w-1/5 px-2`}
                      htmlFor="axBriefId"
                    >
                      Project
                    </label>
                    <p className="ml-10 text-blue-700 font-bold">{project}</p>
                  </div>
                </>
              )}

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }  w-full lg:w-1/5 px-2`}
                  htmlFor="qty"
                >
                  No. of Qty
                </label>
                <input
                  type="text"
                  id="qty"
                  value={no_of_qty}
                  onChange={(e) => setNo_of_qty(e.target.value)}
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  placeholder="Enter Quantity"
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                     theme === "light" ? "text-gray-700" : "text-gray-200"
                   } w-full lg:w-1/5 px-2`}
                  htmlFor="assignDate"
                >
                  Assign Date
                </label>
                <input
                  type="date"
                  id="assignDate"
                  value={assign_date}
                  onChange={(e) => setAssign_date(e.target.value)}
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                 theme === "light" ? "text-gray-700" : "text-gray-200"
                   } w-full lg:w-1/5 px-2`}
                  htmlFor="targetDate"
                >
                  Target Date
                </label>
                <input
                  type="date"
                  id="targetDate"
                  value={target_date}
                  onChange={(e) => setTarget_date(e.target.value)}
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                     theme === "light" ? "text-gray-700" : "text-gray-200"
               } w-full lg:w-1/5 px-2`}
                  htmlFor="targetDate"
                >
                  Departmemt
                </label>
                <Select
                   className={`mt-2 lg:mt-0 w-full lg:w-4/5 ${
                    theme === "light"
                      ? "border-gray-300 text-black "
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  } w-full md:w-3/5`}
                  isClearable
                  options={deptOptions}
                  styles={customStyles}
                  value={deptOptions.find(
                    (option) => option.value === assignTo
                  )}
                  onChange={handledept}
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                     theme === "light" ? "text-gray-700" : "text-gray-200"
                   } w-full lg:w-1/5 px-2`}
                  htmlFor="targetDate"
                >
                  Asignee Email
                </label>
                <input
                  type="email"
                  id="assigneeEmail"
                  value={assignTo}
                  onChange={(e) => setassignTo(e.target.value)}
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  placeholder="Enter valid email ID"
                  required
                />
              </div>


              
              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4 " >
                  <label
                       className={`block mt-4 text-base font-bold ${
                        theme === "light" ? "text-gray-700" : "text-gray-200"
                      } w-full lg:w-1/5 px-2`}
                    htmlFor="axBriefId"
                  >
                    No of Persons
                  </label>
                  <Select
                    styles={customStyles}
                    options={[1, 2, 3, 4, 5, 6].map((num) => ({
                      value: num,
                      label: num,
                    }))}
                    onChange={handleAssignToCountChange}
                    className={`mt-2 lg:mt-0 w-full lg:w-4/5 ${
                      theme === "light"
                        ? "border-gray-300 text-black "
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-3/5`}
                  />
                </div>

                {Array.from({ length: assignToCount }).map((_, index) => (
                 
                 <div className="flex flex-col lg:flex-row lg:space-x-4 py-4"  key={index}>
                 <label
                      className={`block text-base font-bold ${
                       theme === "light" ? "text-gray-700" : "text-gray-200"
                     } w-full lg:w-1/5 px-2`}
                 >
                   Assign Person {index + 1} Email
                 </label>

                 <input
                   type="email"
                   value={assignToPersonEmails[index] || ""}
                   onChange={(e) => handleEmailChange(index, e.target.value)}
                   className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                     theme === "light"
                       ? "bg-gray-100 text-gray-700 border-gray-300"
                       : "bg-gray-700 text-gray-100 border-gray-600"
                   }`}
                   placeholder="Enter valid email ID"
                   required
                 />
               </div>
             ))}
              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  } w-full lg:w-1/5 px-2`}
                  htmlFor="targetDate"
                >
                  HOD Email
                </label>
                <input
                  type="email"
                  id="hodemail"
                  value={hodemail}
                  onChange={(e) => setHodemail(e.target.value)}
                  className={`mt-2 lg:mt-0 w-full lg:w-4/5 border rounded py-2 px-3 leading-tight focus:outline-none ${
                    theme === "light"
                      ? "bg-gray-100 text-gray-700 border-gray-300"
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  }`}
                  placeholder="Enter valid email ID"
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                     theme === "light" ? "text-gray-700" : "text-gray-200"
                   } w-full lg:w-1/5 px-2`}
                  htmlFor="priority"
                >
                  Priority
                </label>

                <Select
                   className={`mt-2 lg:mt-0 w-full lg:w-4/5 ${
                    theme === "light"
                      ? "border-gray-300 text-black "
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  } w-full md:w-3/5`}
                  isClearable
                  options={priorityOptions}
                  styles={customStyles}
                  value={priorityOptions.find(
                    (option) => option.value === priority
                  )}
                  onChange={(selectedOption) =>
                    setPriority(selectedOption?.value || "medium")
                  }
                  required
                />
              </div>

              <div className="flex flex-col lg:flex-row lg:space-x-4 py-4">
                <label
                  className={`block text-base font-bold ${
                     theme === "light" ? "text-gray-700" : "text-gray-200"
                   } w-full lg:w-1/5 px-2`}
                  htmlFor="ref_images"
                >
                  Have a Reference Images
                </label>

                <Select
                   className={`mt-2 lg:mt-0 w-full lg:w-4/5 ${
                    theme === "light"
                      ? "border-gray-300 text-black "
                      : "bg-gray-700 text-gray-100 border-gray-600"
                  } w-full md:w-3/5`}
                  isClearable
                  options={images}
                  styles={customStyles}
                  value={images.find((option) => option.value === ref_images)}
                  onChange={handle_images_upload}
                  required
                />
              </div>

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

                      <p className="mt-2 text-sm text-gray-500">{fileName}</p>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`flex items-center mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
              >
                <input
                  id="link-checkbox"
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 mr-2"
                />
                <label htmlFor="link-checkbox" className="text-base font-bold">
                  Project View only.
                </label>
              </div>

              <div className="md:col-span-2 flex justify-center">
                <button
                  type="submit"
                  className={`w-full sm:w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
                    theme === "light"
                      ? "bg-blue-500 hover:bg-blue-700"
                      : "bg-blue-600 hover:bg-blue-800"
                  }`}
                  onClick={handlecreate_task}
                >
                  Create New Task
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateTask;