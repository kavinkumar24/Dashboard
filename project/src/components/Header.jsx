import React from 'react';
import { BsSun, BsMoon } from "react-icons/bs";
import { ImTable2, ImSearch, ImUser } from 'react-icons/im';
import { IoCardOutline } from "react-icons/io5";

function Header({ onSearch, onView, view ,theme,dark}) {
  const handle_theme = ()=>{
    if(theme=='dark'){
      dark('light')
    }
    else{
      dark('dark')
    }

  }
  return (
    <div>
      <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 p-4">
        <div>
          <h1 className={`text-xl font-bold ${theme==='light'?'text-black':'text-gray-400'}`}>
            Production <span className="text-[#879FFF]">Performance</span> Dashboard
          </h1>
          <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
        </div>
        <div className="flex items-center gap-5 m-0">
          <div className='flex flex-row'>
            <input
              type="search"
              placeholder="Search"
              className={`p-2 border rounded-md shadow-md focus:outline-none focus:ring-1   ${theme==='light'? 'bg-white text-black focus:ring-zinc-300':'bg-gray-900 text-gray-300  border-indigo-950 focus:ring-zinc-700'} `} 
              onChange={(e) => onSearch(e.target.value)}
            />
            <div className={`flex mt-4 ${theme==='light'? 'text-gray-300':'text-gray-500'}`}>
              <ImSearch className='right-6 relative' />
            </div>
          </div>
          <button onClick={handle_theme}>
          {theme==='light'?<BsMoon title="dark" className="text-gray-600 cursor-pointer" size={20}   />:<BsSun title="light" className="text-gray-400 cursor-pointer" size={20}  />}
          </button>
          <button
            onClick={() => onView(!view)}
            className="p-3 rounded-full text-black"
          >
            {view ? <ImTable2 size={20}  className={`${theme==='light'?'text-gray-700':'text-gray-400'}`}/> : <IoCardOutline size={20}  className={`${theme==='light'?'text-gray-700':'text-gray-400'}`}/>}

          </button>
          <div className={` rounded-full shadow-md p-3 ${theme==='light'?'bg-white text-slate-600':'bg-gray-400 text-slate-900'}`}>
            <ImUser size={20} />
          </div>
        </div>
      </header>
    </div>
  );
}

export default Header;
