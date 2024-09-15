import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function Detailed_task() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [sketchData, setSketchData] = useState([]);
  const [summedData, setSummedData] = useState({});
  const [totalData, setTotalData] = useState([]);
  const [clickedCellData, setClickedCellData] = useState({});
  const [groupedCellData, setGroupedCellData] = useState();
  const [overAllData, setoverAllData] = useState();
  const [cell, setCell] = useState();


  //   const currentData = []
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pendingResponse = await fetch("http://localhost:8081/pending_data");
      const pendingData = await pendingResponse.json();
      setoverAllData(pendingData);

      const filteredPendingData = pendingData.reduce((acc, curr) => {
        // Check if the BRIEFNUM1 already exists in the accumulator
        const existingEntry = acc.find(
          (item) =>
            item.BRIEFNUM1.toLowerCase() === curr.BRIEFNUM1.toLowerCase()
        );

        if (existingEntry) {
          // If it exists, add the JCPDSCWQTY1 to the existing entry's sum
          existingEntry.JCPDSCWQTY1 += curr.JCPDSCWQTY1;
          existingEntry.NoOfQty += 1;
        } else {
          // If it doesn't exist, create a new entry
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

      const dataForId = filteredPendingData.filter(
        (item) => item.BRIEFNUM1.toLowerCase() === id.toLowerCase()
      );

      //   filteredPendingData.sort((a, b) => b.JCPDSCWQTY1 - a.JCPDSCWQTY1);
      setTotalData(dataForId);

    const result = {};

    pendingData.forEach(item => {
      if (item.BRIEFNUM1 && item.BRIEFNUM1.toLowerCase() === id.toLowerCase()) {
        const { SKETCHNUM1, JCPDSCWQTY1 } = item;
      
        if (result[SKETCHNUM1]) {
          result[SKETCHNUM1] += JCPDSCWQTY1;
        } else {
          result[SKETCHNUM1] = JCPDSCWQTY1;
        }
      }      
    });
    

    const resultArray = Object.entries(result).map(([key, value]) => ({
      SKETCHNUM1: key,
      JCPDSCWQTY1: value
    }));

    resultArray.sort((a, b) => b.JCPDSCWQTY1 - a.JCPDSCWQTY1);
    console.log(resultArray);
    setSketchData(resultArray);

      const cellMasterData = await fetch(
        "http://localhost:8081/api/cellmaster"
      );
      const cellData = await cellMasterData.json();

      const cellMapping = cellData.reduce((acc, { Wh, Cell }) => {
        acc[Wh.toLowerCase()] = Cell;
        return acc;
      }, {});

      const filteredata = pendingData.filter(
        (item) => item.BRIEFNUM1.toLowerCase() === id.toLowerCase()
      );
      const mappedData = filteredata.map((item) => ({
        Cell: cellMapping[item.TODEPT.toLowerCase()] || "UNKNOWN",
        JCPDSCWQTY1: item.JCPDSCWQTY1,
      }));

      const summedDatares = mappedData.reduce((acc, curr) => {
        if (!acc[curr.Cell]) {
          acc[curr.Cell] = 0;
        }
        acc[curr.Cell] += curr.JCPDSCWQTY1;
        return acc;
      }, {});

      // console.log(summedDatares);
      setSummedData(summedDatares);

      // ////////////////////////////////////////

      const groupedData = cellData.reduce((acc, curr) => {
        if (!acc[curr.Cell]) {
          acc[curr.Cell] = [];
        }
        acc[curr.Cell].push(curr.Wh.toLowerCase());
        return acc;
      }, {});

      console.log(groupedData);
      setGroupedCellData(groupedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const [selectedCard, setSelectedCard] = useState(null);
  const handleCardClick = (cell) => {
    const getWh = groupedCellData[cell];
    setSelectedCard(cell);
    setCell(cell);
    const whCardData = {};

    getWh.forEach((wh) => {
      const filteredWh = overAllData.filter(
        (item) =>
          item.TODEPT.toLowerCase() === wh.toLowerCase() &&
          item.BRIEFNUM1.toLowerCase() === id.toLowerCase()
      );

      const whCard = filteredWh.reduce(
        (total, item) => total + item.JCPDSCWQTY1,
        0
      );

      if (whCard > 0) {
        whCardData[wh] = whCard;
      }
    });

    const arrayOfObjects = Object.keys(whCardData).map((key) => ({
      [key]: whCardData[key],
    }));

    const flattenedArray = [];

    arrayOfObjects.forEach((obj) => {
      const entries = Object.entries(obj);
      flattenedArray.push(entries);
    });

    // Update state with flattenedArray
    console.log(flattenedArray);
    setClickedCellData(flattenedArray);
  };

  const [currentPage1, setCurrentPage1] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(sketchData.length / itemsPerPage);

  const currentData = sketchData.slice(
    (currentPage1 - 1) * itemsPerPage,
    currentPage1 * itemsPerPage
  );

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
            Task Management Home Page{" "}
          </h1>
          <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
            <h1 className="text-xl font-semibold p-2 pl-10 py-5">
              Ax Brief Data
            </h1>

            <table className="w-full table-auto text-sm ">
              <thead>
                <tr className="bg-gray-300 text-gray-700 ">
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
                </tr>
              </thead>
              <tbody>
                {totalData.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200"
                  >                    
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
            <h1 className="text-xl font-semibold p-2 pl-10 py-5">
              Sketch details for <span className="text-[#879FFF]">{id}</span>
            </h1>

            <table className="w-full table-auto text-sm ">
              <thead>
                <tr className="bg-gray-300 text-gray-700 ">
                  <th className="py-3 text-center font-semibold text-base">
                    SI no.
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Sketch Number
                  </th>
                  <th className="py-3 text-center font-semibold text-base">
                    Count
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
                      {item.SKETCHNUM1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item.JCPDSCWQTY1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 m-4 ">
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
          <p className="ml-6 font-semibold text-xl text-gray-700">Pending Quantity based on <span className="text-[#879FFF]">Cells</span></p>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(summedData).map(([cell, sum]) => (
              <div
                key={cell}
                className={`shadow-md rounded-lg p-6 ${selectedCard === cell ? 'bg-gray-200 border-2 border-gray-400' : 'bg-white'}`}
                onClick={() => handleCardClick(cell)}
              >
                <h2 className="text-xl font-semibold mb-2">{cell}</h2>
                <p className="text-gray-500 font-bold text-xl">{sum}</p>
              </div>
            ))}
          </div>
          {clickedCellData.length > 0 && <p className="ml-6 font-semibold text-xl text-gray-700">Warehouse Details of the cell - <span className="text-[#879FFF]">{cell}</span></p>}
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.isArray(clickedCellData) && clickedCellData.length > 0 && cell !=='UNKNOWN'? (
              clickedCellData.map((entry, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-2">{entry[0][0].toUpperCase()}</h2>{" "}
                  {/* Key (cell) */}
                  <p className="text-gray-500 font-bold text-xl">
                    {entry[0][1]}
                  </p>{" "}
                  {/* Value (sum) */}
                </div>
              ))
            ) : <p className="text-xl text-red-500">No Data</p>}
          </div>

        </div>
      </div>
    </>
  );
}

export default Detailed_task;
