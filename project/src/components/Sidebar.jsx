import React from 'react'
import {GrProjects} from "react-icons/gr";
import { ImHome } from 'react-icons/im';
import { BsGear } from 'react-icons/bs';
import { useState } from 'react';
function Sidebar() {
  return (
    <div>
       <aside className="w-40 bg-white border-r hidden md:block h-full">
        <div className="p-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <nav className="mt-10">
          <a
            href="#"
            className="block py-2 px-4 rounded transition duration-200 hover:bg-indigo-100 hover:text-gray-600"
          >
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <ImHome />
              </div>
              Home 
             
            </div>
          </a>
          <a
            href="#"
            className="block py-2 px-4 rounded transition duration-200 hover:bg-indigo-100 hover:text-gray-600"
          >
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <GrProjects />
              </div>
              Projects 
              
            </div>
          </a>  
          <a
            href="#"
            className="block py-2 px-4 rounded transition duration-200 hover:bg-indigo-100 hover:text-gray-600"
          >
            
            <div className='flex flez-row p-2'>
            <div className='mt-1 px-2'>
                <BsGear />
              </div>
              Settings 
              
            </div>
          </a>
        </nav>
      </aside>
    </div>
  )
}

export default Sidebar
