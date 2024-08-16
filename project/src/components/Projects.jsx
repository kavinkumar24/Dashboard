import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useRef } from 'react';
function Projects() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [activeTab, setActiveTab] = useState("");
  const [spin, setSpin] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  
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
        const productionCounts = countDepartments(filteredProductionData);

        const pendingResponse = await fetch("http://localhost:8081/pending_data");
        const pendingData = await pendingResponse.json();
        const filteredPendingData = pendingData.filter(item => departmentsToShow.includes(item.pltcoded1.toUpperCase()));
        setPendingData(filteredPendingData);
        const pendingCounts = countDepartments(filteredPendingData, true);

        const combinedCounts = {};
        departmentsToShow.forEach(dept => {
          combinedCounts[dept] = {
            production: productionCounts[dept] || 0,
            pending: pendingCounts[dept] || 0,
            total: (productionCounts[dept] || 0) + (pendingCounts[dept] || 0)
          };
        });

        setDepartmentCounts(combinedCounts);

        const initialTab = departmentsToShow.find(dept => combinedCounts[dept]?.total > 0) || "";
        setActiveTab(initialTab);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    setTimeout(() => {
      setSkeleton(false);
    }, 2000);
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
  const sectionRef = useRef(null);

  const handleTabClick = (dept) => {
    setSpin(true);
    setTimeout(() => {
      setSpin(false);
    }, 700);
    setActiveTab(dept);
    setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 750)
  };

  const renderCards = (data, isPending = false) => {
    return data
      .filter(item => (isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase()) === activeTab)
      .map((item, index) => (
        <div
          key={index}
          className={`bg-white shadow-md rounded-lg p-4 m-2 w-full ${
            isPending ? "border-l-4 border-yellow-500" : "border-r-4 border-green-500"
          }`}
        >
          <h3 className="text-md font-semibold">Department: {isPending ? item.todept : item.fromdept1}</h3>
          <p className="text-sm text-slate-500">Description: {isPending ? item.designspec1 : item.description1}</p>
        </div>
      ));
  };

  const hasData = (data) => data.length > 0;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {skeleton && (
        <div className={`max-w-[100%] bg-opacity-100 max-h-full fixed inset-0 z-50 bg-gray-100 ml-0 px-4 sm:px-8 sm:ml-40 md:px-24 md:ml-40 md:mt-24 lg:px-48 xl:px-64 2xl:px-96`}>
          <div role="status" className="animate-pulse mt-32 w-full relative">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-slate-300 mb-4 w-[50%] sm:w-[40%] md:w-[35%] lg:w-[30%] xl:w-[25%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-[60%] sm:w-[50%] md:w-[45%] lg:w-[40%] xl:w-[35%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-[70%] sm:w-[60%] md:w-[55%] lg:w-[50%] xl:w-[45%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-[80%] sm:w-[70%] md:w-[65%] lg:w-[60%] xl:w-[55%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-[90%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[65%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[75%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[91%] md:w-[85%] lg:w-[80%] xl:w-[77%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[92%] md:w-[85%] lg:w-[80%] xl:w-[79%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[93%] md:w-[85%] lg:w-[80%] xl:w-[81%]"></div>

            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[94%] md:w-[85%] lg:w-[80%] xl:w-[83%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[95%] md:w-[85%] lg:w-[80%] xl:w-[85%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[96%] md:w-[85%] lg:w-[80%] xl:w-[87%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[97%] md:w-[85%] lg:w-[80%] xl:w-[89%]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-slate-300 mb-2.5 w-full sm:w-[98%] md:w-[85%] lg:w-[80%] xl:w-[91%]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {spin &&
        <div className={`max-w-full bg-opacity-35 max-h-full fixed px-96 2xl:pr-px inset-0 z-50 bg-gray-500 `}>
          <div className="flex gap-2 max-h-20 w-20 items-center justify-center relative top-72 -left-52 md:top-64 md:left-36 animate-bounce rounded-lg 2xl:left-[35%] lg:left-[45%] 2xl:top-80 3xl:left-96">
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
          </div>
        </div>
      }
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Header />
        <div className="flex flex-col flex-grow p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
            {departmentsToShow.map((dept) => (
              departmentCounts[dept] && (
                <button
                  key={dept}
                  onClick={() => handleTabClick(dept)}
                  className={`px-4 py-2 rounded-md ${activeTab === dept ? "bg-[#CAD4E0] text-black shadow-lg" : "bg-[#FFFFFF] text-gray-700 shadow-md"}`}
                >
                  {/* {dept} */}
                  <b>
                    {/* <div>
                   <div> Total: {departmentCounts[dept].total} </div>
                    <div>Prod: {departmentCounts[dept].production} </div>
                    <div>Pending: {departmentCounts[dept].pending}</div>
                    </div> */}




                    <div className="flex flex-col space-y-3">
  <h2 className="font-bold text-lg text-gray-700 uppercase bg-gray-50 dark:bg-slate-100 dark:text-gray-700 text-center rounded-md shadow-md">
    {dept} <span className='font-normal text-sm'>({departmentCounts[dept].total})</span>
  </h2>
  
  <div className="flex justify-between">
    <div className="bg-[#c1fbce92] rounded-lg shadow-md border border-[#00ff379e] w-[50%] mr-1 h-7">
      <p className="font-normal text-sm text-center text-[#1C6C00] p-1">
        Production: <span className="font-bold text-gray-600">{departmentCounts[dept].production}</span>
      </p>
    </div>
    <div className="bg-[#fbf9c19d] rounded-lg shadow-md border border-[#F1EA1C] w-[50%] ml-1 h-7">
      <p className="font-normal text-sm text-center text-[#9F9F00] p-1">
        Pending: <span className="font-bold text-gray-600">{departmentCounts[dept].pending}</span>
      </p>
    </div>
  </div>

  {/* <div className="bg-[#fbc6c191] rounded-lg shadow-md border border-[#ff00009e] w-full h-7">
    <p className="font-normal text-sm text-center text-[#9F0000] p-1">
      Total: <span className="font-bold text-gray-600"> {departmentCounts[dept].total}</span>
    </p>
  </div> */}
</div>

                  </b>
                </button>
              )
            ))}
          </div>

          <div className="mt-6" ref={sectionRef} >
            <h2 className="text-xl font-bold mb-4">Production Data for {activeTab}</h2>
            {hasData(productionData.filter(item => item.pltcode.toUpperCase() === activeTab)) ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 ">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
