import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import Sidebar from '../Sidebar';

function DepartmentDetail() {
  const { deptId, type } = useParams();
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [selectedDept, setSelectedDept] = useState(deptId || '');
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [dataView, setDataView] = useState([]);
  const[load,setLoad] = useState(true);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    setTimeout(()=>{
      setLoad(false);
    },1000)
  }, [theme]);
  useEffect(() => {
    fetchDepartmentMappings();
  }, []);

  useEffect(() => {
    if (type === 'production') {
      fetchData('production');
    } else if (type === 'pending') {
      fetchData('pending');
    }
  }, [deptId, type, search, selectedDept]);

  useEffect(() => {
    let groupedData;
  
    if (selectedDept && departmentMappings[selectedDept]) {
      const { from = [], to = [] } = departmentMappings[selectedDept];
      const dataToRender = type === 'production' ? productionData : pendingData;
  
      if (Array.isArray(dataToRender)) {
        let filteredData;
  
        if (type === 'production') {
          filteredData = dataToRender
            .filter(item => 
              from.includes(item["From Dept"]?.toUpperCase()) && 
              to.includes(item["To Dept"]?.toUpperCase()) &&
              (search.toLowerCase() === '' || 
               item["From Dept"].toLowerCase().includes(search.toLowerCase()) || 
               item["To Dept"].toLowerCase().includes(search.toLowerCase()))
            );
  
          console.log("Filtered Production Data:", filteredData);
          groupedData = groupDataByDept_production(filteredData);
  
        } else if (type === 'pending') {
          filteredData = dataToRender.filter(item => 
            item.TODEPT && from.includes(item.TODEPT.toUpperCase()) &&
            (search.toLowerCase() === '' || item.TODEPT.toLowerCase().includes(search.toLowerCase()))
          );
  
          console.log("Filtered Pending Data:", filteredData);
          groupedData = groupDataByDept(filteredData);
        }
  
        setDataView(groupedData);
      } else {
        console.error('Data to render is not an array:', dataToRender);
        setDataView({});
      }
    }
  }, [selectedDept, departmentMappings, productionData, pendingData, type, search]);
  

  const fetchDepartmentMappings = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/department-mappings');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setDepartmentMappings(data);
    } catch (err) {
      console.error('Error fetching department mappings:', err);
    }
  };

  const fetchData = async (dataType) => {
    try {
      const url = dataType === 'production' 
        ? 'http://localhost:8081/api/raw_filtered_production_data' 
        : 'http://localhost:8081/api/raw_filtered_pending_data';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const fetchedData = await res.json();
      console.log(`Fetched ${dataType} Data:`, fetchedData);

      if (dataType === 'production') {
        setProductionData(fetchedData);
      } else {
        setPendingData(fetchedData);
      }
    } catch (err) {
      console.error(`Error fetching ${dataType} data:`, err);
    }
  };

  const groupDataByDept_production = (data) => {
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        const dept = (item["From Dept"] || item["To Dept"] || 'Unknown').toUpperCase();
        const pltcode = item.Project ||item.PLTCODE1|| 'Unknown';
  
        if (!acc[dept]) {
          acc[dept] = { quantity: 0, pltcodes: {} };
        }
  
        // acc[dept].quantity += Number(item["CW Qty"] || item.JCPDSCWQTY1) || 0;
        acc[dept].quantity += 1 || 0;
  
        if (!acc[dept].pltcodes[pltcode]) {
          acc[dept].pltcodes[pltcode] = 0;
        }
        acc[dept].pltcodes[pltcode] += 1;
  
        return acc;
      }, {});
    } else {
      console.error('Invalid data format for grouping:', data);
      return {};
    }
  };

  const groupDataByDept = (data) => {
    if (Array.isArray(data)) {
        return data.reduce((acc, item) => {
            const dept = (item.fromdept1 || item.TODEPT || 'Unknown').toUpperCase();
            const pltcode = item.pltcode || item.PLTCODE1 || 'Unknown';

            if (!acc[dept]) {
                acc[dept] = { quantity: 0, pltcodes: {} };
            }

            acc[dept].quantity += 1 ;

            if (!acc[dept].pltcodes[pltcode]) {
                acc[dept].pltcodes[pltcode] = 0;
            }
            acc[dept].pltcodes[pltcode] += 1;

            return acc;
        }, {});
    } else {
        console.error('Invalid data format for grouping:', data);
        return {};
    }
};

  

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderFromDepartmentCards = (fromDepartments, data, label) => {
    if (!fromDepartments.length || !Object.keys(data).length) {
      return <p className={`${theme === 'light'?'text-gray-800':'text-red-500'}`}>No data available for the selected department's "from" departments.</p>;
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {Object.entries(data).map(([dept, { quantity, pltcodes }], index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative ${theme === 'light' ? 'text-gray-800 bg-white' : 'text-gray-300 bg-slate-600'}`}
            style={{ minWidth: "150px", minHeight: "100px" }}
          >
            <div className={`p-2 mt-4 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-500'}`}>
              <h3 className="font-bold text-lg">{dept}</h3>
              <p>Total Quantity: <mark className="bg-purple-200 text-black p-1">{quantity}</mark></p>

             
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(pltcodes).map(([pltcode, count]) => (
                  <div key={pltcode} className={`flex items-center justify-between shadow-md p-1 rounded-md border ${theme==='light'?'bg-slate-100 border-slate-300':'bg-slate-700 border-slate-500 '} `}>
                    <span className={` ${theme==='light'?'text-gray-800':'text-slate-300'} font-normal`}>{toTitleCase(pltcode)}</span>
                    <span className={` ${theme==='light'?'text-gray-800':'text-slate-300'}`}>{count}</span>
                  </div>
                ))}
              </div>
            <span
              className={`absolute top-1 right-2 text-xs font-semibold px-2 py-1 rounded-full ${label === 'Production' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  };
  
  
  return (
    <div className={`min-h-screen lg:min-h-screen min-w-screen  w-[110%] md:w-[100%] lg:w-[100%] flex  ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>


{load &&
 <div className="text-center text-lg font-semibold">
 <div className={`border fixed shadow rounded-md p-4 max-w-full min-h-full inset-0 z-50 w-full md:w-[90%] ml-0 md:ml-52 mx-auto ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} sm:ml-0`}>
 <div className="animate-pulse flex space-x-4 mt-16">
   <div className={`rounded-fullh-10 w-10`}></div>
   <div className="flex-1 space-y-6 py-10 md:py-1">
     <div
       className={`h-2 w-[90%] ${
         theme === "dark" ? "bg-slate-700" : "bg-slate-200"
       } rounded`}
     ></div>
     <div className="space-y-5 md:space-y-3">
       <div className="grid grid-cols-3 gap-4">
         <div
           className={`h-2 ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded col-span-2`}
         ></div>
         <div
           className={`h-2 w-[70%] ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded col-span-1`}
         ></div>
       </div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div className="grid grid-cols-3 gap-4">
         <div
           className={`h-2 ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
         <div
           className={`h-2  ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
       </div>

       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div className="grid grid-cols-3 gap-4">
         <div
           className={`h-2  ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
         <div
           className={`h-2 ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
       </div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div className="grid grid-cols-3 gap-4">
         <div
           className={`h-2 ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
         <div
           className={`h-2  ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
       </div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div
         className={`h-2 w-[90%] ${
           theme === "dark" ? "bg-slate-700" : "bg-slate-200"
         } rounded`}
       ></div>
       <div className="grid grid-cols-3 gap-4">
         <div
           className={`h-2 ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
         <div
           className={`h-2  ${
             theme === "dark" ? "bg-slate-700" : "bg-slate-200"
           } rounded`}
         ></div>
       </div>
     </div>
   </div>
 </div>    
        {/*  loading skeleton end*/}
 </div>
</div>
}
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <h2 className={`font-bold text-xl mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-400'}`}>
            Related Departments for {deptId.toUpperCase()}
          </h2>
          {type === 'production' && (
  <div className="mb-8">
    {renderFromDepartmentCards(
      departmentMappings[selectedDept]?.from || [],
      dataView,
      'Production'
    )}
  </div>
)}

{type === 'pending' && (
  <div className="mb-8">
    {renderFromDepartmentCards(
      departmentMappings[selectedDept]?.to || [],
      dataView,
      'Pending'
    )}
  </div>
)}

        </main>
      </div>
    </div>
  );
}

export default DepartmentDetail;
