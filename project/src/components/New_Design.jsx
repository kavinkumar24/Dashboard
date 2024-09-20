import React, { useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import CustomMultiSelect from "./Custom/Mutliselect";
import { IoFilterOutline } from "react-icons/io5";
import { Pie } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);
function New_Design() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [orderData, setOrderData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [group_party, setgroup_party] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [active, setActive] = useState(null);
  const itemsPerPage = 10;
  const [allCharts, setAllCharts] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeIndex1, setActiveIndex1] = useState(null);
  const totalPages = Math.ceil(orderData.length / itemsPerPage);

  const [currentPage1, setCurrentPage1] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = orderData.slice(startIndex, startIndex + itemsPerPage);
  const [isSelected_top15, setIsSelected_top15] = useState(true);

  const handleCancelFilter = () => {
    setShowDatePickerModal(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalpages1 = Math.ceil(group_party.length / itemsPerPage);

  const handlePageChange1 = (page) => {
    if (page >= 1 && page <= totalpages1) {
      setCurrentPage1(page);
    }
  };

  // Pagination logic to slice the data for the current page
  const indexOfLastItem = currentPage1 * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentdata1 = group_party.slice(indexOfFirstItem, indexOfLastItem);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    console.log(orderData);
  };
  const toggleAccordion1 = (index) => {
    setActiveIndex1(activeIndex1 === index ? null : index);
  };

  const [openDropdown, setOpenDropdown] = useState(null);
  const handleDropdownToggle = (dropdownType) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };
  const [overall_data_filtered, setOverall_data_filtered] = useState([]);
  const handleFilter = () => {
    setIsLoading(true);
    setShowDatePickerModal(false);
    setfilter(!filter);
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [chartmonthData, setChartmonthData] = useState({
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
  const [product, setProduct] = useState({
    labels: [],
    datasets: [],
  });
  const [plainStone, setPlainStone] = useState({
    labels: [],
    datasets: [],
  });

  const [subproduct, setSubproduct] = useState({
    labels: [],
    datasets: [],
  });
  const currentMonth = new Date().getMonth() + 1; // Note: Months are zero-indexed (0 = January)

  const handleClick_purity_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
        const purity = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/purity-detail-new_design/${encodeURIComponent(
          purity
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

  const handleTop25Click = () => {
    setIsSelected_top15((prevState) => {
      const newTop15State = !prevState;
      return newTop15State;
    });
  };

  const handleClick_plain_stone_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
        const plstone = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/PL-ST-detail-new_design/${encodeURIComponent(
          plstone
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };
  const clickTimeout = useRef(null);

  const handleChartClick = (event, elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedProduct = product.labels[clickedIndex];

      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }

      // Set a timeout to detect a single click
      clickTimeout.current = setTimeout(() => {
        console.log("Single click detected:", clickedProduct);
        handleProductClick(event, elements);
      }, 250);
    }
  };

  const handleProductClick = (event, elements) => {
    console.log("Elements:", elements);

    if (elements.length > 0) {
      // Get the clicked product's index
      const clickedIndex = elements[0].index;

      // Retrieve the corresponding product from the chart
      const clickedProduct = product.labels[clickedIndex];
      console.log("Clicked Product:", clickedProduct);

      // Ensure `filteredData` is populated
      if (!overall_data_filtered || overall_data_filtered.length === 0) {
        console.error("Filtered data is empty or not available.");
        return;
      }

      // Filter subproduct data based on the clicked product (case-insensitive comparison)
      const filteredSubproductData = overall_data_filtered.filter(
        (item) => item.PRODUCT.toLowerCase() === clickedProduct.toLowerCase()
      );
      console.log("Filtered Subproduct Data:", filteredSubproductData);

      // Check if any subproduct data was found
      if (filteredSubproductData.length === 0) {
        console.warn("No subproduct data found for the selected product.");
        return;
      }

      // Aggregate the filtered data for subproducts
      const subproductData = filteredSubproductData.reduce((acc, item) => {
        const subproduct = item["SUB PRODUCT"]; // Using exact case from your data
        if (!acc[subproduct]) acc[subproduct] = 0;
        acc[subproduct] += item.WT || 0;
        return acc;
      }, {});

      console.log("Aggregated Subproduct Data:", subproductData);

      // Now you can update the chart with the aggregated subproduct data
      setSubproduct({
        labels: Object.keys(subproductData),
        datasets: [
          {
            label: "KG Count by Sub Product",
            data: Object.values(subproductData).map((value) => value / 1000), // Adjust as per your data units
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "#215e5e",
            borderWidth: 1,
          },
        ],
      });
    }
  };

  const handleClick_produt_detail = (event, chartElement) => {
    if (chartElement && chartElement.length > 0) {
      try {
        const chart = chartElement[0].element.$context.chart;
        const index = chartElement[0].index;
        const product = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/product-detail-new_design/${encodeURIComponent(
          product
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };


  const handleClick_subprodut_detail = (event, chartElement) => {
    if (chartElement && chartElement.length > 0) {
      try {
        const chart = chartElement[0].element.$context.chart; 
        const index = chartElement[0].index;
        const subproduct = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/subproduct-detail-new_design/${encodeURIComponent(
          subproduct
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

  

  

  const handleClick_zone_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
        const zone = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        let zonedetailurl = `/zone-detail-new_design/${encodeURIComponent(
          zone
        )}`;

        if (year) {
          zonedetailurl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          zonedetailurl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          zonedetailurl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(zonedetailurl);


      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

  const handleClick_color_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
        const color = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/color-detail-new_design/${encodeURIComponent(
          color
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
  const handleClick_project_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
<<<<<<< Updated upstream
        const color = chart.data.labels[index];

        // Use current year and month if not selected
=======
        const project = chart.data.labels[index];

>>>>>>> Stashed changes
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
<<<<<<< Updated upstream
        let colorDetailUrl = `/project-detail-new_design/${encodeURIComponent(
          color
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
=======
        let projectDetailUrl = `/project-detail-new_design/${encodeURIComponent(
          project
        )}`;

        if (year) {
          projectDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          projectDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
>>>>>>> Stashed changes
            month
          )}`;
        }
        if (totalWeight) {
<<<<<<< Updated upstream
          colorDetailUrl += `${
=======
          projectDetailUrl += `${
>>>>>>> Stashed changes
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

<<<<<<< Updated upstream
        navigate(colorDetailUrl);
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

  const handle_subproduct_detail = (event, chartElement) => {
    // Check if chartElement is defined and has at least one item
    if (chartElement && chartElement.length > 0) {
      try {
        // Access the chart object and the clicked index
        const chart = chartElement[0].element.$context.chart; // Update as per your chart.js version
        const index = chartElement[0].index;
        const color = chart.data.labels[index];

        // Use current year and month if not selected
        const year = selectedYear || currentYear;
        const month = selectedMonth || currentMonth;

        // Navigate to the details page with parameters
        let colorDetailUrl = `/subproduct-detail-new_design/${encodeURIComponent(
          color
        )}`;

        if (year) {
          colorDetailUrl += `?year=${encodeURIComponent(year)}`;
        }
        if (month) {
          colorDetailUrl += `${year ? "&" : "?"}month=${encodeURIComponent(
            month
          )}`;
        }
        if (totalWeight) {
          colorDetailUrl += `${
            year || month ? "&" : "?"
          }totalweight=${encodeURIComponent(totalWeight)}`;
        }

        navigate(colorDetailUrl);
=======
        navigate(projectDetailUrl);
>>>>>>> Stashed changes
      } catch (error) {
        console.error("Error handling chart click:", error);
      }
    } else {
      console.warn("No chart element clicked or chart element is empty");
    }
  };

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);
  const [yearlyData, setYearlyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});

  const [filter, setfilter] = useState(false);
  const handleFilterClick = () => {
    setShowDatePickerModal(true);
  };

  const convertWtToKg = (wt) => wt / 1000;
  const getYearlyData = (data, filterYear = null) => {
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

    if (filterYear) {
      return Object.entries(yearlyData)
        .filter(([year]) => year === filterYear)
        .map(([year, kg]) => ({
          year,
          kg,
        }));
    }

    const sortedYears = Object.keys(yearlyData).sort((a, b) => b - a);
    const lastFourYears = sortedYears.slice(0, 4);

    const othersCount = Object.entries(yearlyData)
      .filter(([year]) => !lastFourYears.includes(year))
      .reduce((sum, [, kg]) => sum + kg, 0);

    const result = lastFourYears.map((year) => ({
      year,
      kg: yearlyData[year],
    }));

    if (othersCount > 0) {
      result.push({
        year: "Others",
        kg: othersCount,
      });
    }

    return result;
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
      "rgba(221, 160, 221, 0.2)",
      "rgba(250, 128, 114, 0.2)",
      "rgba(240, 230, 140, 0.2)",
      "rgba(175, 238, 238, 0.2)",
      "rgba(255, 228, 196, 0.2)",
      "rgba(224, 255, 255, 0.2)",
      "rgba(238, 130, 238, 0.2)",
      "rgba(245, 222, 179, 0.2)",
      "rgba(103, 58, 183, 0.7)",
      "rgba(96, 125, 139, 0.7)",
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
      }))
      .sort((a, b) => b.kg - a.kg);
  };

  const getProject = (data) => {
    const project_data = data.reduce((acc, item) => {
      const zone = item.PROJECT || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[zone]) {
        acc[zone] = 0;
      }
      acc[zone] += wtGrams;

      return acc;
    }, {});

    return Object.entries(project_data)
      .filter(([project, grams]) => grams > 0)
      .map(([project, grams]) => ({
        project,
        kg: grams / 1000,
      }));
  };

  const getProduct = (data) => {
    const product_data = data.reduce((acc, item) => {
      const product = item.PRODUCT || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[product]) {
        acc[product] = 0;
      }
      acc[product] += wtGrams;

      return acc;
    }, {});

    return Object.entries(product_data)
      .filter(([product, grams]) => grams > 0)
      .map(([product, grams]) => ({
        product,
        kg: grams / 1000,
      }));
  };

  const colorMapping = {
    Y: "rgba(255, 223, 0, 0.6)", // Bright Yellow
    P: "rgba(255, 105, 180, 0.6)", // Bright Pink
    "Y/P": "rgba(255, 165, 79, 0.6)", // Soft Orange (Blend of Yellow and Pink)
    W: "rgba(245, 245, 245, 0.8)", // Off-White
    R: "rgba(255, 69, 58, 0.9)", // Vivid Red
    "W/P": "rgba(255, 182, 193, 0.6)", // Light Pink (White and Pink blend)
    "W/P/Y": "rgba(255, 222, 179, 0.6)", // Soft Beige (White, Pink, Yellow blend)
    "Y/P/W": "rgba(255, 228, 196, 0.6)", // Bisque (Yellow, Pink, White blend)
    "W/Y": "rgba(255, 250, 205, 0.7)", // Lemon Chiffon (White and Yellow blend)
    "Y/Base metal": "rgba(169, 169, 169, 0.6)", // Dim Gray
    Unknown: "rgba(211, 211, 211, 0.6)", // Light Gray
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
      backgroundColor: colorMapping[color] || "rgba(211, 211, 211, 0.6)",
    }));
  };
  const getplainStone = (data) => {
    const purityData = data.reduce((acc, item) => {
      const purity = item["PL-ST"] || "Unknown";
      const wtKg = convertWtToKg(item.WT || 0);
      if (!acc[purity]) {
        acc[purity] = 0;
      }
      acc[purity] += wtKg;

      return acc;
    }, {});

    const colors = [
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
    ];

    return Object.entries(purityData)
      .filter(([purity, kg]) => kg > 0)
      .map(([purity, kg], index) => ({
        purity,
        kg,
        color: colors[index % colors.length],
      }));
  };

  const currentYear = new Date().getFullYear();
  const last4Years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  useEffect(() => {
    setFilteredData(filterByYear(orderData, selectedYear));
  }, [selectedYear, orderData]);

  const filterByYear = (data, year) => {
    return data.filter((item) => item.Dyr === year);
  };

  const fetchedDataRef = useRef(null);

  useEffect(() => {
    if (fetchedDataRef.current) {
      console.log("Using cached data");
      processFetchedData(fetchedDataRef.current);
      setIsLoading(false);
      return;
    }

    fetch("http://localhost:8081/order_receive&new_design")
      .then((response) => response.json())
      .then((data) => {
        fetchedDataRef.current = data; // Cache data
        setOrderData(data);
        processFetchedData(data);
      })
      .catch((error) => console.error("Error fetching data:", error))
      .finally(() => setIsLoading(false));
  }, [theme, filter, isSelected_top15]);

  const getsubproduct = (data) => {
    const sub_product_data = data.reduce((acc, item) => {
      const sub_product = item["SUB PRODUCT"] || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[sub_product]) {
        acc[sub_product] = 0;
      }
      acc[sub_product] += wtGrams;

      return acc;
    }, {});

    return Object.entries(sub_product_data)
      .filter(([sub_product, grams]) => grams > 0)
      .map(([sub_product, grams]) => ({
        sub_product,
        kg: grams / 1000,
      }));
  };
  const processFetchedData = (data) => {
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
    setIsLoading(false);

    setYears(Array.from(allYears).sort((a, b) => b - a));
    setMonths(Array.from(allMonths).sort((a, b) => a - b));
    setDates(Array.from(allDates).sort((a, b) => a - b));

    const filteredData = data.filter((item) => {
      const itemDate = new Date(item["DD&month"]);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      const yearMatch = !selectedYear.length || selectedYear.includes(itemYear);
      const monthMatch =
        !selectedMonth.length || selectedMonth.includes(itemMonth);

      return yearMatch && monthMatch;
    });

    console.log("Filtered Data:", filteredData);
    setOverall_data_filtered(filteredData);
    const totalWeightFromAPI =
      filteredData.reduce((total, item) => total + (item.WT || 0), 0) / 1000;
    setTotalWeight(totalWeightFromAPI);

    const monthData = filteredData.reduce((acc, item) => {
      const date = new Date(item["DD&month"]);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const yearMonth = `${year}, ${getMonthName(monthIndex)}`;
      if (!acc[yearMonth]) acc[yearMonth] = 0;
      acc[yearMonth] += item.WT || 0;
      return acc;
    }, {});

    const yearlyData = filteredData.reduce((acc, item) => {
      const year = new Date(item["DD&month"]).getFullYear();
      if (!acc[year]) acc[year] = 0;
      acc[year] += item.WT || 0;
      return acc;
    }, {});

    setYearlyData(yearlyData);
    setMonthlyData(monthData);

    let sortedData = [...filteredData].sort((a, b) => b.WT - a.WT);
    const istop15 = isSelected_top15;

    const currentZoneData = getZoneData(sortedData);
    const currentProjectData = getProject(sortedData);
    const currentProductData = getProduct(sortedData);
    const currentSubproductData = getsubproduct(sortedData);

    let sortedProjectData = [...currentProjectData].sort((a, b) => b.kg - a.kg);
    let sortedProductData = [...currentProductData].sort((a, b) => b.kg - a.kg);
    let sortedSubproductData = [...currentSubproductData].sort(
      (a, b) => b.kg - a.kg
    );

    if (istop15) {
      sortedProjectData = sortedProjectData.slice(0, 15);
      sortedProductData = sortedProductData.slice(0, 15);
      sortedSubproductData = sortedSubproductData.slice(0, 15);
    } else {
      // Retain the original values when istop15 is false
      sortedProjectData = [...currentProjectData];
      sortedProductData = [...currentProductData];
      sortedSubproductData = [...currentSubproductData];
    }

    let sortedZoneData = [...currentZoneData].sort((a, b) => b.kg - a.kg);
    setChartData({
      labels: getYearlyData(filteredData).map((entry) => entry.year),
      datasets: [
        {
          label: "KG Count per Year",
          data: getYearlyData(filteredData).map((entry) => entry.kg),
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)",
            "rgba(144, 238, 144, 0.2)",
            "rgba(255, 182, 193, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(240, 128, 128, 0.2)",
            "rgba(230, 230, 250, 0.2)",
            "rgba(23, 162, 184, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(103, 58, 183, 0.7)",
            "rgba(96, 125, 139, 0.7)",
          ],
          borderColor: [
            "#215e5e",
            "rgba(144, 238, 144, 1)",
            "rgba(255, 182, 193, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(240, 128, 128, 1)",
            "rgba(230, 230, 250, 1)",
            "rgba(23, 162, 184, 1)",
          ],
          borderWidth: 1,
        },
      ],
    });
    const latestYear = data.reduce((latest, item) => {
      const itemYear = new Date(item["DD&month"]).getFullYear();
      return itemYear > latest ? itemYear : latest;
    }, 0);

    console.log("Latest Year:", latestYear);
    const monthData1 = filteredData.reduce((acc, item) => {
      const date = new Date(item["DD&month"]);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthName = getMonthName(monthIndex);

      if (last4Years.includes(year)) {
        const yearMonth = `${year}, ${monthName}`;
        if (!acc[yearMonth]) acc[yearMonth] = 0;
        acc[yearMonth] += item.WT || 0;
      }

      return acc;
    }, {});

    let yearsToDisplay = [];

    if (selectedYear.length === 0) {
      yearsToDisplay = [Math.max(...last4Years)];
    } else {
      yearsToDisplay = selectedYear;
    }

    const selectedYearsData = {};
    const otherYearsData = {};

    for (const key in monthData1) {
      const [year] = key.split(", ");

      if (yearsToDisplay.includes(parseInt(year))) {
        selectedYearsData[key] = monthData1[key];
      } else {
        otherYearsData[key] = monthData1[key];
      }
    }

    const monthOrder = [
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
    const currentYear = new Date().getFullYear();

    const allMonthData = { ...otherYearsData, ...selectedYearsData };
    const sortedSelectedYearsData = Object.keys(selectedYearsData)
      .filter((key) => {
        // Only keep data for the current year
        const year = parseInt(key.split(", ")[0], 10);
        return year === currentYear;
      })
      .sort((a, b) => {
        const [, monthA] = a.split(", ");
        const [, monthB] = b.split(", ");
        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
      })
      .reduce((acc, key) => {
        acc[key] = selectedYearsData[key];
        return acc;
      }, {});

    const initialDisplayData = { ...sortedSelectedYearsData };

    console.log("Initial Display Data (Selected Years):", initialDisplayData);

    // Combine current year data with other years' data
    const sortedMonthData = {
      ...allMonthData, // Start with all month data
      ...sortedSelectedYearsData, // Add the sorted data for the current year
    };

    // Sort the combined data based on year and then by month
    const sortedKeys = Object.keys(sortedMonthData).sort((a, b) => {
      const [yearA, monthA] = a.split(", ");
      const [yearB, monthB] = b.split(", ");
      return (
        parseInt(yearA, 10) - parseInt(yearB, 10) || // First sort by year
        monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB) // Then sort by month
      );
    });

    // Create a sorted object based on the keys
    const finalSortedMonthData = {};
    sortedKeys.forEach((key) => {
      finalSortedMonthData[key] = sortedMonthData[key];
    });

    console.log("Sorted Month Data:", finalSortedMonthData);

    // Set chart month data to display based on the sorted month data
    setChartmonthData({
      labels: Object.keys(finalSortedMonthData),
      datasets: [
        {
          label: "KG Count per month",
          data: Object.values(finalSortedMonthData).map(
            (value) => value / 1000
          ),
          backgroundColor: "rgba(240, 128, 128, 0.2)",
          borderColor: "#ec5f5f",
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
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
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

    setProduct({
      labels: sortedProductData.map((entry) => entry.product),
      datasets: [
        {
          label: "KG Count by product",
          data: sortedProductData.map((entry) => entry.kg),
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "#9900cc",
          borderWidth: 1,
        },
      ],
    });

    const colorData = prepareColorData(filteredData);

    setColorChartData({
      labels: colorData.map((entry) => entry.color),
      datasets: [
        {
          label: "KG Count by Color",
          data: colorData.map((entry) => entry.kg),
          backgroundColor: colorData.map((entry) => entry.backgroundColor),
          borderColor: colorData.map((entry) =>
            entry.backgroundColor.replace("0.4", "1")
          ),
          borderWidth: 1,
        },
      ],
    });

    setProjectData({
      labels: sortedProjectData.map((entry) => entry.project),
      datasets: [
        {
          label: "KG Count by Project",
          data: sortedProjectData.map((entry) => entry.kg),
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    });

    setPlainStone({
      labels: getplainStone(filteredData).map((entry) => entry.purity),
      datasets: [
        {
          label: "KG Count by Plain Stone",
          data: getplainStone(filteredData).map((entry) => entry.kg),
          backgroundColor: getplainStone(filteredData).map(
            (entry) => entry.color
          ),
          borderColor: getplainStone(filteredData).map((entry) =>
            entry.color.replace("0.3", "1")
          ),
          borderWidth: 1,
        },
      ],
    });

    setSubproduct({
      labels: sortedSubproductData.map((entry) => entry.sub_product),
      datasets: [
        {
          label: "KG Count by Sub Product",
          data: sortedSubproductData.map((entry) => entry.kg),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "#215e5e",
          borderWidth: 1,
        },
      ],
    });

    const calculateTotalWeight = (data) => {
      const weightMap = {};

      data.forEach((order) => {
        const photoNo = order["PHOTO NO 2"];
        const project = order.PROJECT;
        const weight = order.WT;

        const key = `${photoNo} - ${project}`;

        if (weightMap[key]) {
          weightMap[key].WT += weight;
        } else {
          weightMap[key] = {
            "PHOTO NO 2": photoNo,
            PROJECT: project,
            WT: weight,
          };
        }
      });

      return Object.values(weightMap);
    };

    const uniqueOrdersByWeight = calculateTotalWeight(sortedData);

    const top25Orders = uniqueOrdersByWeight
      .sort((a, b) => b.WT - a.WT)
      .slice(0, 25);

    setOrderData(top25Orders);

    const calculateTotalWeightByGroup = (data) => {
      const weightMap = {};

      data.forEach((order) => {
        const groupParty = order["Group party"];
        const project = order.PROJECT;
        const weight = order.WT;

        const key = `${groupParty} - ${project}`;

        if (weightMap[key]) {
          weightMap[key].WT += weight; // Sum weights for duplicates
        } else {
          weightMap[key] = {
            "Group party": groupParty,
            PROJECT: project,
            WT: weight,
          }; // Initialize with the first weight
        }
      });

      // Convert weightMap back to an array of objects
      return Object.values(weightMap);
    };

    // Usage
    const uniqueGroupPartyData = calculateTotalWeightByGroup(sortedData);
    const top15GroupParty = uniqueGroupPartyData
      .sort((a, b) => b.WT - a.WT) // Sort by total weight
      .slice(0, 25); // Get top 15

    setgroup_party(top15GroupParty);

    setAllCharts([chartData, purityChartData, typeChartData, zoneChartData]);
    console.log(selectedMonth, selectedYear);
    console.log("Filtered Data:", filteredData);
  };

  // const getMonthName = (index) => {
  //   const months = [
  //     "January", "February", "March", "April", "May", "June",
  //     "July", "August", "September", "October", "November", "December"
  //   ];
  //   return months[index];
  // };

  const handleYearClick = (year) => {
    setSelectedYear(year);
  };

  const filteredLineChartData = () => {
    const yearToDisplay = selectedYear || new Date().getFullYear();

    if (!Array.isArray(chartmonthData.datasets)) {
      console.error(
        "chartmonthData.datasets is not an array:",
        chartmonthData.datasets
      );
      return { labels: [], datasets: [] };
    }

    const monthOrder = [
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

    const filteredData = chartmonthData.labels
      .map((label, index) => {
        const monthDate = new Date(label);
        if (monthDate.getFullYear() === yearToDisplay) {
          return {
            label,
            monthIndex: monthOrder.indexOf(
              monthDate.toLocaleString("default", { month: "long" })
            ),
            data: chartmonthData.datasets.map((dataset) => dataset.data[index]),
          };
        }
<<<<<<< Updated upstream
        return null;
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.monthIndex - b.monthIndex);
    const filteredLabels = filteredData.map((item) => item.label);
    const filteredDatasets = chartmonthData.datasets.map((dataset) => ({
      ...dataset,
      data: filteredData.map((item) => item.data[dataset.index]),
    }));

    return {
      labels: filteredLabels,
      datasets: filteredDatasets.map((dataset, index) => ({
=======
      });

      return Array.from(orderWeightMap.values());
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
        "rgba(221, 160, 221, 0.2)",
        "rgba(250, 128, 114, 0.2)",
        "rgba(240, 230, 140, 0.2)",
        "rgba(175, 238, 238, 0.2)",
        "rgba(255, 228, 196, 0.2)",
        "rgba(224, 255, 255, 0.2)",
        "rgba(238, 130, 238, 0.2)",
        "rgba(245, 222, 179, 0.2)",
        "rgba(103, 58, 183, 0.7)",
        "rgba(96, 125, 139, 0.7)",
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
        }))
        .sort((a, b) => b.kg - a.kg);
    };

    const getProject = (data) => {
      const project_data = data.reduce((acc, item) => {
        const zone = item.PROJECT || "Unknown";
        const wtGrams = item.WT || 0;

        if (!acc[zone]) {
          acc[zone] = 0;
        }
        acc[zone] += wtGrams;

        return acc;
      }, {});

      return Object.entries(project_data)
        .filter(([project, grams]) => grams > 0)
        .map(([project, grams]) => ({
          project,
          kg: grams / 1000,
        }));
    };

    const getProduct = (data) => {
      const product_data = data.reduce((acc, item) => {
        const product = item.PRODUCT || "Unknown";
        const wtGrams = item.WT || 0;

        if (!acc[product]) {
          acc[product] = 0;
        }
        acc[product] += wtGrams;

        return acc;
      }, {});

      return Object.entries(product_data)
        .filter(([product, grams]) => grams > 0)
        .map(([product, grams]) => ({
          product,
          kg: grams / 1000,
        }));
    };

    const colorMapping = {
      Y: "rgba(255, 223, 0, 0.6)", // Bright Yellow
      P: "rgba(255, 105, 180, 0.6)", // Bright Pink
      "Y/P": "rgba(255, 165, 79, 0.6)", // Soft Orange (Blend of Yellow and Pink)
      W: "rgba(245, 245, 245, 0.8)", // Off-White
      R: "rgba(255, 69, 58, 0.9)", // Vivid Red
      "W/P": "rgba(255, 182, 193, 0.6)", // Light Pink (White and Pink blend)
      "W/P/Y": "rgba(255, 222, 179, 0.6)", // Soft Beige (White, Pink, Yellow blend)
      "Y/P/W": "rgba(255, 228, 196, 0.6)", // Bisque (Yellow, Pink, White blend)
      "W/Y": "rgba(255, 250, 205, 0.7)", // Lemon Chiffon (White and Yellow blend)
      "Y/Base metal": "rgba(169, 169, 169, 0.6)", // Dim Gray
      Unknown: "rgba(211, 211, 211, 0.6)", // Light Gray
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
        backgroundColor: colorMapping[color] || "rgba(211, 211, 211, 0.6)",
      }));
    };
    const getplainStone = (data) => {
      const purityData = data.reduce((acc, item) => {
        const purity = item["PL-ST"] || "Unknown";
        const wtKg = convertWtToKg(item.WT || 0);
        if (!acc[purity]) {
          acc[purity] = 0;
        }
        acc[purity] += wtKg;

        return acc;
      }, {});

      const colors = [
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
      ];

      return Object.entries(purityData)
        .filter(([purity, kg]) => kg > 0)
        .map(([purity, kg], index) => ({
          purity,
          kg,
          color: colors[index % colors.length],
        }));
    };

    const currentYear = new Date().getFullYear();
    const last4Years = Array.from({ length: 4 }, (_, i) => currentYear - i);

    useEffect(() => {
      setFilteredData(filterByYear(orderData, selectedYear));
    }, [selectedYear, orderData]);

    const filterByYear = (data, year) => {
      return data.filter((item) => item.Dyr === year);
    };

    const fetchedDataRef = useRef(null);

    useEffect(() => {
      if (fetchedDataRef.current) {
        console.log("Using cached data");
        processFetchedData(fetchedDataRef.current);
        setIsLoading(false);
        return;
      }

      fetch("http://localhost:8081/order_receive&new_design")
        .then((response) => response.json())
        .then((data) => {
          fetchedDataRef.current = data; // Cache data
          setOrderData(data);
          processFetchedData(data);
        })
        .catch((error) => console.error("Error fetching data:", error))
        .finally(() => setIsLoading(false));
    }, [theme, filter , isSelected_top15]);

    const getsubproduct = (data) => {
      const sub_product_data = data.reduce((acc, item) => {
        const sub_product = item["SUB PRODUCT"] || "Unknown";
        const wtGrams = item.WT || 0;
  
        if (!acc[sub_product]) {
          acc[sub_product] = 0;
        }
        acc[sub_product] += wtGrams;
  
        return acc;
      }, {});
  
      return Object.entries(sub_product_data)
        .filter(([sub_product, grams]) => grams > 0)
        .map(([sub_product, grams]) => ({
          sub_product,
          kg: grams / 1000,
        }));
    }
  const processFetchedData = (data) => {
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
          setIsLoading(false);

          setYears(Array.from(allYears).sort((a, b) => b - a));
          setMonths(Array.from(allMonths).sort((a, b) => a - b));
          setDates(Array.from(allDates).sort((a, b) => a - b));

          const filteredData = data.filter((item) => {
            const itemDate = new Date(item["DD&month"]);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth() + 1;
            const yearMatch =
              !selectedYear.length || selectedYear.includes(itemYear);
            const monthMatch =
              !selectedMonth.length || selectedMonth.includes(itemMonth);

            return yearMatch && monthMatch;
          });

          console.log("Filtered Data:", filteredData);
          setOverall_data_filtered(filteredData);
          const totalWeightFromAPI =
            filteredData.reduce((total, item) => total + (item.WT || 0), 0) /
            1000;
          setTotalWeight(totalWeightFromAPI);

          const monthData = filteredData.reduce((acc, item) => {
            const date = new Date(item["DD&month"]);
            const year = date.getFullYear();
          const monthIndex = date.getMonth();
          const yearMonth = `${year}, ${getMonthName(monthIndex)}`;
          if (!acc[yearMonth]) acc[yearMonth] = 0;
          acc[yearMonth] += item.WT || 0;
          return acc;
        }, {});

        const yearlyData = filteredData.reduce((acc, item) => {
          const year = new Date(item["DD&month"]).getFullYear();
          if (!acc[year]) acc[year] = 0;
          acc[year] += item.WT || 0;
          return acc;
        }, {});

        setYearlyData(yearlyData);
        setMonthlyData(monthData);

        let sortedData = [...filteredData].sort((a, b) => b.WT - a.WT);
        const istop15 = isSelected_top15;

        const currentZoneData = getZoneData(sortedData);
        const currentProjectData = getProject(sortedData);
        const currentProductData = getProduct(sortedData);
        const currentSubproductData = getsubproduct(sortedData);

        let sortedProjectData = [...currentProjectData].sort(
          (a, b) => b.kg - a.kg
        );
        let sortedProductData = [...currentProductData].sort(
          (a, b) => b.kg - a.kg
        );
        let sortedSubproductData = [...currentSubproductData].sort(
          (a, b) => b.kg - a.kg
        );

        if (istop15) {
          sortedProjectData = sortedProjectData.slice(0, 15);
          sortedProductData = sortedProductData.slice(0, 15);
          sortedSubproductData = sortedSubproductData.slice(0, 15);
        }
        else {
          // Retain the original values when istop15 is false
          sortedProjectData = [...currentProjectData];
          sortedProductData = [...currentProductData];
          sortedSubproductData = [...currentSubproductData];
        }

        let sortedZoneData = [...currentZoneData].sort((a, b) => b.kg - a.kg);
        setChartData({
          labels: getYearlyData(filteredData).map((entry) => entry.year),
          datasets: [
            {
              label: "KG Count per Year",
              data: getYearlyData(filteredData).map((entry) => entry.kg),
              backgroundColor: [
                "rgba(75, 192, 192, 0.2)",
                "rgba(144, 238, 144, 0.2)",
                "rgba(255, 182, 193, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(240, 128, 128, 0.2)",
                "rgba(230, 230, 250, 0.2)",
                "rgba(23, 162, 184, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(103, 58, 183, 0.7)",
                "rgba(96, 125, 139, 0.7)",
              ],
              borderColor: [
                "#215e5e",
                "rgba(144, 238, 144, 1)",
                "rgba(255, 182, 193, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(240, 128, 128, 1)",
                "rgba(230, 230, 250, 1)",
                "rgba(23, 162, 184, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });
        const latestYear = data.reduce((latest, item) => {
          const itemYear = new Date(item["DD&month"]).getFullYear();
          return itemYear > latest ? itemYear : latest;
        }, 0);

        console.log("Latest Year:", latestYear);
        const monthData1 = filteredData.reduce((acc, item) => {
          const date = new Date(item["DD&month"]);
          const year = date.getFullYear();
          const monthIndex = date.getMonth();
          const monthName = getMonthName(monthIndex);

          if (last4Years.includes(year)) {
            const yearMonth = `${year}, ${monthName}`;
            if (!acc[yearMonth]) acc[yearMonth] = 0;
            acc[yearMonth] += item.WT || 0;
          }

          return acc;
        }, {});

        let yearsToDisplay = [];

        if (selectedYear.length === 0) {
          yearsToDisplay = [Math.max(...last4Years)];
        } else {
          yearsToDisplay = selectedYear;
        }

        const selectedYearsData = {};
        const otherYearsData = {};

        for (const key in monthData1) {
          const [year] = key.split(", ");

          if (yearsToDisplay.includes(parseInt(year))) {
            selectedYearsData[key] = monthData1[key];
          } else {
            otherYearsData[key] = monthData1[key];
          }
        }

        const monthOrder = [
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
        const currentYear = new Date().getFullYear();

        const allMonthData = { ...otherYearsData, ...selectedYearsData };
const sortedSelectedYearsData = Object.keys(selectedYearsData)
  .filter(key => {
    // Only keep data for the current year
    const year = parseInt(key.split(", ")[0], 10);
    return year === currentYear;
  })
  .sort((a, b) => {
    const [, monthA] = a.split(", ");
    const [, monthB] = b.split(", ");
    return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
  })
  .reduce((acc, key) => {
    acc[key] = selectedYearsData[key];
    return acc;
  }, {});

const initialDisplayData = { ...sortedSelectedYearsData };

console.log("Initial Display Data (Selected Years):", initialDisplayData);

// Combine current year data with other years' data
const sortedMonthData = {
  ...allMonthData, // Start with all month data
  ...sortedSelectedYearsData, // Add the sorted data for the current year
};

// Sort the combined data based on year and then by month
const sortedKeys = Object.keys(sortedMonthData).sort((a, b) => {
  const [yearA, monthA] = a.split(", ");
  const [yearB, monthB] = b.split(", ");
  return (
    parseInt(yearA, 10) - parseInt(yearB, 10) || // First sort by year
    monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB) // Then sort by month
  );
});

// Create a sorted object based on the keys
const finalSortedMonthData = {};
sortedKeys.forEach(key => {
  finalSortedMonthData[key] = sortedMonthData[key];
});

console.log("Sorted Month Data:", finalSortedMonthData);

// Set chart month data to display based on the sorted month data
setChartmonthData({
  labels: Object.keys(finalSortedMonthData),
  datasets: [
    {
      label: "KG Count per month",
      data: Object.values(finalSortedMonthData).map(value => value / 1000),
      backgroundColor: "rgba(240, 128, 128, 0.2)",
      borderColor: "#ec5f5f",
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
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
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

        setProduct({
          labels: sortedProductData.map((entry) => entry.product),
          datasets: [
            {
              label: "KG Count by product",
              data: sortedProductData.map((entry) => entry.kg),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "#9900cc",
              borderWidth: 1,
            },
          ],
        });

        const colorData = prepareColorData(filteredData);

        setColorChartData({
          labels: colorData.map((entry) => entry.color),
          datasets: [
            {
              label: "KG Count by Color",
              data: colorData.map((entry) => entry.kg),
              backgroundColor: colorData.map((entry) => entry.backgroundColor),
              borderColor: colorData.map((entry) =>
                entry.backgroundColor.replace("0.4", "1")
              ),
              borderWidth: 1,
            },
          ],
        });

        setProjectData({
          labels: sortedProjectData.map((entry) => entry.project),
          datasets: [
            {
              label: "KG Count by Project",
              data: sortedProjectData.map((entry) => entry.kg),
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        });

        setPlainStone({
          labels: getplainStone(filteredData).map((entry) => entry.purity),
          datasets: [
            {
              label: "KG Count by Plain Stone",
              data: getplainStone(filteredData).map((entry) => entry.kg),
              backgroundColor: getplainStone(filteredData).map(
                (entry) => entry.color
              ),
              borderColor: getplainStone(filteredData).map((entry) =>
                entry.color.replace("0.3", "1")
              ),
              borderWidth: 1,
            },
          ],
        });

        
    setSubproduct({
      labels: sortedSubproductData.map((entry) => entry.sub_product),
      datasets: [
        {
          label: "KG Count by Sub Product",
          data: sortedSubproductData.map((entry) => entry.kg),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "#215e5e",
          borderWidth: 1,
        },
      ],
    });


const calculateTotalWeight = (data) => {
  const weightMap = {};

  data.forEach(order => {
    const photoNo = order["PHOTO NO 2"];  
    const project = order.PROJECT;        
    const weight = order.WT;               

    const key = `${photoNo} - ${project}`;

    if (weightMap[key]) {
      weightMap[key].WT += weight; 
    } else {
      weightMap[key] = {
        "PHOTO NO 2": photoNo,
        PROJECT: project,
        WT: weight,
      }; 
    }
  });

  return Object.values(weightMap);
};

const uniqueOrdersByWeight = calculateTotalWeight(sortedData);

const top25Orders = uniqueOrdersByWeight
  .sort((a, b) => b.WT - a.WT) 
  .slice(0, 25); 

setOrderData(top25Orders);


const calculateTotalWeightByGroup = (data) => {
  const weightMap = {};

  data.forEach(order => {
    const groupParty = order["Group party"];
    const project = order.PROJECT;
    const weight = order.WT;

    const key = `${groupParty} - ${project}`; 

    if (weightMap[key]) {
      weightMap[key].WT += weight; // Sum weights for duplicates
    } else {
      weightMap[key] = {
        "Group party": groupParty,
        PROJECT: project,
        WT: weight,
      }; // Initialize with the first weight
    }
  });

  // Convert weightMap back to an array of objects
  return Object.values(weightMap);
};

// Usage
const uniqueGroupPartyData = calculateTotalWeightByGroup(sortedData);
const top15GroupParty = uniqueGroupPartyData
  .sort((a, b) => b.WT - a.WT) // Sort by total weight
  .slice(0, 25); // Get top 15

setgroup_party(top15GroupParty);


        setAllCharts([
          chartData,
          purityChartData,
          typeChartData,
          zoneChartData,
        ]);
        console.log(selectedMonth, selectedYear);
        console.log("Filtered Data:", filteredData);
      
    
}



  // const getMonthName = (index) => {
  //   const months = [
  //     "January", "February", "March", "April", "May", "June",
  //     "July", "August", "September", "October", "November", "December"
  //   ];
  //   return months[index];
  // };

    const handleYearClick = (year) => {
      setSelectedYear(year);
    };
    
  
    const filteredLineChartData = () => {
      const yearToDisplay = selectedYear || new Date().getFullYear();
    
      if (!Array.isArray(chartmonthData.datasets)) {
        console.error("chartmonthData.datasets is not an array:", chartmonthData.datasets);
        return { labels: [], datasets: [] };
      }
    
      const monthOrder = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
    
      const filteredData = chartmonthData.labels
        .map((label, index) => {
          const monthDate = new Date(label);
          if (monthDate.getFullYear() === yearToDisplay) {
            return {
              label,
              monthIndex: monthOrder.indexOf(monthDate.toLocaleString('default', { month: 'long' })),
              data: chartmonthData.datasets.map(dataset => dataset.data[index]),
            };
          }
          return null;
        })
        .filter(item => item !== null) 
        .sort((a, b) => a.monthIndex - b.monthIndex); 
      const filteredLabels = filteredData.map(item => item.label);
      const filteredDatasets = chartmonthData.datasets.map(dataset => ({
>>>>>>> Stashed changes
        ...dataset,
        data: filteredData.map((item) => item.data[index]),
      })),
    };
  };

  const [count, setcount] = useState(0);

  const handleBarClick = (event, elements) => {
    setcount(count + 1);
    if (elements.length > 0) {
      const yearIndex = elements[0].index;
      const selectedYear = parseInt(chartData.labels[yearIndex], 10); // Convert to integer
      console.log("Selected Year:", selectedYear);
      handleYearClick(selectedYear); // Set the selected year
    }
  };

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
        {/* <div
          className={`p-4  m-6 ${
            theme === "light"
            ? "bg-white border-gray-300"
            : "bg-slate-900 border-zinc-800"
          } shadow-lg  flex justify-center items-center space-x-4 m-4 border rounded-lg`}
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
        </div> */}
        <div className="flex justify-end mr-10">
          <button
            onClick={handleFilterClick}
            className={`mr-3 py-2 px-4 font-bold text-sm text-white rounded-lg flex ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            <IoFilterOutline
              size={20}
              className={`${
                theme === "light" ? "text-gray-100" : "text-gray-100"
              } mr-2`}
            />
            Filter
          </button>

          <button
            className={`p-2 rounded ${
              isSelected_top15
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : theme === "light"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
            onClick={handleTop25Click}
          >
            {isSelected_top15 ? (
              <span className="flex items-center justify-between">
                Top 15
                <span className="ml-2 border border-white rounded-full px-1">
                  X
                </span>
              </span>
            ) : (
              "Top 15"
            )}
          </button>
        </div>

        {showDatePickerModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div
              className={` ${
                theme === "light" ? "bg-white" : "bg-gray-900"
              }  rounded-lg shadow-lg p-6 w-[30%]`}
            >
              <h2
                className={` ${
                  theme === "light" ? "text-black" : "text-slate-200"
                } text-lg font-bold mb-4 text-center`}
              >
                Select Date Range
              </h2>
              <div className="mb-4 flex justify-center items-center space-x-4 m-4">
                <CustomMultiSelect
                  theme={theme}
                  options={years}
                  selectedOptions={selectedYear}
                  setSelectedOptions={setSelectedYear}
                  label="Select DD Year"
                  isOpen={openDropdown === "year"}
                  onToggle={() => handleDropdownToggle("year")}
                  onClose={() => setOpenDropdown(null)}
                />
                <CustomMultiSelect
                  theme={theme}
                  options={months}
                  selectedOptions={selectedMonth}
                  setSelectedOptions={setSelectedMonth}
                  label="Select DD Month"
                  isOpen={openDropdown === "month"}
                  onToggle={() => handleDropdownToggle("month")}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleCancelFilter}
                  className={`py-2 px-4 font-bold text-sm text-white rounded-lg ${
                    theme === "light"
                      ? "bg-gray-500 hover:bg-gray-700"
                      : "bg-gray-600 hover:bg-gray-800"
                  }`}
                >
                  Cancel
                </button>

                <button
                  onClick={handleFilter}
                  className="p-2 bg-blue-500 text-white rounded"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`m-4 py-4 px-8 border rounded-lg ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-900 border-zinc-800"
          } shadow-lg`}
        >
          Total : <span className="text-red-500">{totalWeight.toFixed(2)}</span>
        </div>

        <div
          className={`m-4 px-8 border rounded-lg ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-900 border-zinc-800"
          } shadow-lg`}
        >
          <button
            onClick={() => toggleAccordion1(1)}
            className="w-full flex justify-between items-center py-4"
          >
            <span
              className={`text-lg font-semibold ${
                theme === "light" ? "text-slate-800" : "text-slate-300"
              }`}
            >
              Top <span className="text-red-500">25</span> Group party
            </span>
            <span className="text-slate-800 transition-transform duration-300">
              {activeIndex1 === 1 ? (
                <FiMinusCircle
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              ) : (
                <IoIosAddCircleOutline
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              )}
            </span>
          </button>

          <div
            className={`${
              activeIndex1 === 1 ? "max-h-screen" : "max-h-0"
            } overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <div
              className={`m-4 border rounded-lg ${
                theme === "light"
                  ? "border-gray-300 bg-white"
                  : "border-slate-700 bg-slate-800"
              } shadow-lg`}
            >
              <table
                className={`w-full text-left table-auto text-sm ${
                  theme === "light"
                    ? "bg-white text-gray-800"
                    : "bg-slate-800 text-gray-300"
                }`}
              >
                <thead>
                  <tr
                    className={`${
                      theme === "light" ? "bg-gray-200" : "bg-slate-700"
                    }`}
                  >
                    <th
                      className={`p-2 border ${
                        theme === "light"
                          ? "border-gray-200"
                          : "border-gray-700"
                      } text-center`}
                    >
                      Group party
                    </th>
                    <th
                      align="center"
                      className={`p-2 border ${
                        theme === "light"
                          ? "border-gray-200"
                          : "border-gray-700"
                      } text-center`}
                    >
                      Project
                    </th>
                    <th
                      className={`p-2 border ${
                        theme === "light"
                          ? "border-gray-200"
                          : "border-gray-700"
                      } text-center`}
                    >
                      Weight in KG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentdata1.map((item, index) => (
                    <tr key={index}>
                      <td
                        className={`p-2 border ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-700"
                        } text-center`}
                      >
                        {item["Group party"]}
                      </td>
                      <td
                        className={`p-2 border ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-700"
                        } text-center`}
                      >
                        {item.PROJECT}
                      </td>
                      <td
                        className={`p-2 border ${
                          theme === "light"
                            ? "border-gray-200"
                            : "border-gray-700"
                        } text-center`}
                      >
                        {item.WT.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-4 mb-4">
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange1(currentPage1 - 1)}
                  disabled={currentPage1 === 1}
                >
                  Previous
                </button>
                {[...Array(totalpages1)].map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage1 === pageIndex + 1
                        ? "bg-blue-500 text-white"
                        : theme === "light"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => handlePageChange1(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange1(currentPage1 + 1)}
                  disabled={currentPage1 === totalpages1}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`m-4 px-10 border rounded-lg ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-900 border-zinc-800"
          } shadow-lg`}
        >
          <button
            onClick={() => toggleAccordion(1)}
            className="w-full flex justify-between items-center py-5"
          >
            <span
              className={`text-lg font-semibold ${
                theme === "light" ? "text-slate-800" : "text-slate-300"
              }`}
            >
              Top <span className="text-red-500">25</span> Photo no
            </span>
            <span className="text-slate-800 transition-transform duration-300">
              {activeIndex === 1 ? (
                <FiMinusCircle
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              ) : (
                <IoIosAddCircleOutline
                  className={`text-2xl ${
                    theme === "light" ? "text-gray-800" : "text-gray-300"
                  }`}
                />
              )}
            </span>
          </button>

          <div
            className={`${
              activeIndex === 1 ? "max-h-screen" : "max-h-0"
            } overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <div
              className={`m-4 border rounded-lg ${
                theme === "light"
                  ? "border-gray-300 bg-white"
                  : "border-slate-700 bg-slate-800"
              } shadow-lg`}
            >
              <table
                className={`w-full text-left table-auto text-sm ${
                  theme === "light"
                    ? "bg-white text-gray-800"
                    : "bg-slate-800 text-gray-300"
                }`}
              >
                <thead>
                  <tr
                    className={`${
                      theme === "light" ? "bg-gray-200" : "bg-slate-700"
                    }`}
                  >
                    <th className="p-2 border text-center">Photo No 2</th>
                    <th align="center" className="p-2 border text-center">
                      Project
                    </th>
                    <th className="p-2 border text-center">Weight in KG</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2 border text-center">
                        {item["PHOTO NO 2"]}
                      </td>
                      <td className="p-2 border text-center">{item.PROJECT}</td>
                      <td className="p-2 border text-center">
                        {item.WT.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-4 mb-4">
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, pageIndex) => (
                  <button
                    key={pageIndex}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageIndex + 1
                        ? "bg-blue-500 text-white"
                        : theme === "light"
                        ? "bg-gray-200 text-gray-800"
                        : "bg-slate-700 text-gray-300"
                    }`}
                    onClick={() => handlePageChange(pageIndex + 1)}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  className={`mx-1 px-3 py-1 rounded ${
                    theme === "light"
                      ? "bg-gray-200 text-gray-800"
                      : "bg-slate-700 text-gray-300"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-40">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}
          <div
            className={`order-2 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md  h-[450px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Year
            </h2>
            {!isLoading && (
              <div className="w-full h-[98%]">
                <Bar
                  data={chartData}
                  options={{
                    onClick: handleBarClick,
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
              </div>
            )}
          </div>

          <div
            className={`order-1 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            }  p-4 rounded shadow-md  h-[450px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Month
            </h2>
            {!isLoading && (
              <div className="w-full h-[98%]">
                <Line
                  data={count > 0 ? filteredLineChartData() : chartmonthData}
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
                          text: "Month",
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
              </div>
            )}
          </div>

          <div
            className={`order-3 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md  h-[450px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Purity
            </h2>
            {!isLoading && (
              <div className="w-full h-[98%]">
                <Bar
                  data={purityChartData}
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
                            const label = context.label || "";
                            const value = context.raw.toFixed(2);

                            const totalWeight =
                              context.chart.data.datasets[0].data.reduce(
                                (acc, curr) => acc + curr,
                                0
                              );

                            if (totalWeight === 0) {
                              return `${label}: ${value} KG (0%)`;
                            }

                            const percentage = (
                              (context.raw / totalWeight) *
                              100
                            ).toFixed(2);

                            return `${label}: ${value} KG (${percentage}%)`;
                          },
                        },
                      },
                      datalabels: {
                        display: true,
                        align: "end",
                        anchor: "end",
                        formatter: (value, context) => {
                          const totalWeight = getPurityData(
                            overall_data_filtered
                          ).reduce((acc, entry) => acc + entry.kg, 0);
                          if (totalWeight === 0) {
                            return `${value.toFixed(2)} KG (0%)`;
                          }

                          const percentage =
                            totalWeight > 0
                              ? Math.round((value / totalWeight) * 100)
                              : "0.00";

                          return `     (${percentage})%\n${value.toFixed(
                            2
                          )} KG`;
                        },
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
                          text: "Purity",
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
                    onClick: (event, chartElement) =>
                      handleClick_purity_detail(event, chartElement),
                  }}
                  plugins={[ChartDataLabels]}
                />
              </div>
            )}
          </div>
          <div
            className={`order-4 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md 
     h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[450px] 2xl:h-[450px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Order Weight by Zone
            </h2>
            <div className="w-full h-[98%]">
              <Bar
                data={zoneChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      display: true,
                      align: "end",
                      anchor: "end",
                      formatter: (value, context) => {
                        const totalWeight = getZoneData(
                          overall_data_filtered
                        ).reduce((acc, entry) => acc + entry.kg, 0);
                        if (totalWeight === 0) {
                          return `${value.toFixed(2)} KG (0%)`;
                        }

                        const percentage =
                          totalWeight > 0
                            ? ((value / totalWeight) * 100).toFixed(2)
                            : "0.00";

                        return `   (${percentage})%\n${value.toFixed(2)} KG`;
                      },
                      color: theme === "light" ? "black" : "white",
                      font: {
                        weight: "normal",
                      },
                    },
                    legend: {
                      display: true,
                      labels: {
                        color: theme === "light" ? "black" : "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const totalWeight = getZoneData(
                            overall_data_filtered
                          ).reduce((acc, entry) => acc + entry.kg, 0);
                          const percentage = (
                            (context.raw / totalWeight) *
                            100
                          ).toFixed(2);
                          return `KG: ${context.raw.toFixed(
                            2
                          )} (${percentage}%)`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Zone",
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
                  onClick: (event, chartElement) =>
                    handleClick_zone_detail(event, chartElement),
                }}
                plugins={[ChartDataLabels]}
              />
            </div>
          </div>
          <div
            className={`order-8 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md 
     h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[450px] 2xl:h-[500px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Product Data
            </h2>

            <Bar
              data={product}
              options={{
                onClick: (event, elements) => {
                  if (clickTimeout.current) {
                    clearTimeout(clickTimeout.current);
                    clickTimeout.current = null;
                    handleClick_produt_detail(event, elements);
                  } else {
                    // Set a timeout for single-click detection
                    clickTimeout.current = setTimeout(() => {
                      handleChartClick(event, elements);
                      clickTimeout.current = null;
                    }, 300);
                  }
                },
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                  datalabels: {
                    display: true,
                    align: "end",
                    anchor: "end",
                    formatter: (value, context) => {
                      if (
                        value !== undefined &&
                        value !== null &&
                        !isNaN(value)
                      ) {
                        return ` ${value.toFixed(2)} KG`;
                      } else {
                        return "0.00";
                      }
                    },
                    color: theme === "light" ? "black" : "white",
                    font: {
                      weight: "normal",
                    },
                  },
                  legend: {
                    display: true,
                    labels: {
                      color: theme === "light" ? "black" : "white",
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const totalWeight = getProduct(
                          overall_data_filtered
                        ).reduce((acc, entry) => acc + entry.kg, 0);
                        const percentage = (
                          (context.raw / totalWeight) *
                          100
                        ).toFixed(2);
                        return `KG: ${context.raw.toFixed(2)} (${percentage}%)`;
                      },
                    },
                  },
                },
                scales: {
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
          </div>
          <div
            className={`order-5 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            }  p-4 rounded shadow-md  h-[500px]`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Plain Stone
            </h2>
            {!isLoading && (
              <div className="w-full h-[98%]">
                <Pie
                  data={plainStone}
                  options={{
                    onClick: handleClick_plain_stone_detail,
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                      padding: {
                        top: 20,
                      },
                    },

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
                            const totalWeight = getplainStone(
                              overall_data_filtered
                            ).reduce((acc, entry) => acc + entry.kg, 0);
                            const percentage = (
                              (context.raw / totalWeight) *
                              100
                            ).toFixed(2);
                            return `KG: ${context.raw.toFixed(
                              2
                            )} (${percentage}%)`;
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
                          text: "Plain Stone",
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
              </div>
            )}
          </div>
          <div
            className={`order-4 col-span-1 ${
              theme === "light" ? "bg-white " : "bg-slate-900"
            } p-4 rounded shadow-md overflow-auto h-[700px] custom-scrollbar`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Project Data
            </h2>

            <Bar
              data={projectData}
              options={{
                onClick: handleClick_project_detail,
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                  datalabels: {
                    display: true,
                    align: "end",
                    anchor: "end",
                    formatter: (value, context) => {
                      return ` ${value.toFixed(2)} KG`;
                    },
                    color: theme === "light" ? "black" : "white",
                    font: {
                      weight: "normal",
                    },
                  },
                  legend: {
                    display: true,
                    labels: {
                      color: theme === "light" ? "black" : "white",
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const totalWeight = getProject(
                          overall_data_filtered
                        ).reduce((acc, entry) => acc + entry.kg, 0);
                        const percentage = (
                          (context.raw / totalWeight) *
                          100
                        ).toFixed(2);
                        return `KG: ${context.raw.toFixed(2)} (${percentage}%)`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "KG Count",
                      color: theme === "light" ? "black" : "#94a3b8",
                    },
                    beginAtZero: true,
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
                      text: "Project",
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
                },
                onClick: (event, chartElement) =>
                  handleClick_project_detail(event, chartElement),
              }}
              type="bar"
              plugins={[ChartDataLabels]}
            />
          </div>
          <div
            className={`order-4 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md h-[700px] flex flex-col`}
          >
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Color Distribution
            </h2>
            <div className="flex-1 w-full h-full overflow-hidden flex justify-center items-center">
              <div className="w-[500px] h-[500px]">
                <Doughnut
                  data={colorChartData}
                  options={{
                    onClick: (event, elements) =>
                      handleClick_color_detail(event, elements),
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: true,
                        labels: {
                          color: theme === "light" ? "black" : "white",
                          generateLabels: function (chart) {
                            const data = chart.data;
                            if (
                              !data ||
                              !data.datasets ||
                              !data.datasets[0] ||
                              !data.datasets[0].data
                            ) {
                              return [];
                            }

                            const totalWeight = data.datasets[0].data.reduce(
                              (acc, curr) => acc + curr,
                              0
                            );

                            return data.labels.map((label, index) => {
                              const value = data.datasets[0].data[index];
                              const percentage =
                                totalWeight === 0
                                  ? 0
                                  : ((value / totalWeight) * 100).toFixed(2);
                              const fontColor =
                                theme === "light" ? "black" : "white";
                              const isHidden =
                                chart.getDatasetMeta(0).data[index].hidden;
                              return {
                                text: `${label} (${percentage}%)`,
                                fillStyle:
                                  data.datasets[0].backgroundColor[index],
                                strokeStyle:
                                  data.datasets[0].borderColor[index],
                                lineWidth: 1,
                                hidden: isHidden,
                                index: index,
                                fontColor: fontColor,
                                fontStyle: isHidden ? "line-through" : "normal",
                              };
                            });
                          },
                        },
                        onClick: function (e, legendItem, legend) {
                          const index = legendItem.index;
                          const ci = legend.chart;
                          const meta = ci.getDatasetMeta(0);

                          meta.data[index].hidden = !meta.data[index].hidden;
                          ci.update();
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.raw.toFixed(2);
                            const totalWeight =
                              context.chart.data.datasets[0].data.reduce(
                                (acc, curr) => acc + curr,
                                0
                              );

                            if (totalWeight === 0) {
                              return `${label}: ${value} KG (0%)`;
                            }

                            const percentage = (
                              (context.raw / totalWeight) *
                              100
                            ).toFixed(2);

                            return `${label}: ${value} KG (${percentage}%)`;
                          },
                        },
                      },
                      datalabels: {
                        display: false,
                      },
                    },
                  }}
                  plugins={[ChartDataLabels]}
                />
              </div>
            </div>
          </div>
          <div
            className={`order-9 col-span-1 ${
              theme === "light" ? "bg-white" : "bg-slate-900"
            } p-4 rounded shadow-md 
   h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[450px] 2xl:h-[600px]`}
          >
<<<<<<< Updated upstream
            <h2
              className={`text-md font-bold ${
                theme === "light" ? "text-slate-800" : "text-slate-400"
              }`}
            >
              Sub Product Data
            </h2>
            <Bar
              data={subproduct}
              options={{
                onClick: (event, chartElement) =>
                  handle_subproduct_detail(event, chartElement),
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "y",
                plugins: {
                  datalabels: {
                    display: true,
                    align: "end",
                    anchor: "end",
                    formatter: (value, context) => {
                      if (
                        value !== undefined &&
                        value !== null &&
                        !isNaN(value)
                      ) {
                        return ` ${value.toFixed(2)} KG`;
                      } else {
                        return "0.00";
                      }
                    },
=======
            Sub Product wise
          </h2>

          <Bar
            data={subproduct}
            options={{
              onClick: (event, chartElement) =>
                handleClick_subprodut_detail(event, chartElement),
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: "y",
              plugins: {
                datalabels: {
                  display: true,
                  align: "end",
                  anchor: "end",
                  formatter: (value, context) => {
                    if (value !== undefined && value !== null && !isNaN(value)) {
                      return ` ${value.toFixed(2)} KG`;
                    } else {
                      return "0.00";
                    }
                  },
                  color: theme === "light" ? "black" : "white",
                  font: {
                    weight: "normal",
                  },
                },
                legend: {
                  display: true,
                  labels: {
>>>>>>> Stashed changes
                    color: theme === "light" ? "black" : "white",
                    font: {
                      weight: "normal",
                    },
                  },
                  legend: {
                    display: true,
                    labels: {
                      color: theme === "light" ? "black" : "white",
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const totalWeight = getsubproduct(
                          overall_data_filtered
                        ).reduce((acc, entry) => acc + entry.kg, 0);
                        const percentage = (
                          (context.raw / totalWeight) *
                          100
                        ).toFixed(2);
                        return `KG: ${context.raw.toFixed(2)} (${percentage}%)`;
                      },
                    },
                  },
                },
                scales: {
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default New_Design;
