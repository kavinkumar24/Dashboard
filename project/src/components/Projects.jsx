import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Projects() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [activeTab, setActiveTab] = useState("");

  const departmentsToShow = [
    "CASTING", "CHAIN", "CHAIN MIX", "DIAMOND", "DIRECT CASTING", "EKTARA",
    "ELECTRO FORMING", "EMERALD GEMSTONE JEW", "FUSION", "HAND MADE", "ILA BANGLES",
    "IMPREZ", "INDIANIA", "ISHTAA", "LASER CUT", "MANGALSUTRA", "MARIYA", "MMD",
    "PLATINUM", "RUMI", "STAMPING", "THIN CASTING", "TURKISH", "UNIKRAFT", "KALAKRITI"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productionResponse = await fetch("http://localhost:8081/production_data");
        const productionData = await productionResponse.json();
        const filteredProductionData = productionData.filter(item => departmentsToShow.includes(item.pltcode.toUpperCase()));
        setProductionData(filteredProductionData);

        const pendingResponse = await fetch("http://localhost:8081/pending_data");
        const pendingData = await pendingResponse.json();
        const filteredPendingData = pendingData.filter(item => departmentsToShow.includes(item.pltcoded1.toUpperCase()));
        setPendingData(filteredPendingData);

        const productionCounts = countDepartments(filteredProductionData);
        const pendingCounts = countDepartments(filteredPendingData, true);
        setDepartmentCounts({ ...productionCounts, ...pendingCounts });

        const initialTab = departmentsToShow.find(dept => productionCounts[dept] || pendingCounts[dept]) || "";
        setActiveTab(initialTab);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); 

  const countDepartments = (data, isPending = false) => {
    const departmentCounts = {};
    data.forEach(item => {
      const department = isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase();
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });
    return departmentCounts;
  };

  const handleTabClick = (dept) => {
    setActiveTab(dept);
  };

  const renderCards = (data, isPending = false) => {
    return data
      .filter(item => (isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase()) === activeTab)
      .map((item, index) => (
        <div key={index} className="bg-white shadow-md rounded-lg p-4 m-2 w-full">
          <h3 className="text-md font-semibold">Department: {isPending ? item.todept : item.fromdept1}</h3>
          <p className="text-sm">Description: {isPending ? item.designspec1 : item.description1}</p>
        </div>
      ));
  };

  const hasData = (data) => data.length > 0;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Header />
        <div className="flex flex-col flex-grow p-4">
          <div className="flex flex-wrap justify-around space-x-4">
            {departmentsToShow.map(dept => (
              departmentCounts[dept] && (
                <button
                  key={dept}
                  onClick={() => handleTabClick(dept)}
                  className={`px-4 py-2 m-2 rounded ${activeTab === dept ? "bg-[#879FFF] text-white" : "bg-gray-200 text-gray-700"}`}
                >
                  {dept} ({departmentCounts[dept]})
                </button>
              )
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Production Data for {activeTab}</h2>
            {hasData(productionData.filter(item => item.pltcode.toUpperCase() === activeTab)) ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {renderCards(productionData)}
              </div>
            ) : (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                <p className="font-bold">No Production Data Available</p>
                <p>Please check back later or try a different department.</p>
              </div>
            )}

            <h2 className="text-xl font-bold mt-8 mb-4">Pending Data for {activeTab}</h2>
            {hasData(pendingData.filter(item => item.pltcoded1.toUpperCase() === activeTab)) ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {renderCards(pendingData, true)}
              </div>
            ) : (
              <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
                <p className="font-bold">No Pending Data Available</p>
                <p>Check back later or adjust your filter settings.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Projects;
