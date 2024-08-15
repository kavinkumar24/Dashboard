import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

function DepartmentDetail() {
  const { deptId } = useParams();
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [search, setSearch] = useState('');
  const [viewData, setViewData] = useState(false); 

  useEffect(() => {
    fetch("http://localhost:8081/production_data")
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(item => item.fromdept1.includes(deptId));
        const filtersearch = filteredData.filter(dept => {
          return search.toLowerCase() === '' ? dept : dept.fromdept1.toLowerCase().includes(search.toLowerCase());
        });
        setProductionData(filtersearch);
      })
      .catch(err => console.log("Error fetching production data:", err));
  }, [deptId, search]);

  useEffect(() => {
    fetch("http://localhost:8081/pending_data")
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(item => item.todept.includes(deptId));
        const filtersearch = filteredData.filter(dept => {
          return search.toLowerCase() === '' ? dept : dept.todept.toLowerCase().includes(search.toLowerCase());
        });
        console.log(filtersearch)
        setPendingData(filtersearch);
      })
      .catch(err => console.log("Error fetching pending data:", err));
  }, [deptId, search]);

const renderTable = (data, label) => (
  <div className="bg-white p-2 rounded-lg shadow-md flex flex-col justify-between m-0 mb-6">
    <h3 className="font-bold text-lg mb-2">{label}</h3>
    <table className="w-full text-sm text-left text-gray-700">
      <thead className="text-base text-gray-700 uppercase bg-gray-100">
        <tr>
          <th scope="col" className="px-2 py-3">
            Department
          </th>
          <th scope="col" className="px-2 py-3">
            Quantity
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="bg-white border-b text-gray-700">
            <td className="px-6 py-3">{item.fromdept1 || item.todept}</td>
            <td className="px-6 py-3">
              {item.pdscwqty1 || item.jcpdscwqty1 ? Number(item.pdscwqty1 || item.jcpdscwqty1).toFixed(0) : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderCards = (data, label) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {data.map((item, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative"
        style={{ minWidth: "150px", minHeight: "100px" }}
      >
        <h3 className="font-bold text-lg text-gray-700">
          {item.fromdept1 || item.todept}
        </h3>
        <p className="text-gray-600">
          Quantity: {item.pdscwqty1 || item.jcpdscwqty1 ? Number(item.pdscwqty1 || item.jcpdscwqty1).toFixed(0) : 'N/A'}
        </p>
        <span
          className={`absolute bottom-2 right-2 text-xs font-semibold px-2 py-1 rounded-full ${
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
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
          <Header onSearch={setSearch} onView={setViewData} view={viewData} />
          <h2 className="font-bold text-xl mb-4">Related Departments for {deptId}</h2>

          {/* Production Data Section */}
          <div className="mb-8">
            {viewData ? renderTable(productionData, 'Production Data') : renderCards(productionData, 'Production')}
          </div>

          {/* Separator */}
          <hr className="my-8 border-gray-300" />

          {/* Pending Data Section */}
          <div className="mb-8">
            {viewData ? renderTable(pendingData, 'Pending Data') : renderCards(pendingData, 'Pending')}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DepartmentDetail;
