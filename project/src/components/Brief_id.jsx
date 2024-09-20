import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

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
  const [whSketchData, setWhSketchData] = useState([]);
  const [selectedWhCard, setSelectedWhCard] = useState(null);
  //   const currentData = []
  const [activeIndex, setActiveIndex] = useState(null);

  const [message, setMessage] = useState("");

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
    if(cell === 'UNKNOWN') {
      setMessage("No Warehouse data available for this cell");
      return;
    }
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

  const handleWhCardClick = (wh) => {
    setSelectedWhCard(wh);
    const sample = overAllData.filter((obj) => obj.TODEPT.toLowerCase() === wh.toLowerCase() && obj.BRIEFNUM1.toLowerCase() === id.toLowerCase());

    const whSkchData = Object.entries(sample.reduce((acc, curr) => {
      if (!acc[curr.SKETCHNUM1]) {
        acc[curr.SKETCHNUM1] = 0;
      }
      acc[curr.SKETCHNUM1] += curr.JCPDSCWQTY1;
      return acc;
    }, {}));
    setWhSketchData(whSkchData);
    console.log(whSkchData);

  }

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

  const [currentPage2, setCurrentPage2] = useState(1);
  const itemsPerPage2 = 10;

  const totalPage2 = Math.ceil(whSketchData.length / itemsPerPage);

  const currentData2 = whSketchData.slice(
    (currentPage2 - 1) * itemsPerPage2,
    currentPage2 * itemsPerPage2
  );

  const handlePageChange2 = (newPage) => {
    if (newPage >= 1 && newPage <= totalPage2) {
      setCurrentPage1(newPage);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      whSketchData.map(([sketchNumber, count], index) => ({
        "SI no.": index + 1,
        "Sketch Number": sketchNumber,
        Count: count,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sketch Data");
    XLSX.writeFile(workbook, `sketch_data_${selectedWhCard}.xlsx`);
  };
  const downloadExcel2 = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sketchData.map(({ SKETCHNUM1, JCPDSCWQTY1 }, index) => ({
        "SI no.": index + 1,
        "Sketch Number": SKETCHNUM1,
        Count: JCPDSCWQTY1,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sketch Data");
    XLSX.writeFile(workbook, `sketch_data_${id}.xlsx`);
  }
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


          <div className="m-6 px-10 border rounded-lg border-gray-300 bg-white shadow-lg">

          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleAccordion(1)}
              className="w-full flex justify-between items-center py-5 text-slate-800"
            >
              <span className="text-lg font-semibold">Sketch details</span>
              <span className="text-slate-800 transition-transform duration-300">
                {activeIndex === 1 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                )}
              </span>
            </button>
            <div
              className={`${
                activeIndex === 1 ? "max-h-screen" : "max-h-0"
              } overflow-hidden transition-all duration-300 ease-in-out`}
            >
              {/* <div className="pb-5 text-sm text-slate-500">
            Material Tailwind is a framework that enhances Tailwind CSS with additional styles and components.
          </div> */}
<div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
           <div className="flex justify-between">
           <h1 className="text-xl font-semibold p-2 pl-10 py-5">
              Sketch details for <span className="text-[#879FFF]">{id}</span>
            </h1>
            <div className="m-4">
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
              onClick={downloadExcel2}
            >
              Download as Excel
            </button>
            </div>
           </div>
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
              
            </div>
          </div>
        </div>



          
          <p className="ml-6 font-semibold text-xl text-gray-700">Pending Quantity based on <span className="text-[#879FFF]">Cells</span></p>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(summedData).map(([cell, sum]) => (
              <div
                key={cell}
                className={`shadow-md rounded-lg p-6 ${selectedCard === cell ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white'}`}
                onClick={() => handleCardClick(cell)}
              >
                <h2 className="text-xl font-semibold mb-2">{cell}</h2>
                <p className="text-gray-500 font-bold text-xl">{sum}</p>
              </div>
            ))}
          </div>
          {(clickedCellData.length > 0 && cell !== 'UNKNOWN') && <p className="ml-6 font-semibold text-xl text-gray-700">Warehouse Details of the cell - <span className="text-[#879FFF]">{cell}</span></p>}
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.isArray(clickedCellData) && clickedCellData.length > 0 && cell !== 'UNKNOWN' ? (
        clickedCellData.map((entry, index) => (
          <div
            key={index}
            // Conditionally set background color based on whether the card is selected
            className={`shadow-md rounded-lg p-6 cursor-pointer ${
              selectedWhCard === entry[0][0].toLowerCase() ? 'bg-blue-100 border-2 border-blue-400' : 'bg-white'
            }`}
            onClick={() => handleWhCardClick(entry[0][0].toLowerCase())} // Handle the click event
          >
            <h2 className="text-xl font-semibold mb-2">{entry[0][0].toUpperCase()}</h2>{" "}
            <p className="text-gray-500 font-bold text-xl">
              {entry[0][1]}
            </p>{" "}
          </div>
        ))
      ) : (
        <p className="text-red-500 text-lg font-bold">{message}</p>
      )}
    </div>
          {whSketchData.length > 0 && <p className="ml-6 font-semibold text-xl text-gray-700">Sketch Details of the Warehouse </p>}
          {whSketchData.length > 0  && <div className="m-6 border rounded-lg border-gray-300 bg-white shadow-lg">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold p-2 pl-10 py-5">
              Sketch details for <span className="text-[#879FFF]">{selectedWhCard.toUpperCase()}</span>
            </h1>
            <div className="m-4">
            <button
              className="px-5 py-3 bg-blue-500 text-white rounded-lg font-semibold"
              onClick={downloadExcel}
            >
              Download as Excel
            </button>
            </div>
            
          </div>
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
                {currentData2.map((item, index) => (
                  <tr
                    key={index}
                    className="bg-white even:bg-gray-50 hover:bg-gray-200 transition-colors duration-200" 
                  >
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {(currentPage2 - 1) * itemsPerPage2 + index + 1}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item[0]}
                    </td>
                    <td className="py-4 text-center whitespace-nowrap overflow-hidden text-base">
                      {item[1]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center space-x-2 m-4 ">
              <button
                className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                  currentPage2 === 1
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => handlePageChange2(currentPage2 - 1)}
                disabled={currentPage2 === 1}
              >
                Previous
              </button>

              <button className="text-base px-5 py-3 rounded-lg border bg-gray-300">
                {currentPage2}
              </button>

              <button
                className={`text-base font-semibold px-5 py-3 rounded-lg border ${
                  currentPage2 === totalPage2
                    ? "bg-gray-200 cursor-not-allowed"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                onClick={() => handlePageChange(currentPage2 + 1)}
                disabled={currentPage2 === totalPage2}
              >
                Next
              </button>
            </div>
          </div> 
        }



        </div>
      </div>
    </>
  );
}

export default Detailed_task;
