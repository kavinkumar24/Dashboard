import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const Top15Graph = () => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState([]); // For grouped data (sum by project/department)
  const [showTop15, setShowTop15] = useState(false);  // Toggle between original and top 15 data

  // Fetch data from API
  useEffect(() => {
    axios.get('http://localhost:8081/order_receive&new_design')
      .then((response) => {
        const fetchedData = response.data;
        setData(fetchedData);  // Store the full data
        groupByProject(fetchedData);  // Group the data by project/department
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Group data by project and sum top 15 weights
  const groupByProject = (data) => {
    const grouped = data.reduce((acc, item) => {
      const project = item.PROJECT;
      if (!acc[project]) {
        acc[project] = [];
      }
      acc[project].push(item.WT);  // Collect weights for each project
      return acc;
    }, {});

    const finalData = Object.keys(grouped).map(project => {
      const weights = grouped[project];
      const top15Weights = [...weights].sort((a, b) => b - a).slice(0, 15); // Top 15 weights
      const top15Sum = top15Weights.reduce((sum, weight) => sum + weight, 0); // Sum of top 15 weights
      return {
        PROJECT: project,
        WT: top15Sum
      };
    });

    setGroupedData(finalData);
  };

  // Prepare data for the chart
  const chartData = {
    labels: groupedData.map(item => item.PROJECT), // Use project names as labels
    datasets: [
      {
        label: 'Top 15 Weight (WT)',
        data: groupedData.map(item => item.WT), // Weight values for each project
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>All Projects with Top 15 Projects Summed</h2>
      <button
        onClick={() => setShowTop15(!showTop15)}  // Toggle between original and top 15 data
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {showTop15 ? "Show All Data" : "Show Top 15"}
      </button>

      <Bar
        data={chartData}
        options={{
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  );
};

export default Top15Graph;
