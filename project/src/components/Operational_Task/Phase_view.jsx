import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { IoMdOpen } from "react-icons/io";
import Datepicker from "react-tailwindcss-datepicker";
import { CiCalendarDate } from "react-icons/ci";
import { useToast } from "vue-toast-notification";


function Phase_view() {
  const toast = useToast();
  const [overallPhaseData, setOverallPhaseData] = useState({});
  const location = useLocation();
  const { taskId, project_name, assignee} = location.state || {};
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });

  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [filter_on, setFilter_on] = useState(false);

  const toggleModal = (task_id) => {
    setGraceUpdate(task_id);
    setShowModal((prev) => !prev); // Toggle modal visibility
  };

  const loggedUser = localStorage.getItem("Email");
  const getrole = localStorage.getItem("role");

  const getuserID = (mail) => {
    const filteredTeamData = teamDetails.filter(
      (task) => task.mail_id === mail
    );
    const userID = filteredTeamData[0].name;
    const indexOfFirst = userID.trim().indexOf(" ");
    return userID.trim().slice(0, indexOfFirst);
  };

  const openPhaseModal = () => {
    setIsPhaseModalOpen(true);
  };
  const closePhaseModal = () => setIsPhaseModalOpen(false);
  const [phaseTableData, setPhaseTableData] = useState([]);
  const [overAllData, setOverallData] = useState([]);
  const [teamDetails, setTeamDetails] = useState([]);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [link, setLink] = useState("");
  const statusOptions = [
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
  ];

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [viewNotes, setViewNotes] = useState("");
  const [viewLink, setViewLink] = useState("");

  const handleNotesOpen = (id) => {
    // console.log("Notes Opened",id);
    const filtered = submittedTasks.filter((task) => task.task_id === id);
    // console.log("filtered",filtered);
    setViewNotes(filtered[0].notes);
    setViewLink(filtered[0].link);
    setIsNotesOpen(true);
  };
  const handleNotesClose = () => {
    setIsNotesOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [notesTaskId, setNotesTaskId] = useState("");
  const [graceUpdate, setGraceUpdate] = useState("");

  const handleOpen = (id) => {
    setNotesTaskId(id);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setInputValue("");
  };

  const handleSubmit = () => {
    console.log("Submitted value:", inputValue);
    updateTaskInDB(notesTaskId, {
      notes: taskNotes,
      link: link,
      type: "note",
    });
    setNotesTaskId("");
    setTaskNotes("");
    handleClose();
  };

  const handleGracePeriod = () => {
    const graceDate = new Date(value.startDate).toISOString().split("T")[0];

    console.log("Submitted value:", graceDate);

    updateTaskInDB(graceUpdate, {
      grace_period: graceDate,
      type: "grace",
    });
    setValue({
      startDate: null,
      endDate: null,
    });
    toggleModal(); // Close the modal after submission
  };

  const[currentEmailid, setCurrentEmailid] = useState("");

  const fetchData = async () => {
    // Clear previous options
    setAssigneeOptions([]); // Clear the previous state

    const teamResponse = await fetch("http://localhost:8081/api/team-member");
    const teamData = await teamResponse.json();
    const filteredTeamData = teamData.filter((task) => task.task_id === taskId);

    // Use map to create a new array for assigneeOptions
    const newAssigneeOptions = filteredTeamData.map((task) => ({
      value: task.mail_id,
      label: task.name,
    }));

    // Set the new options in state
    setAssigneeOptions(newAssigneeOptions);

    setTeamDetails(filteredTeamData);
    // console.log(teamDetails);

    // Fetch phase tasks
    const phaseTaskResponse = await fetch(
      "http://localhost:8081/api/phase-tasks"
    );
    const phaseTaskData = await phaseTaskResponse.json();
    const filteredPhaseTaskData = phaseTaskData.filter(
      (task) => task.ot_id === taskId
    );
    setSubmittedTasks(filteredPhaseTaskData);

    // Fetch phases
    const phaseResponse = await fetch("http://localhost:8081/api/phases");
    const phaseData = await phaseResponse.json();
    const filteredPhaseData = phaseData.filter(
      (phase) => phase.task_id === taskId
    );
    setPhaseTableData(filteredPhaseData);


    // Construct overall data structure
    const overallData = {};

    filteredPhaseData.forEach((phase) => {
      overallData[phase.phase_id] = {
        phase_id: phase.phase_id,
        phase_name: phase.phase_name,
        tasks: filteredPhaseTaskData.filter(
          (task) => task.phase_id === phase.phase_id
        ),
        phase_status: phase.phase_status,
      };
    });

    setOverallData(overallData);

    console.log("Over all Data", overallData);

    phaseStatusUpdation();
    // console.log("Over all Data",overallData);  
  };

  useEffect(() => {
    phaseStatusUpdation();
  }, []);

  const phaseStatusUpdation = useCallback(async () => {
    try {
      const phaseResponse = await fetch("http://localhost:8081/api/phases");
      const phaseData = await phaseResponse.json();
      const filteredPhaseData = phaseData.filter(
        (phase) => phase.task_id === taskId
      );

      const phaseTaskResponse = await fetch(
        "http://localhost:8081/api/phase-tasks"
      );
      const phaseTaskData = await phaseTaskResponse.json();
      const filteredPhaseTaskData = phaseTaskData.filter(
        (task) => task.ot_id === taskId
      );

      const overallData = {};

      filteredPhaseData.forEach((phase) => {
        overallData[phase.phase_id] = {
          phase_id: phase.phase_id,
          phase_name: phase.phase_name,
          tasks: filteredPhaseTaskData.filter(
            (task) => task.phase_id === phase.phase_id
          ),
          phase_status: phase.phase_status,
        };
      });

      // console.log("Overall Data", overallData);
      setOverallPhaseData(overallData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [taskId]);

  const areAllTasksCompleted = (tasks) => {
    return tasks.every((task) => task.status === "Completed");
  };

  const updatePhaseStatusIfAllTasksCompleted = async (phaseId, phaseData) => {
    if (areAllTasksCompleted(phaseData.tasks)) {
      const updatedPhase = {
        phase_status: "Completed",
      };

      try {
        const response = await fetch(
          `http://localhost:8081/api/update-phase/${phaseId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPhase),
          }
        );

        const data = await response.json();
        // console.log("Phase updated successfully:", data);
      } catch (error) {
        console.error("Error updating phase:", error);
      }
    } else {
      // console.log("Not all tasks are completed for this phase.");
      const updatedPhase = {
        phase_status: "In Progress",
      };

      try {
        const response = await fetch(
          `http://localhost:8081/api/update-phase/${phaseId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedPhase),
          }
        );

        const data = await response.json();
        // console.log("Phase updated successfully:", data);
      } catch (error) {
        console.error("Error updating phase:", error);
      }
    }
  };

  useEffect(() => {
    phaseStatusUpdation();
  }, [phaseStatusUpdation]);

  useEffect(() => {
    Object.keys(overallPhaseData).forEach((phaseId) => {
      const phaseData = overallPhaseData[phaseId];
      updatePhaseStatusIfAllTasksCompleted(phaseId, phaseData);
    });
  }, [overallPhaseData]);

  const updateTaskInDB = (taskId, updatedFields) => {
    // Ensure updatedFields is a valid JSON object
    fetch(`http://localhost:8081/api/phase-task/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields), // Convert the object to a valid JSON string
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Task updated successfully:", data);
      })
      .catch((error) => {
        console.error("Error updating task:", error);
      });
    handleClose();
    fetchData(); // Refresh data after update
  };

  useEffect(() => {
    fetchData();
    // console.log("Phase Table Data");
  }, []);

  const [tasks, setTasks] = useState([
    {
      task_id: "",
      phase_id: "",
      task_name: "",
      description: "",
      start_date: "",
      end_date: "",
      assignee: "",
      owner_email: "",
      grace_period: "",
      ot_id: "",
    },
  ]);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [phase, setPhase] = useState("");

  // Handle input change for tasks
  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  // Add a new task
  // Add a new task form entry
  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        task_id: "",
        phase_id: "",
        task_name: "",
        description: "",
        start_date: "",
        end_date: "",
        assignee: "",
        owner_email: "",
        grace_period: "",
        ot_id: "",
      },
    ]);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    try {
      // Filter the submitted tasks based on ot_id to find the previous phase
      const filteredTasksByOT = phaseTableData.filter(
        (task) => task.task_id === taskId
      );
      const previousPhaseId =
        filteredTasksByOT.length > 0
          ? filteredTasksByOT[filteredTasksByOT.length - 1].phase_id
          : `PH0`;

      // Generate the new phase ID based on the ot_id
      const newPhaseID = `PH${parseInt(previousPhaseId.slice(2)) + 1}`;

      const phaseData = {
        phase_id: newPhaseID,
        task_id: taskId, // Ensure taskId is unique per phase
        phase_name: phase, // Assuming 'phase' is a string variable with phase name
      };

      // Task counter to generate unique task IDs within this phase
      let taskCounter = 0;

      // Helper function to generate unique task IDs within this phase
      const generateTaskId = () => {
        taskCounter++; // Increment task counter
        return `${phaseData.phase_id}TA${taskCounter}`; // New task ID e.g., OT1PH1TA1, OT1PH1TA2, etc.
      };

      // Create updated tasks with new phase ID and generated task IDs
      const updatedTasks = tasks.map((task) => ({
        ...task,
        phase_id: phaseData.phase_id, // Ensure phase ID is added
        task_id: generateTaskId(), // Generate unique task ID
        start_date: task.start_date || "",
        end_date: task.end_date || "",
        grace_period: task.grace_period || "",
        ot_id: taskId,
      }));

      // // Log for debugging
      // console.log("Phase Data:", phaseData);
      // console.log("Updated Task Data:", updatedTasks);

      // Submit phase data
      const phaseResponse = await fetch("http://localhost:8081/api/phase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(phaseData),
      });

      if (!phaseResponse.ok) {
        const errorDetails = await phaseResponse.json();
        console.error("Failed to submit phase:", errorDetails);
        throw new Error("Failed to submit phase");
      }

      // Submit task data
      const taskResponse = await fetch("http://localhost:8081/api/phase-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTasks),
      });

      if (!taskResponse.ok) {
        const errorDetails = await taskResponse.json();
        console.error("Failed to submit tasks:", errorDetails);
        throw new Error("Failed to submit tasks");
      }

      const taskResult = await taskResponse.json();
      // console.log("Tasks and phase submitted:", taskResult);

      setPhase("");
      setTasks([
        {
          task_id: "",
          phase_id: "",
          task_name: "",
          description: "",
          start_date: "",
          end_date: "",
          assignee: "",
          owner_email: "",
          grace_period: "",
          ot_id: "",
        },
      ]);
      closePhaseModal();
      fetchData();

      try{
        const response = await fetch("http://localhost:8081/api/send-email/Op-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignee: assignee,
            currentEmailid: currentEmailid,
            phase: phase,
            task: updatedTasks,
            phase_id: newPhaseID.slice(2),
          }),
        });
        console.log(response);

        if(response.ok){
          toast.success("Email sent successfully");
        }
        else{
          toast.error("Error sending email");
        }

      }
      catch (error) {
        console.error("Error sending email:", error);
        toast.error("Error sending email");

      }


    } catch (error) {
      console.error("Error submitting phase and tasks:", error);
    }
  };

  return (
    <>
      <div
        className={`min-h-screen w-full flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
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
            {/* <main */}
            {/* className={`flex-1 overflow-y-auto overflow-x-auto p-4 ml-20  md:px-8 lg:px-4  md:max-w-screen-xl 2xl:max-w-screen-2xl`} 
>*/}
            <div className="flex justify-between  p-4 items-center">
              <h1 className="text-xl font-bold">Project Phases - {taskId}</h1>
              <div className="m-4">
                <button
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold"
                  onClick={openPhaseModal}
                >
                  Add New Phase
                </button>
              </div>
            </div>

            {isPhaseModalOpen && (
              <div
                className="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                onClick={openPhaseModal}
              >
                <div className="w-full max-h-[80vh] overflow-y-auto">
                  <div
                    className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${
                      theme === "light" ? "bg-white" : "bg-gray-900"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end p-2">
                      <h2
                        className={`text-2xl font-semibold ${
                          theme === "light" ? "text-gray-800" : "text-gray-100"
                        }`}
                      >
                        Create Task Phases
                      </h2>
                      <button
                        onClick={closePhaseModal}
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

                    <form onSubmit={handleTaskSubmit} className="mx-10">
                      <div className="space-y-6 ">
                        {/* Phase Input Outside of the Task Mapping */}
                        <div className="py-5 space-y-5 ">
                          <div className="md:flex md:flex-row">
                            <label
                              className={`block text-base font-bold w-full md:w-1/5 ${
                                theme === "light"
                                  ? "text-gray-700"
                                  : "text-gray-200"
                              }`}
                            >
                              Phase
                            </label>
                            <input
                              type="text"
                              className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                theme === "light"
                                  ? "bg-gray-100 text-gray-700 border-gray-300"
                                  : "bg-gray-700 text-gray-100 border-gray-600"
                              }`}
                              placeholder="Enter Phase"
                              value={phase} // Assume you have a phase state
                              onChange={(e) => setPhase(e.target.value)} // Update accordingly
                              required
                            />
                          </div>
                        </div>

                        {/* Task Mapping */}
                        {tasks.map((task, index) => (
                          <div key={index} className="py-5 space-y-5">
                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                Task Name
                              </label>
                              <input
                                type="text"
                                className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                  theme === "light"
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                placeholder="Enter Task"
                                value={task.task_name}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "task_name",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                Description
                              </label>
                              <input
                                type="text"
                                className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                  theme === "light"
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                placeholder="Enter Description"
                                value={task.description}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                Start Date
                              </label>
                              <input
                                type="date"
                                className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                  theme === "light"
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                value={task.start_date}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                End Date
                              </label>
                              <input
                                type="date"
                                className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                  theme === "light"
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                value={task.end_date}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "end_date",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                Assignee
                              </label>
                              <Select
                                className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                                  theme === "light"
                                    ? "border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                options={assigneeOptions}
                                value={assigneeOptions.find(
                                  (option) => option.value === task.assignee
                                )}
                                onChange={(selectedOption) => {
                                  setCurrentEmailid(selectedOption.value);
                                  handleInputChange(
                                    index,
                                    "assignee",
                                    selectedOption?.value || ""
                                  );
                                }}
                                placeholder="Select Assignee"
                                required
                                isClearable
                              />
                            </div>

                            <div className="md:flex md:flex-row">
                              <label
                                className={`block text-base font-bold w-full md:w-1/5 ${
                                  theme === "light"
                                    ? "text-gray-700"
                                    : "text-gray-200"
                                }`}
                              >
                                Owner
                              </label>
                              <input
                                type="text"
                                className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${
                                  theme === "light"
                                    ? "bg-gray-100 text-gray-700 border-gray-300"
                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                }`}
                                placeholder="Enter Owner's Name"
                                value={task.owner_email}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "owner_email",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Button to add more tasks */}
                      <button
                        type="button"
                        onClick={handleAddTask}
                        className={`py-2 px-4 text-sm font-bold text-white rounded-lg ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-800"
                        }`}
                      >
                        Add another Task
                      </button>

                      <div className="flex justify-center mt-6">
                        <button
                          type="submit"
                          className={`w-full md:w-1/3 py-3 px-4 font-bold text-white rounded-lg ${
                            theme === "light"
                              ? "bg-blue-500 hover:bg-blue-700"
                              : "bg-blue-600 hover:bg-blue-800"
                          }`}
                        >
                          Create New Phase
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {Object.keys(overAllData).length > 0 ? (
              Object.entries(overAllData).map(([phaseId, phaseData]) => (
                <div
                  key={phaseId} // Use phaseId as the key for better uniqueness
                  className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg"
                >
                  <div className="mb-6">
                    <div className="flex justify-between items-center mr-10">
                      <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                        Phase {phaseId.slice(2)} - {phaseData.phase_name}
                      </h1>

                      <p
                        className={`border-2 px-4 py-2 rounded-lg
                     ${
                       phaseData.phase_status === "In Progress"
                         ? "bg-red-100 text-red-600 border-red-400"
                         : "bg-green-100 text-green-600 border-green-400"
                     } `}
                      >
                        {phaseData.phase_status}
                      </p>
                    </div>
                    <div className="">
                      <table className="w-full table-auto text-sm">
                        <thead>
                          <tr className="bg-gray-300 text-gray-700">
                            {[
                              "Task",
                              "Description",
                              "Start Date",
                              "End Date",
                              "Grace Period",
                              "Assignee",
                              "Owner",
                              "Status",
                              "Notes",
                            ].map((header) => (
                              <th
                                key={header}
                                className="py-3 text-center font-semibold text-base"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {phaseData.tasks.map((task, index) => (
                            <tr
                              key={task.task_id} // Use task_id for better uniqueness, fallback to index
                              className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                            >
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                {task.task_name}
                              </td>
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                {task.description}
                              </td>
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                {task.start_date
                                  ? task.start_date.slice(0, 10)
                                  : "N/A"}
                              </td>
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base text-red-500">
                                {task.end_date
                                  ? task.end_date.slice(0, 10)
                                  : "N/A"}
                              </td>
                              <td
                                className={`py-4 text-center whitespace-nowrap text-base ${
                                  task.grace_period ? "text-green-500" : ""
                                } `}
                              >
                                {task.grace_period ? (
                                  task.grace_period.slice(0, 10) // Show grace period date
                                ) : assignee === loggedUser ||
                                  getuserID(task.assignee) === loggedUser ? (
                                  <div>
                                    <button
                                      onClick={() => {
                                        toggleModal(task.task_id);
                                      }}
                                      className="icon-button"
                                    >
                                      <CiCalendarDate size={24} />
                                    </button>
                                    {showModal && (
                                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-20">
                                        <div className="bg-white rounded shadow-lg flex flex-col p-14">
                                          <Datepicker
                                            primaryColor={"fuchsia"}
                                            useRange={false}
                                            asSingle={true}
                                            value={value}
                                            onChange={(newValue) =>
                                              setValue(newValue)
                                            }
                                            inputClassName={`border rounded w-full py-4 px-3 leading-tight focus:outline-none focus:shadow-outline  ${
                                              theme === "light"
                                                ? "bg-white text-gray-900 border-gray-300"
                                                : "bg-gray-700 text-gray-100 border-gray-600"
                                            }`}
                                          />
                                          <div className="mt-4 flex justify-center">
                                            <button
                                              className="bg-blue-100 text-blue-600 rounded px-4 py-2 mr-2 font-semibold"
                                              onClick={() => {
                                                if (value.startDate) {
                                                  handleGracePeriod();
                                                } else {
                                                  console.log(
                                                    "Start date is required"
                                                  );
                                                }
                                              }}
                                            >
                                              Add Notes
                                            </button>
                                            <button
                                              className="bg-gray-300 text-gray-700 rounded px-4 py-2"
                                              onClick={toggleModal}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p>N/A</p>
                                )}
                              </td>
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                <a
                                  href={`mailto:${task.assignee}`}
                                  className="text-blue-500 underline"
                                >
                                  {task.assignee}
                                </a>
                              </td>
                              <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                {task.owner_email}
                              </td>

                              <td className="py-4 flext justify-center items-center text-center whitespace-nowrap text-base">
                                {task.status !== "Completed" &&
                                (task.assignee === loggedUser ||
                                  getuserID(task.assignee) === loggedUser) ? (
                                  <Select
                                    className={`rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                                      theme === "light"
                                        ? "border-gray-300"
                                        : "bg-gray-700 text-gray-100 border-gray-600"
                                    } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5 `}
                                    isClearable
                                    options={statusOptions}
                                    placeholder="Update Status"
                                    required
                                    value={statusOptions.find(
                                      (option) => option.value === taskStatus
                                    )}
                                    onChange={(selectedOption) => {
                                      const newStatus = selectedOption
                                        ? selectedOption.value
                                        : "";
                                      setTaskStatus(newStatus);
                                      // Call the function to update the task status in the database
                                      updateTaskInDB(task.task_id, {
                                        status: newStatus,
                                        type: "state",
                                        phaseId: task.phase_id,
                                      });

                                      // handleTaskStatusChange(task.task_id, newStatus, task.phase_id);
                                    }}
                                  />
                                ) : (
                                  task.status
                                )}
                              </td>

                              <td className="py-4 flex justify-center items-center text-center whitespace-nowrap text-base">
                                {task.notes === "Not Yet Received" &&
                                (task.assignee === loggedUser ||
                                  getuserID(task.assignee) === loggedUser) ? (
                                  <div>
                                    <TbEdit
                                      className=" h-7 w-7 mt-2 text-gray-400 cursor-pointer"
                                      onClick={() => handleOpen(task.task_id)}
                                    />

                                    {isOpen && (
                                      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                                        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
                                          <h2 className="text-xl font-semibold mb-4">
                                            Add your Notes Here
                                          </h2>
                                          <div className="flex flex-col">
                                            <textarea
                                              className="border rounded w-full p-2 focus:outline-sky-500"
                                              rows="4"
                                              value={taskNotes}
                                              onChange={(e) => {
                                                const newNotes = e.target.value;
                                                setTaskNotes(newNotes);
                                              }}
                                              placeholder="Type your notes here..."
                                            />

                                            <input
                                              type="text"
                                              className={`appearance-none border rounded w-full mt-5 py-2 px-3 focus:outline-sky-500 ${
                                                theme === "light"
                                                  ? "bg-gray-100 text-gray-700 border-gray-300"
                                                  : "bg-gray-700 text-gray-100 border-gray-600"
                                              }`}
                                              placeholder="Provide Your Work Drive Link Here"
                                              value={link} // Assume you have a phase state
                                              onChange={(e) =>
                                                setLink(e.target.value)
                                              } // Update accordingly
                                              required
                                            />
                                          </div>

                                          <div className="mt-4 flex justify-end">
                                            <button
                                              className="bg-blue-100 text-blue-600 rounded px-4 py-2 mr-2 font-semibold"
                                              onClick={handleSubmit}
                                            >
                                              Add Notes
                                            </button>
                                            <button
                                              className="bg-gray-300 text-gray-700 rounded px-4 py-2"
                                              onClick={handleClose}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  // task.notes
                                  <div>
                                    <MdOutlineRemoveRedEye
                                      className=" h-7 w-7 text-gray-400 cursor-pointer"
                                      onClick={() =>
                                        handleNotesOpen(task.task_id)
                                      }
                                    />

                                    {isNotesOpen && (
                                      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-20">
                                        <div className="bg-white p-5 rounded-lg shadow-lg w-1/3">
                                          <h2 className="text-xl font-semibold mb-4">
                                            View Notes
                                          </h2>
                                          <div className="flex flex-col ">
                                            <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5 flex items-center">
                                              <label
                                                className={`block text-lg font-semibold  ${
                                                  theme === "light"
                                                    ? "text-gray-700"
                                                    : "text-gray-200"
                                                } w-full px-6 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                                                htmlFor="notes"
                                              >
                                                Notes:
                                              </label>
                                              <p className="text-lg text-gray-500 font-semibold">
                                                {viewNotes}
                                              </p>
                                            </div>

                                            <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5 flex items-center">
                                              <label
                                                className={`block text-lg font-semibold ${
                                                  theme === "light"
                                                    ? "text-gray-700"
                                                    : "text-gray-200"
                                                } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                                                htmlFor="link"
                                              >
                                                Link :
                                              </label>
                                              <a
                                                className=" text-base underline flex items-end gap-2 underline-offset-4 text-blue-500 font-semibold "
                                                target="_blank"
                                                href={viewLink}
                                              >
                                                {" "}
                                                {viewLink
                                                  ? "Open Attachment"
                                                  : " No Link Attached"}{" "}
                                                <IoMdOpen />{" "}
                                              </a>
                                            </div>
                                          </div>

                                          <div className="mt-4 flex justify-end">
                                            <button
                                              className="bg-red-100 text-red-500 border font-semibold border-red-500 rounded px-4 py-1"
                                              onClick={handleNotesClose}
                                            >
                                              Close
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              ))
            ) : (
              <h1 className="text-red-600 text-xl text-center font-semibold">
                No Phases added Yet to the Task - {project_name}
              </h1>
            )}
            {/* </main> */}
          </main>
        </div>
      </div>
    </>
  );
}

export default Phase_view;
