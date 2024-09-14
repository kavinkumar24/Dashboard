import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Header from './Header';
import Sidebar from './Sidebar';

Chart.register(ChartDataLabels);

const ZoneDetail = () => {
  const { zone } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/order_receive&new_design`);
        const jsonData = await response.json();
        const filteredData = jsonData.filter(item => item.ZONE === zone);
        setData(filteredData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [zone]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!data) return <p>Loading...</p>;

  const aggregateData = (data) => {
    const purityAcc = {};
    const projectAcc = {};
    const productAcc = {};
    const colorAcc = {};

    data.forEach(item => {
      const weight = item.WT;

      purityAcc[item.Purity] = (purityAcc[item.Purity] || 0) + weight;
      projectAcc[item.PROJECT] = (projectAcc[item.PROJECT] || 0) + weight;
      productAcc[item.PRODUCT] = (productAcc[item.PRODUCT] || 0) + weight;
      colorAcc[item.Color] = (colorAcc[item.Color] || 0) + weight;
    });

    const formatData = (data) => {
      const formattedData = {};
      for (const [key, value] of Object.entries(data)) {
        formattedData[key] = (value / 1000).toFixed(1); 
      }
      return formattedData;
    };

    return {
      purityAcc: formatData(purityAcc),
      projectAcc: formatData(projectAcc),
      productAcc: formatData(productAcc),
      colorAcc: formatData(colorAcc),
    };
  };

  const { purityAcc, projectAcc, productAcc, colorAcc } = aggregateData(data);

  const labelColor = theme === 'light' ? '#000' : '#fff';

  const chartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: labelColor, 
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value) => `${value}k`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: labelColor, 
        },
      },
      x: {
        ticks: {
          color: labelColor,
        },
      },
    },
  };

  const purityChartData = {
    labels: Object.keys(purityAcc),
    datasets: [{
      label: 'Purity Distribution',
      data: Object.values(purityAcc),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const projectChartData = {
    labels: Object.keys(projectAcc),
    datasets: [{
      label: 'Project Distribution',
      data: Object.values(projectAcc),
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }],
  };

  const productChartData = {
    labels: Object.keys(productAcc),
    
    datasets: [{
      label: 'Product Distribution',
      data: Object.values(productAcc),
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }],
  };

  const colorChartData = {
    labels: Object.keys(colorAcc),
    datasets: [{
      label: 'Color Distribution',
      data: Object.values(colorAcc),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40'],
      borderColor: '#fff',
      borderWidth: 1,
    }],
  };

  const horizontalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'right',
        color: labelColor,
        font: {
          weight: 'normal',
          size: 14,
        },
        formatter: (value) => `${value}k`, 
      },
    },
    scales: {

      y: {
        
        beginAtZero: true,
        title: {
          display: true,
          text: "KG Count",
          color: theme === "light" ? "black" : "#94a3b8",
        },
        grid: {
          display: true,
          color: theme === "light" ? "#e5e7eb" : "#374151",
        },
        ticks: {
          color: labelColor,
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
      },
      x: {
        title: {
          display: true,
          text: "Product",
          color: theme === "light" ? "black" : "#94a3b8",
        },
        grid: {
          display: true,
          color: theme === "light" ? "#e5e7eb" : "#374151",
        },
        ticks: {
          color: labelColor,
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
      },
    },
  };
  

  return (
    <div
  className={`min-h-screen flex ${
    theme === "light"
      ? "bg-gray-100 text-gray-900"
      : "bg-gray-800 text-gray-100"
  }`}
>
  {/* Sidebar */}
  <Sidebar theme={theme} className="w-1/6 h-screen p-0" /> {/* Ensure no padding or margin */}
  
  {/* Main content area */}
  <div className="flex-1 flex flex-col p-0">
    {/* Header */}
    <Header onSearch={setSearch} theme={theme} dark={setTheme} className="p-0 m-0" /> {/* Remove margins/padding */}

    {/* Main Content */}
    <main className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
  <h1 className="col-span-2">Details for Zone: {zone}</h1>

  {/* Purity Chart */}
  <div
    className={`order-1 col-span-1 ${
      theme === "light" ? "bg-white" : "bg-slate-900"
    } p-4 rounded shadow-md overflow-x-auto h-[450px]`}
  >
    <Bar data={purityChartData} options={chartOptions} />
  </div>

  {/* Color Chart */}
  <div
    className={`order-2 col-span-1 ${
      theme === "light" ? "bg-white" : "bg-slate-900"
    } p-4 rounded shadow-md overflow-x-auto h-[450px]`}
  >
    <Doughnut data={colorChartData} options={chartOptions} />
  </div>

  {/* Project Chart (Horizontal Bar) */}
  <div
    className={`order-3 col-span-1 ${
      theme === "light" ? "bg-white" : "bg-slate-900"
    } p-4 rounded shadow-md overflow-x-auto h-[500px]`}
  >
    <Bar data={projectChartData} options={horizontalChartOptions} />
  </div>

  {/* Product Chart (Horizontal Bar) */}
  <div
    className={`order-4 col-span-1 ${
      theme === "light" ? "bg-white" : "bg-slate-900"
    } p-4 rounded shadow-md overflow-x-auto h-[500px]`}
  >
    <Bar data={productChartData} options={horizontalChartOptions} />
  </div>
</main>

  </div>
</div>

  );
};

export default ZoneDetail;
