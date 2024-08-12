import React, { useState, useEffect } from "react";

function Dashboard() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [activeTab, setActiveTab] = useState("Production Data");
  const [departmentData, setDepartmentData] = useState({});
  const [pendingDepartmentData, setPendingDepartmentData] = useState({});
  // const [tableViewDepartmentData, settableViewDepartmentData] = useState({});
  // const [tableViewPendingDepartmentData, settableViewPendingDepartmentData] = useState({});
  // const [tableViewData, settableViewData] = useState({});
  const [viewData, setviewData] = useState(false);
  const [search, setSearch] = useState('');


  useEffect(() => {
    fetch("http://localhost:8081/production_data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Production Data:", data);
        if (Array.isArray(data)) {
          setProductionData(data);

          const groupedData = data.reduce((acc, curr) => {
            const dept = curr.fromdept1;
            if (!acc[dept]) {
              acc[dept] = 0;
            }
            acc[dept] += curr.pdscwqty1;
            return acc;
          }, {});

          setDepartmentData(groupedData);
        }
      })
      .catch((err) => console.log("Error fetching production data:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8081/pending_data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Pending Data:", data);

        if (Array.isArray(data) && data.length > 0) {
          let totalQuantity = 0;
          const groupedPendingData = data.reduce((acc, curr) => {
            console.log("Processing item:", curr);

            const dept = curr.todept || "Unknown Department";
            const quantity = parseFloat(curr.jcpdscwqty1) || 0;

            totalQuantity += quantity;

            if (!acc[dept]) {
              acc[dept] = 0;
            }
            acc[dept] += quantity;

            return acc;
          }, {});

          setPendingDepartmentData(groupedPendingData);
          console.log("Grouped Pending Data:", groupedPendingData);
          console.log("Total Quantity:", totalQuantity);
        } else {
          console.log(
            "Pending Data is not in expected format or is empty:",
            data
          );
        }
      })
      .catch((err) => console.log("Error fetching pending data:", err));
  }, []);

  // useEffect(()=>{
  //   if(activeTab==='Production Data')
  //     settableViewData(departmentData);
  //   else if(activeTab === 'Pending Data')
  //     settableViewData(pendingDepartmentData);
  // },[activeTab,departmentData,pendingDepartmentData]);

  const renderCards = (data) => {
    return Object.keys(data).filter((data)=>{
      return search.toLowerCase() === ''?data : data.toLowerCase().includes(search);
    }).map((dept) => (
      <div
        key={dept}
        className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between"
        style={{ minWidth: "150px", minHeight: "100px" }}
      >
        <h2 className="font-bold text-lg text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">{dept}</h2>
        <p className="font-bold bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-base">{data[dept]}</p>
      </div>
    ));
  };

  const renderTable = (data) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-base text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Warehouse
              </th>
              <th scope="col" className="px-6 py-3">
                {activeTab} Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).filter((data)=>{
              return search.toLowerCase() === ''?data : data.toLowerCase().includes(search.toLowerCase());
            }).map((dept) => (
              <tr
                key={dept}
                className="font-bold bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-sm"
              >
                <td className="px-6 py-3">{dept}</td>
                <td className="px-6 py-3">{data[dept]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <nav className="mt-10">
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500"
          >
            Home
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500"
          >
            Projects
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500"
          >
            Task Board
          </a>
          <a
            href="#"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500"
          >
            Settings
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white p-4 shadow flex items-center justify-start">
          <button
            onClick={() => setActiveTab("Production Data")}
            className={`px-4 py-2 rounded-md mr-2 ${
              activeTab === "Production Data" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Production Data
          </button>
          <button
            onClick={() => setActiveTab("Pending Data")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "Pending Data" ? "bg-gray-300" : "bg-white"
            }`}
          >
            Pending Data
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{activeTab} Dashboard</h1>
            <div className="flex items-center gap-5">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setviewData((prev)=>!prev)}
              >
                {viewData ? 'View Cards':'View in Table'}
              </button>
              <input
                type="search"
                placeholder={viewData ? 'Search in Table':'Search Card'}
                className="p-2 border rounded-md"
                onChange={(e)=>setSearch(e.target.value)}
              />
            </div>
          </header>

          {/* Department Cards */}
            <div className={`${viewData ? 'relative overflow-x-auto':'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'}`}>
              {viewData
                ? renderTable(activeTab === "Production Data" ? departmentData : pendingDepartmentData)
                : renderCards(activeTab === "Production Data" ? departmentData : pendingDepartmentData)}
            </div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
