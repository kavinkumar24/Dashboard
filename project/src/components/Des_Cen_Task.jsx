import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Des_Cen_Task() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
      );
    const [search, setSearch] = useState("");
    const data = [
        {
          name: "cbe",
          assignedProjects: 5,
          pendingProjects: 2,
          assignedQty: 25,
          pendingQty: 5,
          waitingSelectionBrief: 3,
        },
        {
          name: "kol",
          assignedProjects: 5,
          pendingProjects: 5,
          assignedQty: 50,
          pendingQty: 5,
          waitingSelectionBrief: 2,
        },
        {
          name: "del",
          assignedProjects: 10,
          pendingProjects: 0,
          assignedQty: 100,
          pendingQty: 0,
          waitingSelectionBrief: 4,
        },
        {
          name: "mdc",
          assignedProjects: 5,
          pendingProjects: 5,
          assignedQty: 80,
          pendingQty: 80,
          waitingSelectionBrief: 4,
        },
        {
          name: "sur",
          assignedProjects: 5,
          pendingProjects: 0,
          assignedQty: 50,
          pendingQty: 0,
          waitingSelectionBrief: 0,
        },

      ];
      
      const total = [        
        {
        name: "Total",
        assignedProjects: 30,
        pendingProjects: 30,
        assignedQty: 305,
        pendingQty: 305,
        waitingSelectionBrief: 13,
      },
    ]
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
        <h1 className="font-bold text-xl mx-4 mt-4">Design Center Tasks Overview</h1>

{/* ********** For Total Data Only */}
        <div className="grid grid-cols-3 gap-4 mx-4 my-4">
        {total.map((center) => (
            <div className="border p-4 rounded-lg shadow-md bg-white" key={center.name}>
            <h3 className="text-lg font-bold ">{center.name}</h3>
            <table className="table-auto w-full">
                <thead>
                <tr >
                    <th></th>
                    <th className="text-left pr-5">Assigned</th>
                    <th className="text-left">Pending</th>
                </tr>
                </thead>
                <tbody>
                <tr >
                    <td className="font-semibold py-3">No. of Projects</td>
                    <td>{center.assignedProjects}</td>
                    <td>{center.pendingProjects}</td>
                </tr>
                <tr>
                    <td className="font-semibold py-3">Assigned Qty</td>
                    <td>{center.assignedQty}</td>
                    <td>{center.pendingQty}</td>
                </tr>
                <tr>
                    <td className="font-semibold py-3">Waiting for Selection Brief</td>
                    <td>{center.waitingSelectionBrief}</td>
                    <td>-</td>
                </tr>
                </tbody>
            </table>
            </div>
        ))}
        </div>

{/* ********** For Total Data Only end *************/}

<h1 className="font-bold text-xl mx-4 mt-4">Detailed Task View of all the <span className="text-[#879FFF]">Centers</span></h1>
        <div className="grid grid-cols-3 gap-4 mx-4 my-4">
      {data.map((center) => (
        <div className="border p-4 rounded-lg shadow-md bg-white" key={center.name}>
          <h3 className="text-lg font-bold text-blue-700">{center.name.toUpperCase()}</h3>
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th></th>
                <th className="text-left pr-5">Assigned</th>
                <th className="text-left">Pending</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold py-3">No. of Projects</td>
                <td>{center.assignedProjects}</td>
                <td>{center.pendingProjects}</td>
              </tr>
              <tr>
                <td className="font-semibold py-3">Assigned Qty</td>
                <td>{center.assignedQty}</td>
                <td>{center.pendingQty}</td>
              </tr>
              <tr>
                <td className="font-semibold py-3">Waiting for Selection Brief</td>
                <td>{center.waitingSelectionBrief}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>

      </div>
    </div>
    </>
  )
}

export default Des_Cen_Task
