import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Select from "react-select";

function CreateTask() {
  const [axBriefMapping, setAxBriefMapping] = useState({});
  // const axBriefMapping = {
  //   "BF-900001390": {
  //     collectionName: "MANGAL SUTRA COLLECTION-ISHTAA-PAN INDIA",
  //     project: "ISHTAA"
  //   },
  //   "BF-900001393": {
  //     collectionName: "ISHTAA-LADIES RING-PAN INDIA",
  //     project: "ISHTAA"
  //   },
  //   "BF-900001395": {
  //     collectionName: "ISHTAA-CHAIN SET-ELECTRO FORMING-PAN INDIA",
  //     project: "ISHTAA"
  //   }
  // };
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
  const [assignTo, setassignTo] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [assign_date, setAssign_date] = useState("");
  const [target_date, setTarget_date] = useState("");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [sketchOptions, setSketchOptions] = useState([]);

  const handleAxBriefIdChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setAx_brief(value);
    console.log("brief id", value);

    // Check if value exists in the axBriefMapping
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

  // const handleAxBriefIdChange = (selectedOption) => {
  //   const value = selectedOption ? selectedOption.value : '';
  //   setAx_brief(value);

  //   const briefDetails = axBriefMapping[value];
  //   if (briefDetails) {
  //     setCollection_name(briefDetails.designspecs[0] || '');
  //     setProject(briefDetails.pltcodes[0] || '');

  //     // Access sketchnums correctly
  //     const sketchnums = briefDetails.sketchnums || [];
  //     setSketchOptions(sketchnums.map(num => ({ value: num, label: num })));

  //     setIsAutoFilled(true);
  //     setError('');
  //   } else {
  //     setCollection_name('');
  //     setProject('');
  //     setSketchOptions([]);
  //     setIsAutoFilled(false);
  //   }
  // };

  const handleAxBriefIdBlur = () => {
    if (!axBriefMapping[ax_brief]) {
      setError("Please enter a correct AX Brief ID");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAutoFilled) {
      setError("Please enter a correct AX Brief ID");
      return;
    }

    const taskData = {
      ax_brief,
      collection_name,
      project,
      no_of_qty,
      assign_date,
      target_date,
      assignTo,
      priority,
    };

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
    } catch (error) {
      console.error(error);
      setError("An error occurred while creating the task");
    }
  };
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
  // const briefOptions = [ { value: 'BF-900001390', label: 'BF-900001390' }, { value: 'BF-900001393', label: 'BF-900001393' }, { value: 'BF-900001395', label: 'BF-900001395' } ];

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
                  <p className="ml-10 text-blue-700 font-bold">{collection_name}</p>
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
                    onChange={(selectedOption) =>
                      setassignTo(selectedOption?.value || "")
                    }
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
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
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
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
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
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
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

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
                      theme === "light"
                        ? "bg-blue-500 hover:bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-800"
                    }`}
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
