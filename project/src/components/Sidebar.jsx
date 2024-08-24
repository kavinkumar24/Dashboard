import { useState, useEffect } from 'react';
import { GrProjects } from "react-icons/gr";
import { ImHome } from 'react-icons/im';
import { BsGear, BsListTask, BsEye, BsPlusCircleDotted } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [spin, setSpin] = useState(false);
  const [active, setActive] = useState('home');
  const [taskExpanded, setTaskExpanded] = useState(false);
  const [activeSubTask, setActiveSubTask] = useState('');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActive('home');
      setActiveSubTask('');
    } else if (path === '/projects') {
      setActive('projects');
      setActiveSubTask('');
    } else if (path === '/settings') {
      setActive('settings');
      setActiveSubTask('');
    } else if (path === '/daily-report') {
      setActive('daily-report');
      setActiveSubTask('');
    } else if (path.startsWith('/task')) {
      setActive('task');
      setTaskExpanded(true);
      if (path === '/task/create') {
        setActiveSubTask('create');
      } else if (path === '/task/view') {
        setActiveSubTask('view');
      }
    }
  }, [location.pathname]);

  const handleNavigation = (path, name) => {
    if (name !== 'task') {
      setTaskExpanded(false);
      setActiveSubTask('');
    }
    setSpin(true);
    navigate(path);
    setSpin(false);
  };

  const handleTaskClick = () => {
    setTaskExpanded(!taskExpanded);
  };

  const getActiveClass = (name) => {
    if (active === name) {
      return theme === 'light' ? 'bg-slate-200' : 'bg-gray-800';
    }
    return '';
  };

  const getSubTaskActiveClass = (subTask) => {
    if (activeSubTask === subTask) {
      return theme === 'light' ? 'bg-gray-100' : 'bg-gray-600';
    }
    return '';
  };

  return (
    <div>
      {spin &&
        <div className={`max-w-full bg-opacity-35 max-h-full fixed px-96 2xl:pr-px inset-0 z-50 bg-gray-500`}>
          <div className="flex gap-2 max-h-20 w-20 items-center justify-center relative top-72 -left-52 md:top-64 md:left-36 animate-bounce rounded-lg 2xl:left-[35%] lg:left-[45%] 2xl:top-80 3xl:left-96">
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
          </div>
        </div>
      }
      <aside className={`w-48 border-r hidden md:block h-full ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-gray-700 border-slate-400 '}`}>
        <div className="p-4 px-6">
          <h1 className={`text-xl font-thin ${theme === 'light' ? 'text-slate-800' : 'text-slate-400'}`}><span className={`eb-garamond-normal  font-bold ${theme==='light'?'text-indigo-600':'text-indigo-300'}text-2xl`}>Ej</span> <span className='text-lg'>Dashboard</span></h1>
        </div>
        <nav className="mt-10">
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('home')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/', 'home')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <ImHome />
              </div>
              Home
            </div>
          </a>
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('projects')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/projects', 'projects')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <GrProjects />
              </div>
              Projects
            </div>
          </a>
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('daily-report')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/daily-report', 'daily-report')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <IoDocumentTextOutline />
              </div>
              Pending Range
            </div>
          </a>
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('task')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={handleTaskClick} 
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <BsListTask />
              </div>
              Task
            </div>
          </a>
          {/* Subcategories for Task */}
          {taskExpanded && (
            <div className="ml-8">
              <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('create')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/task/create', 'task')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsPlusCircleDotted />
                  </div>
                  Create
                </div>
              </a>
              <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('view')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/task/view', 'task')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsEye />
                  </div>
                  View
                </div>
              </a>
            </div>
          )}
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('settings')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/settings', 'settings')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <BsGear />
              </div>
              Settings
            </div>
          </a>
        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
