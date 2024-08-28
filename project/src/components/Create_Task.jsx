import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function CreateTask() {
  const axBriefMapping = {
    "BF-900001390": {
      collectionName: "MANGAL SUTRA COLLECTION-ISHTAA-PAN INDIA",
      project: "ISHTAA"
    },
    "BF-900001393": {
      collectionName: "ISHTAA-LADIES RING-PAN INDIA",
      project: "ISHTAA"
    },
    "BF-900001395": {
      collectionName: "ISHTAA-CHAIN SET-ELECTRO FORMING-PAN INDIA",
      project: "ISHTAA"
    }
  };

  const [axBriefId, setAxBriefId] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [project, setProject] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isUrgent, setIsUrgent] = useState(false);
  const [assignDate, setAssignDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAxBriefIdChange = (e) => {
    const value = e.target.value;
    setAxBriefId(value);
  
    if (axBriefMapping[value]) {
      setCollectionName(axBriefMapping[value].collectionName);
      setProject(axBriefMapping[value].project);
      setIsAutoFilled(true); 
    } else {
      setCollectionName('');
      setProject('');
      setIsAutoFilled(false);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      taskName,
      description,
      taskId,
      collectionName,
      project,
      priority,
      isUrgent,
      assignDate,
      targetDate,
    };
    console.log(taskData);
  };

  return (
    <div className={`min-h-screen lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <div className={`p-5 relative shadow-xl rounded-lg left-0 md:left-28 w-full mb-20 md:w-[80%] ${theme === 'light' ? 'bg-white' : 'bg-gray-900'}`}>
            <h2 className={`text-2xl font-semibold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-gray-100'}`}>
              Create a New Task
            </h2>
            <div className="scrollbar-hide">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="axBriefId">
                    Ax Brief
                  </label>
                  <input
                    type="text"
                    id="axBriefId"
                    value={axBriefId}
                    onChange={handleAxBriefIdChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    placeholder="Enter AX Brief ID" 
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="collectionName">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    id="collectionName"
                    value={collectionName}
                    readOnly={isAutoFilled}
                    onChange={(e) => setCollectionName(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    placeholder="Enter Collection Name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="project">
                    Project
                  </label>
                  <input
                    type="text"
                    id="project"
                    value={project}
                    readOnly={isAutoFilled}
                    onChange={(e) => setProject(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    placeholder="Enter Project Name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="qty">
                    No. of Qty
                  </label>
                  <input
                    type="text"
                    id="qty"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    placeholder="Enter Quantity"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="assignDate">
                    Assign Date
                  </label>
                  <input
                    type="date"
                    id="assignDate"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="targetDate">
                    Target Date
                  </label>
                  <input
                    type="date"
                    id="targetDate"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    required
                  />
                </div>


                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-slate-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 font-bold text-white rounded-lg ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-800'}`}
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreateTask;
