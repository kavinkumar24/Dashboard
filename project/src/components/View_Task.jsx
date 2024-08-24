import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect } from 'react';
function ViewTasks() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const tasks = [
    { id: 1, title: 'Design Homepage', description: 'Create the homepage design.', priority: 'High' },
    { id: 2, title: 'Develop API', description: 'Develop RESTful API for the application.', priority: 'Medium' },
    { id: 3, title: 'Setup Database', description: 'Setup the database schema and tables.', priority: 'High' },
    { id: 4, title: 'Write Unit Tests', description: 'Write unit tests for the API endpoints.', priority: 'Low' },
    { id: 5, title: 'User Authentication', description: 'Implement user authentication and authorization.', priority: 'High' },
  ];

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
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
          <div className="overflow-x-hidden shadow-lg rounded-lg">
            <table className={`min-w-full border rounded-lg  ${theme === 'light' ? 'border-gray-300 bg-white' : 'border-gray-600 bg-slate-500'}`}>
              <thead>
                <tr className='bg-red-300'>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>
                    ID
                  </th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>
                    Title
                  </th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>
                    Description
                  </th>
                  <th className={`px-4 py-2 text-left ${theme === 'light' ? 'bg-gray-300 text-gray-700' : 'bg-gray-900 text-gray-300'}`}>
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className={`border-solid border-t ${theme === 'light' ? 'border-slate-300' : 'border-gray-400'}`}>
                    <td className="px-4 py-2">{task.id}</td>
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">{task.description}</td>
                    <td className="px-4 py-2">{task.priority}</td>
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
