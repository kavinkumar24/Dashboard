import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function DepartmentDetail() {
  const { deptId } = useParams();
  const [relatedDepartments, setRelatedDepartments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/production_data")
      .then(res => res.json())
      .then(data => {
        const filteredData = data.filter(item => item.fromdept1.includes(deptId));
        setRelatedDepartments(filteredData);
      })
      .catch(err => console.log("Error fetching related departments:", err));
  }, [deptId]);

  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Related Departments for {deptId}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {relatedDepartments.map((item, index) => (
          <div
            key={index}
            className="bg-blue-100 p-4 rounded-lg shadow-md"
            style={{ minWidth: "150px", minHeight: "100px" }}
          >
            <h3 className="font-bold text-lg text-gray-700">{item.fromdept1}</h3>
            <p className="text-gray-600">Quantity: {item.pdscwqty1}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepartmentDetail;
