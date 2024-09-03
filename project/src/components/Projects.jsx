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
  const [viewData, setviewData] = useState(false);
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
  
   
  useEffect(()=>{
    setTimeout(() => {
      setSkeleton(false);
    }, 1000);
  },[skeleton])
  useEffect(() => {
    if (search !== '') {
      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1000);
    }

    // const groupProductionDataByDepartment = (data) => {
    //   // Grouping data by 'fromdept1' and summing up 'qty1'
    //   return data.reduce((acc, item) => {
    //     const department = item.fromdept1;
    //     if (!acc[department]) {
    //       acc[department] = 0;
    //     }
    //     acc[department] += item.qty1;
    //     return acc;
    //   }, {});
    // };
    
    const renderGroupedProductionData = (groupedData) => {
      return (
        <div className="flex flex-col space-y-2">
          {Object.entries(groupedData).map(([department, qty]) => (
            <div key={department} className="flex justify-between">
              <span className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>{department}</span>
              <span className="font-bold">{qty}</span>
            </div>
          ))}
        </div>
      );
    };
   
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
      
      if (pltcoded1 === department) {
        const { todept, jcpdscwqty1 } = item;
  
        const normalizedqty = parseInt(jcpdscwqty1,10)
        if (!todept) {
          console.warn("Missing fromdept1 in item:", item);
          return acc;
        }
  
        const normalizedDept = todept.toLowerCase();
        if (!acc[pltcoded1]) {
          acc[pltcoded1] = {};
        }
  
        if (!acc[pltcoded1][normalizedDept]) {
          acc[pltcoded1][normalizedDept] = 0;
        }
  
        acc[pltcoded1][normalizedDept] += normalizedqty;
      }

      else if (pltcode === department) {
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
  
const renderGroupedDataByPltcodeAndDepartment = (groupedData, isPending = false) => {
  console.log(isPending)
  const noDataMessage = isPending ? 'No data available.' : 'No data available.';

 
  const filterDepartments = (departments) => {
      if (!search) return Object.entries(departments);
      return Object.entries(departments).filter(([department]) =>
          department.toLowerCase().includes(search.toLowerCase())
      );
  };

  return (
      <div className="space-y-8">
          

          {Object.entries(groupedData).length === 0 ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{noDataMessage}</span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
                      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <title>Close</title>
                          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                      </svg>
                  </span>
              </div>
          ) : (
              Object.entries(groupedData).map(([pltcode, departments]) => (
                  <div key={pltcode}>
                      {/* Heading for pltcode */}
                      <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                          {pltcode}
                      </h3>
                      {/* Cards for departments */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {filterDepartments(departments).map(([department, qty]) => (
                              <div 
                                  key={`${pltcode}-${department}`} 
                                  className={`p-4 shadow-md rounded-lg border-solid border-2 ${ isPending ? "border-[#eab20894]" : "border-[#22c55e93]"} ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300'}`}
                              >
                                  <div className={`flex justify-between p-2  rounded-md border-solid border mb-2 ${theme==='light'?'bg-slate-100 border-slate-200':'bg-slate-800 border-slate-500'}`}>
                                      <span className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{department.toUpperCase()}</span>
                                      
                                  </div>
                                  <span className="font-normal px-2 py-9">Total : <span className='font-bold'>{qty}</span></span>
                              </div>
                          ))}
                      </div>
                  </div>
              ))
          )}
      </div>
  );
};
  

  

const renderPendingData = () => {
  if (!pendingData.length) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const filteredDepartments = Object.entries(departmentCounts)
    .filter(([department]) => !search || department.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredDepartments.map(([department, count]) => (
        <div
          key={department}
          className="p-4 shadow-lg rounded-lg border-2 border-yellow-300 bg-white hover:bg-yellow-50 transition-colors duration-300"
        >
          <div className="flex justify-between items-center p-2 rounded-md mb-2">
            <span className="font-semibold text-gray-700">{department.toUpperCase()}</span>
            <span className="text-gray-600">Total: <strong>{count}</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
};


  const renderCardCounts = (data, isPending = false) => {
    const groupedData = data.reduce((acc, item) => {
      const department = isPending ? item.pltcoded1.toUpperCase() : item.pltcode.toUpperCase();
      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {departmentsToShow.map((dept) => (
        groupedData[dept] ? (
          <div
            key={dept}
            className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} shadow-md ${isPending ? 'border-yellow-500' : 'border-green-500'} border`}
          >
            <h3 className="text-md font-semibold mb-2">{dept}</h3>
            <p className="text-sm">
              {isPending ? 'Pending Data' : 'Production Data'}: <span className="font-bold">{groupedData[dept]}</span>
            </p>
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
        <div className={`border fixed shadow rounded-md p-4 max-w-full min-h-full inset-0 z-50 w-full md:w-[86%]  ml-0 md:ml-52 mx-auto ${theme === 'dark' ? 'bg-gray-800 border-blue-300 ' : 'bg-white border-gray-200'} sm:ml-0`} >
        <div className="animate-pulse flex space-x-4 mt-16">
      <div className={`rounded-fullh-10 w-10`}></div>
      <div className="flex-1 space-y-6 py-10 md:py-1">
        <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
        <div className="space-y-5 md:space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded col-span-2`}></div>
            <div className={`h-2 w-[70%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded col-span-1`}></div>
          </div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className="grid grid-cols-3 gap-4">
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2  ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          </div>
          
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className="grid grid-cols-3 gap-4">
          <div className={`h-2  ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          
          </div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className="grid grid-cols-3 gap-4">
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2  ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          </div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2 w-[90%] ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className="grid grid-cols-3 gap-4">
          <div className={`h-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          <div className={`h-2  ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
          </div>
        </div>
        
      </div>
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
      <div className="flex-1 flex flex-col">

      <Header onSearch={setSearch} theme={theme} dark={setTheme} onView = {setviewData} view = {viewData} />
      <main className="flex-1 p-6 overflow-y-auto">
      <div className="flex flex-col flex-grow p-4">
      {viewData ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
              <tr className={`${theme==='light'?'bg-slate-700 text-white':'bg-slate-900 text-white '}`}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Pending</th>
              </tr>
            </thead>
            <tbody className={`${theme === 'light' ? 'bg-white divide-y divide-gray-200' : 'bg-gray-900 divide-y divide-gray-700'}`}>
              {departmentsToShow.map((dept) => (
                departmentCounts[dept] && (
                  <tr key={dept} onClick={() => handleTabClick(dept)} className={`cursor-pointer ${activeTab === dept ?
                    (theme === 'dark' ? "bg-slate-500 text-white" : "bg-[#CAD4E0] text-black") :
                    (theme === 'dark' ? "bg-slate-700 text-gray-300" : "bg-[#FFFFFF] text-gray-700")}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                        {dept}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`rounded-lg shadow-md border-solid border w-full h-7 ${theme === 'light' ? 'bg-[#feffd1] border-[#e5ff00] text-[#879300]' : 'bg-gray-800 border-[#7d8808] text-amber-300 shadow-md'}`}>
                        <p className="font-normal text-sm text-center p-1">
                          Pending: <span className={`font-bold ${theme === 'light' ? 'text-gray-600' : 'text-gray-200'}`}>{departmentCounts[dept].pending}</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-5">
          {departmentsToShow.map((dept) => (
            departmentCounts[dept] && (
              <button
                key={dept}
                onClick={() => handleTabClick(dept)}
                className={`px-4 py-2 rounded-md ${activeTab === dept ?
                  (theme === 'dark' ? "bg-slate-500 text-white shadow-lg" : "bg-[#CAD4E0] text-black shadow-lg") :
                  (theme === 'dark' ? "bg-slate-700 text-gray-300 shadow-md" : "bg-[#FFFFFF] text-gray-700 shadow-md")}`}
              >
                <div className="flex flex-col space-y-3">
                  <h2 className={`font-bold text-lg  text-center rounded-md ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {dept}
                  </h2>
                  <div className={`rounded-lg shadow-md border-solid border w-full ml-1 h-7 ${theme === 'light' ? 'bg-[#feffd1] border-[#e5ff00] text-[#879300]' : 'bg-gray-800 border-[#7d8808] text-amber-300 shadow-md'}`}>
                    <p className="font-normal text-sm text-center p-1">
                      Pending: <span className={`font-bold ${theme === 'light' ? 'text-gray-600' : 'text-gray-200'}`}>{departmentCounts[dept].pending}</span>
                    </p>
                  </div>
                </div>
              </button>
            )
          ))}
        </div>
      )}

          <section ref={sectionRef} className="flex flex-col items-center justify-center">
            
            {hasData(pendingData) && (
              <div className="mt-4 w-full">
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Pending Data
                </h3>
                <div>
                  {renderGroupedDataByPltcodeAndDepartment(groupDataByPltcodeAndDepartment(pendingData, activeTab),true)}
                </div>
              </div>
            )}
          </section>

        </div>
      </main>
      </div>
    </div>
  );
}

export default Projects;
