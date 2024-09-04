import React, { useState, useEffect } from 'react';
import { BsSun, BsMoon } from "react-icons/bs";
import { ImTable2, ImSearch, ImUser } from 'react-icons/im';
import { IoCardOutline, IoFilterOutline } from "react-icons/io5";

function Header({ onSearch, onView, view, theme, dark,on_filter,filter }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [showFilter, setShowFilter] = useState(false); 

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleTheme = () => {
    dark(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div>
      <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 p-4 relative">
        <div>
          <h1 className={`text-xl hidden sm:block font-bold ${theme === 'light' ? 'text-black' : 'text-gray-400'}`}>
            Production <span className="text-[#879FFF]">Performance</span> Dashboard
          </h1>
          <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
        </div>
        <div className="flex items-center gap-5 m-0">
          <p className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}> {currentTime}</p>

          <div className='flex flex-row'>
            <input
              type="search"
              placeholder="Search"
              className={`p-2 border w-36 rounded-md shadow-md focus:outline-none focus:ring-1 ${theme === 'light' ? 'bg-white text-black focus:ring-zinc-300' : 'bg-gray-900 text-gray-300 border-indigo-950 focus:ring-zinc-700'}`}
              onChange={(e) => onSearch(e.target.value)}
            />
            <div className={`flex mt-4 ${theme === 'light' ? 'text-gray-300' : 'text-gray-500'}`}>
              <ImSearch className='right-6 relative' />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => on_filter(!filter)}
              className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}
            >
              <IoFilterOutline size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} />
            </button>

            {filter && (
              <div className={`absolute top-12 -right-24 w-96  shadow-md rounded-lg px-2 py-3 z-10 ${theme === 'light' ? 'bg-white' : 'bg-gray-900 text-gray-400'}`}>
                <div className="flex flex-row gap-2"> 
                  <input
                    type="date"
                    placeholder="From Date"
                    className={`p-2 border rounded-md ${theme === 'light' ? 'bg-slate-100 text-black' : 'bg-gray-700 text-gray-300'}`}
                  />
                  <input
                    type="date"
                    placeholder="To Date"
                    className={`p-2 border rounded-md ${theme === 'light' ? 'bg-slate-100 text-black' : 'bg-gray-700 text-gray-300'}`}
                  />
                  <button className={`p-2 mt-2 rounded-md ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-700 text-white'}`}>
                    Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleTheme} className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}>
            {theme === 'light' ? <BsMoon title="dark" className="text-gray-600 cursor-pointer" size={20} /> : <BsSun title="light" className="text-gray-400 cursor-pointer" size={20} />}
          </button>

          <button onClick={() => onView(!view)} className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}>
            {view ? <ImTable2 size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} /> : <IoCardOutline size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} />}
          </button>

          <div className={`rounded-full shadow-md p-3 ${theme === 'light' ? 'bg-white text-slate-600' : 'bg-gray-400 text-slate-900'}`}>
            <ImUser size={20} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
