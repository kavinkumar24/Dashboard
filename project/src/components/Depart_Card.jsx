import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

function DepartmentDetail() {
  const { deptId, type } = useParams();
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [selectedDept, setSelectedDept] = useState(deptId || '');
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [dataView, setDataView] = useState([]);


  useEffect(() => {
    localStorage.setItem('theme', theme);
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
  if (selectedDept && departmentMappings[selectedDept]) {
    const fromDepartments = departmentMappings[selectedDept].from || [];
    const dataToRender = type === 'production' ? productionData : pendingData;

    if (Array.isArray(dataToRender)) {
      let filteredData;

      if (type === 'production') {
        filteredData = dataToRender.filter(item => 
          item.fromdept1 && fromDepartments.includes(item.fromdept1.toUpperCase()) &&
          (search.toLowerCase() === '' || item.fromdept1.toLowerCase().includes(search.toLowerCase()))
        );
      } else if (type === 'pending') {
        filteredData = dataToRender.filter(item => 
          item.todept && fromDepartments.includes(item.todept.toUpperCase()) &&
          (search.toLowerCase() === '' || item.todept.toLowerCase().includes(search.toLowerCase()))
        );
      }

      const groupedData = groupDataByDept(filteredData);
      console.log(groupedData);
      setDataView(groupedData);
    } else {
      console.error('Data to render is not an array:', dataToRender);
      setDataView({});
    }
  }
}, [selectedDept, departmentMappings, productionData, pendingData, type, search]);


  const fetchDepartmentMappings = async () => {
    try {
      const res = await fetch('http://localhost:8081/departmentMappings');
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
        ? 'http://localhost:8081/raw_filtered_production_data' 
        : 'http://localhost:8081/raw_filtered_pending_data';
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

  const groupDataByDept = (data) => {
    if (Array.isArray(data)) {
      return data.reduce((acc, item) => {
        const dept = (item.fromdept1 || item.todept || 'Unknown').toUpperCase();
        const pltcode = item.pltcode ||item.pltcoded1|| 'Unknown';
  
        if (!acc[dept]) {
          acc[dept] = { quantity: 0, pltcodes: {} };
        }
  
        acc[dept].quantity += Number(item.pdscwqty1 || item.jcpdscwqty1) || 0;
  
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
      return <p>No data available for the selected department's "from" departments.</p>;
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
    <div className={`min-h-screen flex w-full ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
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
      departmentMappings[selectedDept]?.from || [],
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