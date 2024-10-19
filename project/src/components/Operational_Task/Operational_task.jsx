import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function Operational_task() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [activeRow, setActiveRow] = useState(null);
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  // const [phaseData, setPhaseData] = useState([]);
  const [filter_on, setFilter_on] = useState(false);

  const [tableData, setTableData] = useState([]);
  useEffect(() => {
    fetchData();
    fetchTeamData();
    fetchUserData();
    fetchPhaseTaskData();
    // fetchPhaseData();
  }, []);

  // useEffect(() => {fetchPhaseTaskData()}, [activeRow]);

  const fetchTeamData = () => {
    fetch("http://localhost:8081/api/team-member")
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        setTeamTableData(data);
      })
      .catch((err) => console.log(err));
  };

  const fetchData = () => {
    fetch("http://localhost:8081/api/operational-task")
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        setTableData(data);
      })
      .catch((err) => console.log(err));
  };

  const fetchUserData = () => {
    fetch("http://localhost:8081/api/user")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((task) => ({
          value: task.Email,
          label: `${task.emp_id} - ${task.employer_name}`,
        }));
        setAssigneeOptions(options); // Set the fetched options
      })
      .catch((err) => console.log(err));
  };

  // State to hold phase data (assuming you're using useState)
  const [phaseData, setPhaseData] = useState([]);

  // Fetch phase data from the backend
  const fetchPhaseData = () => {
    fetch("http://localhost:8081/api/phases")
      .then((res) => res.json())
      .then((data) => {
        setPhaseData(data);
        updateTaskStatusIfCompleted(data, "OT1"); // Call the function after fetching data
      })
      .catch((err) => console.log(err));
  };

  // Function to check if all phases for a specific task are completed
  const updateTaskStatusIfCompleted = (phases, taskId) => {
    const taskPhases = phases.filter((phase) => phase.task_id === taskId);
    const allCompleted = taskPhases.every(
      (phase) => phase.phase_status === "Completed"
    );

    if (allCompleted) {
      // Update the task status to 'Completed'
      updateTaskInDB(taskId, { status: "Completed" });
      console.log(`Task ${taskId} status updated to Completed.`);
    } else {
      console.log(`Task ${taskId} is not yet fully completed.`);
    }
  };

  // Function to update the task status in the database (example)
  const updateTaskInDB = (taskId, updateData) => {
    // fetch(`http://localhost:8081/tasks/${taskId}`, {
    //   method: "PUT",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(updateData),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(`Task ${taskId} updated successfully:`, data);
    //   })
    //   .catch((err) => console.log(err));

    console.log(`Task ${taskId} updated with:`, updateData);
  };

  // Fetch phase data on component mount or when needed
  useEffect(() => {
    fetchPhaseData();
  }, []);

  const fetchPhaseTaskData = () => {
    fetch("http://localhost:8081/api/phase-tasks")
      .then((res) => res.json())
      .then((data) => {
        console.log("taskdata", data);

        // Extract unique ot_id values
        const uniqueOtIds = [...new Set(data.map((task) => task.ot_id))];
        console.log("Unique ot_id values:", uniqueOtIds);

        // Filter the data based on unique ot_id (not using activeRow)
        const filteredData = uniqueOtIds.map((ot_id) =>
          data.filter((task) => task.ot_id === ot_id)
        );
        console.log("Filtered Data by ot_id:", filteredData);

        // If you need to store filtered data in state
        // setPhaseTaskTableData(filteredData);
      })
      .catch((err) => console.log(err));
  };

  const handleViewPhase = (taskId, project_name, assignee) => {
    console.log(taskId);
    navigate("/task/operational_task/phase_view", {
      state: { taskId, project_name, assignee},
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsAPerPage = 10;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const [teamDetails, setTeamDetails] = useState({});
  // Function to toggle accordion and fetch team details

  const toggleAccordion = (task_id) => {
    if (activeRow === task_id) {
      // Close the accordion if it's already open
      setActiveRow(null);
    } else {
      // Get the team details for the given task_id from teamTableData
      const teamData = teamTableData.filter((team) => team.task_id === task_id);

      // Open the accordion and set team details
      setActiveRow(task_id);
      setTeamDetails((prevDetails) => ({
        ...prevDetails,
        [task_id]: teamData, // Add the new team data for the task
      }));
    }
  };

  const [task_id, setTask_id] = useState("");
  const [lastEdited, setLastEdited] = useState("");
  const [attachment, setAttachment] = useState("Not Yet Received");

  const [project_name, setProject_name] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [assigneeemail, setAssigneeemail] = useState("");
  const [startingDate, setStartingDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const openTaskModal = () => setIsTaskModalOpen(true);
  const closeTaskModal = () => setIsTaskModalOpen(false);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    // Generate the new task ID based on the last task in tableData
    const previousID =
      tableData.length > 0 ? tableData[tableData.length - 1].task_id : "OT0";
    const newID = `OT${parseInt(previousID.slice(2)) + 1}`;

    const newTask = {
      task_id: newID, // Use the new task ID
      last_edited: lastEdited || new Date().toISOString().split("T")[0], // Set lastEdited to today's date if not set
      attachment: attachment, // Default attachment value
      project_name: project_name,
      status: status,
      assignee: assigneeemail,
      starting_date: startingDate,
      target_date: targetDate,
      priority: priority,
    };

    console.log(newTask);

    // Send a POST request to the API
    try {
      const response = await fetch(
        "http://localhost:8081/api/operational-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Error submitting task:", error);
    }

    fetchData();
    closeTaskModal();
  };

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const openTeamModal = () => setIsTeamModalOpen(true);
  const closeTeamModal = () => setIsTeamModalOpen(false);

  const [teamTableData, setTeamTableData] = useState([]);
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "" }]);

  // Add a new member to the team
  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", email: "" }]);
  };

  // Handle input change for each team member
  const handleInputChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();

    const task_ID = activeRow; // Get the active task ID

    // Add task_ID and default values to each team member
    const updatedTeamMembers = teamMembers.map((member) => ({
      ...member,
      task_id: task_ID,
      status: member.status || "In Progress", // Default status for new team members
      attachment_file: member.attachment_file || "Not Yet Received", // Default attachment placeholder
    }));

    try {
      // Send POST requests for each team member concurrently
      await Promise.all(
        updatedTeamMembers.map(async (member) => {
          const response = await fetch(
            "http://localhost:8081/api/team-member",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(member),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to submit team member");
          }

          const result = await response.json();
          console.log("Team member created successfully:", result.message);
        })
      );

      // Update teamTableData with new team members after API call succeeds
      setTeamTableData((prevData) => {
        const updatedData = [...prevData, ...updatedTeamMembers];
        console.log("Updated Team Table Data:", updatedData);

        // Automatically update the accordion with new data
        setTeamDetails((prevDetails) => ({
          ...prevDetails,
          [task_ID]: updatedData.filter((team) => team.task_id === task_ID),
        }));

        return updatedData; // Return updated table data
      });

      console.log("Team Table Data after addition:", teamTableData);

      // Close the team modal after submission
      fetchData();
      fetchTeamData();
      fetchUserData();
      closeTeamModal();
    } catch (error) {
      console.error("Error submitting team member:", error);
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
            <div className="flex justify-between mx-6">
              <h1 className="  font-bold text-xl">
                Operational Task overview{" "}
              </h1>
            </div>
            <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
              <div className="flex justify-between">
                <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                  Task details
                </h1>
                <div className="m-4">
                  <button
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold"
                    onClick={openTaskModal}
                  >
                    Add New Task
                  </button>
                </div>
              </div>

              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-300 text-gray-700">
                    <th className="py-3 text-center font-semibold text-base">
                      SI NO
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Task ID
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Project Name
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Status
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Assignee
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Starting date
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Target date
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Priority
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Last Edited
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      Attachment
                    </th>
                    <th className="py-3 text-center font-semibold text-base">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <React.Fragment key={item.task_id}>
                      <tr
                        onClick={() => toggleAccordion(item.task_id)}
                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.task_id}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.project_name}
                        </td>

                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.status}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.assignee}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.starting_date.slice(0, 10)}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.target_date.slice(0, 10)}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.priority}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.last_edited.slice(0, 10)}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          {item.attachment}
                        </td>
                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                          <button
                            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold"
                            onClick={() => {
                              handleViewPhase(
                                item.task_id,
                                item.project_name,
                                item.assignee
                              );
                            }}
                            // disabled={teamDetails[item.task_id]?.length === 0}
                          >
                            View Phases
                          </button>
                        </td>
                      </tr>

                      {activeRow === item.task_id && (
                        <tr>
                          <td colSpan="11" className="p-4">
                            <div className="overflow-hidden transition-all duration-300 ease-in-out">
                              <div className="mx-6 mb-6 border rounded-lg border-gray-300 bg-white shadow-lg">
                                <div className="flex justify-between">
                                  <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                                    Team details for task -{" "}
                                    <span className="text-[#879FFF]">
                                      {item.project_name}
                                    </span>
                                  </h1>
                                  <div className="m-4">
                                    <button
                                      className="px-5 py-2 bg-blue-100 text-blue-500 border-2  border-blue-500 rounded-lg font-semibold"
                                      onClick={openTeamModal}
                                    >
                                      Add Members to the Task
                                    </button>
                                    {/* <button className="px-5 py-2 ml-5 bg-blue-500 text-white rounded-lg font-semibold" onClick={openPhaseModal}>
                                    Add Phases Task
                                </button> */}
                                  </div>
                                </div>

                                <table className="w-full table-auto text-sm">
                                  <thead>
                                    <tr className="bg-gray-300 text-gray-700">
                                      <th className="py-3 text-center font-semibold text-base">
                                        SI no.
                                      </th>
                                      <th className="py-3 text-center font-semibold text-base">
                                        Task ID
                                      </th>
                                      <th className="py-3 text-center font-semibold text-base">
                                        Name
                                      </th>
                                      <th className="py-3 text-center font-semibold text-base">
                                        Mail ID
                                      </th>
                                      {/* <th className="py-3 text-center font-semibold text-base">
                                      Status
                                    </th>
                                    <th className="py-3 text-center font-semibold text-base">
                                      Attachment File
                                    </th> */}
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {teamDetails[item.task_id] &&
                                    teamDetails[item.task_id].length > 0 ? (
                                      teamDetails[item.task_id].map(
                                        (person, personIndex) => (
                                          <tr
                                            key={personIndex}
                                            className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                                          >
                                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                              {personIndex + 1}
                                            </td>
                                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                              {person.task_id}
                                            </td>
                                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                              {person.name}
                                            </td>
                                            <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                              {person.mail_id}
                                            </td>
                                            {/* <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                            {person.STATUS}
                                          </td>
                                          <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                            {person.attachment_file}
                                          </td> */}
                                          </tr>
                                        )
                                      )
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="6"
                                          className="text-center py-4"
                                        >
                                          No team members assigned yet.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-center space-x-2 m-4">
                <button
                  className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                  {currentPage}
                </button>

                <button
                  className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            {isTaskModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 p-20 flex justify-center items-center"
                onClick={closeTaskModal}
              >
                <div className="w-full ">
                  <div
                    className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${
                      theme === "light" ? "bg-white" : "bg-gray-900"
                    }`}
                    onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                  >
                    <div className="flex justify-end p-2">
                      <h2
                        className={`text-2xl font-semibold ${
                          theme === "light" ? "text-gray-800" : "text-gray-100"
                        }`}
                      >
                        Create a New Task
                      </h2>
                      <button
                        onClick={closeTaskModal}
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
                    <div className="">
                      <form onSubmit={handleTaskSubmit}>
                        <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                          <label
                            className={`block text-base font-bold mb-2 ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-200"
                            } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                            htmlFor="project_name"
                          >
                            Project Name
                          </label>
                          <input
                            type="text"
                            id="project_name"
                            value={project_name}
                            onChange={(e) => setProject_name(e.target.value)}
                            className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                              theme === "light"
                                ? "bg-gray-100 text-gray-700 border-gray-300"
                                : "bg-gray-700 text-gray-100 border-gray-600"
                            }  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                            placeholder="Enter Project Name"
                            required
                          />
                        </div>

                        <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                          <label
                            className={`block text-base font-bold mb-2 ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-200"
                            } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                            htmlFor="assigneeemail"
                          >
                            Task Assigner
                          </label>
                          <Select
                            className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${
                              theme === "light"
                                ? "border-gray-300"
                                : "bg-gray-700 text-gray-100 border-gray-600"
                            } w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                            isClearable
                            options={assigneeOptions} // Dynamically loaded options
                            value={assigneeOptions.find(
                              (option) => option.value === assigneeemail
                            )} // Set selected value
                            onChange={(selectedOption) =>
                              setAssigneeemail(selectedOption?.value || "")
                            } // Handle changes
                            placeholder="Select Assigner Name "
                            required
                          />
                        </div>

                        <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                          <label
                            className={`block text-base font-bold mb-2 ${
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-200"
                            } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                            htmlFor="startingDate"
                          >
                            Starting date
                          </label>
                          <input
                            type="date"
                            id="startingDate"
                            value={startingDate}
                            onChange={(e) => setStartingDate(e.target.value)}
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
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-200"
                            } w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`}
                            htmlFor="targetDate"
                          >
                            Target date
                          </label>
                          <input
                            type="date"
                            id="targetDate"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
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
                              theme === "light"
                                ? "text-gray-700"
                                : "text-gray-200"
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
                </div>
              </div>
            )}

            {isTeamModalOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 p-20 flex justify-center items-center"
                onClick={closeTeamModal}
              >
                <div className="w-1/2 ">
                  <div
                    className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${
                      theme === "light" ? "bg-white" : "bg-gray-900"
                    }`}
                    onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
                  >
                    <div className="flex justify-end p-2 mb-5">
                      <h2
                        className={`text-2xl font-semibold  ${
                          theme === "light" ? "text-gray-800" : "text-gray-100"
                        }`}
                      >
                        Add Team Details
                      </h2>
                      <button
                        onClick={closeTeamModal}
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
                    <div className="">
                      <form onSubmit={handleTeamSubmit}>
                        <div className="space-y-6">
                          {teamMembers.map((member, index) => (
                            <div
                              className="flex flex-col md:flex-row md:space-x-6 pb-5"
                              key={index}
                            >
                              {/* Name */}
                              <div className="flex flex-col md:w-1/2">
                                <label
                                  className={`block text-base font-bold ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-200"
                                  }`}
                                  htmlFor={`person_name_${index}`}
                                >
                                  Name
                                </label>

                                <Select
                                  id={`person_name_${index}`}
                                  className={`appearance-none  rounded w-full py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    theme === "light"
                                      ? "text-gray-700 "
                                      : "text-gray-100"
                                  }`}
                                  options={assigneeOptions} // Assuming assigneeOptions contains available team members with both name and email
                                  value={assigneeOptions.find(
                                    (option) => option.label === member.name
                                  )} // Set the selected option by name
                                  onChange={(selectedOption) => {
                                    // Automatically update both name and email when a name is selected
                                    handleInputChange(
                                      index,
                                      "name",
                                      selectedOption?.label || ""
                                    );
                                    handleInputChange(
                                      index,
                                      "email",
                                      selectedOption?.value || ""
                                    ); // Auto-fill email based on selected name
                                  }}
                                  isClearable
                                  placeholder="Select Name"
                                  required
                                />
                              </div>

                              {/* Email */}
                              <div className="flex flex-col md:w-1/2">
                                <label
                                  className={`block text-base font-bold mb-3 ${
                                    theme === "light"
                                      ? "text-gray-700"
                                      : "text-gray-200"
                                  }`}
                                  htmlFor={`assigneeemail_${index}`}
                                >
                                  Email
                                </label>

                                <input
                                  type="email"
                                  id={`assigneeemail_${index}`}
                                  className={`appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-not-allowed ${
                                    theme === "light"
                                      ? "bg-gray-100 text-gray-700 border-gray-300"
                                      : "bg-gray-700 text-gray-100 border-gray-600"
                                  }`}
                                  value={member.email} // Automatically filled email based on selected name
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter valid email ID"
                                  disabled
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Button to add more team members */}
                        <button
                          type="button"
                          onClick={handleAddTeamMember}
                          className={`py-2 text-sm px-4 font-bold text-white rounded-lg ${
                            theme === "light"
                              ? "bg-blue-500 hover:bg-blue-700"
                              : "bg-blue-600 hover:bg-blue-800"
                          }`}
                        >
                          Add one more Team Member
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
                            Create New Task
                          </button>
                        </div>
                      </form>
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

export default Operational_task;
