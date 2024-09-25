import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from 'react-select';

function Phase_view() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);

  const openPhaseModal = () => setIsPhaseModalOpen(true);
  const closePhaseModal = () => setIsPhaseModalOpen(false);

  const handlePhaseSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    closePhaseModal(); // Optionally close the modal after submission
  };

  const [tasks, setTasks] = useState([{ taskName: '', description: '', startDate: '', endDate: '', assignee: '', owner: '' }]);
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [phase, setPhase] = useState("");
  // Handle task input change
  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  // Add new task
  const handleAddTask = () => {
    setTasks([...tasks, {taskName: '', description: '', startDate: '', endDate: '', assignee: '', owner: '' }]);
  };

  // Handle form submission
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    setSubmittedTasks(tasks); // Set the submitted tasks
    console.log('Tasks submitted:', tasks);
    closePhaseModal();
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
            <h1 className="text-xl font-bold">Project Phases</h1>
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
      <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
        Phase
      </label>
      <input
        type="text"
        className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
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
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Task Name
        </label>
        <input
          type="text"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          placeholder="Enter Task"
          value={task.taskName}
          onChange={(e) => handleInputChange(index, 'taskName', e.target.value)}
          required
        />
      </div>

      <div className="md:flex md:flex-row">
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Description
        </label>
        <input
          type="text"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          placeholder="Enter Description"
          value={task.description}
          onChange={(e) => handleInputChange(index, 'description', e.target.value)}
          required
        />
      </div>

      <div className="md:flex md:flex-row">
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Start Date
        </label>
        <input
          type="date"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          value={task.startDate}
          onChange={(e) => handleInputChange(index, 'startDate', e.target.value)}
          required
        />
      </div>

      <div className="md:flex md:flex-row">
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          End Date
        </label>
        <input
          type="date"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          value={task.endDate}
          onChange={(e) => handleInputChange(index, 'endDate', e.target.value)}
          required
        />
      </div>

      <div className="md:flex md:flex-row">
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Assignee
        </label>
        <input
          type="email"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          placeholder="Enter Assignee Email"
          value={task.assignee}
          onChange={(e) => handleInputChange(index, 'assignee', e.target.value)}
          required
        />
      </div>

      <div className="md:flex md:flex-row">
        <label className={`block text-base font-bold w-full md:w-1/5 ${theme === "light" ? "text-gray-700" : "text-gray-200"}`}>
          Owner
        </label>
        <input
          type="text"
          className={`appearance-none border rounded ml-10 w-full py-2 px-3 ${theme === "light" ? "bg-gray-100 text-gray-700 border-gray-300" : "bg-gray-700 text-gray-100 border-gray-600"}`}
          placeholder="Enter Owner's Name"
          value={task.owner}
          onChange={(e) => handleInputChange(index, 'owner', e.target.value)}
        />
      </div>
    </div>
  ))}
</div>


      {/* Button to add more tasks */}
      <button
        type="button"
        onClick={handleAddTask}
        className={`py-2 px-4 text-sm font-bold text-white rounded-lg ${theme === "light" ? "bg-blue-500 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-800"}`}
      >
        Add another Task
      </button>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={`w-full md:w-1/3 py-3 px-4 font-bold text-white rounded-lg ${theme === "light" ? "bg-blue-500 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-800"}`}
        >
          Create New Phase
        </button>
      </div>
    </form>
                </div>
              </div>
            </div>
          )}

          <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                Phase 1 - Planning
              </h1>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-300 text-gray-700">
                    <th className="py-3 text-center font-semibold text-base">
                      Phase/Task
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
                  <tr className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Project Kick-off
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Initial meeting to define goals
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      09/25/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base text-red-500">
                      09/25/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      12/31/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      <a
                        href="mailto:karthik.j@ejindia.com"
                        className="text-blue-500 underline"
                      >
                        Karthik.j@ejindia.com
                      </a>
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      HOD Mail ID
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Completed
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Meeting held with all stakeholders
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                Phase 2 - Requirement gathering
              </h1>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-300 text-gray-700">
                    <th className="py-3 text-center font-semibold text-base">
                      Phase/Task
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
                  <tr className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Project Kick-off
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Initial meeting to define goals
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      09/25/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base text-red-500">
                      09/25/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      12/31/2024
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      <a
                        href="mailto:karthik.j@ejindia.com"
                        className="text-blue-500 underline"
                      >
                        Karthik.j@ejindia.com
                      </a>
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      HOD Mail ID
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Completed
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      Meeting held with all stakeholders
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {submittedTasks.length > 0 && (
        <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold p-2 pl-10 py-5">
              Phase - {phase}
            </h1>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-300 text-gray-700">
                  <th className="py-3 text-center font-semibold text-base">Phase/Task</th>
                  <th className="py-3 text-center font-semibold text-base">Description</th>
                  <th className="py-3 text-center font-semibold text-base">Start Date</th>
                  <th className="py-3 text-center font-semibold text-base">End Date</th>
                  <th className="py-3 text-center font-semibold text-base">Assignee</th>
                  <th className="py-3 text-center font-semibold text-base">Owner</th>
                </tr>
              </thead>
              <tbody>
                {submittedTasks.map((task, index) => (
                  <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{task.taskName}</td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{task.description}</td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{task.startDate}</td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base text-red-500">{task.endDate}</td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      <a href={`mailto:${task.assignee}`} className="text-blue-500 underline">{task.assignee}</a>
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">{task.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}

export default Phase_view;
