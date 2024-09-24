  import React, { useState, useEffect } from "react";
  import Sidebar from "./Sidebar";
  import Header from "./Header";
  import * as XLSX from "xlsx";

  function ViewTasks() {
    const [theme, setTheme] = useState(
      () => localStorage.getItem("theme") || "light"
    );
    const [search, setSearch] = useState("");
    const [tasks, setTasks] = useState([]);
    const [sortOrder, setSortOrder] = useState(0);
    const [error, setError] = useState("");

    useEffect(() => {
      localStorage.setItem("theme", theme);
    }, [theme]);

    const fetch_task_data = async () => {
      try {
        const response = await fetch("http://localhost:8081/create-task");
        const data = await response.json();
        setTasks(data);
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

    const getPriorityClass = (priority) => {
      switch (priority) {
        case "High":
          return "bg-red-500 text-white px-2 py-1 rounded-full";
        case "Medium":
          return "bg-yellow-500 text-white px-2 py-1 rounded-full";
        case "Low":
          return "bg-green-500 text-white px-2 py-1 rounded-full";
        default:
          return "";
      }
    };

    const getStatusClass = (status) => {
      return `text-white px-3 py-1 rounded-full shadow-sm text-center w-24 ${
        {
          "In Progress": "bg-yellow-500 hover:bg-yellow-600",
          Completed: "bg-green-500 hover:bg-green-600",
        }[status] || "bg-gray-400"
      } transition duration-200 ease-in-out`;
    };

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const filteredTasks = tasks.filter((task) => {
      const escapedSearch = escapeRegExp(search.toLowerCase());
      const searchRegex = new RegExp(escapedSearch);

      return (
        searchRegex.test(task.Ax_Brief.toLowerCase()) ||
        searchRegex.test(task.Collection_Name.toLowerCase()) ||
        searchRegex.test(task.Project.toLowerCase()) ||
        searchRegex.test(task.No_of_Qty.toString()) ||
        searchRegex.test(formatDate(task.Assign_Date).toLowerCase()) ||
        searchRegex.test(formatDate(task.Target_Date).toLowerCase()) ||
        searchRegex.test(task.Completed_Status.toLowerCase())
      );
    });

    const handleDownload = () => {
      const worksheetData = tasks.map((task) => ({
        ID: task.Task_ID,
        AxBrief: task.Ax_Brief,
        CollectionName: task.Collection_Name,
        Project: task.Project,
        Quantity: task.No_of_Qty,
        AssignDate: formatDate(task.Assign_Date),
        TargetDate: formatDate(task.Target_Date),
        Status: task.Completed_Status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

      XLSX.writeFile(workbook, "tasks.xlsx");
    };

    return (
      <div
        className={`min-h-screen flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
        }`}
      >
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <main className="flex-1 overflow-y-auto p-4 md:px-8 md:ml-20  ml-0 lg:px-4 max-w-screen-2xl">
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
    
            <div className="max-w-[100%] overflow-x-auto border rounded-lg border-gray-300 bg-white shadow-lg">
              <h1 className="text-xl font-semibold p-2 pl-10 py-5">Task List</h1>
    
              {/* Table Wrapper */}
              <div className="min-w-full overflow-x-auto">
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr className="bg-gray-300 text-gray-700">
                      {[
                        "ID",
                        "Ax Brief",
                        "Sketch Id",
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
                      ].map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-center font-semibold text-base"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task, index) => (
                      <tr
                        key={`${task.Task_ID}-${index}`}
                        className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                      >
                        <td className="px-6 py-6 text-center whitespace-nowrap text-base">
                          {task.Task_ID}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                          {task.Ax_Brief}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                          {task.Sketch}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                          {task.Collection_Name}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                          {task.References_Image}
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
                          <span className={getStatusClass(task.Completed_Status)}>
                            {task.Completed_Status}
                          </span>
                        </td>
    
                        <td className="px-6 py-4 text-center whitespace-nowrap text-base">
                          {task.Remarks}
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
