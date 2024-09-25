import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import Select from 'react-select';
import { useNavigate } from "react-router-dom";

function Operational_task() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [activeRow, setActiveRow] = useState(null); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tableData = [
    {
      task_id: "OT1",
      projectName: "Dashboard development",
      status: "In Process",
      assignee: "Karthik.j@ejindia.com",
      startDate: "22.08.2024",
      targetDate: "28.09.2024",
      priority: "High",
      lastEdited: "18.09.2024",
      attachment: "",
      person_details: [
        { person_name: "Kavin", Status: 'Completed',mail_id : 'kavin@gmail.com',attachement_File : "Attached" },
        { person_name: "Srikanth", Status: 'In Progress',mail_id : 'srikanth@gmail.com',attachement_File: "Attached" },
      ], // Example data for accordion
    },
    {
      task_id: "OT2",
      projectName: "sample project",
      status: "In Process",
      assignee: "Arun@ejindia.com",
      startDate: "22.08.2024",
      targetDate: "28.09.2024",
      priority: "High",
      lastEdited: "18.09.2024",
      attachment: "",
      person_details: [
        { person_name: "Arun", Status: 'Completed', mail_id : 'arun@gmail.com' , attachement_File : "Attached" },
        { person_name: "Karthick", Status: 'In Progress', mail_id : 'karthick@gmail.com' ,attachement_File: "Attached" },
      ], // Example data for accordion
    },
    // Add more rows as needed
  ];

  const handleViewPhase = (taskId) => {
    console.log(taskId);
    navigate("/task/operational_task/phase_view", {
      state: { taskId },
    });
  }

  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const currentData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleAccordion = (taskId ) => {
    setActiveRow(activeRow === taskId  ? null : taskId ); // Toggle accordion open/close
  };

  const downloadExcel = () => {
    // Function to download data as Excel
  };
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
 

  const openTaskModal = () => setIsTaskModalOpen(true);
  const closeTaskModal = () => setIsTaskModalOpen(false);

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    closeTaskModal(); // Optionally close the modal after submission
  };

  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
 

  const openTeamModal = () => setIsTeamModalOpen(true);
  const closeTeamModal = () => setIsTeamModalOpen(false);

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    closeTeamModal(); // Optionally close the modal after submission
  };
  const [teamMembers, setTeamMembers] = useState([{ name: '', email: '' }]);

  const handleAddTeamMember = () => {
    setTeamMembers([...teamMembers, { name: '', email: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);

    console.log(updatedMembers);
  };

  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
 

  const openPhaseModal = () => setIsPhaseModalOpen(true);
  const closePhaseModal = () => setIsPhaseModalOpen(false);

  const handlePhaseSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    closePhaseModal(); // Optionally close the modal after submission
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
          <div className="flex justify-between mx-6">
            <h1 className="  font-bold text-xl">Operational Task overview </h1>
          </div>
          <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
            <div className="flex justify-between">
              <h1 className="text-xl font-semibold p-2 pl-10 py-5">
                Task details
              </h1>
              <div className="m-4">
              <button className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold" onClick={openTaskModal}>
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
                        {item.projectName}
                      </td>
                      
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.status}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.assignee}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.startDate}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.targetDate}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.priority}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.lastEdited}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        {item.attachment ? "Attached" : "No Attachment"}
                      </td>
                      <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                        <button 
                            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold" 
                            onClick={()=> handleViewPhase(item.task_id)} >
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
                                Team details for task - <span className="text-[#879FFF]">{item.projectName}</span>
                                </h1>
                                <div className="m-4">
                                <button className="px-5 py-2 bg-blue-100 text-blue-500 border-2  border-blue-500 rounded-lg font-semibold" onClick={openTeamModal}>
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
                                    <th className="py-3 text-center font-semibold text-base">
                                      Status 
                                    </th>
                                    
                                    <th className="py-3 text-center font-semibold text-base">
                                      Attachement File 
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.person_details.map(
                                    (person, personIndex) => (
                                      <tr
                                        key={personIndex}
                                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                                      >
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {personIndex + 1}
                                        </td>
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {item.task_id}
                                        </td>
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {person.person_name}
                                        </td>
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {person.mail_id}
                                        </td>
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {person.Status}
                                        </td>
                                        <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                                          {person.attachement_File}
                                        </td>
                                      </tr>
                                    )
                                  )}
                                  {/* { person_name: "Arun", Status: 'Completed', mail_id : 'arun@gmail.com' , attachement_File : "Attached" }, */}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 p-20 flex justify-center items-center" onClick={closeTaskModal}>
            <div className="w-full ">
          <div
            className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            

            <div className="flex justify-end p-2">
            <h2 className={`text-2xl font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
              Create a New Task
            </h2>
                  <button
                    onClick={closeTaskModal}
                    type="button"
                    className={`text-gray-400 ${theme === "light" ? "bg-transparent hover:bg-gray-200 hover:text-gray-900" : "bg-transparent hover:bg-gray-600 hover:text-gray-300"} rounded-lg text-sm p-1.5 ml-auto inline-flex items-center`}
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
              <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="project_name">
                  Project Name
                </label>
                <input
                    type="text"
                    id="project_name"
                    // value={assign_date}
                    // onChange={(e) => setAssign_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter Project Name"

                    required
                  />
              </div>       
                

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="status">
                  Status
                  </label>
                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'} w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    // options={deptOptions}
                    // value={deptOptions.find(option => option.value === assignTo)}
                    // onChange={(selectedOption) => setassignTo(selectedOption?.value || '')}
                    required
                  />
                  
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="assigneeemail">
                   Asignee Email
                  </label>
                  <input
                    type="email"
                    id="assigneeemail"
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter valid email ID"
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="startingDate">
                  Starting date
                  </label>
                  <input
                    type="date"
                    id="startingDate"
                    // value={assign_date}
                    // onChange={(e) => setAssign_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    required
                  />
                </div>

                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="targetDate">
                  Target date
                  </label>
                  <input
                    type="date"
                    id="targetDate"
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter valid email ID"
                    required
                  />
                </div>


                <div className="mb-4 space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="priority">
                    Priority
                  </label>
                 
                  <Select
                    className={`appearance-none rounded w-full ml-10 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'} w-full @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    isClearable
                    // options={priorityOptions}
                    // value={priorityOptions.find(option => option.value === priority)}
                    // onChange={(selectedOption) => setPriority(selectedOption?.value || 'medium')}
                    required
                  />
                  
                </div>

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/3 py-3 px-4 font-bold text-white rounded-lg ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-800'}`}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 p-20 flex justify-center items-center" onClick={closeTeamModal}>
            <div className="w-1/2 ">
          <div
            className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
           

            <div className="flex justify-end p-2 mb-5">
            <h2 className={`text-2xl font-semibold  ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
              Add Team Details
            </h2>
                  <button
                    onClick={closeTeamModal}
                    type="button"
                    className={`text-gray-400 ${theme === "light" ? "bg-transparent hover:bg-gray-200 hover:text-gray-900" : "bg-transparent hover:bg-gray-600 hover:text-gray-300"} rounded-lg text-sm p-1.5 ml-auto inline-flex items-center`}
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
          <div className="flex flex-col md:flex-row md:space-x-6 pb-5" key={index}>
            {/* Name */}
            <div className="flex flex-col md:w-1/2">
              <label
                className={`block text-base font-bold  ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}
                htmlFor={`person_name_${index}`}
              >
                Name
              </label>
              <input
                type="text"
                id={`person_name_${index}`}
                className={`appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                placeholder="Enter Person Name"
                value={member.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col md:w-1/2">
              <label
                className={`block text-base font-bold  ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}
                htmlFor={`assigneeemail_${index}`}
              >
                Email
              </label>
              <input
                type="email"
                id={`assigneeemail_${index}`}
                className={`appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                placeholder="Enter valid email ID"
                value={member.email}
                onChange={(e) => handleInputChange(index, 'email', e.target.value)}
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
        className={`py-2 text-sm px-4 font-bold text-white rounded-lg ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-800'}`}
      >
        Add one more Team Member
      </button>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className={`w-full md:w-1/3 py-3 px-4 font-bold text-white rounded-lg ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-800'}`}
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


    {isPhaseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 p-20 flex justify-center items-center" onClick={closeTaskModal}>
            <div className="w-1/2 ">
          <div
            className={`p-5 relative shadow-xl rounded-lg mx-10 mb-20 ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            
            <div className="flex justify-end p-2">
            <h2 className={`text-2xl font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
              Create Task Phases
            </h2>
                  <button
                    onClick={closePhaseModal}
                    type="button"
                    className={`text-gray-400 ${theme === "light" ? "bg-transparent hover:bg-gray-200 hover:text-gray-900" : "bg-transparent hover:bg-gray-600 hover:text-gray-300"} rounded-lg text-sm p-1.5 ml-auto inline-flex items-center`}
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
              <form onSubmit={handlePhaseSubmit}>
              <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
              <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="project_name">
                  Phase Name : 
                </label>
                <input
                    type="text"
                    id="project_name"
                    // value={assign_date}
                    // onChange={(e) => setAssign_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter Phase Name"

                    required
                  />
              </div>  
              <p className="ml-8 font-semibold">Phase 1 - Task 1 Details</p>

              <div className=" space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="assigneeemail">
                   Asignee Email
                  </label>
                  <input
                    type="email"
                    id="assigneeemail"
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter valid email ID"
                    required
                  />
                </div>

                <div className="space-y-2 md:flex @md/modal:flex md:flex-row @md/modal:flex-row md:space-y-0 @md/modal:space-y-0 py-5">
                  <label className={`block text-base font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} w-full px-6 md:mt-2 @md/modal:mt-2 md:px-8 @md/modal:px-8 md:w-1/5 @md/modal:w-1/5`} htmlFor="assigneeemail">
                   Asignee Email
                  </label>
                  <input
                    type="email"
                    id="assigneeemail"
                    // value={target_date}
                    // onChange={(e) => setTarget_date(e.target.value)}
                    className={`  appearance-none border rounded ml-10 w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}  w-full space-y-2 px-6 md:px-8 @md/modal:px-8 md:w-3/5 @md/modal:w-3/5`}
                    placeholder="Enter valid email ID"
                    required
                  />
                </div>

              <button className="px-5 text-xs py-2 ml-5 bg-blue-500 text-white rounded-lg font-semibold">Add Task</button>  
              <button className="px-5 py-2 text-xs ml-5 bg-blue-500 text-white rounded-lg font-semibold">Add Phase</button>  

            

                <div className="md:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    className={`w-1/3 py-3 px-4 font-bold text-white rounded-lg ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-800'}`}
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


        </div>
      </div>
    </>
  );
}

export default Operational_task;
