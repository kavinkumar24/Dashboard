import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function Projects() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [activeTab, setActiveTab] = useState("");
  const [spin, setSpin] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const departmentsToShow = [
    "CASTING", "CHAIN", "CHAIN MIX", "DIAMOND", "DIRECT CASTING", "EKTARA",
    "ELECTRO FORMING", "EMERALD GEMSTONE JEW", "FUSION", "HAND MADE", "ILA BANGLES",
    "IMPREZ", "INDIANIA", "ISHTAA", "LASER CUT", "MANGALSUTRA", "MARIYA", "MMD",
    "PLATINUM", "RUMI", "STAMPING", "THIN CASTING", "TURKISH", "UNIKRAFT", "KALAKRITI"
  ];

  const sectionRef = useRef(null);

  useEffect(() => {
    if (search !== '') {
      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 750);
    }

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
  }, [search]);

  const countDepartments = (data, isPending = false) => {
    const departmentCounts = {};
    data.forEach(item => {
      const department = isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase();
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });
    return departmentCounts;
  };

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
    }, 750);
  };
  const groupDataByPltcodeAndDepartment = (data, department) => {
    return data.reduce((acc, item) => {
      const pltcode = item.pltcode ? item.pltcode.toUpperCase() : "";
      const pltcoded1 = item.pltcoded1 ? item.pltcoded1.toUpperCase() : "";
  
      if (pltcode === department || pltcoded1 === department) {
        const { fromdept1, pdscwqty1 } = item;
  
        if (!fromdept1) {
          console.warn("Missing fromdept1 in item:", item);
          return acc;
        }
  
        const normalizedDept = fromdept1.toLowerCase();
  
        if (!acc[pltcode]) {
          acc[pltcode] = {};
        }
  
        if (!acc[pltcode][normalizedDept]) {
          acc[pltcode][normalizedDept] = 0;
        }
  
        acc[pltcode][normalizedDept] += pdscwqty1;
      }
      return acc;
    }, {});
  };
  
  const renderGroupedDataByPltcodeAndDepartment = (groupedData) => {
    return Object.entries(groupedData).map(([pltcode, departments]) => (
      <div key={pltcode} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{pltcode}</h3>
        <div className="flex flex-col space-y-2">
          {Object.entries(departments).map(([department, qty]) => (
            <div key={department} className="flex justify-between">
              <span className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>{department}</span>
              <span className="font-bold">{qty}</span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const renderCardCounts = (data, isPending = false) => {
    const groupedData = data.reduce((acc, item) => {
      const department = isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase();
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="flex flex-wrap -mx-2">
        {departmentsToShow.map((dept) => (
          groupedData[dept] ? (
            <div
              key={dept}
              className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4`}
            >
              <div
                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} shadow-md border ${isPending ? 'border-yellow-500' : 'border-green-500'}`}
              >
                <h3 className="text-md font-semibold mb-2">{dept}</h3>
                <p className="text-sm">
                  {isPending ? 'Pending Data' : 'Production Data'}: <span className="font-bold">{groupedData[dept]}</span>
                </p>
              </div>
            </div>
          ) : null
        ))}
      </div>
    );
  };

  const hasData = (data) => data.length > 0;

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      {skeleton && (
        <div className={`max-w-[100%] ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'} bg-opacity-100 max-h-full fixed inset-0 z-50`}>
          <div role="status" className="animate-pulse mt-32 w-full relative">
            <div className={`h-2.5 ${theme === 'light' ? 'bg-gray-200' : 'bg-slate-700'} rounded-full mb-4 w-[50%]`}></div>
            <div className={`h-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-slate-700'} rounded-full mb-2.5 w-[60%]`}></div>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {spin && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} bg-opacity-50`}>
          <div className="flex gap-2 animate-bounce">
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
          </div>
        </div>
      )}

      <Sidebar theme={theme} />
      <main className="flex-1 p-6 overflow-y-auto">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <div className="flex flex-col flex-grow p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6">
            {departmentsToShow.map((dept) => (
              departmentCounts[dept]?.total > 0 && (
                <button
                  key={dept}
                  onClick={() => handleTabClick(dept)}
                  className={`py-2 px-4 rounded-lg ${activeTab === dept ? 'bg-blue-500 text-white' : 'bg-gray-300'} focus:outline-none`}
                >
                  {dept}
                </button>
              )
            ))}
          </div>

          <section ref={sectionRef} className="flex flex-col items-center justify-center">
            {hasData(productionData) && (
              <div className="mt-4 w-full">
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Production Data
                </h3>
                <div>
                  {renderGroupedDataByPltcodeAndDepartment(groupDataByPltcodeAndDepartment(productionData, activeTab))}
                </div>
              </div>
            )}

            {hasData(pendingData) && (
              <div className="mt-4 w-full">
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Pending Data
                </h3>
                <div>
                  {renderGroupedDataByPltcodeAndDepartment(groupDataByPltcodeAndDepartment(pendingData, activeTab))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Projects;
