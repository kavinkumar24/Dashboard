import React from 'react'
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useEffect } from 'react'

function Welcome() {

  const [filter_on, setFilter_on] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [userName, setUserName] = useState("")
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const name = localStorage.getItem("name"); // Get the user's name from localStorage
    if (name) {
      setUserName(name); // Set the name in state
    }
  }, [theme]);
  return (


    <div
    className={`min-h-screen min-w-full flex flex-col md:flex-row ${
      theme === "light"
        ? "bg-gray-100 text-gray-900"
        : "bg-gray-800 text-gray-100"
    }`}
  >
    <Sidebar theme={theme} className="w-1/6 h-screen p-0" />

    <div className="flex-1 flex flex-col p-0">
      <Header
        theme={theme}
        dark={setTheme}
        className="p-0 m-0"
        on_filter={setFilter_on}
        filter={filter_on}
      />
<main
  className={`flex-1 p-0 overflow-y-auto overflow-hidden ${
    filter_on === true ? "opacity-10" : "opacity-100"
  }`}
>
  <h1 className='text-2xl font-bold ml-10'>Welcome, {userName}!</h1>
  <blockquote className='ml-10 mt-4 italic text-lg'>
    "The only way to do great work is to love what you do." – Steve Jobs
  </blockquote>
  <div className='ml-10 mt-4 flex items-center'>
    <span className='text-lg'>&#8592;</span> {/* Left arrow */}
    <span className='ml-2'>Continue your work!</span>
  </div>
</main>


    </div>
    </div>

  )
}

export default Welcome
