import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Header from '../Header';
import Sidebar from '../Sidebar';

Chart.register(ChartDataLabels);

const PurityDetail = () => {
  const { product } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [showTop15, setShowTop15] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const[originalData, setOriginalData] = useState(null);

  const colorMapping = {
    Y: "rgba(255, 223, 0, 0.6)",
    P: "rgba(255, 105, 180, 0.6)",
    "Y/P": "rgba(255, 165, 79, 0.6)",
    W: "rgba(245, 245, 245, 0.8)",
    R: "rgba(255, 69, 58, 0.9)",
    "W/P": "rgba(255, 182, 193, 0.6)",
    "W/P/Y": "rgba(255, 222, 179, 0.6)",
    "Y/P/W": "rgba(255, 228, 196, 0.6)",
    "W/Y": "rgba(255, 250, 205, 0.7)",
    "Y/Base metal": "rgba(169, 169, 169, 0.6)",
    Unknown: "rgba(211, 211, 211, 0.6)",
  };

  const handleTop15Click = () => {
    if (!isSelected) {
      if (originalData) {
        const categoryFilteredData = originalData.filter(item => item.PRODUCT === product);
        const sortedData = [...categoryFilteredData].sort((a, b) => b.WT - a.WT);
        const top15 = sortedData.slice(0, 15);
        
        setData(top15);
        setShowTop15(true);
      }
    } else {
      setData(originalData);
      setShowTop15(false);
    }
    
    setIsSelected(!isSelected);
  };
  



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8081/order_receive&new_design`);
        const jsonData = await response.json();
        const filteredData = jsonData.filter(item => item.PRODUCT === product);
        setData(filteredData);
        setOriginalData(filteredData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [product]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  if (!data){
    return (
      <div
        className={`${
          theme === "light" ? "bg-slate-300" : "bg-slate-800"
        } min-h-screen flex items-center justify-center`}
      >
       
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
            <div className="flex gap-2 ml-9">
              <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
            </div>
          </div>
        
      </div>
    );
  };

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
    
    const formatAndSortData = (data) => {
     
      return Object.entries(data)
        .sort((a, b) => b[1] - a[1]) 
        .reduce((acc, [key, value]) => {
          acc[key] = (value / 1000).toFixed(1);
          return acc;
        }, {});
    };


    return {
      purityAcc: formatAndSortData(purityAcc),
      projectAcc: formatAndSortData(projectAcc),
      productAcc: formatAndSortData(productAcc),
      colorAcc: formatAndSortData(colorAcc),
    };
  };

  const { purityAcc, projectAcc, productAcc, colorAcc } = aggregateData(data);

  const labelColor = theme === 'light' ? '#000' : '#fff';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        anchor: 'top',
        align: 'top',
        color: labelColor, 
        font: {
          weight: 'normal',
          size: 14,
        },
        formatter: (value) => `${value}`,
      },
      legend:{
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      }
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

  const colorChartData_values = {
    labels: Object.keys(colorAcc),
    datasets: [{
      label: 'Color Distribution',
      data: Object.values(colorAcc),
      backgroundColor: Object.keys(colorAcc).map(key => colorMapping[key] || colorMapping.Unknown),
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
        align: 'end',
        color: labelColor,
        font: {
          weight: 'normal',
          size: 14,
        },
        formatter: (value) => `${value}`,
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
          padding: 20, 
          autoSkip: false, 
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
          padding: 20, // Increase padding for better spacing
          autoSkip: false, // Prevent skipping of labels
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
      },
    },
    layout: {
      padding: {
        left: 30, // Adjust padding as needed for better spacing
        right: 30,
        top: 20,
        bottom: 20,
      },
    },
  };
  
  
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      legend:{
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      },
      title: {
        display: true,
        text: 'Color Distribution',
        color: theme === "light" ? "black" : "white",
        font: {
          size: 12,
        },
        padding: {
          bottom: 20,
        },
      },
    },
    layout: {
      padding: 0,
    },
    cutout: '50%',
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
      <Sidebar theme={theme} className="w-1/6 h-screen p-0" />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col p-0">
        {/* Header */}
        <Header onSearch={setSearch} theme={theme} dark={setTheme} className="p-0 m-0" />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
            
<button
  className={`p-2 rounded w-52 ${
    isSelected
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : theme === "light"
      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
      : "bg-slate-700 text-white hover:bg-slate-600"
  }`}
  onClick={handleTop15Click}
>
  {isSelected ? (
    <span className="flex items-center justify-between">
      Remove filter
      <span className="ml-2 border border-white rounded-full flex items-center justify-center w-5 h-5">
        <p className="text-sm -mt-1">x</p>
      </span>
    </span>
  ) : (
    "Top 15 in " + product
  )}
</button>

  <h1 className="col-span-2">Details for Product: {product}</h1>

  {/* Purity Chart */}
  <div
    className={`order-1 col-span-2 lg:col-span-1 ${
      theme === "light" ? "bg-white" : "bg-gray-900"
    } p-4 rounded shadow-lg max-h-[700px] overflow-auto`}
  >
    <Bar data={purityChartData} options={chartOptions} />
  </div>

  {/* Project Chart */}
  <div
        className={`order-3 col-span-1 ${
          theme === "light" ? "bg-white " : "bg-slate-900"
        } p-4 rounded shadow-md overflow-auto h-[700px] custom-scrollbar`}
>
  <Bar data={projectChartData} options={horizontalChartOptions} />
</div>


  {/* Product Chart */}
  <div
    className={`order-3 col-span-2 lg:col-span-1 ${
      theme === "light" ? "bg-white" : "bg-gray-900"
    } p-4 rounded shadow-lg max-h-[600px] overflow-auto`}
  >
    <Bar data={productChartData} options={horizontalChartOptions} />
  </div>

  {/* Color Chart */}
 {/* Color Chart */}
<div
  className={`order-4 col-span-2 lg:col-span-1 flex justify-center items-center h-[600px] ${
    theme === "light" ? "bg-white" : "bg-gray-900"
  } p-4 rounded shadow-lg`}
>
  <div className="w-[400px] h-[400px] flex justify-center items-center">
    <Doughnut data={colorChartData_values} options={doughnutChartOptions} />
  </div>
</div>

</main>

      </div>
    </div>
  );
};

export default PurityDetail;
