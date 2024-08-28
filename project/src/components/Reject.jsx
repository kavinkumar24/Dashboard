import React from 'react'
import Sidebar from './Sidebar';
import { useEffect,useState } from 'react';
import Header from './Header';
function Reject() {
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [search, setSearch] = useState('');

    useEffect(() => {
        localStorage.setItem('theme', theme);
      }, [theme]);

  return (
    <div className={`min-h-screen lg:min-h-screen min-w-screen  w-[110%] md:w-[100%] lg:w-[100%] flex  ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
         <Sidebar theme={theme} />
         <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        
          <h1 className='ml-4 font-bold text-lg'>
            Rejections
          </h1>
          <div className="upload-container pt-10">
        <label
          htmlFor="uploadFile1"
          className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif] "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-11 mb-2 fill-gray-500"
            viewBox="0 0 32 32"
          >
            <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
            <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
          </svg>
          Import Rejection file
          <input
            type="file"
            id="uploadFile1"
            className="hidden"
            accept=".xlsx"
            // onChange={handleFileChange}
          />
          <p className="text-xs font-medium text-gray-400 mt-2">
            .xlsx file formats are only allowed.
          </p>
        </label>
        {/* {message && <p className="mt-2 text-green-500">{message}</p>} */}
      </div>

        </div>
    </div>
  )
}

export default Reject
