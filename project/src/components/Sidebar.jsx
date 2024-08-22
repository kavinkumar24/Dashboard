import React from 'react'
import {GrProjects} from "react-icons/gr";
import { ImHome } from 'react-icons/im';
import { BsGear,BsListTask} from 'react-icons/bs';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Sidebar({theme}) {
  const navigate = useNavigate();
  const [spin, setSpin] = useState(false);
  const navigate_home = ()=>{
    setSpin(true);
    setTimeout(()=>{
      navigate('/');
      setSpin(false);
    },700)
  }

  const navigate_projects = ()=>{
    setSpin(true);
    setTimeout(()=>{
      setSpin(false);
    },700)
    
    navigate('/projects');

  }
  return (
    <div>
       {spin&&
      <div className={`max-w-full bg-opacity-35 max-h-full fixed px-96 2xl:pr-px inset-0 z-50 bg-gray-500`}>
      <div className="flex gap-2 max-h-20 w-20 items-center justify-center relative top-72 -left-52 md:top-64 md:left-36 animate-bounce rounded-lg 2xl:left-[35%] lg:left-[45%] 2xl:top-80
          3xl:left-96">
      <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
      <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
      <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
      </div>
  </div>
      }
       <aside className={`w-44 border-r hidden md:block h-full ${theme==='light'?'bg-white border-slate-200':'bg-gray-700 border-slate-400 '}`}>
        <div className="p-4">
          <h1 className={`text-xl font-bold ${theme==='light'?'text-slate-800':'text-slate-400'}`}>Dashboard</h1>
        </div>
        <nav className="mt-10">
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200  ${theme==='light'?'text-black hover:bg-indigo-100 hover:text-gray-600':' text-slate-300 hover:bg-gray-900'}`} onClick={navigate_home}
          >
            <div className='flex flez-row p-2' >
            <div className='mt-1 px-2' >
                <ImHome />
              </div>
              Home 
             
            </div>
          </a>
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200  ${theme==='light'?'text-black hover:bg-indigo-100 hover:text-gray-600':' text-slate-300 hover:bg-gray-900'}`}  
            onClick={navigate_projects}
          >
            <div className='flex flez-row p-2' >
            <div className='mt-1 px-2'>
                <GrProjects />
              </div>
              Projects 
              
            </div>
          </a>  
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200  ${theme==='light'?'text-black hover:bg-indigo-100 hover:text-gray-600':' text-slate-300 hover:bg-gray-900'}`} 
          >
            
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <BsGear />
              </div>
              Settings 
              
            </div>
          </a>
         
          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200  ${theme==='light'?'text-black hover:bg-indigo-100 hover:text-gray-600':' text-slate-300 hover:bg-gray-900'}`} 
          >
            
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <IoDocumentTextOutline />
              </div>
              Daily report 
              
            </div>
          </a>

          <a
            href="#"
            className={`block py-2 px-4 rounded transition duration-200  ${theme==='light'?'text-black hover:bg-indigo-100 hover:text-gray-600':' text-slate-300 hover:bg-gray-900'}`} 
          >
            
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <BsListTask />
              </div>
              Task 
              
            </div>
          </a>
        </nav>
      </aside>
    </div>
  )
}

export default Sidebar
