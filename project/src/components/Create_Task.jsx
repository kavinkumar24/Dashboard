import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useEffect } from 'react';
function CreateTask() {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isUrgent, setIsUrgent] = useState(false);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');


  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      taskName,
      description,
      taskId,
      priority,
      isUrgent,
    };
    console.log(taskData);
  };

  return (
    
    <div className={`min-h-screen lg:min-h-screen min-w-screen  w-[110%] md:w-[100%] lg:w-[100%] flex  ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
         <Sidebar theme={theme} />
         <div className="flex-1 flex flex-col">
         <main className="flex-1 overflow-y-auto">
         <Header onSearch={setSearch} theme={theme} dark={setTheme} />
         <div className={`p-5 relative shadow-xl rounded-lg left-28 w-full md:w-[80%] ${theme==='light'?'bg-white':'bg-gray-900'}`}>
         <h2 className={`text-2xl font-semibold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>Create a New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="taskName">
            Task Name
          </label>
          <input
            type="text"
            id="taskName"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
            placeholder="Enter task name"
            required
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="taskId">
            Task ID
          </label>
          <input
            type="text"
            id="taskId"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
            placeholder="Enter task ID"
            required
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
            placeholder="Enter task description"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Priority</label>
          <div className="flex items-center">
            <input
              type="radio"
              id="low"
              name="priority"
              value="low"
              checked={priority === 'low'}
              onChange={(e) => setPriority(e.target.value)}
              className={`mr-2 ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`}
            />
            <label htmlFor="low" className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mr-4`}>
              Low
            </label>
            <input
              type="radio"
              id="medium"
              name="priority"
              value="medium"
              checked={priority === 'medium'}
              onChange={(e) => setPriority(e.target.value)}
              className={`mr-2 ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`}
            />
            <label htmlFor="medium" className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'} mr-4`}>
              Medium
            </label>
            <input
              type="radio"
              id="high"
              name="priority"
              value="high"
              checked={priority === 'high'}
              onChange={(e) => setPriority(e.target.value)}
              className={`mr-2 ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`}
            />
            <label htmlFor="high" className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
              High
            </label>
          </div>
        </div>

       

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-indigo-500 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-800 text-white'}`}
          >
            Create Task
          </button>
        </div>
      </form>
      </div>
        </main>
        </div>
    </div>
  );
}

export default CreateTask;
