import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [activeTab, setActiveTab] = useState('Production Data');
  const [departmentData, setDepartmentData] = useState({});
  const [pendingDepartmentData, setPendingDepartmentData] = useState({});

  useEffect(() => {
    fetch('http://localhost:8081/production_data')
      .then((res) => res.json())
      .then((data) => {
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
      })
      .catch((err) => console.log(err));

    fetch('http://localhost:8081/pending_data')
      .then((res) => res.json())
      .then((data) => {
        setPendingData(data);
        
        const groupedPendingData = data.reduce((acc, curr) => {
          const dept = curr.todept1;
          if (!acc[dept]) {
            acc[dept] = 0;
          }
          acc[dept] += curr.pdscwqty1;
          return acc;
        }, {});

        setPendingDepartmentData(groupedPendingData);
      })
      .catch((err) => console.log(err));
  }, []);

  const renderCards = (data) => {
    return Object.keys(data).map((dept) => (
      <div key={dept} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between" style={{ minWidth: '150px', minHeight: '100px' }}>
        <h2 className="text-lg font-bold">{dept}</h2>
        <p className="text-2xl font-bold">{data[dept]}</p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="p-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <nav className="mt-10">
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500">
            Home
          </a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500">
            Projects
          </a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500">
            Task Board
          </a>
          <a href="#" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-100 hover:text-blue-500">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white p-4 shadow flex items-center justify-start">
          <button
            onClick={() => setActiveTab('Production Data')}
            className={`px-4 py-2 rounded-md mr-2 ${activeTab === 'Production Data' ? 'bg-gray-300' : 'bg-white'}`}
          >
            Production Data
          </button>
          <button
            onClick={() => setActiveTab('Pending Data')}
            className={`px-4 py-2 rounded-md ${activeTab === 'Pending Data' ? 'bg-gray-300' : 'bg-white'}`}
          >
            Pending Data
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{activeTab} Dashboard</h1>
            <input
              type="search"
              placeholder="Search"
              className="p-2 border rounded-md"
            />
          </header>

          {/* Department Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
  {activeTab === 'Production Data' ? renderCards(departmentData) : renderCards(pendingDepartmentData)}
</div>

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
