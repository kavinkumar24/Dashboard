import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";

function Phase_view() {
  const location = useLocation();
  const { taskId, project_name, assignee } = location.state || {};
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);

  const openPhaseModal = () => {
    setIsPhaseModalOpen(true);
  };
  const closePhaseModal = () => setIsPhaseModalOpen(false);
  const [phaseTableData, setphaseTableData] = useState([]);
  const [overAllData, setOverAllData] = useState([]);
  const [teamDetails, setTeamDetails] = useState([]);
  const[assigneeOptions ,setassigneeOptions ] = useState([]);

  // const assigneeOptions = [
  //   { value: "assignee1@example.com", label: "Assignee 1" },
  //   { value: "assignee2@example.com", label: "Assignee 2" },
  //   // Add more options as needed
  // ];
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    
    const teamResponse = await fetch("http://localhost:8081/team-member");
    const teamData = await teamResponse.json();
    const filteredTeamData = teamData.filter(task=>task.task_id === taskId);
    

    filteredTeamData.map((task) => {
      assigneeOptions.push({ value: task.mail_id, label: task.name });
    }
  )


    setTeamDetails(filteredTeamData);
    console.log(filteredTeamData);
    // Fetch phase tasks

    const phaseTaskResponse = await fetch("http://localhost:8081/phase-tasks");
    const phaseTaskData = await phaseTaskResponse.json();
    const filteredPhaseTaskData = phaseTaskData.filter(
      (task) => task.ot_id === taskId
    );
    setSubmittedTasks(filteredPhaseTaskData);

    // Fetch phases
    const phaseResponse = await fetch("http://localhost:8081/phases");
    const phaseData = await phaseResponse.json();
    const filteredPhaseData = phaseData.filter(
      (phase) => phase.task_id === taskId
    );
    setphaseTableData(filteredPhaseData);

    // Construct overall data structure
    const overallData = {};

    filteredPhaseData.forEach((phase) => {
      overallData[phase.phase_id] = {
        phase_id: phase.phase_id,
        phase_name: phase.phase_name,
        tasks: filteredPhaseTaskData.filter(
          (task) => task.phase_id === phase.phase_id
        ),
      };
    });

    setOverAllData(overallData);

    // Log overall data
    console.log(overallData);
  };

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

      // Log for debugging
      console.log("Phase Data:", phaseData);
      console.log("Updated Task Data:", updatedTasks);

      // Submit phase data
      const phaseResponse = await fetch("http://localhost:8081/phase", {
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
      const taskResponse = await fetch("http://localhost:8081/phase-task", {
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
      console.log("Tasks and phase submitted:", taskResult);

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
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
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
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
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
                              options={assigneeOptions} // Define this array elsewhere
                              value={assigneeOptions.find(
                                (option) => option.value === task.assignee
                              )}
                              onChange={(selectedOption) => {
                                handleInputChange(
                                  index,
                                  "assignee",
                                  selectedOption?.value || ""
                                ); // Adjusting the value on selection
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
                key={phaseId}
                className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg"
              >
                <div className="mb-6">
                  <div className="flex justify-between">
                    <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                      Phase {phaseId.slice(2)} - {phaseData.phase_name}
                    </h1>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-sm">
                      <thead>
                        <tr className="bg-gray-300 text-gray-700">
                          <th className="py-3 text-center font-semibold text-base">
                            Task
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Description
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Start Date
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            End Date
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Grace Period
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Assignee
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Owner
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Status
                          </th>
                          <th className="py-3 text-center font-semibold text-base">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseData.tasks.map((task, index) => (
                          <tr
                            key={index}
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
                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base text-green-500">
                              {task.grace_period
                                ? task.grace_period.slice(0, 10)
                                : "N/A"}
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
                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                              {task.status}
                            </td>
                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                              {task.notes}
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
        </div>
      </div>
    </>
  );
}

export default Phase_view;
