import React, { useEffect, useState } from "react";
import {useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Problem_Arised() {
    const location = useLocation();
    const { skch, overAllData} = location.state || {};
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
      );
    const [search, setSearch] = useState(""); // State for search input
    const [searchTable, setTableSearch] = useState(""); // State for search input
    const navigate = useNavigate();
    const [data,setData] = useState([]);
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchData();
      }, []);

      const fetchData = () =>{
        const filteredData = overAllData.filter(data => data.ProblemArised2.toLowerCase().trim() === skch.toLowerCase().trim());
        
        // console.log(filteredData);

        const sketchMap = new Map();

        filteredData.forEach((item) => {
        const { SketchNo, ToDept, ReasonDept, TypeOfReason, COUNT } = item;
        if (sketchMap.has(SketchNo)) {
            const existingItem = sketchMap.get(SketchNo);
            existingItem.COUNT += COUNT;
            sketchMap.set(SketchNo, existingItem);
        } else {
            sketchMap.set(SketchNo, { SketchNo, ToDept, ReasonDept, TypeOfReason, COUNT });
        }
        });

        // Convert Map to array and sort by COUNT
        const sortedData = Array.from(sketchMap.values()).sort((a, b) => b.COUNT - a.COUNT);

        console.log(sortedData);
        setData(sortedData);
      }
      const [currentPage1, setCurrentPage1] = useState(1);
      const itemsPerPage = 10; // Number of items per page
      
      // Assuming sortedData is available
      const totalPages = Math.ceil(data.length / itemsPerPage);
      
      // Slice the data for the current page
      const currentData = data.slice(
        (currentPage1 - 1) * itemsPerPage, 
        currentPage1 * itemsPerPage
      );
      
      // Handle page change
      const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage1(newPage);
        }
      };
    
  return (
    <>
      <div
        className={`min-h-screen w-full flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
        }`}
      >
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />

          <h1 className=" mx-4 font-bold text-xl">
            Problem Arised
          </h1>

        <div className="m-4 mt-7 border rounded-lg border-gray-300 bg-white shadow-lg">
        <div className="flex justify-between p-2 m-2">
            <h1 className="text-xl font-semibold pt-2">Detailed View of <span className="text-[#879FFF]">{skch}</span> Problem</h1>
        </div>

        <table className="w-full table-auto text-sm">
            <thead>
            <tr className="bg-gray-300 text-gray-700">
                <th className="py-3 pl-2 text-center font-semibold text-base">SI no.</th>
                <th className="py-3 text-center font-semibold text-base">SketchNo</th>
                <th className="py-3 text-center font-semibold text-base">ToDept</th>
                <th className="py-3 text-center font-semibold text-base">ReasonDept</th>
                <th className="py-3 text-center font-semibold text-base">TypeOfReason</th>
                <th className="py-3 text-center font-semibold text-base">COUNT</th>
            </tr>
            </thead>
            <tbody>
            {currentData.map((item, index) => (
                <tr key={index} className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200">
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {(currentPage1 - 1) * itemsPerPage + index + 1}
                </td>
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {item.SketchNo}
                </td>
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {item.ToDept}
                </td>
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {item.ReasonDept}
                </td>
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {item.TypeOfReason}
                </td>
                <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                    {item.COUNT}
                </td>
                </tr>
            ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center space-x-2 m-4">
            <button
            className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage1 === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={() => handlePageChange(currentPage1 - 1)}
            disabled={currentPage1 === 1}
            >
            Previous
            </button>

            <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">{currentPage1}</button>

            <button
            className={`text-base font-semibold px-5 py-3 rounded-lg border ${currentPage1 === totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={() => handlePageChange(currentPage1 + 1)}
            disabled={currentPage1 === totalPages}
            >
            Next
            </button>
        </div>
        </div>

        </div>
      </div>
    </>
  )
}

export default Problem_Arised
