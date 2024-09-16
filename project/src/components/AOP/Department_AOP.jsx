import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import axios from 'axios';

const DEFAULT_DEPARTMENTS = ['CAD', 'CAM', 'MFD', 'PD-TEXTURING', 'PHOTO'];

function Department_AOP() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [departments, setDepartments] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [pendingSumData, setPendingSumData] = useState([]);
  const [rawFilteredData, setRawFilteredData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [showTargetPopup, setShowTargetPopup] = useState(false);
  const [targets, setTargets] = useState({});
  const [tableData, setTableData] = useState([]);
  const [popupCurrentPage, setPopupCurrentPage] = useState(1);
  const itemsPerPage = 5; 

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

    fetch('http://localhost:8081/pending-sum')
      .then(response => response.json())
      .then(data => {
        console.log('Pending Sum Data:', data);
        setPendingSumData(data);
      })
      .catch(error => console.error('Error fetching pending sum data:', error));

    fetch('http://localhost:8081/raw_filtered_production_data')
      .then(response => response.json())
      .then(data => {
        console.log('Raw Filtered Production Data:', data);
        setRawFilteredData(data);
      })
      .catch(error => console.error('Error fetching raw filtered production data:', error));

    fetch('http://localhost:8081/department-mappings')
      .then(response => response.json())
      .then(data => {
        console.log('Department Mappings Response:', data);
        setDepartmentMappings(data);
      })
      .catch(error => console.error('Error fetching department mappings:', error));

    fetch('http://localhost:8081/targets')
      .then(response => response.json())
      .then(data => {
        console.log('Targets Data:', data);
        const targetsMap = data.reduce((acc, item) => {
          acc[item.project.toUpperCase()] = item.target;
          return acc;
        }, {});
        setTargets(targetsMap);
      })
      .catch(error => console.error('Error fetching targets:', error));
  }, []);

  const handleCardClick = (deptName) => {
    const normalizedData = pendingData.map(item => ({
      ...item,
      PLTCODE1: item.PLTCODE1?.toUpperCase() || '',
      Wip: pendingSumData.find(p => p.PLTCODE1 === item.PLTCODE1)?.total_quantity || 0
    }));
  
    const deptMapping = departmentMappings[deptName];
    if (deptMapping && deptMapping.to) {
      const week1Counts = rawFilteredData.reduce((acc, item) => {
        const pltcode = item.PLTCODE1?.toUpperCase() || '';
        const deptFrom = item["From Dept"]?.toUpperCase() || '';
        const deptTo = item["To Dept"]?.toUpperCase() || '';
  
        if (deptMapping.from.includes(deptFrom) && deptMapping.to.includes(deptTo)) {
          if (!acc[pltcode]) {
            acc[pltcode] = { count: 0 };
          }
          acc[pltcode].count += 1;
        }
        return acc;
      }, {});
  
      const filteredPendingData = normalizedData.filter(item =>
        deptMapping.to.map(dept => dept.toUpperCase())
          .includes(item.TODEPT?.toUpperCase() || '')
      );
  
      const pltcodeCounts = filteredPendingData.reduce((acc, item) => {
        if (!acc[item.PLTCODE1]) {
          acc[item.PLTCODE1] = { count: 0, totalJCPDSCWQTY1: 0, totalWIP: 0 };
        }
        acc[item.PLTCODE1].count += 1;
        acc[item.PLTCODE1].totalJCPDSCWQTY1 += item.JCPDSCWQTY1 || 0
        acc[item.PLTCODE1].totalWIP = item.Wip;
        return acc;
      }, {});
  
      const uniqueData = Object.keys(pltcodeCounts).map(pltcode => {
        const totalJCPDSCWQTY1 = pltcodeCounts[pltcode].totalJCPDSCWQTY1;
        const target = targets[pltcode] || '';
        const achieved = totalJCPDSCWQTY1;
        const pending = target - achieved; 
        const percentageAchieved = target > 0 ? ((achieved / target) * 100).toFixed(2) : '0'; 
  
        return {
          PLTCODE1: pltcode,
          Count: pltcodeCounts[pltcode].count,
          TotalJCPDSCWQTY1: totalJCPDSCWQTY1,
          Target: target,
          PercentageAchieved: percentageAchieved,
          Wip: pltcodeCounts[pltcode].totalWIP, 
          AOP: target,
          Week1: week1Counts[pltcode]?.count || 0,
        };
      });
  
      
      setTableData(uniqueData);
      setSelectedDeptName(deptName);
    } else {
      console.error('Department mapping not found for:', deptName);
      setTableData([]);
      setSelectedDeptName('');
    }
  };
  

  const handleTargetClick = () => {
    setShowTargetPopup(true);
    setPopupCurrentPage(1);
  };

  const handleEditChange = (pltcode, value) => {
    setTargets(prevTargets => ({
      ...prevTargets,
      [pltcode]: value,
    }));
  };

  const handleSave = () => {
    const dataToSave = Object.keys(targets).map(pltcode => ({
      project: pltcode,
      target: targets[pltcode],
    }));

    fetch('http://localhost:8081/save-targets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targets: dataToSave }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Data saved successfully:', data);
        setShowTargetPopup(false);

        setTableData(prevTableData =>
          prevTableData.map(row => ({
            ...row,
            Target: targets[row.PLTCODE1] || '',
          }))
        );
      })
      .catch(error => console.error('Error saving data:', error));
  };

  const popupStartIndex = (popupCurrentPage - 1) * itemsPerPage;
  const popupEndIndex = popupStartIndex + itemsPerPage;
  const paginatedTargets = Object.keys(targets).slice(popupStartIndex, popupEndIndex);

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <Sidebar theme={theme} className="w-1/6 h-screen p-0" />

      <div className="flex-1 flex flex-col p-0">
        <Header theme={theme} dark={setTheme} className="p-0 m-0" />

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

          {/* Target Button */}
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleTargetClick}
          >
            Set Target
          </button>

          {/* Display Table */}
          {selectedDeptName && (
            <>
              <h2 className="text-xl font-bold mb-4">Department: {selectedDeptName}</h2>
              <table className="min-w-full mb-4 border border-gray-300 table-auto text-center">
                <thead className={`${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'} text-white`}>
                  <tr>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Project wise</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Target</th>
                    <th colSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>AOP Achieved</th>
                    <th colSpan="1" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Assignment AOP</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>{selectedDeptName}</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Percentage</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Week1</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Week2</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Week3</th>
                    <th rowSpan="2" className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Week4</th>
                  </tr>
                  <tr>
                    <th className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Achieved</th>
                    <th className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>Pending</th>
                    <th className={`px-6 py-3 border-b ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>WIP</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? (theme === 'light' ? 'bg-gray-100' : 'bg-gray-600') : (theme === 'light' ? 'bg-white' : 'bg-gray-800')}`}
                    >
                      <td className="px-6 py-4 border-b">{row.PLTCODE1}</td>
                      <td className="px-6 py-4 border-b">{row.Target}</td>
                      <td className="px-6 py-4 border-b">{row.Achieved}</td>
                      <td className="px-6 py-4 border-b">{row.Pending}</td>
                      <td className="px-6 py-4 border-b">{row.Wip}</td>
                      <td className="px-6 py-4 border-b">{row.TotalJCPDSCWQTY1}</td>
                      <td className="px-6 py-4 border-b">nil</td>
                      <td className="px-6 py-4 border-b">{row.Week1}</td>
                      <td className="px-6 py-4 border-b">-</td>
                      <td className="px-6 py-4 border-b">-</td>
                      <td className="px-6 py-4 border-b">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Target Popup */}
          {showTargetPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-lg">
                <h3 className="text-xl font-semibold mb-4">Edit Targets</h3>
                <div>
                  {paginatedTargets.map((pltcode, index) => (
                    <div key={index} className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        {pltcode}
                        <input
                          type="text"
                          value={targets[pltcode] || ''}
                          onChange={(e) => handleEditChange(pltcode, e.target.value)}
                          className="ml-2 p-2 border border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <div>
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                      disabled={popupCurrentPage === 1}
                      onClick={() => setPopupCurrentPage(popupCurrentPage - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-md"
                      disabled={popupCurrentPage * itemsPerPage >= Object.keys(targets).length}
                      onClick={() => setPopupCurrentPage(popupCurrentPage + 1)}
                    >
                      Next
                    </button>
                    <button onClick={() => setShowTargetPopup(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Department_AOP;
