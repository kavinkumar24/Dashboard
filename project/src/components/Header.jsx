import React, { useState, useEffect } from "react";
import { BsSun, BsMoon } from "react-icons/bs";
import { ImSearch } from "react-icons/im";
import { IoCardOutline, IoFilterOutline } from "react-icons/io5";
import { ImTable2 } from "react-icons/im";
import { FiLogOut } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { CiGrid41 } from "react-icons/ci";
import { useRef } from "react";

function Header({
  onSearch,
  onView,
  view,
  theme,
  dark,
  on_filter,
  filter,
  onDateRangeChange,
}) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [showFilter, setShowFilter] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const dropdownRef = useRef(null);

  const [filteredData, setFilteredData] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profile_modal = () => {
    setShowProfileModal(!showProfileModal);
    on_filter(!filter);
  };
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const emailToMatch = localStorage.getItem("Email");

    fetch("http://localhost:8081/user/loggedin/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.find((user) => user.Email === emailToMatch);
        if (user) {
          setUserData({
            emp_id: user.emp_id,
            Email: user.Email,
            role: user.role,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleLogout = () => {
    // Remove JWT token from localStorage
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleTheme = () => {
    dark(theme === "dark" ? "light" : "dark");
  };

  

  const [dropdown, setdropdown] = useState(false);
  const handleprofile = () => {
    setdropdown(!dropdown);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

      if (!showProfileModal) {
        setdropdown(false); 
      }
      if (showProfileModal) {
        on_filter(true); 
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 p-4 relative ">
      <div>
        <h1
          className={`text-xl hidden sm:block font-bold ${
            theme === "light" ? "text-black" : "text-gray-400"
          }`}
        >
          NPD Production <span className="text-[#879FFF]">Performance</span>{" "}
          Dashboard
          <span className="text-sm text-gray-400 font-thin"> (Sample)</span>
        </h1>
        <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
      </div>
      <div className="flex items-center gap-5 m-0">
        <p
          className={`hidden sm:block md:block lg:block sl:block ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {currentTime}
        </p>

        <div className="flex flex-row">
          <input
            type="search"
            placeholder="Search"
            className={`p-2 border w-36 rounded-md shadow-md focus:outline-none focus:ring-1 ${
              theme === "light"
                ? "bg-white text-black focus:ring-zinc-300"
                : "bg-gray-900 text-gray-300 border-indigo-950 focus:ring-zinc-700"
            }`}
            onChange={(e) => onSearch(e.target.value)}
          />
          <div
            className={`flex items-center ${
              theme === "light" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            <ImSearch className="right-6 relative" />
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
          className={`p-2 rounded-md ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? (
            <BsMoon size={20} className="text-blue-800" />
          ) : (
            <BsSun size={20} className="text-yellow-400" />
          )}
        </button>

        <button
          onClick={() => onView(!view)}
          className={`p-2 rounded-md ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
          aria-label={`Switch to ${view ? "card" : "table"} view`}
        >
          {view ? (
            <ImTable2
              size={20}
              className={`${
                theme === "light" ? "text-gray-700" : "text-gray-400"
              }`}
            />
          ) : (
            <IoCardOutline
              size={20}
              className={`${
                theme === "light" ? "text-gray-700" : "text-gray-400"
              }`}
            />
          )}
        </button>

        <button
          onClick={handleprofile}
          className={`p-2 rounded-md ${
            theme === "light" ? "bg-white" : "bg-gray-700"
          }`}
          aria-label="Logout"
        >
          <FaRegUser
            size={20}
            className={`${
              theme === "light" ? "text-gray-700" : "text-gray-400"
            }`}
          />
        </button>
        {dropdown && (
          <div
            ref={dropdownRef}
            className={`absolute top-20 md:top-16 right-5 ${
              theme === "light" ? "bg-white" : "bg-gray-700"
            } shadow-md rounded-lg p-2 transition-transform transform scale-95 origin-top-right w-40 z-10`}
          >
            <button
              className={`flex items-center gap-2 w-full text-left p-2 rounded-md
      ${
        theme === "light"
          ? "text-black bg-gray-100 hover:bg-gray-200"
          : "text-white bg-gray-900 hover:bg-blue-950"
      }`}
              onClick={profile_modal}
            >
              <CiGrid41 size={20} className="text-blue-500" />
              <p
                className={`${theme === "light" ? "text-black" : "text-white"}`}
              >
                Profile
              </p>
            </button>

            <button
              className={`flex items-center mt-2 gap-2 w-full text-left cursor-pointer p-2 rounded-md
      ${
        theme === "light"
          ? "text-black bg-gray-100 hover:bg-gray-200"
          : "text-white bg-gray-900 hover:bg-red-900"
      }`}
              onClick={handleLogout}
            >
              <FiLogOut size={20} className="text-red-500" />
              <p>Logout</p>
            </button>
          </div>
        )}

        {showProfileModal && userData && (
          <div className="fixed inset-0 flex items-center justify-center z-20">
           <div
  className={`relative w-[60%] max-w-md ${
    theme === "light" ? "bg-white" : "bg-gray-700"
  } shadow-lg rounded-lg p-6`} 
>
  <h2
    className={`${theme === "light" ? "text-black" : "text-white"} text-lg font-semibold`}
  >
    User Profile
  </h2>
  <p className="text-sm text-gray-400 mt-1">Details about the user:</p>
  <div className="mt-4 space-y-2"> {/* Added space between paragraphs */}
    <p
      className={`${
        theme === "light" ? "text-black" : "text-white"
      }`}
    >
      <strong>Emp ID:</strong> {userData.emp_id}
    </p>
    <p
      className={`${
        theme === "light" ? "text-black" : "text-white"
      }`}
    >
      <strong>Email:</strong> {userData.Email}
    </p>
    <p
      className={`${
        theme === "light" ? "text-black" : "text-white"
      }`}
    >
      <strong>Role:</strong> {userData.role}
    </p>
  </div>
  <button
    className="mt-6 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
    onClick={profile_modal}
  >
    Close
  </button>
</div>

          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
