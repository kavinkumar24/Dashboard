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


  const fetch_task_data = async () => {
    try{
    const response = await fetch('http://localhost:8081/create-task');
    const data = await response.json();
    console.log(data);
    setTasks(data);

    }
    catch(error){
      console.error("Error fetching task data:", error);
    }
  }
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

  return (
    <div className={`min-h-[120vh] lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <main className="flex-1 overflow-y-auto p-5 px-0 md:px-28">
          <h1 className={`text-xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            Task List
          </h1>

  <div className='max-w-full '>
  <div className="overflow-x-scroll max-h-screen-md shadow-lg rounded-lg border border-gray-300 max-w-screen-lg no-scrollbar">
  <div className=" max-h-[400px] w-96">
    <table className={`min-w-full border rounded-lg ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-slate-500'}`}>
      <thead>
        <tr>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>ID</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Ax Brief</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Collection Name</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Project</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Quantity</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Assign Date</th>
          <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`}>Target Date</th>
          <th
            className={`px-4 py-2 text-left cursor-pointer ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-700 text-gray-300'}`} 
            onClick={handleSort}
          >
            Priority
          </th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr
            key={task.ax_brief}
            className={`border-solid border-t text-sm   ${
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

            <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{(task.collection_name)}</td>

            <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.project}</td>

            <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.no_of_qty}</td>

            <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.assign_date}</td>

            <td className="px-4 py-2 whitespace-nowrap overflow-hidden">{task.target_date}</td>

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
  
</div>

</div>

        </main>
      </div>
    </div>
  );
}





export default ViewTasks;
