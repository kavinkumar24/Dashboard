import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
function DepartmentDetail() {
  const { deptId } = useParams();
  const [relatedDepartments, setRelatedDepartments] = useState([]);
  const[search,setSearch] = useState('');
  const[inHome,setInHome] = useState(false);

  
  useEffect(() => {
    fetch("http://localhost:8081/production_data")
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(item => item.fromdept1.includes(deptId));
        const filtersearch = filteredData.filter(dept => {
          return search.toLowerCase() === '' ? dept : dept.fromdept1.toLowerCase().includes(search.toLowerCase());
        });
        setRelatedDepartments(filtersearch);
      })
      .catch(err => console.log("Error fetching related departments:", err));
  }, [deptId,search]);

  return (
    <div className='min-h-screen flex bg-gray-100 w-[100%]'>
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto">
        <Header onSearch = {setSearch}/>

        <h2 className="font-bold text-xl mb-4">Related Departments for {deptId}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {relatedDepartments.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md border-t-4 border-indigo-300"
            style={{ minWidth: "150px", minHeight: "100px" }}
          >
            <h3 className="font-bold text-lg text-gray-700">{item.fromdept1}</h3>
            <p className="text-gray-600">Quantity: {item.pdscwqty1}</p>
          </div>
        ))}
      </div>

        </main>
      </div>
     
    </div>
  );
}

export default DepartmentDetail;
