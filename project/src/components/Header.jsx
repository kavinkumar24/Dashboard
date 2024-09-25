import React, { useState, useEffect } from 'react';
import { BsSun, BsMoon } from "react-icons/bs";
import { ImSearch } from 'react-icons/im';
import { IoCardOutline, IoFilterOutline } from "react-icons/io5";
import { ImTable2 } from 'react-icons/im';
function Header({ onSearch, onView, view, theme, dark, on_filter, filter, onDateRangeChange }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [showFilter, setShowFilter] = useState(false); 
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleTheme = () => {
    dark(theme === 'dark' ? 'light' : 'dark');
  };

  const handleFilter = () => {
    if (fromDate && toDate && new Date(fromDate) <= new Date(toDate)) {
      onDateRangeChange(fromDate, toDate);
    } else {
      // Optionally handle invalid date range (e.g., show a message)  
    }
    on_filter(!filter);
  };

  return (
    <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 p-4 relative ">
      <div>
        <h1 className={`text-xl hidden sm:block font-bold ${theme === 'light' ? 'text-black' : 'text-gray-400'}`}>
         NPD Production <span className="text-[#879FFF]">Performance</span> Dashboard
         <span className='text-sm text-gray-400 font-thin'>   (Sample)</span>
        </h1>
        <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
      </div>
      <div className="flex items-center gap-5 m-0">
        <p className={`hidden sm:block md:block lg:block sl:block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{currentTime}</p>

        <div className='flex flex-row'>
          <input
            type="search"
            placeholder="Search"
            className={`p-2 border w-36 rounded-md shadow-md focus:outline-none focus:ring-1 ${theme === 'light' ? 'bg-white text-black focus:ring-zinc-300' : 'bg-gray-900 text-gray-300 border-indigo-950 focus:ring-zinc-700'}`}
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className={`flex items-center ${theme === 'light' ? 'text-gray-300' : 'text-gray-500'}`}>
          <ImSearch className='right-6 relative' />

          </div>
        </div>

        {/* <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}
            aria-label="Toggle Filter"
          >
            <IoFilterOutline size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} />
          </button>

          {showFilter && (
            <div className={`absolute top-12 -right-24 w-96 shadow-md rounded-lg px-2 py-3 z-10 ${theme === 'light' ? 'bg-white' : 'bg-gray-900 text-gray-400'}`}>
              <div className="flex flex-row gap-2">
                <input
                  type="date"
                  placeholder="From Date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`p-2 border rounded-md ${theme === 'light' ? 'bg-slate-100 text-black' : 'bg-gray-700 text-gray-300'}`}
                />
                <input
                  type="date"
                  placeholder="To Date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`p-2 border rounded-md ${theme === 'light' ? 'bg-slate-100 text-black' : 'bg-gray-700 text-gray-300'}`}
                />
                <button
                  className={`p-2 mt-2 rounded-md ${theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-700 text-white'}`}
                  onClick={handleFilter}
                >
                  Filter
                </button>
              </div>
            </div>
          )}
        </div> */}

        <button
          onClick={handleTheme}
          className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <BsMoon size={20}  className='text-blue-800' /> : <BsSun size={20} className='text-yellow-400' />}
        </button>

        <button
          onClick={() => onView(!view)}
          className={`p-2 rounded-md ${theme === 'light' ? 'bg-white' : 'bg-gray-700'}`}
          aria-label={`Switch to ${view ? 'card' : 'table'} view`}
        >
          {view ? <ImTable2 size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} /> : <IoCardOutline size={20} className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
