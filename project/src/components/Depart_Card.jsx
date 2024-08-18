import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

function DepartmentDetail() {
  const { deptId, type } = useParams();
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [search, setSearch] = useState('');
  const[theme, setTheme] = useState(()=>{
    return localStorage.getItem('theme') || 'light';
  });
  useEffect(() => {
    if (type === 'production' || type === 'pending') {
      fetchData();
    }
  }, [deptId, type, search]);

  const fetchData = async () => {
    if (type === 'production') {
      try {
        const res = await fetch("http://localhost:8081/production_data");
        const data = await res.json();
        const filteredData = data.filter(item => item.fromdept1.includes(deptId));
        const filtersearch = filteredData.filter(dept => 
          search.toLowerCase() === '' ? dept : dept.fromdept1.toLowerCase().includes(search.toLowerCase())
        );
        setProductionData(filtersearch);
      } catch (err) {
        console.log("Error fetching production data:", err);
      }
    } else if (type === 'pending') {
      try {
        const res = await fetch("http://localhost:8081/pending_data");
        const data = await res.json();
        const filteredData = data.filter(item => item.todept.includes(deptId));
        const filtersearch = filteredData.filter(dept => 
          search.toLowerCase() === '' ? dept : dept.todept.toLowerCase().includes(search.toLowerCase())
        );
        setPendingData(filtersearch);
      } catch (err) {
        console.log("Error fetching pending data:", err);
      }
    }
  };

  const groupDataByDept = (data) => {
    return data.reduce((acc, item) => {
      const dept = item.fromdept1 || item.todept;
      if (!acc[dept]) {
        acc[dept] = { quantity: 0, pltcodes: {} };
      }
      acc[dept].quantity += Number(item.pdscwqty1 || item.jcpdscwqty1) || 0;

      const pltcode = item.pltcode || 'Unknown';
      if (!acc[dept].pltcodes[pltcode]) {
        acc[dept].pltcodes[pltcode] = 0;
      }
      acc[dept].pltcodes[pltcode] += 1;

      return acc;
    }, {});
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const renderGroupedCards = (groupedData, label) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {Object.entries(groupedData).map(([dept, { quantity, pltcodes }], index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative"
          style={{ minWidth: "150px", minHeight: "100px" }}
        >
          <div className='bg-slate-100 p-2 mt-4 rounded-lg'>
          <h3 className="font-bold text-lg text-gray-700">{dept}</h3>
          <p className="text-gray-600">Total Quantity: {quantity}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(pltcodes).map(([pltcode, count]) => (
              <div key={pltcode} className="flex items-center justify-between bg-slate-200 shadow-lg 
              shadow-slate-50 p-1 rounded-md border border-slate-300">
                <span className="text-gray-800 font-medium">{toTitleCase(pltcode)}</span>
                <span className="text-gray-600">{count}</span>
              </div>
            ))}
          </div>
          <span
            className={`absolute top-1 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
              label === 'Production' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
  

  return (
    <div className="min-h-screen flex bg-gray-100 w-[100%]">
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          <Header onSearch={setSearch}theme = {theme} dark = {setTheme} />
          <h2 className="font-bold text-xl mb-4">Related Departments for {deptId}</h2>

          {type === 'production' && (
            <div className="mb-8">
              {renderGroupedCards(groupDataByDept(productionData), 'Production')}
            </div>
          )}

          {type === 'pending' && (
            <div className="mb-8">
              {renderGroupedCards(groupDataByDept(pendingData), 'Pending')}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DepartmentDetail;
