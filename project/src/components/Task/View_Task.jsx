import React, { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";

function ViewTasks() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [filter_on, setFilter_on] = useState(false);

  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState("");
  const userRole = localStorage.getItem("role");
  const loggedInEmail = localStorage.getItem("Email");
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const fetch_task_data = async () => {
    try {
      const response = await fetch("http://localhost:8081/create-task");
      const tasks = await response.json(); // Now tasks is an array

      const tasksWithImages = await Promise.all(
        tasks.map(async (task) => {
          if (task.image_data && Array.isArray(task.image_data.data)) {
            const byteArray = new Uint8Array(task.image_data.data);
            const blob = new Blob([byteArray], { type: "image/jpeg" }); // Adjust type as necessary
            const imageUrl = URL.createObjectURL(blob);
            console.log("Image URL:", imageUrl);
            return { ...task, imageUrl }; // Add imageUrl to the task object
          }
          return task; // Return the task without modification
        })
      );

      setTasks(tasksWithImages); // Store all tasks with their images in the state
    } catch (error) {
      console.error("Error fetching task data:", error);
      setError("Failed to load tasks. Please try again later.");
    }
  };

  useEffect(() => {
    fetch_task_data();
  }, []);

  const handleSort = () => {
    const priorityOrders = [
      { High: 1, Medium: 2, Low: 3 },
      { High: 2, Medium: 1, Low: 3 },
      { High: 3, Medium: 2, Low: 1 },
    ];

    const currentOrder = priorityOrders[sortOrder % 3];
    const sortedTasks = [...tasks].sort(
      (a, b) => currentOrder[a.priority] - currentOrder[b.priority]
    );

    setTasks(sortedTasks);
    setSortOrder((prevOrder) => prevOrder + 1);
  };

  const [showimage, setshowimage] = useState(false);
  const handle_show_image = (imageUrl) => {
    setUploadedImage(imageUrl);
    setshowimage(true);
  };

  const closeModal = () => {
    setshowimage(false);
  };

  const handleViewClick = (briefId) => {
    navigate(`/task/detailed_task/brief_id/${briefId}`); // Redirect to detailed task view
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const updateTaskRemarks = async (taskId, newRemarks) => {
    try {
      const response = await fetch(
        `http://localhost:8081/update-task/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Remarks: newRemarks }), // Ensure this is correctly structured
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task remarks");
      }
    } catch (error) {
      console.error("Error updating task remarks:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const escapedSearch = escapeRegExp(search.toLowerCase());
    const searchRegex = new RegExp(escapedSearch);
    const emailMatch =
      [task.Assign_Name, task.Person, task.OWNER].includes(loggedInEmail) ||
      userRole === "admin";

    return (
      emailMatch &&
      (searchRegex.test(task.Ax_Brief.toLowerCase()) ||
        searchRegex.test(task.Collection_Name.toLowerCase()) ||
        searchRegex.test(task.Project.toLowerCase()) ||
        searchRegex.test(task.No_of_Qty.toString()) ||
        searchRegex.test(formatDate(task.Assign_Date).toLowerCase()) ||
        searchRegex.test(formatDate(task.Target_Date).toLowerCase()) ||
        searchRegex.test(task.Completed_Status.toLowerCase()))
    );
  });

  const handleDownload = () => {
    const worksheetData = tasks.map((task) => ({
      ID: task.Task_ID,
      AxBrief: task.Ax_Brief,
      Sketch_No: task.Sketch,
      CollectionName: task.Collection_Name,
      References_Image: task.References_Image,
      Project: task.Project,
      Assignee: task.Assign_Name,
      Person: task.Person,
      OWNER: task.OWNER,
      Quantity: task.No_of_Qty,
      Dept: task.Dept,
      CompleteQty: task.Complete_Qty,
      PendingQty: task.Pending_Qty,
      AssignDate: formatDate(task.Assign_Date),
      TargetDate: formatDate(task.Target_Date),
      RemainingDays: task.Remaining_Days,
      ProjectView: task.Project_View,
      Status: task.Completed_Status,
      Remarks: task.Remarks,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    XLSX.writeFile(workbook, "tasks.xlsx");
  };

  const updateTaskStatus = async (taskId, updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:8081/update-task/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData), // Ensure this includes both Completed_Status and Remarks
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleStatusChange = (task, newStatus) => {
    if (userRole !== "admin") {
      const updatedRemarks = task.Remarks; // Get the current remarks
      const updatedData = {
        Completed_Status: newStatus,
        Remarks: updatedRemarks,
      };

      updateTaskStatus(task.Task_ID, updatedData);
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.Task_ID === task.Task_ID ? { ...t, Completed_Status: newStatus } : t
        )
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-200"; // Green for completed
      case "In Progress":
        return "bg-yellow-200"; // Yellow for in progress
      default:
        return "";
    }
  };

  return (
    <div
      className={`min-h-screen flex ${
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
          className={`flex-1 overflow-y-auto overflow-x-auto p-4 ml-10 w-full md:px-8 lg:px-4 max-w-full md:max-w-screen-xl lg:max-w-screen-6xl xl:max-w-screen-7xl  ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
          

          {showimage && uploadedImage && (
            <div
              id="modelConfirm"
              className={`fixed z-50 inset-0 ${
                theme === "light"
                  ? "bg-gray-900 bg-opacity-60"
                  : "bg-gray-900 bg-opacity-80"
              } overflow-auto h-full w-full px-4`}
            >
              <div
                className={`relative top-20 mx-auto shadow-xl rounded-md ${
                  theme === "light" ? "bg-white" : "bg-gray-800"
                } max-w-4xl p-4`}
              >
                <div className="flex justify-end p-2">
                  <button
                    onClick={closeModal}
                    type="button"
                    className={`text-gray-400 ${
                      theme === "light"
                        ? "bg-transparent hover:bg-gray-200 hover:text-gray-900"
                        : "bg-transparent hover:bg-gray-600 hover:text-gray-300"
                    } rounded-lg text-sm p-1.5 ml-auto inline-flex items-center`}
                  >
                    <IoIosCloseCircleOutline size={25} />
                  </button>
                </div>
                <div className="flex justify-center items-center p-2 border border-emerald-400">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    style={{ maxWidth: "100%", maxHeight: "600px" }}
                  />
                </div>

                <div className="flex justify-center">
                  <a
                    href={uploadedImage}
                    download="downloaded_image.jpg"
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                  >
                    Download Image
                  </a>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-between items-center mb-4">
            <h1
              className={`text-xl font-bold ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}
            >
              Task List
            </h1>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Download
            </button>
          </div>

          <div
            className={`max-w-full overflow-x-auto border rounded-lg shadow-lg 
    ${
      theme === "light"
        ? "border-gray-300 bg-white"
        : "border-gray-700 bg-gray-800 text-white"
    }`}
          >
            <h1 className="text-xl font-semibold p-2 pl-10 py-5">Task List</h1>

            <div
              className={`w-full overflow-x-auto${
                theme === "light" ? "bg-black" : "bg-gray-800"
              }`}
            >
              <table
                className={`w-full table-auto text-sm ${
                  theme === "light" ? "text-gray-800" : "text-gray-200"
                }`}
              >
                <thead>
                  <tr
                    className={`font-semibold text-base ${
                      theme === "light"
                        ? "bg-gray-300 text-gray-700"
                        : "bg-gray-900 text-gray-200"
                    }`}
                  >
                    {[
                      "ID",
                      "Ax Brief",
                      "Collection Name",
                      "References_Image",
                      "Project",
                      "Assignee",
                      "Person",
                      "OWNER",
                      "Quantity",
                      "Dept",
                      "Complete_Qty",
                      "Pending_Qty",
                      "Assign Date",
                      "Target Date",
                      "Remaining_Days",
                      "Project_View",
                      "Status",
                      "Remarks",
                      "Details",
                    ].map((header, index) => (
                      <th key={index} className="px-6 py-3 text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr
                      key={`${task.Task_ID}-${index}`}
                      className={`transition-colors duration-200 ${
                        index % 2 === 0
                          ? theme === "light"
                            ? "bg-gray-100"
                            : "bg-gray-700"
                          : theme === "light"
                          ? "bg-white"
                          : "bg-gray-800"
                      }`}
                    >
                      <td className="px-6 py-6 text-center whitespace-nowrap text-base">
                        {task.Task_ID}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Ax_Brief}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Collection_Name}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.References_Image === "yes" ? (
                          <button
                            onClick={() => handle_show_image(task.imageUrl)} // Pass the specific image URL
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                          >
                            show
                          </button>
                        ) : (
                          task.References_Image
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Project}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Assign_Name}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Person}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.OWNER}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.No_of_Qty}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Dept}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Complete_Qty}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Pending_Qty}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {formatDate(task.Assign_Date)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {formatDate(task.Target_Date)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Remaining_Days}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {task.Project_View}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {userRole !== "admin" ? (
                          <select
                            value={task.Completed_Status}
                            onChange={(e) =>
                              handleStatusChange(
                                task,
                                e.target.value,
                                task.Remarks
                              )
                            }
                            className={`border shadow-xl rounded-xl px-2 py-1 ${
                              task.Completed_Status === "In Progress"
                                ? theme === "dark"
                                  ? "bg-yellow-300 text-black"
                                  : "bg-yellow-300"
                                : "border-green-600 bg-green-500 text-white font-bold"
                            }`}
                          >
                            {task.Completed_Status === "In Progress" ? (
                              <>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </>
                            ) : (
                              <option value="Completed">Completed</option>
                            )}
                          </select>
                        ) : (
                          <div>
                            <p
                              className={`border rounded-xl px-2 py-1 
    ${
      task.Completed_Status === "In Progress"
        ? theme === "dark"
          ? "bg-yellow-300 text-black"
          : "bg-yellow-300"
        : "bg-green-500 text-white"
    }`}
                            >
                              {task.Completed_Status}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        {(loggedInEmail === task.Assign_Name) &&(userRole !== "admin")? (
                          <input
                            type="text"
                            value={task.Remarks}
                            onChange={(e) => {
                              const updatedRemarks = e.target.value;
                              setTasks((prevTasks) =>
                                prevTasks.map((t) =>
                                  t.Task_ID === task.Task_ID
                                    ? { ...t, Remarks: updatedRemarks }
                                    : t
                                )
                              );
                              // Call the function to update remarks on the backend
                              updateTaskRemarks(task.Task_ID, updatedRemarks); // Send the string directly
                            }}
                            className="border rounded-lg px-2 py-1"
                            placeholder="Enter your remarks"
                          />
                        ) : (
                          <p className="border rounded-xl px-2 py-1">
                            {task.Remarks}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                        <button
                          onClick={() => handleViewClick(task.Ax_Brief)}
                          className={`bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewTasks;
