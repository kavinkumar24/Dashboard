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

  const [ax_brief, setAx_brief] = useState('');
  const [collection_name, setCollection_name] = useState('');
  const [project, setProject] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [error, setError] = useState('');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [no_of_qty, setNo_of_qty] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignTo, setassignTo] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [assign_date, setAssign_date] = useState('');
  const [target_date, setTarget_date] = useState('');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAxBriefIdChange = (e) => {
    const value = e.target.value;
    setAx_brief(value);
  
    if (axBriefMapping[value]) {
      setCollection_name(axBriefMapping[value].collectionName);
      setProject(axBriefMapping[value].project);
      setIsAutoFilled(true); 
      setError('');
    } else {
      setCollection_name('');
      setProject('');
      setIsAutoFilled(false);
    }
  };
  const handleAxBriefIdBlur = () => {
    if (!axBriefMapping[ax_brief]) {
      setError('Please enter a correct AX Brief ID');
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAutoFilled) {
      setError('Please enter a correct AX Brief ID');
      return;
    }
  
    const taskData = {
      ax_brief,
      collection_name,
      project,
      no_of_qty,
      assign_date,
      target_date,
      assignTo,
      priority,
    };
  
    try {
      const response = await fetch('http://localhost:8081/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
  
      const result = await response.json();
      console.log(result);
      alert('Task created successfully');
    } catch (error) {
      console.error(error);
      setError('An error occurred while creating the task');
    }
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
                    value={ax_brief}
                    onChange={handleAxBriefIdChange}
                    onBlur={handleAxBriefIdBlur}
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    placeholder="Enter AX Brief ID" 
                    required
                  />
                   {error && (
                    <p className="text-red-500 text-xs italic">{error}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="collectionName">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    id="collectionName"
                    value={collection_name}
                    readOnly={true}
                    onChange={(e) => setCollection_name(e.target.value)}
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
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
                    readOnly={true}
                    onChange={(e) => setProject(e.target.value)}
                    className={`appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
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
                    value={no_of_qty}
                    onChange={(e) => setNo_of_qty(e.target.value)}
                    className={` appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
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
                    value={assign_date}
                    onChange={(e) => setAssign_date(e.target.value)}
                    className={`  appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
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
                    value={target_date}
                    onChange={(e) => setTarget_date(e.target.value)}
                    className={`  appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="targetDate">
                    Assign To
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setassignTo(e.target.value)}
                    className={` appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
                    required
                  >
                    <option value="cad">E00346</option>
                    <option value="cam">E18763</option>
                  </select>
                </div>
                

                <div className="mb-4">
                  <label className={`block text-sm font-bold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`} htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={` appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${theme === 'light' ? 'bg-gray-100 text-gray-700 border-gray-300' : 'bg-gray-700 text-gray-100 border-gray-600'}`}
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
