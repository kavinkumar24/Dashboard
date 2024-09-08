import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import * as XLSX from 'xlsx';

function ViewTasks() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState(0); 
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetch_task_data = async () => {
    try {
      const response = await fetch('http://localhost:8081/create-task');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching task data:", error);
      setError('Failed to load tasks. Please try again later.');
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
    const sortedTasks = [...tasks].sort((a, b) => currentOrder[a.priority] - currentOrder[b.priority]);

    setTasks(sortedTasks);
    setSortOrder((prevOrder) => prevOrder + 1);
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500 text-white px-2 py-1 rounded-full';
      case 'Medium':
        return 'bg-yellow-500 text-white px-2 py-1 rounded-full';
      case 'Low':
        return 'bg-green-500 text-white px-2 py-1 rounded-full';
      default:
        return '';
    }
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const filteredTasks = tasks.filter(task => {
    const escapedSearch = escapeRegExp(search.toLowerCase());
    const searchRegex = new RegExp(escapedSearch);

    return searchRegex.test(task.ax_brief.toLowerCase()) ||
      searchRegex.test(task.collection_name.toLowerCase()) ||
      searchRegex.test(task.project.toLowerCase()) ||
      searchRegex.test(task.no_of_qty.toString()) ||
      searchRegex.test(formatDate(task.assign_date).toLowerCase()) ||
      searchRegex.test(formatDate(task.target_date).toLowerCase()) ||
      searchRegex.test(task.priority.toLowerCase());
  });

  const handleDownload = () => {
    const worksheetData = tasks.map(task => ({
      ID: task.id,
      AxBrief: task.ax_brief,
      CollectionName: task.collection_name,
      Project: task.project,
      Quantity: task.no_of_qty,
      AssignDate: formatDate(task.assign_date),
      TargetDate: formatDate(task.target_date),
      Priority: task.priority,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');

    XLSX.writeFile(workbook, 'tasks.xlsx');
  };

  return (
    <div className={`min-h-screen min-w-max max-w-full flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <main className="flex-1 overflow-y-auto p-4 md:px-8 lg:px-12 max-w-full">
          {error && <p className="text-red-500">{error}</p>}

          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              Task List
            </h1>
            <button 
              onClick={handleDownload} 
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Download
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className={`min-w-full border rounded-lg ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-slate-500'}`}>
              <thead>
                <tr>
                  {['ID', 'Ax Brief', 'Collection Name', 'Project', 'Quantity', 'Assign Date', 'Target Date', 'Priority'].map((header, index) => (
                    <th key={index} className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <tr
                    key={`${task.id}-${index}`}
                    className={`border-solid border-t text-sm ${
                      theme === "light"
                        ? index % 2 === 0
                          ? "bg-gray-200 text-gray-700 border-slate-200"
                          : "bg-white text-gray-700 border-slate-100"
                        : index % 2 === 0
                        ? "bg-gray-800 text-gray-300 border-slate-900"
                        : "bg-gray-900 text-gray-300 border-gray-800"
                    }`}
                  >
                    <td className="px-6 py-4">{task.id}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.ax_brief}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.collection_name}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.project}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.no_of_qty}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{formatDate(task.assign_date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{formatDate(task.target_date)}</td>
                    <td className="px-4 py-2">
                      <span className={getPriorityClass(task.priority)}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewTasks;
