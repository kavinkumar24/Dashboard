import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
function Dashboard() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [departmentData, setDepartmentData] = useState({});
  const[avg_prod,setAvg_prod] = useState(0);
  const [pendingDepartmentData, setPendingDepartmentData] = useState({});
  const [viewData, setviewData] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate(); 
  const[theme, setTheme] = useState(()=>{
    return localStorage.getItem('theme') || 'light';
  });
  useEffect(() => {
    fetch("http://localhost:8081/production_data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Production Data:", data);
        if (Array.isArray(data)) {
          setProductionData(data);
  
          const departmentsList = [
            'CAD', 'CAM', 'MFD', 'MP', 'DIE', 'WAX', 'CASTING', 'SEPERATION', 
            'ASSY', 'BP', 'CORR', 'SETTING', 'BUFFING', 'TEXTURING', 
            'QC', 'FI BOM', 'PHOTO'
          ];
  
          const groupedData = departmentsList.reduce((acc, dept) => {
            acc[dept] = 0;
            return acc;
          }, {});
  
          const departmentsRegex = /(?:CAD|CAM|MFD|MP|DIE|WAX|CASTING|SEP(?:ERATION|)|ASSY|BP|COR(?:R|)|SETTING|BUFFING|TEXTURING|QC|FI\s?BOM|PHOTO)/i;
  
          data.forEach(curr => {
            const deptMatch = curr.fromdept1.match(departmentsRegex);
            if (deptMatch) {
              const dept = deptMatch[0].toUpperCase();
              groupedData[dept] += curr.pdscwqty1;
            }
          });
  
          setDepartmentData(groupedData);
        }
      })
      .catch((err) => console.log("Error fetching production data:", err));
  }, []);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetch("http://localhost:8081/pending_data")
      .then((res) => res.json())
      .then((data) => {
        console.log("Pending Data:", data);
  
        if (Array.isArray(data) && data.length > 0) {
          const departmentsList = [
            'CAD', 'CAM', 'MFD', 'MP', 'DIE', 'WAX', 'CASTING', 'SEPERATION', 
            'ASSY', 'BP', 'CORR', 'SETTING', 'BUFFING', 'TEXTURING', 
            'QC', 'FI BOM', 'PHOTO'
          ];
  
          const groupedPendingData = departmentsList.reduce((acc, dept) => {
            acc[dept] = 0;
            return acc;
          }, {});
  
          const departmentsRegex = /(?:CAD|CAM|MFD|MP|DIE|WAX|CASTING|SEP(?:ERATION|)|ASSY|BP|COR(?:R|)|SETTING|BUFFING|TEXTURING|QC|FI\s?BOM|PHOTO)/i;
  
          data.forEach(curr => {
            const deptMatch = curr.todept && curr.todept.match(departmentsRegex);
            if (deptMatch) {
              const dept = deptMatch[0].toUpperCase();
              const quantity = parseFloat(curr.jcpdscwqty1) || 0;
  
              groupedPendingData[dept] += quantity;
            }
          });
  
          setPendingDepartmentData(groupedPendingData);
          console.log("Grouped Pending Data:", groupedPendingData);
        } else {
          console.log("Pending Data is not in expected format or is empty:", data);
        }
      })
      .catch((err) => console.log("Error fetching pending data:", err));
  }, []);
  
  const renderTable = (productionData, pendingData) => {
    return (
      <div className={`p-2 rounded-lg shadow-md flex flex-col justify-between m-0 
        ${theme === 'light' ? 'bg-white text-gray-700' : 'bg-gray-800 text-gray-300'}`}
      >
        <table className={`w-full text-sm text-left 
          ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}
        `}>
          <thead className={`text-base uppercase 
            ${theme === 'light' ? 'bg-gray-100 text-gray-700' : 'bg-gray-700 text-gray-300'}
          `}>
            <tr>
              <th scope="col" className="px-2 py-3">
                Warehouse
              </th>
              <th scope="col" className="px-2 py-3">
                Production Qty
              </th>
              <th scope="col" className="px-2 py-3">
                Pending Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(productionData).filter((dept) => {
              return search.toLowerCase() === '' ? dept : dept.toLowerCase().includes(search.toLowerCase());
            }).map((dept) => (
              <tr
                key={dept}
                className={`border-b 
                  ${theme === 'light' ? 'bg-white text-gray-700' : 'bg-gray-800 text-gray-300'}
                `}
              >
                <td className="px-6 py-3">{dept}</td>
                <td className="px-6 py-3">{productionData[dept]}</td>
                <td className="px-6 py-3">{pendingData[dept] || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    );
  };
  
  const renderCards = (productionData, pendingData) => {
    const allowedDepartments = [
      'CAD', 'CAM', 'MFD', 'MP', 'DIE', 'WAX', 'CASTING', 'SEPERATION',
      'ASSY', 'BP', 'CORR', 'SETTING', 'BUFFING', 'TEXTURING', 'QC', 'FI BOM', 'PHOTO'
    ];
    
  
    const regex = new RegExp(`(${allowedDepartments.join('|')})$`, 'i');

  return Object.keys(productionData).filter((dept) => {
    return regex.test(dept) && (search.toLowerCase() === '' ? dept : dept.toLowerCase().includes(search.toLowerCase()));
  }).map((dept) => {
    const productionQty = productionData[dept];
    let avgproduction = 0;
    
    const pendingQty = pendingData[dept] || 0;
    avgproduction=(((productionQty+pendingQty)/productionQty)*1).toFixed(2);
    const efficiency = ((productionQty / (productionQty + pendingQty)) * 100).toFixed(2);

  return(
  // <Link to={`/department/${dept}`} key={dept}>
  <>
    <div
      className={`p-4 rounded-lg shadow-md flex flex-col justify-between ${theme==='light'? 'bg-white':'bg-slate-600'}`} 
      

      style={{ minWidth: "150px", minHeight: "180px" }}
    >
      <h2 className={`font-bold text-lg text-gray-700 uppercase dark:text-gray-700 text-center rounded-md shadow-md ${theme==='light'?'bg-gray-200':
      'bg-slate-900 dark:text-gray-500'
      } `}>
        {dept}
      </h2>
      
      <div className="flex mt-3 space-x-2 justify-between">
  <Link to={`/department/${dept}/production`}>
    <div className={`rounded-lg shadow-md border w-[100%] mr-1
      ${theme === 'light'
        ? 'bg-[#c1fbce92] border-[#00ff379e]'
        : 'bg-gray-800 border-[#00ff379e] text-green-300'}
      `}>
      <p className="font-normal text-sm text-center p-2">
        Production: <span className="font-bold">{productionData[dept]}</span>
      </p>
    </div>
  </Link>
  <Link to={`/department/${dept}/pending`}>
    <div className={`rounded-lg shadow-md border w-[100%] ml-1
      ${theme === 'light'
        ? 'bg-[#fbf9c19d] border-[#F1EA1C]'
        : 'bg-gray-800 border-yellow-600 text-yellow-300'}
      `}>
      <p className="font-normal text-sm text-center p-2">
        Pending: <span className="font-bold">{pendingData[dept]}</span>
      </p>
    </div>
  </Link>
</div>

<div className="flex justify-between mt-3">
  <div className={`rounded-lg shadow-md border w-[80%] mr-1 h-8
    ${theme === 'light'
      ? 'bg-[#fbc6c191] border-[#ff00009e]'
      : 'bg-gray-800 border-[#ff00009e] text-red-300'}
    `}>
    <p className="font-normal text-sm text-center p-1">
      Target: <span className="font-bold">100</span>
    </p>
  </div>
  <div className={`rounded-lg shadow-md border w-[80%] ml-1 h-8
    ${theme === 'light'
      ? 'bg-cyan-50 border-cyan-500'
      : 'bg-gray-800 border-cyan-900 text-cyan-300'}
    `}>
    <p className="font-normal text-sm text-center p-1">
      Avg Prod: <span className="font-bold">{avgproduction}</span>
    </p>
  </div>
</div>

<div className="flex mt-3 justify-center">
  <div className={`rounded-lg shadow-md border w-full
    ${theme === 'light'
      ? 'bg-fuchsia-100 border-fuchsia-500'
      : 'bg-gray-800 border-fuchsia-900 text-fuchsia-300'}
    `}>
    <p className="font-normal text-sm text-center p-2">
      Efficiency: <span className="font-bold">{efficiency}</span>
    </p>
  </div>
</div>

    </div>
  {/* </Link> */}
  </>
)});

  };
  
  return (
    <div className={` w-[100%] min-h-screen flex ${theme==='light'?'bg-gray-100':
    'bg-slate-900'} `}>
      {/* Sidebar */}
     
    <Sidebar theme={theme} />
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
        <Header onSearch = {setSearch} onView = {setviewData} view = {viewData} theme = {theme} dark = {setTheme}/>

          {/* <header className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
            <div>
              <h1 className="text-lg font-bold">
                Production <span className="text-blue-500">Performance</span> Dashboard
              </h1>
              <p className="text-sm text-gray-500">Welcome to Automated Dash View</p>
            </div>
            <div className="flex items-center gap-4 m-0">
              <input
                type="search"
                placeholder="Search"
                className="p-2 border rounded-md"
                onChange={(e) => setSearch(e.target.value)}
              />
              <BsMoon className="text-gray-600 cursor-pointer" size={20} />
              <BsGear className="text-gray-600 cursor-pointer" size={20} />
            </div>
            <div className="transform -translate-x-1/2 z-10 mb-4">
        <button
          onClick={() => setviewData(!viewData)}
          className="p-3 bg-gray-700 rounded-full text-white shadow-lg"
        >
          {viewData ? <ImTable2 size={24} /> : <IoCardOutline size={24} />}
        </button>
        <h1></h1>
      </div>
          </header> */}
{/* 
          <div
            className={`${
              viewData ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            } grid gap-4`}
          >
            {renderCards(departmentData, pendingDepartmentData)}
          </div> */}

          
          {/* Department Cards */}
          <div className={`${viewData ? 'relative overflow-x-auto':'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4'}`}>
  {viewData
    ? renderTable(departmentData, pendingDepartmentData)
    : renderCards(departmentData, pendingDepartmentData)}
</div>

        </main>
      </div>

      {/* View Switcher */}
      
    </div>
  );
}

export default Dashboard;

