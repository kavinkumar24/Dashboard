import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { useEffect } from 'react'
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
function New_Design() {
    const [search, setSearch] = useState("")
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
      );
      const [orderData, setOrderData] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [years, setYears] = useState([]);
      const [months, setMonths] = useState([]);
      const [dates, setDates] = useState([]);
      const [currentPage, setCurrentPage] = useState(1);
      const [allCharts, setAllCharts] = useState([]);
      const [selectedYear, setSelectedYear] = useState("");
      const [selectedMonth, setSelectedMonth] = useState("");
      const [activeIndex, setActiveIndex] = useState(null);
        const [activeIndex1, setActiveIndex1] = useState(null);
    
      const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
      };
      const toggleAccordion1 = (index) =>{
        setActiveIndex1(activeIndex1 === index ? null : index);
      }
      const handleFilter = () => {
        setIsLoading(true);
        setfilter(!filter);
      };
    
      useEffect(() => {
        localStorage.setItem("theme", theme);
      }, [theme]);
      const [chartData, setChartData] = useState({
        labels: [],
        datasets: [],
      });
      const [purityChartData, setPurityChartData] = useState({
        labels: [],
        datasets: [],
      });
    
      const [typeChartData, setTypeChartData] = useState({
        labels: [],
        datasets: [],
      });
      const [zoneChartData, setZoneChartData] = useState({
        labels: [],
        datasets: [],
      });
      const [colorChartData, setColorChartData] = useState({
        labels: [],
        datasets: [],
      });
    
      const [projectData, setProjectData] = useState({
        labels: [],
        datasets: [],
      });

      
  const [totalWeight, setTotalWeight] = useState(0);
  const [yearlyData, setYearlyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});

  const [filter, setfilter] = useState(false);

  const convertWtToKg = (wt) => wt / 1000;
  const getYearlyData = (data) => {
    const yearlyData = data.reduce((acc, item) => {
      if (item["DD&month"]) {
        const year = new Date(item["DD&month"]).getFullYear();
        const wtKg = convertWtToKg(item.WT || 0);

        if (!acc[year]) {
          acc[year] = 0;
        }
        acc[year] += wtKg;
      }
      return acc;
    }, {});

    return Object.entries(yearlyData)
      .filter(([year, kg]) => kg > 0)
      .map(([year, kg]) => ({
        year,
        kg,
      }));
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

  const getMonthName = (monthIndex) => monthNames[monthIndex];
  
  const calculateTotalWeight = (data) => {
    const orderWeightMap = new Map();
    data.forEach((order) => {
        if (orderWeightMap.has(order.ORDERNO)) {
            const existingOrder = orderWeightMap.get(order.ORDERNO);
            if (order.WT > existingOrder.WT) {
                orderWeightMap.set(order.ORDERNO, order);
            }
        } else {
            orderWeightMap.set(order.ORDERNO, order);
        }
    });

    return Array.from(orderWeightMap.values());
};
  useEffect(() => {
    fetch("http://localhost:8081/order_receive&new_design")
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
        setIsLoading(false);

        const allYears = new Set();
        const allMonths = new Set();
        const allDates = new Set();

        data.forEach((item) => {
          if (item["DD&month"]) {
            const date = new Date(item["DD&month"]);
            allYears.add(date.getFullYear());
            allMonths.add(date.getMonth() + 1);
            allDates.add(date.getDate());
          }
        });

        setYears(Array.from(allYears).sort((a, b) => b - a));
        setMonths(Array.from(allMonths).sort((a, b) => a - b));
        setDates(Array.from(allDates).sort((a, b) => a - b));

        const filteredData = data.filter((item) => {
          const itemDate = new Date(item["DD&month"]);

          const itemYear = itemDate.getFullYear();
          const itemMonth = itemDate.getMonth() + 1;
          const itemDateOnly = itemDate.getDate();

          return (
            (!selectedYear || itemYear === parseInt(selectedYear)) &&
            (!selectedMonth || itemMonth === parseInt(selectedMonth))
          );
        });

        const totalWeightFromAPI =
          filteredData.reduce((total, item) => total + (item.WT || 0), 0) /
          1000;
        setTotalWeight(totalWeightFromAPI);

        const yearData = filteredData.reduce((acc, item) => {
          const year = new Date(item["DD&month"]).getFullYear();
          if (!acc[year]) acc[year] = 0;
          acc[year] += item.WT || 0;
          return acc;
        }, {});

        const monthData = filteredData.reduce((acc, item) => {
          const date = new Date(item["DD&month"]);
          const year = date.getFullYear();
          const monthIndex = date.getMonth();
          const yearMonth = `${year}, ${getMonthName(monthIndex)}`;
          if (!acc[yearMonth]) acc[yearMonth] = 0;
          acc[yearMonth] += item.WT || 0;
          return acc;
        }, {});

        setYearlyData(yearData);
        setMonthlyData(monthData);

        setChartData({
          labels: getYearlyData(filteredData).map((entry) => entry.year),
          datasets: [
            {
              label: "KG Count per Year",
              data: getYearlyData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });


          
          
        const sortedData = filteredData.sort((a, b) => b.WT - a.WT);
        const uniqueOrdersByWeight = calculateTotalWeight(sortedData);
        const top25Orders = uniqueOrdersByWeight.sort((a, b) => b.ORDERNO - a.ORDERNO).slice(0, 25);
        setOrderData(top25Orders);
        
        setAllCharts([
          chartData,
          purityChartData,
          typeChartData,
          zoneChartData,
        ]);
        console.log( selectedMonth, selectedYear);
        console.log("Filtered Data:", filteredData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [theme, filter]);

  return (
    <div
      className={`min-h-screen flex ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-gray-800 text-gray-100"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <div
          className={`p-4 ${
            theme == "light" ? "bg-white" : "bg-slate-900"
          } shadow-md flex justify-center items-center space-x-4 m-4`}
        >
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={`p-2 border rounded ${
              theme == "light"
                ? "bg-white text-black border border-gray-200"
                : "bg-slate-900 text-gray-400 border-gray-600"
            } `}
          >
            <option value="">Select Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={`p-2 border rounded ${
              theme == "light"
                ? "bg-white text-black border border-gray-200"
                : "bg-slate-900 text-gray-400 border-gray-600"
            } `}
          >
            <option value="">Select Month</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          

          <button
            onClick={handleFilter}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Filter
          </button>
        </div>
        <div
      className={`border-b overflow-auto ${
        theme === 'light' ? 'border-slate-300' : 'border-slate-600'
      }`}
    >
      <button
        onClick={() => toggleAccordion(1)}
        className="w-full flex justify-between items-center py-5"
      >
        <span
          className={`text-lg font-semibold ${
            theme === 'light' ? 'text-slate-800' : 'text-slate-300'
          }`}
        >
          Order Details
        </span>
        <span className="text-slate-800 transition-transform duration-300">
          {activeIndex === 1 ? (
            <FiMinusCircle
              className={`text-2xl ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-300'
              }`}
            />
          ) : (
            <IoIosAddCircleOutline
              className={`text-2xl ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-300'
              }`}
            />
          )}
        </span>
      </button>
      <div
        className={`${
          activeIndex === 1 ? 'max-h-screen' : 'max-h-0'
        } overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div
          className={`m-6 border rounded-lg ${
            theme === 'light'
              ? 'border-gray-300 bg-white'
              : 'border-slate-700 bg-slate-800'
          } shadow-lg`}
        >
          {orderData.map((item, index) => (
            <div key={index} className="accordion-item border-b border-gray-200">
              <div
                className="accordion-header cursor-pointer p-4 flex justify-between items-center"
                onClick={() => toggleAccordion1(index)}
              >
                <h3 className="text-lg font-semibold">
                  Order No: {item.ORDERNO}
                </h3>
                <span className="text-lg">
                  {activeIndex1 === index ? (
                    <FiMinusCircle />
                  ) : (
                    <IoIosAddCircleOutline />
                  )}
                </span>
              </div>
              <div
                className={`accordion-content overflow-auto transition-all duration-300 ease-in-out ${
                  activeIndex1 === index ? 'max-h-[25em] py-4' : 'max-h-0'
                }`}
              >
                <p><strong>Item ID:</strong> {item.itemid}</p>
                <p><strong>Weight:</strong> {item.WT} grams</p>
                <p><strong>Date:</strong> {item['DD&month']}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  
        <main className="flex-1 p-6 overflow-y-auto">
        <div
        className={`order-2 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        }  p-4 rounded shadow-md overflow-x-auto h-[400px]`}
      >
        {!isLoading && (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,

                  labels: {
                    color: theme === "light" ? "black" : "white",
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      return `KG: ${context.raw.toFixed(2)}`;
                    },
                  },
                },
                datalabels: {
                  display: true,
                  align: "end",
                  anchor: "end",
                  formatter: (value) => value.toFixed(2),
                  color: theme === "light" ? "black" : "white",

                  font: {
                    weight: "normal",
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Year",
                    color: theme === "light" ? "black" : "#94a3b8",
                  },
                  grid: {
                    display: true,
                    color: theme === "light" ? "#e5e7eb" : "#374151",
                  },
                  ticks: {
                    color: theme === "light" ? "black" : "#94a3b8",
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
                  color: theme === "light" ? "black" : "red",
                  grid: {
                    display: true,
                    color: theme === "light" ? "#e5e7eb" : "#374151",
                  },
                  ticks: {
                    color: theme === "light" ? "black" : "#94a3b8",
                  },
                  border: {
                    color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                  },
                },
              },
            }}
            plugins={[ChartDataLabels]}
          />
        )}
      </div>
            </main>
        </div>
    </div>
  )
}

export default New_Design
