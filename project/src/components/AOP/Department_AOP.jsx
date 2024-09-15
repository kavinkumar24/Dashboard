import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';

const DEFAULT_DEPARTMENTS = ['CAD', 'CAM', 'MFD', 'PD-TEXTURING', 'PHOTO'];

function Department_AOP() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [departments, setDepartments] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [selectedDept, setSelectedDept] = useState([]);
  const [selectedDeptName, setSelectedDeptName] = useState('');

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const defaultDepartments = DEFAULT_DEPARTMENTS.map(dept => ({ name: dept }));
    setDepartments(defaultDepartments);

    fetch('http://localhost:8081/pending_data')
      .then(response => response.json())
      .then(data => {
        console.log('Pending Data Response:', data);
        setPendingData(data);
      })
      .catch(error => console.error('Error fetching pending data:', error));
  }, []);

  const handleCardClick = (deptName) => {
    fetch('http://localhost:8081/department-mappings')
      .then(response => response.json())
      .then(data => {
        console.log('Department Mappings Response:', data);

        const deptMapping = data[deptName];
        console.log(deptMapping)
        if (deptMapping && deptMapping.to) {
            const filteredPendingData = pendingData.filter(item => 
              deptMapping.to.map(dept => dept.toUpperCase()) 
                .includes(item.TODEPT.toUpperCase()) 
            );

          const normalizedData = filteredPendingData.map(item => ({
              ...item,
              PLTCODE1: item.PLTCODE1.toLowerCase() 
            }));
            console.log("norm",normalizedData)

          const pltcodeCounts = normalizedData.reduce((acc, item) => {
            if (!acc[item.PLTCODE1]) {
              acc[item.PLTCODE1] = { count: 0, totalJCPDSCWQTY1: 0 };
            }
            acc[item.PLTCODE1].count += 1;
            acc[item.PLTCODE1].totalJCPDSCWQTY1 += item.JCPDSCWQTY1 || 0;
            return acc;
          }, {});
          console.log('PLTCODE Counts:', pltcodeCounts);

          const uniqueData = Object.keys(pltcodeCounts).map(pltcode => ({
            PLTCODE1: pltcode,
            Count: pltcodeCounts[pltcode].count,
            TotalJCPDSCWQTY1: pltcodeCounts[pltcode].totalJCPDSCWQTY1
          }));

          const total = uniqueData.reduce((sum, item) => sum + item.TotalJCPDSCWQTY1, 0);
          console.log('Calculated Total:', total);

          setSelectedDept(uniqueData);
          setSelectedDeptName(deptName); 
        } else {
          console.error('Department mapping not found for:', deptName);
          setSelectedDept([]);
          setSelectedDeptName(''); 
        }
      })
      .catch(error => console.error('Error fetching department mappings:', error));
  };

  return (
    <div
      className={`min-h-screen flex ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-100'}`}
    >
      {/* Sidebar */}
      <Sidebar theme={theme} className="w-1/6 h-screen p-0" />

      <div className="flex-1 flex flex-col p-0">
        {/* Header */}
        <Header theme={theme} dark={setTheme} className="p-0 m-0" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-5 gap-x-4 gap-y-4 p-6">
            {departments.map((dept, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(dept.name)}
                className={`border p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'} cursor-pointer`}
              >
                <h2 className="text-lg font-semibold">{dept.name}</h2>
              </div>
            ))}
          </div>

          {/* Details of selected department */}
          <div className="mt-6 p-6 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Pending Data for {selectedDeptName} Department</h2>

            <div className="mt-4">
              {selectedDept.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total JCPDSCWQTY1</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedDept.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{item.PLTCODE1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.Count}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{item.TotalJCPDSCWQTY1}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="px-6 py-4 font-bold text-right">Total:</td>
                      <td className="px-6 py-4 font-bold"></td>
                      <td className="px-6 py-4 font-bold">
                        {selectedDept.reduce((sum, item) => sum + item.TotalJCPDSCWQTY1, 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-gray-500">No pending data available for this department</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Department_AOP;
