import { useState, useEffect } from 'react';
import { GrProjects } from "react-icons/gr";
import { ImHome } from 'react-icons/im';
import { BsGear, BsListTask, BsEye, BsPlusCircleDotted } from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoStop } from "react-icons/go";
import { CgIfDesign } from "react-icons/cg";
import { RiFolderReceivedLine } from "react-icons/ri";
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { MdDriveFolderUpload } from "react-icons/md";
import { MdSchedule } from 'react-icons/md';

function Sidebar({ theme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [spin, setSpin] = useState(false);
  const [active, setActive] = useState('home');
  const [taskExpanded, setTaskExpanded] = useState(false);
  const [activeSubTask, setActiveSubTask] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  const [role, setRole] = useState('');
  
  


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
      }else if(path==='/task/design_center'){
        setActiveSubTask('design_center');
      }else if(path==='/task/detailed_task' || path==='/task/detailed_task/brief_id/:id'){
        setActiveSubTask('detailed_task');
      }
    } else if (path === '/rejections') {
      setActive('rejections');
    } else if (path === '/order_receiving&new_design') {
      setActive('order_new_design');
    } else if (path === '/order_receiving&new_design'|| /project-detail-order_receiving/.test(path)
      ||/purity-detail-order_receiving/.test(path)
      ||/zone-detail-order_receiving/.test(path)
      ||/product-detail-order_receiving/.test(path)
      ||/subproduct-detail-order_receiving/.test(path)
      ||
      /color-detail-order_receiving/.test(path)
      ||
      /group_party-detail-order_receiving/.test(path)
      ||
      /plain-stone-detail-order_receiving/.test(path)
    ) {
        setActive('order_new_design');
      }
    else if (path === '/new_design') {
      setActive('new_design');
    }
    else if(path==='/rejections/dept_rejections'){
      setActive('rejections')
    }else if(path==='/rejections/detailed_rejections' || path==='/rejections/problem_arised'){
      setActive('rejections')
    }else if(path == '/uploads'){
      setActive('uploads')
    }
    else if(path == '/aop_schedule'||
      /product-details/.test(path)
    ){
      setActive('aop_schedule')
    }
    
  }, [location.pathname]);


  useEffect(()=>{
    const roles = localStorage.getItem('role')
    setRole(roles);
    console.log(role);
  },[role])

  const handleNavigation = (path, name) => {
    if (name !== 'task') {
      setTaskExpanded(false);
      setActiveSubTask('');
    }
    setSpin(true);
    navigate(path);
    setSpin(false);
    setIsMobileMenuOpen(false); 
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4">
        <button onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 z-40`}>
          <div className={`fixed top-0 left-0 w-64 h-full p-4 bg-white dark:bg-gray-800 z-50`}>
            <nav className="mt-5">
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
            </nav>
          </div>
        </div>
      )}

      <aside className={`hidden md:block w-48 border-r h-full ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-gray-700 border-slate-400 '}`}>
        <div className="p-4 px-6">
          <h1 className={`text-xl font-thin ${theme === 'light' ? 'text-slate-800' : 'text-slate-400'}`}>
            <span className={`eb-garamond-normal font-bold ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-300'} text-2xl`}>Ej</span>
            <span className='text-lg'>Dashboard</span>
          </h1>
        </div>
        <nav className="mt-5">
        <nav className="mt-5">
        { role == 'admin' && <a
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
          </a>}

         
          { role == 'admin' &&  <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('uploads')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/uploads', '/uploads')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
              <MdDriveFolderUpload />
              </div>
              Uploads
            </div>
          </a>}


          { role == 'admin' &&  <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('aop_schedule')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/aop_schedule', '/aop_schedule')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
              <MdSchedule />
              </div>
              AOP schedule
            </div>
          </a>}
          

          { role == 'admin' &&  <a
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
          </a>}
          { role == 'admin' &&     <a
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
          </a>}
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
          
          {taskExpanded && (
            <div className="ml-2">

              <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('design_center')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/task/design_center', 'task')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsEye />
                  </div>
                  Design Center
                </div>
              </a>
              <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('detailed_task')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/task/detailed_task', 'task')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsEye />
                  </div>
                  Detailed Task
                </div>
              </a>

              { role == 'admin' && <a
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
              </a>}
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

{ role == 'admin' &&  <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('rejections')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/rejections', 'rejections')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <GoStop />
              </div>
              Rejections
            </div>
          </a>
}
{ role == 'admin' &&     <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('order_new_design')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/order_receiving&new_design', '/order_receiving&new_design')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <RiFolderReceivedLine />
              </div>
              Order Receive
            </div>
          </a>}


          { role == 'admin' &&     <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('new_design')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={() => handleNavigation('/new_design', '/new_design')}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <CgIfDesign />
              </div>
              New Design
            </div>
          </a>}

          { role == 'admin' && <a
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
          </a>}
        </nav>

        </nav>
      </aside>
    </div>
  );
}

export default Sidebar;
