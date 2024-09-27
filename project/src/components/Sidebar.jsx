import { useState, useEffect } from 'react';
import { GrProjects } from "react-icons/gr";
import { ImHome } from 'react-icons/im';
import { BsGear, BsListTask, BsEye, BsPlusCircleDotted } from 'react-icons/bs';
import { MdOutlineCategory } from "react-icons/md";
import { IoCreate, IoDocumentTextOutline } from 'react-icons/io5';
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
  const[party_visit_expand, setParty_visit_expand] =  useState(false)
  const [activeSubTask, setActiveSubTask] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visibility state


  const [role, setRole] = useState('');
  

  const toggleSidebar = () => {
    setIsSidebarVisible(prevState => !prevState);
  };


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
      }else if(path==='/task/detailed_task' || path==='/task/detailed_task/brief_id/:id'){
        setActiveSubTask('detailed_task');
      }else if(path==='/task/operational_task' || path==='/task/operational_task/phase_view'){
        setActiveSubTask('operational_task');
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
      else if (path === '/new_design' || /purity-detail-new_design/.test(path) || /zone-detail-new_design/.test(path) || /product-detail-new_design/.test(path) || /PL-ST-detail-new_design/.test(path) || /color-detail-new_design/.test(path) || /project-detail-new_design/.test(path)
      ) {
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
      /product-details/.test(path)||  /AOP\/design_center/.test(path) 
    ){
      setActive('aop_schedule')
    }
    else if(path.startsWith('/party_visit')){
      setActive('party_visit')
      setParty_visit_expand(true)
    }if (path === '/party_visit/new') {
      setActiveSubTask('New_party_creation');
    }
    if (path === '/party_visit/view') {
      setActiveSubTask('view_party_creation');
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
    if(name!=='party_visit'){
      
      setParty_visit_expand(false)
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
  const handleParty_click = (event) =>{
    event.preventDefault();
    setParty_visit_expand(!party_visit_expand);


  }

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
      <div className="fixed top-0 left-0 z-50 p-4">
        <button onClick={toggleSidebar}>
          {isSidebarVisible ? <AiOutlineClose size={24} className='relative left-36 '/> : 
          <div className='bg-white p-2 relative right-2 shadow-lg rounded-md mt-4'>
          <AiOutlineMenu size={24} />
          </div>
          }
        </button>
      </div>

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

{isSidebarVisible && (
      <aside className={`hidden  md:block w-48 border-r h-full ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-gray-700 border-slate-400 '}`}>
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
              <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('operational_task')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/task/operational_task', 'task')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsEye />
                  </div>
                  Operational Task
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

          { role == 'admin' &&     <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200 ${getActiveClass('party_visit')} ${theme === 'light' ? 'text-black hover:bg-slate-100 hover:text-gray-600' : ' text-slate-300 hover:bg-gray-900'}`}
            onClick={handleParty_click}
          >
            <div className='flex flex-row p-2'>
              <div className='mt-1 px-2'>
                <MdOutlineCategory />
              </div>
              Party Wise
            </div>
          </a>}

          {party_visit_expand &&
             <>
              <div className='ml-2'>
                 <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('New_party_creation')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/party_visit/new', '/party_visit')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <IoCreate />
                  </div>
                  New Party
                </div>
              </a>
              </div>
              <div className='ml-2'>
                 <a
                href="#"
                className={`block py-2 px-6 rounded transition duration-200 ${getSubTaskActiveClass('view_party_creation')} ${theme === 'light' ? 'text-gray-500 hover:bg-slate-100 hover:text-gray-600' : ' text-slate-400 hover:bg-gray-900'}`}
                onClick={() => handleNavigation('/party_visit/view', '/party_visit')}
              >
                <div className='flex flex-row p-0'>
                  <div className='mt-1 px-2'>
                    <BsEye />
                  </div>
                  View Party
                </div>
              </a>
              </div>

              </>

              
          }

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
)}
    </div>
  );
}

export default Sidebar;
