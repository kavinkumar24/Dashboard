import React from 'react'
import { BsSearch, BsMoon, BsGear } from "react-icons/bs";
import { useState } from 'react';
import { ImTable2,ImSearch,ImUser} from 'react-icons/im';
import { IoCardOutline } from "react-icons/io5";
function Header({onSearch,onView,view}) {
    
  return (
    <div>
      <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
            <div>
              <h1 className="text-xl font-bold">
                Production <span className="text-[#879FFF]">Performance</span> Dashboard
              </h1>
              <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
            </div>
            <div className="flex items-center gap-5 m-0">
              <div className='flex flex-row'>
              <input
                type="search"
                placeholder="Search"
                className="p-2 border rounded-md shadow-md focus:outline-none focus:ring-1 focus:ring-zinc-300"
                onChange={(e) => onSearch(e.target.value)}
              />
              <div className='flex text-gray-300 mt-4 '>
              <ImSearch className='right-6 relative' />
              </div>
              </div>
              <BsMoon className="text-gray-600 cursor-pointer" size={20} />
              <button
          onClick={()=>onView(!view)}
          className="p-3 rounded-full text-black"
        >
        {view? <ImTable2 size={20} /> : <IoCardOutline size={20} />}

        </button>
        <div className='bg-white rounded-full shadow-md p-3 text-slate-600'>
          <ImUser size={20}/>
          </div>
          </div>
         
            
          </header>
    </div>
  )
}

export default Header
