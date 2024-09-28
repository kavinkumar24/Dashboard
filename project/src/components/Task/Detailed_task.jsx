import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";

function Detailed_task() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState(""); // State for search input
  const [searchTable, setTableSearch] = useState(""); // State for search input
  const navigate = useNavigate();

  const [totalData, setTotalData] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pendingResponse = await fetch("http://localhost:8081/pending_data");
      const pendingData = await pendingResponse.json();

      const filteredPendingData = pendingData.reduce((acc, curr) => {
        const existingEntry = acc.find(
          (item) =>
            item.BRIEFNUM1.toLowerCase() === curr.BRIEFNUM1.toLowerCase()
        );

        if (existingEntry) {
          existingEntry.JCPDSCWQTY1 += curr.JCPDSCWQTY1;
          existingEntry.NoOfQty += 1;
        } else {
          acc.push({
            BRIEFNUM1: curr.BRIEFNUM1,
            PLTCODE1: curr.PLTCODE1,
            DESIGNSPEC1: curr.DESIGNSPEC1,
            JCPDSCWQTY1: curr.JCPDSCWQTY1,
            NoOfQty: 1,
          });
        }

        return acc;
      }, []);

      filteredPendingData.sort((a, b) => b.JCPDSCWQTY1 - a.JCPDSCWQTY1);
      setTotalData(filteredPendingData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [currentPage1, setCurrentPage1] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search input for BRIEFNUM1
  const filteredData = totalData.filter((item) =>
    item.BRIEFNUM1.toLowerCase().includes(searchTable.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentData = filteredData.slice(
    (currentPage1 - 1) * itemsPerPage,
    currentPage1 * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage1(newPage);
    }
  };

  const handleTableClick = (id) => {
    navigate(`/task/detailed_task/brief_id/${id}`);
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
            Task Management Home Page
          </h1>

          <div className="m-4 mt-7 border rounded-lg border-gray-300 bg-white shadow-lg">
            <div className="flex justify-between p-2  m-2">
            <h1 className="text-xl font-semibold pt-2">Tasks</h1>
            <input
              type="text"
              placeholder="Search by BRIEF NUMBER"
              value={searchTable}
              onChange={(e) => setTableSearch(e.target.value)}
              className=" rounded-lg p-1 px-3 border-gray-400 bg-gray-100"
            />
            </div>
            

            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-300 text-gray-700">
                  <th className="py-3 pl-2 text-center font-semibold text-base">
                    SI no.
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Ax Brief
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Collection name
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Project
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    No.of.Qty
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Pending Qty
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {(currentPage1 - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.BRIEFNUM1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.DESIGNSPEC1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.PLTCODE1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.NoOfQty}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.JCPDSCWQTY1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      <button
                        className={`py-2 px-4 font-bold text-sm text-white rounded-lg ${
                          theme === "light"
                            ? "bg-blue-500 hover:bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-800"
                        }`}
                        onClick={() => handleTableClick(item.BRIEFNUM1)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 m-4">
              <button
                className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                  currentPage1 === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => handlePageChange(currentPage1 - 1)}
                disabled={currentPage1 === 1}
              >
                Previous
              </button>

              <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                {currentPage1}
              </button>

              <button
                className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                  currentPage1 === totalPages
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
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
  );
}

export default Detailed_task;
