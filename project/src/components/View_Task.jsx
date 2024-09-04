import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function ViewTasks() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState(0); 

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  
  useEffect(() => {
    const initialTasks = [
      { id: 1, axBrief: 'Brief 1', collectionName: 'Collection A', project: 'Project X', quantity: '100', assignDate: '2024-09-01', targetDate: '2024-09-10', priority: 'High' },
      { id: 2, axBrief: 'Brief 2', collectionName: 'Collection B', project: 'Project Y', quantity: '50', assignDate: '2024-09-02', targetDate: '2024-09-12', priority: 'Medium' },
      { id: 3, axBrief: 'Brief 3', collectionName: 'Collection C', project: 'Project Z', quantity: '150', assignDate: '2024-09-03', targetDate: '2024-09-15', priority: 'Low' },
      { id: 4, axBrief: 'Brief 4', collectionName: 'Collection D', project: 'Project A', quantity: '75', assignDate: '2024-09-04', targetDate: '2024-09-16', priority: 'High' },
      { id: 5, axBrief: 'Brief 5', collectionName: 'Collection E', project: 'Project B', quantity: '200', assignDate: '2024-09-05', targetDate: '2024-09-17', priority: 'Medium' },
      { id: 6, axBrief: 'Brief 6', collectionName: 'Collection F', project: 'Project C', quantity: '30', assignDate: '2024-09-06', targetDate: '2024-09-18', priority: 'Low' },
    ];

    setTasks(initialTasks);
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

  return (
    <div className={`min-h-[120vh] lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <main className="flex-1 overflow-y-auto p-5 px-0 md:px-28">
          <h1 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            Task List
          </h1>

          
          <div className="overflow-auto max-h-[400px] shadow-lg rounded-lg border border-gray-300">
            <table className={`min-w-full border rounded-lg ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-slate-500'}`}>
              <thead>
                <tr className='bg-red-300'>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>ID</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Ax Brief</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Collection Name</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Project</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Quantity</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Assign Date</th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>Target Date</th>
                  <th 
                    className={`px-4 py-2 text-left cursor-pointer ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`} 
                    onClick={handleSort}
                  >
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr 
                    key={task.id} 
                    className={`border-solid border-t ${theme === 'light' ? 'border-slate-300' : 'border-gray-400'} ${index % 2 === 0 ? (theme === 'light' ? 'bg-gray-200' : 'bg-slate-600') : ''}`}
                  >
                    <td className="px-4 py-2">{task.id}</td>
                    <td className="px-4 py-2">{task.axBrief}</td>
                    <td className="px-4 py-2">{task.collectionName}</td>
                    <td className="px-4 py-2">{task.project}</td>
                    <td className="px-4 py-2">{task.quantity}</td>
                    <td className="px-4 py-2">{task.assignDate}</td>
                    <td className="px-4 py-2">{task.targetDate}</td>
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
