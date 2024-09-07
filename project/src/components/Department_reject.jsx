import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; // Make sure to adjust the path to your Sidebar component
import Header from './Header';   // Make sure to adjust the path to your Header component

function Department_reject() {
    useEffect(() => {
        window.scrollTo(0, 0);
        }, []);
  const location = useLocation();
  const { clickedLabel,deptData } = location.state || {};

  const [theme, setTheme] = useState("light"); // Manage theme state
  const [search, setSearch] = useState(""); // Manage search input

  return (
    <div
      className={`min-h-screen w-full flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        
        <div className="flex justify-between mx-4 mt-4">
          <h1 className="font-bold text-xl">Rejected Details of <span className='text-[#879FFF] text-2xl'>{clickedLabel}</span> Department</h1>
          <button
            className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            Export the Data
          </button>
        </div>

        {/* Main content */}
        <div className="p-4">
          <div><pre>{JSON.stringify(deptData, null, 2)}</pre></div>
        </div>
      </div>
    </div>
  );
}

export default Department_reject;
