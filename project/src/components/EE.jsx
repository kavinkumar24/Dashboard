import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

const chartsPerPage = 2; // Number of charts to display per page

function Order_rev() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [allCharts, setAllCharts] = useState([]); // Combined data for all charts

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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
  const [extraChartData1, setExtraChartData1] = useState({
    labels: [],
    datasets: [],
  });
  const [extraChartData2, setExtraChartData2] = useState({
    labels: [],
    datasets: [],
  });
  const [extraChartData3, setExtraChartData3] = useState({
    labels: [],
    datasets: [],
  });
  const [extraChartData4, setExtraChartData4] = useState({
    labels: [],
    datasets: [],
  });
  const [totalWeight, setTotalWeight] = useState(0);

  const convertWtToKg = (wt) => wt / 1000;

  const getYearlyData = (data) => {
    const yearlyData = data.reduce((acc, item) => {
      if (item.TRANSDATE) {
        const year = new Date(item.TRANSDATE).getFullYear();
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

  const getPurityData = (data) => {
    const purityData = data.reduce((acc, item) => {
      const purity = item.Purity || "Unknown";
      const wtKg = convertWtToKg(item.WT || 0);

      if (!acc[purity]) {
        acc[purity] = 0;
      }
      acc[purity] += wtKg;

      return acc;
    }, {});

    const colors = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)",
      "rgba(199, 199, 199, 0.2)",
      "rgba(255, 99, 132, 0.3)",
      "rgba(54, 162, 235, 0.3)",
      "rgba(255, 206, 86, 0.3)",
    ];

    return Object.entries(purityData)
      .filter(([purity, kg]) => kg > 0)
      .map(([purity, kg], index) => ({
        purity,
        kg,
        color: colors[index % colors.length],
      }));
  };

  const getTypeData = (data) => {
    const typeData = data.reduce((acc, item) => {
      const type = item.TYPE || "Unknown";
      const wtKg = convertWtToKg(item.WT || 0);

      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += wtKg;

      return acc;
    }, {});

    return Object.entries(typeData)
      .filter(([type, kg]) => kg > 0)
      .map(([type, kg]) => ({
        type,
        kg,
      }));
  };

  const getZoneData = (data) => {
    const zoneData = data.reduce((acc, item) => {
      const zone = item.ZONE || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[zone]) {
        acc[zone] = 0;
      }
      acc[zone] += wtGrams;

      return acc;
    }, {});

    return Object.entries(zoneData)
      .filter(([zone, grams]) => grams > 0)
      .map(([zone, grams]) => ({
        zone,
        kg: grams / 1000,
      }));
  };

  const prepareColorData = (data) => {
    const colorData = data.reduce((acc, item) => {
      const color = item.Color || "Unknown";
      const kg = parseFloat(item.WT) || 0;

      if (!acc[color]) {
        acc[color] = 0;
      }
      acc[color] += kg;

      return acc;
    }, {});

    return Object.entries(colorData).map(([color, kg]) => ({
      color,
      kg: kg / 1000,
    }));
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
          if (item.TRANSDATE) {
            const date = new Date(item.TRANSDATE);
            allYears.add(date.getFullYear());
            allMonths.add(date.getMonth() + 1);
            allDates.add(date.getDate());
          }
        });

        setYears(Array.from(allYears).sort((a, b) => b - a));
        setMonths(Array.from(allMonths).sort((a, b) => a - b));
        setDates(Array.from(allDates).sort((a, b) => a - b));

        const filteredData = data.filter((item) => {
          const itemDate = new Date(item.TRANSDATE);
          const year = itemDate.getFullYear().toString();
          const month = itemDate.getMonth() + 1;
          const date = itemDate.getDate();

          return (
            (!selectedYear || year === selectedYear) &&
            (!selectedMonth || month === selectedMonth) &&
            (!selectedDate || date === parseInt(selectedDate))
          );
        });

        const totalWeightFromAPI =
          filteredData.reduce((total, item) => total + (item.WT || 0), 0) /
          1000;
        setTotalWeight(totalWeightFromAPI);

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

        const purityData = getPurityData(filteredData);

        setPurityChartData({
          labels: purityData.map((entry) => entry.purity),
          datasets: [
            {
              label: "KG Count by Purity",
              data: purityData.map((entry) => entry.kg),
              backgroundColor: purityData.map((entry) => entry.color),
              borderColor: purityData.map((entry) =>
                entry.color.replace("0.2", "1")
              ),
              borderWidth: 1,
            },
          ],
        });

        setTypeChartData({
          labels: getTypeData(filteredData).map((entry) => entry.type),
          datasets: [
            {
              label: "KG Count by Type",
              data: getTypeData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        });

        setZoneChartData({
          labels: getZoneData(filteredData).map((entry) => entry.zone),
          datasets: [
            {
              label: "KG Count by Zone",
              data: getZoneData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(255, 159, 64, 0.2)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ],
        });

        setColorChartData({
          labels: prepareColorData(filteredData).map((entry) => entry.color),
          datasets: [
            {
              label: "KG Count by Color",
              data: prepareColorData(filteredData).map((entry) => entry.kg),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Placeholder for additional charts
        setExtraChartData1({
          labels: ["A", "B", "C", "D"],
          datasets: [
            {
              label: "Extra Chart 1",
              data: [10, 20, 30, 40],
              backgroundColor: "rgba(255, 205, 86, 0.2)",
              borderColor: "rgba(255, 205, 86, 1)",
              borderWidth: 1,
            },
          ],
        });

        setExtraChartData2({
          labels: ["E", "F", "G", "H"],
          datasets: [
            {
              label: "Extra Chart 2",
              data: [15, 25, 35, 45],
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        setExtraChartData3({
          labels: ["I", "J", "K", "L"],
          datasets: [
            {
              label: "Extra Chart 3",
              data: [20, 30, 40, 50],
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setExtraChartData4({
          labels: ["M", "N", "O", "P"],
          datasets: [
            {
              label: "Extra Chart 4",
              data: [25, 35, 45, 55],
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Combine all chart data for display
        setAllCharts([
          chartData,
          purityChartData,
          typeChartData,
          zoneChartData,
          colorChartData,
          extraChartData1,
          extraChartData2,
          extraChartData3,
          extraChartData4,
        ]);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [selectedYear, selectedMonth, selectedDate]);

  const handleYearChange = (event) => setSelectedYear(event.target.value);
  const handleMonthChange = (event) => setSelectedMonth(event.target.value);
  const handleDateChange = (event) => setSelectedDate(event.target.value);

  const handlePageChange = (pageIndex) => setCurrentPage(pageIndex);

  const numberOfPages = Math.ceil(allCharts.length / chartsPerPage);
  const chartsToDisplay = allCharts.slice(
    currentPage * chartsPerPage,
    (currentPage + 1) * chartsPerPage
  );

  return (
    <div
      className={`flex ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
      } h-screen`}
    >
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">
          <div className="mb-4">
            <select onChange={handleYearChange} value={selectedYear}>
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select onChange={handleMonthChange} value={selectedMonth}>
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select onChange={handleDateChange} value={selectedDate}>
              <option value="">All Dates</option>
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {chartsToDisplay.map((chart, index) => (
              <div key={index} className="border p-4">
                <Bar
                  data={chart}
                  options={{
                    plugins: {
                      datalabels: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              disabled={currentPage === 0}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
            <button
              disabled={currentPage >= numberOfPages - 1}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Order_rev;
