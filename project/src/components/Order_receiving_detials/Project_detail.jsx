import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Header from "../Header";
import Sidebar from "../Sidebar";

Chart.register(ChartDataLabels);

const ProjectDetails = () => {
  const { project } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [filteredData, setFilteredData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showTop15, setShowTop15] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);

  const yearParam = urlParams.get("year");
  const monthParam = urlParams.get("month");
  const dateParam = urlParams.get("date");

  const totalweightParam = urlParams.get("totalweight");
  const totalweight = totalweightParam ? parseFloat(totalweightParam) : 0;
  const formattedTotalWeight = !isNaN(totalweight)
    ? totalweight.toFixed(2)
    : "0.00";

  const [purityAcc, setPurityAcc] = useState({});
  const [projectAcc, setProjectAcc] = useState({});
  const [yearAcc, setYearAcc] = useState({});
  const [monthAcc, setMonthAcc] = useState({});
  const [productAcc, setProductAcc] = useState({});
  const [subproductAcc, setSubproductAcc] = useState({});
  const [colorAcc, setColorAcc] = useState({});
  const [groupPartyAcc, setGroupPartyAcc] = useState({});
  const [zoneAcc, setZoneAcc] = useState({});
  const [plainAcc, setPlainAcc] = useState({});

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function extractYear(dateStr) {
    const date = new Date(dateStr);
    return date.getFullYear();
  }

  function extractMonth(dateStr) {
    const date = new Date(dateStr);
    return date.getMonth() + 1;
  }

  function aggregateData(data) {
    if (!data || !Array.isArray(data)) return {};

    const enhancedData = data.map((item) => ({
      ...item,
      Year: item.TRANSDATE ? extractYear(item.TRANSDATE) : null,
      Month: item.TRANSDATE ? extractMonth(item.TRANSDATE) : null,
    }));

    // Aggregate function
    const aggregate = (items, key) => {
      return items.reduce((acc, item) => {
        const value = item[key];
        const weight = item.WT;

        acc[value] = (acc[value] || 0) + weight;
        return acc;
      }, {});
    };

    // Format and sort data
    const formatAndSortData = (data, limit = Infinity) => {
      return Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .reduce((acc, [key, value]) => {
          acc[key] = (value / 1000).toFixed(1);
          return acc;
        }, {});
    };

    // Aggregate data
    const purityAcc = aggregate(enhancedData, "Purity");
    const projectAcc = aggregate(enhancedData, "PROJECT");
    const productAcc = aggregate(enhancedData, "PRODUCT");
    const subproductAcc = aggregate(enhancedData, "SUB PRODUCT");
    const colorAcc = aggregate(enhancedData, "Color");
    const groupPartyAcc = aggregate(enhancedData, "Group party");
    const zoneAcc = aggregate(enhancedData, "ZONE");
    const plainAcc = aggregate(enhancedData, "PL-ST");
    const yearAcc = aggregate(enhancedData, "Year");
    const monthAcc = aggregate(enhancedData, "Month");

    // Format and sort data
    const formattedPurityAcc = formatAndSortData(purityAcc);
    const formattedProjectAcc = formatAndSortData(projectAcc);
    const formattedProductAcc = formatAndSortData(productAcc);
    const formattedColorAcc = formatAndSortData(colorAcc);
    const formattedZoneAcc = formatAndSortData(zoneAcc);
    const formattedPlainAcc = formatAndSortData(plainAcc);
    const limitedSubproductAcc = formatAndSortData(subproductAcc, 50);
    const limitedGroupPartyAcc = formatAndSortData(groupPartyAcc, 50);
    const formattedYearAcc = formatAndSortData(yearAcc);
    const formattedMonthAcc = formatAndSortData(monthAcc);

    return {
      purityAcc: formattedPurityAcc,
      projectAcc: formattedProjectAcc,
      productAcc: formattedProductAcc,
      subproductAcc: limitedSubproductAcc,
      colorAcc: formattedColorAcc,
      groupPartyAcc: limitedGroupPartyAcc,
      zoneAcc: formattedZoneAcc,
      plainAcc: formattedPlainAcc,
      yearAcc: formattedYearAcc,
      monthAcc: formattedMonthAcc,
    };
  }

  const validValues = Object.values(projectAcc).filter(
    (value) => value != null && value !== 0
  );
  const total = validValues.reduce((sum, value) => sum + value, 0);
  console.log("Valid total:", total);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8081/api/order_receive&new_design`
        );

        const jsonData = await response.json();
        const filteredData = jsonData.filter((item) => {
          const parseParam = (param) => {
            if (!param) return [];
            return param
              .replace(/^\{|\}$/g, "")
              .split(",")
              .map(Number);
          };

          setIsSelected(false);

          const years = parseParam(yearParam);
          const months = parseParam(monthParam);
          const dates = parseParam(dateParam);

          const itemDate = new Date(item.TRANSDATE);
          const itemYear = itemDate.getFullYear();
          const itemMonth = itemDate.getMonth() + 1;
          const itemDay = itemDate.getDate();

          return (
            item.PROJECT === project &&
            (years.length === 0 || years.includes(itemYear)) &&
            (months.length === 0 || months.includes(itemMonth)) &&
            (dates.length === 0 || dates.includes(itemDay))
          );
        });
        setData(filteredData);
        setFilteredData(filteredData);
        setOriginalData(filteredData);
        setIsLoading(false);

        const {
          purityAcc,
          projectAcc,
          productAcc,
          subproductAcc,
          colorAcc,
          groupPartyAcc,
          zoneAcc,
          plainAcc,
          yearAcc,
          monthAcc,
        } = aggregateData(filteredData);

        setPurityAcc(purityAcc);
        setProjectAcc(projectAcc);
        setProductAcc(productAcc);
        setSubproductAcc(subproductAcc);
        setColorAcc(colorAcc);
        setZoneAcc(zoneAcc);
        setPlainAcc(plainAcc);
        setGroupPartyAcc(groupPartyAcc);
        setYearAcc(yearAcc);
        setMonthAcc(monthAcc);

        console.log(yearAcc, monthAcc);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [project]);

  const subproductChartRef = useRef(null); // Create a ref for the subproduct chart div

  const handleTop15Click = () => {
    if (!isSelected) {
      if (originalData && Array.isArray(originalData)) {
        const { subproductAcc: originalSubproductAcc } =
          aggregateData(originalData);
        const { groupPartyAcc: originalGroupPartyAcc } =
          aggregateData(originalData);

        setSubproductAcc(limitToTop15(originalSubproductAcc));
        setGroupPartyAcc(limittotop15_group(originalGroupPartyAcc));
        console.log(subproductAcc);
      }
    } else {
      setMinRotation(20);
      setSubproductAcc(
        (originalData && aggregateData(originalData).subproductAcc) || {}
      );
      setGroupPartyAcc(
        (originalData && aggregateData(originalData).groupPartyAcc) || {}
      );
    }
    setIsSelected(!isSelected);
    if (subproductChartRef.current) {
      subproductChartRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const formatAndSortData = (data) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key, value]) => {
        acc[key] = (value / 1000).toFixed(1);
        return acc;
      }, {});
  };
  function limitToTop50(data) {
    if (!data || typeof data !== "object") return {};

    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .reduce((acc, [key, value]) => {
        acc[key] = (value / 1000).toFixed(1);
        return acc;
      }, {});
  }

  const [minrotaion, setMinRotation] = useState(20);
  function limittotop15_group(data) {
    setMinRotation(0);
    if (!data || typeof data !== "object") return {};

    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  function limitToTop15(data) {
    if (!data || typeof data !== "object") return {};

    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  }

  if (!data) {
    return (
      <div
        className={`${
          theme === "light" ? "bg-slate-100" : "bg-slate-800"
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
  }

  const labelColor = theme === "light" ? "#000" : "#fff";

  const totalWeights = {
    purity: Object.values(purityAcc).reduce((sum, value) => sum + value, 0),
    project: Object.values(projectAcc).reduce((sum, value) => sum + value, 0),
    product: Object.values(productAcc).reduce((sum, value) => sum + value, 0),
    zone: Object.values(zoneAcc).reduce((sum, value) => sum + value, 0),
    plain: Object.values(plainAcc).reduce((sum, value) => sum + value, 0),
    // Add more totals as needed
  };

  const createTooltipCallback = (totalWeight) => ({
    callbacks: {
      label: (tooltipItem) => {
        const value = tooltipItem.raw;
        const percentage =
          totalWeight > 0 ? ((value / totalWeight) * 100).toFixed(2) : 0;
        return `${percentage}%\n${value.toFixed(2)} KG`;
      },
    },
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        anchor: "top",
        align: "top",
        color: labelColor,
        font: {
          weight: "normal",
          size: 14,
        },
        formatter: (value) => `${value}`,
      },
      legend: {
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (total === 0) return `Percent: 0%`;
            const percentage = ((value / total) * 100).toFixed(0);
            return `KG: ${value} Percent: ${percentage}%`;
          },
        },
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

  const purityChartData = {
    labels: Object.keys(purityAcc),
    datasets: [
      {
        label: "Purity Distribution",
        data: Object.values(purityAcc),
        backgroundColor: [
          "rgba(0, 123, 255, 0.3)",
          "rgba(40, 167, 69, 0.3)",
          "rgba(255, 193, 7, 0.3)",
          "rgba(220, 53, 69, 0.3)",
          "rgba(255, 87, 34, 0.3)",
          "rgba(156, 39, 176, 0.3)",
          "rgba(23, 162, 184, 0.3)",
          "rgba(255, 99, 132, 0.3)",
          "rgba(103, 58, 183, 0.3)",
          "rgba(96, 125, 139, 0.3)",
        ],
        borderColor: [
          "rgba(0, 123, 255, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(220, 53, 69, 1)",
          "rgba(255, 87, 34, 1)",
          "rgba(156, 39, 176, 1)",
          "rgba(23, 162, 184, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(103, 58, 183, 1)",
          "rgba(96, 125, 139, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const yearChartData = {
    labels: Object.keys(yearAcc),
    datasets: [
      {
        label: "Year",
        data: Object.values(yearAcc),
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const monthChartData = {
    labels: Object.keys(monthAcc).map(
      (month) => monthNames[parseInt(month, 10) - 1]
    ),
    datasets: [
      {
        label: "Month",
        data: Object.values(monthAcc),
        backgroundColor: "rgba(240, 128, 128, 0.3)",
        borderColor: "#ec5f5f",
        borderWidth: 1,
      },
    ],
  };

  const projectChartData = {
    labels: Object.keys(projectAcc),
    datasets: [
      {
        label: "Project Distribution",
        data: Object.values(projectAcc),
        backgroundColor: "rgba(211, 211, 211, 0.3)",
        borderColor: "rgba(211, 211, 211, 1)",
        borderWidth: 1,
      },
    ],
  };

  const productChartData = {
    labels: Object.keys(productAcc),
    datasets: [
      {
        label: "Product Distribution",
        data: Object.values(productAcc),
        backgroundColor: "rgba(240, 128, 128, 0.3)",
        borderColor: "rgba(240, 128, 128, 1)",
        borderWidth: 1,
      },
    ],
  };
  const zoneChartdata = {
    labels: Object.keys(zoneAcc),
    datasets: [
      {
        label: "zone Distribution",
        data: Object.values(zoneAcc),
        backgroundColor: "rgba(255, 159, 64, 0.3)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };
  const plainstone = {
    labels: Object.keys(plainAcc),
    datasets: [
      {
        label: "Plain Stone Distribution",
        data: Object.values(plainAcc),
        backgroundColor: [
          "rgba(255, 99, 132, 0.3)",
          "rgba(54, 162, 235, 0.3)",
          "rgba(255, 206, 86, 0.3)",
          "rgba(75, 192, 192, 0.3)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const formatParam = (param) => {
    if (param === null || param === undefined) return "-";
    return param
      .replace(/^\{|\}$/g, "")
      .split(",")
      .map((value) => value.trim())
      .join(", ");
  };

  const colorChartData_values = {
    labels: Object.keys(colorAcc),
    datasets: [
      {
        label: "Color Distribution",
        data: Object.values(colorAcc),
        backgroundColor: Object.keys(colorAcc).map(
          (key) => colorMapping[key] || colorMapping.Unknown
        ),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const subproductChartData = {
    labels: Object.keys(subproductAcc),
    datasets: [
      {
        label: "Sub Product Distribution",
        data: Object.values(subproductAcc),
        backgroundColor: "rgba(176, 196, 222, 0.5)",
        borderColor: "rgba(176, 196, 222, 1)",
        borderWidth: 1,
      },
    ],
  };
  const groupPartyChartData = {
    labels: Object.keys(groupPartyAcc),
    datasets: [
      {
        label: "Group Party Distribution",
        data: Object.values(groupPartyAcc),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        borderWidth: 2,
      },
    ],
  };

  const horizontalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (total === 0) return `Percent: 0%`;
            const percentage = ((value / total) * 100).toFixed(0);
            return `KG: ${value} Percent: ${percentage}%`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: labelColor,
        font: {
          weight: "normal",
          size: 14,
        },
        formatter: (value) => `${Number(value).toFixed(1)}`,
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
          padding: 20,
          autoSkip: false,
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
      },
    },
  };

  const linechartoptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (total === 0) return `Percent: 0%`;
            const percentage = ((value / total) * 100).toFixed(0);
            return `KG: ${value} Percent: ${percentage}%`;
          },
        },
      },
      datalabels: {
        display: true,
        align: "top",
        anchor: "end",
        offset: 10,
        formatter: (value) => `${value}`,
        color: theme === "light" ? "black" : "white",
        font: {
          weight: "normal",
          size: 14,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Group Party",
          color: theme === "light" ? "black" : "#94a3b8",
        },
        grid: {
          display: true,
          color: theme === "light" ? "#e5e7eb" : "#374151", // Ensure the grid color is correct
        },
        ticks: {
          color: theme === "light" ? "black" : "#94a3b8",
          minRotation: minrotaion,
          maxRotation: 0,
          autoSkip: false,
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
      },
      y: {
        title: {
          display: true,
          text: "KG Count",
          color: theme === "light" ? "black" : "#94a3b8",
        },
        beginAtZero: true,
        grid: {
          display: true,
          color: theme === "light" ? "#e5e7eb" : "#374151", // Ensure the grid color is correct
        },
        ticks: {
          color: theme === "light" ? "black" : "#94a3b8",
        },
        border: {
          color: theme === "light" ? "#e5e7eb" : "#94a3b8",
        },
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
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (total === 0) return `Percent: 0%`;
            const percentage = ((value / total) * 100).toFixed(0);
            return `KG: ${value} Percent: ${percentage}%`;
          },
        },
      },
      legend: {
        labels: {
          color: theme === "light" ? "black" : "white",
        },
      },
      title: {
        display: true,
        text: "Color Distribution",
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
    cutout: "50%",
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
        <Header
          onSearch={setSearch}
          theme={theme}
          dark={setTheme}
          className="p-0 m-0"
        />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-40">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}

          <button
            className={`p-4 mt-7 rounded w-52 h-12 py-2 ${
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
              "Top 15 in " + project
            )}
          </button>
          <div className={`flex justify-center items-center p-4`}>
            <div className="flex space-x-4">
              <div
                className={`rounded-lg shadow-md p-3 flex items-center ${
                  theme === "dark" ? "bg-gray-900 text-white" : "bg-white"
                }`}
              >
                <h1 className="col-span-2">
                  Details for Project: {project} in {formattedTotalWeight} kg
                </h1>
              </div>

              <div
                className={`rounded-lg shadow-md p-3 flex items-center ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                }`}
              >
                <h1
                  className={`font-bold ${
                    theme === "dark" ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  Date: {formatParam(dateParam) || "All"}
                </h1>
              </div>

              <div
                className={`rounded-lg shadow-md p-3 flex items-center ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                }`}
              >
                <h1
                  className={`font-bold ${
                    theme === "dark" ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  Month: {formatParam(monthParam) || "All"}
                </h1>
              </div>

              <div
                className={`rounded-lg shadow-md p-3 flex items-center ${
                  theme === "dark" ? "bg-gray-900" : "bg-white"
                }`}
              >
                <h1
                  className={`font-bold ${
                    theme === "dark" ? "text-blue-300" : "text-blue-600"
                  }`}
                >
                  Year: {formatParam(yearParam) || "All"}
                </h1>
              </div>
            </div>
          </div>

          <div
            className={`order-8 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg h-[400px] overflow-auto`}
          >
            <Pie data={plainstone} options={chartOptions} />
          </div>

          {/* Purity Chart */}

          <div
            className={`order-1 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg h-[400px] overflow-auto`}
          >
            <Bar data={yearChartData} options={chartOptions} />
          </div>

          <div
            className={`order-1 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg h-[400px] overflow-auto`}
          >
            <Bar data={monthChartData} options={chartOptions} />
          </div>

          <div
            className={`order-3 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg h-[400px] overflow-auto`}
          >
            <Bar data={purityChartData} options={chartOptions} />
          </div>

          <div
            className={`order-4 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg h-[400px] overflow-auto`}
          >
            <Bar data={zoneChartdata} options={chartOptions} />
          </div>
          {/* Project Chart */}
          <div
            className={`order-5 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-md overflow-auto h-[400px] custom-scrollbar`}
          >
            <Bar data={projectChartData} options={horizontalChartOptions} />
          </div>

          {/* Product Chart */}
          <div
            className={`order-6 col-span-2 lg:col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg max-h-[800px] overflow-auto`}
          >
            <Bar data={productChartData} options={horizontalChartOptions} />
          </div>

          {/* Color Chart */}
          <div
            className={`order-3 col-span-2 lg:col-span-1 flex justify-center items-center h-[400px] ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-lg`}
          >
            <div className="w-[350px] h-[350px] flex justify-center items-center">
              <Doughnut
                data={colorChartData_values}
                options={doughnutChartOptions}
              />
            </div>
          </div>

          {/* Sub Product Chart */}
          <div
            ref={subproductChartRef}
            className={`order-7 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-gray-900"
            } p-4 rounded shadow-md overflow-auto h-[790px] custom-scrollbar`}
          >
            <Bar
              key={isSelected ? "top15" : "all"}
              data={subproductChartData}
              options={horizontalChartOptions}
            />
          </div>
        </main>

        {/* Full-Width Line Chart Below */}
        <div
          className={`w-full ${
            theme === "light" ? "bg-white" : "bg-slate-900"
          } p-4 rounded shadow-md h-[450px] overflow-x-auto overflow-y-auto mb-20`}
        >
          <div className="w-full overflow-visible">
            {" "}
            {/* Increase width if needed */}
            {!isLoading && (
              <Line
                data={groupPartyChartData}
                options={{
                  ...linechartoptions,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",

                        autoSkip: false,
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },
                    },
                    y: {
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      grid: {
                        display: true,
                        color: theme === "light" ? "#e5e7eb" : "#374151",
                      },

                      beginAtZero: true,
                    },
                  },
                }}
                height={450}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
