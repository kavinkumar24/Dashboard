import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Select from "react-select";

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
  const [assignTo, setassignTo] = useState("");
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


  const [sketchOptions, setSketchOptions] = useState([]);
  const [image_upload, setImage_upload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); 
  
  const handleCheckboxChange = (event) => {
    if (!event.target.checked) {
      alert('You have unchecked the box!');
    }
    setIsChecked(event.target.checked);
  };

  
  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
    const file = event.target.files[0];

    // Check if a file is selected
    if (file) {
      // Check if file size is less than or equal to 10KB (10 * 1024 bytes)
      if (file.size <= 20 * 1024) {
        // Proceed with the file (like setting it to state, or previewing the image)
        console.log('Image selected:', file);
      } else {
        // Display an error message
        alert('File size must be 10KB or less');
        event.target.value = null; // Clear the input
      }
  };
  }

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
      setSketchOptions(
        briefDetails.sketchnums.map((num) => ({ value: num, label: num }))
      );
      setIsAutoFilled(true);
      setError("");
    } else {
      setCollection_name("");
      setProject("");
      setIsAutoFilled(false);
      setSketchOptions([]);
    }
  };
  const handleSketch = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setsketch(value);
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
    console.log(assignTo)
    console.log(person)
    console.log(hodemail)
    console.log(priority)
    console.log(ref_images)
    console.log(isChecked)
  };


  
  // const remainingDays = calculateRemainingDays(target_date);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAutoFilled) {
      setError("Please enter a correct AX Brief ID");
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedImage);

    reader.onloadend = async () => {
      const imageData = new Uint8Array(reader.result);
    const taskData = {
      ax_brief,
      collection_name,
      project,
      sketch,
      no_of_qty,
      assign_date,
      target_date,
      depart,
      assignTo,
      person,
      hodemail,
      priority,
      ref_images,
      isChecked,
      image: Array.from(imageData) ||[]
      
    };

    console.log("Task Data:", taskData);



    try {
      const response = await fetch("http://localhost:8081/create-task", {
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
      setAx_brief('');
      setCollection_name('');
      setProject('');
      setsketch('');
      setNo_of_qty('');
      setAssign_date('');
      setTarget_date('');
      setdepart('');
      setassignTo('');
      setPerson('');
      setHodemail('');
      setPriority('');
      setRef_images('');
      setIsChecked(false);

    } catch (error) {
      console.error(error);
      setError("An error occurred while creating the task");
    }
  }}
  const deptOptions = [
    { value: "cad", label: "CAD" },
    { value: "cam", label: "CAM" },
    { value: "casting", label: "CASTING" },
    { value: "upstream", label: "UPSTREAM" },
    { value: "downstream", label: "DOWNSTREAM" },
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
              Create a New Task
            </h2>
            <div className="scrollbar-hide">
              <form onSubmit={handleSubmit}>
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
                    options={briefOptions}
                    value={briefOptions.find(
                      (option) => option.value === ax_brief
                    )}
                    onChange={handleAxBriefIdChange}
                    isClearable
                    className={`ml-10 ${
                      theme === "light"
                        ? "border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full md:w-3/5`}
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-xs italic">{error}</p>
                )}
                {isAutoFilled && (
                  <>
                    <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                      <label
                        className={`block text-base font-bold ${
                          theme === "light" ? "text-gray-700" : "text-gray-200"
                        } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                        htmlFor="axBriefId"
                      >
                        Collection Name
                      </label>
                      <p className="ml-10 text-blue-700 font-bold">
                        {collection_name}
                      </p>
                    </div>

                    <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                      <label
                        className={`block text-base font-bold ${
                          theme === "light" ? "text-gray-700" : "text-gray-200"
                        } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                        htmlFor="axBriefId"
                      >
                        Project
                      </label>
                      <p className="ml-10 text-blue-700 font-bold">{project}</p>
                    </div>
                    <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                      <label
                        className={`block text-base font-bold ${
                          theme === "light" ? "text-gray-700" : "text-gray-200"
                        } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                        htmlFor="sketchId"
                      >
                        Sketch number
                      </label>
                      <Select
                        id="sketchId"
                        options={sketchOptions}
                        onChange={handleSketch}
                        className={`ml-10 ${
                          theme === "light"
                            ? "border-gray-300"
                            : "bg-gray-700 text-gray-100 border-gray-600"
                        } w-full md:w-3/5`}
                        required
                      />
                    </div>
                  </>
                )}

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

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label
                    className={`block text-base font-bold mb-2 ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                    htmlFor="assignDate"
                  >
                    Assign Date
                  </label>
                  <input
                    type="date"
                    id="assignDate"
                    value={assign_date}
                    onChange={(e) => setAssign_date(e.target.value)}
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
                    htmlFor="targetDate"
                  >
                    Target Date
                  </label>
                  <input
                    type="date"
                    id="targetDate"
                    value={target_date}
                    onChange={(e) => setTarget_date(e.target.value)}
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
                    htmlFor="targetDate"
                  >
                    Departmemt
                  </label>
                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    options={deptOptions}
                    value={deptOptions.find(
                      (option) => option.value === assignTo
                    )}
                    onChange={handledept}
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
                    Asignee Email
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
                    htmlFor="targetDate"
                  >
                    Person Email
                  </label>
                  <input
                    type="email"
                    id="personemail"
                    value={person}
                    onChange={(e) => setPerson(e.target.value)}
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
                    htmlFor="targetDate"
                  >
                    HOD Email
                  </label>
                  <input
                    type="email"
                    id="hodemail"
                    value={hodemail}
                    onChange={(e) => setHodemail(e.target.value)}
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
                    Priority
                  </label>

                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    options={priorityOptions}
                    value={priorityOptions.find(
                      (option) => option.value === priority
                    )}
                    onChange={(selectedOption) =>
                      setPriority(selectedOption?.value || "medium")
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
                    Have a Reference Images
                  </label>

                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                      theme === "light"
                        ? "border-gray-300"
                        : "bg-gray-700 text-gray-100 border-gray-600"
                    } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    options={images}
                    value={images.find((option) => option.value === ref_images)}
                    onChange={handle_images_upload}
                    required
                  />
                </div>

                {image_upload && (
                  <div className="ml-20">
                    <label
                      htmlFor="uploadFile1"
                      className="bg-white text-gray-500 font-semibold text-base rounded max-w-[60%] h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto"
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
                        // onChange={handleFileChange}
                        // disabled={fileType === ""}
                      />
                      <p className="text-xs font-medium text-gray-400 mt-2">
                        .xlsx file formats are only allowed.
                      </p>
                    </label>
                  </div>
                )}

                <div
                  className={`block text-base font-bold mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                  htmlFor="targetDate"
                >
                    <input 
        id="link-checkbox" 
        type="checkbox" 
        checked={isChecked} 
        onChange={handleCheckboxChange} 
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800" 
      />
                  <label className="ms-2 text-sm font-medium text-gray-900 relative -top-1">
                    Project View only.
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateTask;
