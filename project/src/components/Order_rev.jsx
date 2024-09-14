import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import * as XLSX from "xlsx";
import { Bar, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FiMinusCircle } from "react-icons/fi";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { IoFilterOutline } from "react-icons/io5";
import CustomMultiSelect from "./Custom/Mutliselect";
import { Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

function Order_rev() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [openDropdown, setOpenDropdown] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isloading_sort, setIsloading_sort] = useState(false);
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [dates, setDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  
  const [allCharts, setAllCharts] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  
  const [selectedDate, setSelectedDate] = useState([]);
  
  const [activeIndex, setActiveIndex] = useState(null);
  
  const [isSelected, setIsSelected] = useState(true);
  const [isSelected_top15, setIsSelected_top15] = useState(true);
  const[individual_top15,setIndividual_top15]=useState(false);
  const [isSorted, setIsSorted] = useState(true);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);

  const handleFilterClick = () => {
    setShowDatePickerModal(true);
  };

  const handleCancelFilter = () => {
    setShowDatePickerModal(false);
  };

  const handleDropdownToggle = (dropdownType) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  useEffect(() => {
    if (filteredData.length > 0) {
      const chartData = getGroupPartyData(filteredData);
      setGroupParty(chartData);
    }
  }, [filteredData]);
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

  const [subproduct, setSubproduct] = useState({
    labels: [],
    datasets: [],
  });

  const [partywise, setPartywise] = useState({
    labels: [],
    datasets: [],
  });
  const [photo_no_wise, setPhoto_no_wise] = useState({
    labels: [],
    datasets: [],
  });

  const [totalWeight, setTotalWeight] = useState(0);
  const [yearlyData, setYearlyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});

  const handleButtonClick = () => {
    setIsSorted((prevState) => {
      const newSortedState = !prevState;
      setIsSelected(newSortedState);

      setIsloading_sort(true);

      return newSortedState;
    });
  };

  const handleTop25Click = () => {

    setIsSelected_top15((prevState) => {
      const newTop15State = !prevState;
      setIsloading_sort(true); 
      return newTop15State;
    });

  };
  const handle_individual_click = ()=> {
    setIndividual_top15((prevstate)=>{
    const new_top15_individual = !prevstate;
    setIsloading_sort(true);
    return new_top15_individual;
  });
}

  

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

  const [filter, setfilter] = useState(false);
  const handleFilter = () => {
    setIsLoading(true);
    setShowDatePickerModal(false);

    setfilter(!filter);
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

  
  const [groupedData, setGroupedData] = useState([]);
  const groupByProject = (data, isSorted = false) => {
    console.log("isSorted value:", isSorted);
  
    // Group weights by project
    const grouped = data.reduce((acc, item) => {
      const project = item.PROJECT;
      if (!acc[project]) {
        acc[project] = [];
      }
      acc[project].push(item.WT); 
      return acc;
    }, {});
  
    const processedData = Object.keys(grouped).map(project => {
      const weights = grouped[project];
      const top15Weights = [...weights].sort((a, b) => b - a).slice(0, 15); 
      const top15Sum = top15Weights.reduce((sum, weight) => sum + weight, 0); 
      return {
        project,
        kg: top15Sum / 1000,
      };
    });
  
    const sortedData = processedData.sort((a, b) => b.kg - a.kg);
    console.log("Sorted data:", sortedData);
    return sortedData;
  };

  
  function groupBysubproduct_individual(data) {
    const grouped = data.reduce((acc, currentItem) => {
      const subproduct = currentItem.SUBPRODUCT;
      const weight = currentItem.WT;
      
      if (!acc[subproduct]) {
        acc[subproduct] = [];
      }
      acc[subproduct].push(weight);
      return acc;
    }, {});
  
    const finalData = Object.keys(grouped).map(subproduct => {
      const weights = grouped[subproduct];
      const top15Weights = [...weights].sort((a, b) => b - a).slice(0, 15);
      const top15Sum = top15Weights.reduce((sum, weight) => sum + weight, 0);
      return { SUBPRODUCT: subproduct, WT: top15Sum };
    }).sort((a, b) => b.WT - a.WT).slice(0, 15);
  
    return {
      labels: finalData.map(item => item.SUBPRODUCT), 
      datasets: [
        {
          label: "Top 15 Subproducts by Weight",  
          data: finalData.map(item => item.WT), 
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",  
          borderWidth: 1  
        }
      ]
    };
  }
  
  


  

  const getPartywise = (data) => {
    const party_data = data.reduce((acc, item) => {
      const party = item.PRODUCT || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[party]) {
        acc[party] = 0;
      }
      acc[party] += wtGrams;

      return acc;
    }, {});

    return Object.entries(party_data)
      .filter(([party_wise, grams]) => grams > 0)
      .map(([party_wise, grams]) => ({
        party_wise,
        kg: grams / 1000,
      }));
  };

  const getPhoto_no_wise = (data) => {
    const photo_data = data.reduce((acc, item) => {
      const photo = item["PHOTO NO 2"] || "Unknown";
      const wtGrams = item.WT || 0;

      if (!acc[photo]) {
        acc[photo] = 0;
      }
      acc[photo] += wtGrams;

      return acc;
    }, {});

    return Object.entries(photo_data)
      .filter(([photo_wise, grams]) => grams > 0)
      .map(([[photo_wise], grams]) => ({
        photo_wise,
        kg: grams / 1000,
      }));
  };

  const [groupparty, setGroupParty] = useState({
    labels: [],
    datasets: [],
  });
  const getGroupPartyData = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const groupParty = item["Group party"] || "Unknown";
      const weight = item.WT || 0;
  
      if (!acc[groupParty]) {
        acc[groupParty] = [];
      }
      acc[groupParty].push(weight);
  
      return acc;
    }, {});
  
    console.log('Grouped Data:', groupedData);
  
    const processedData = Object.entries(groupedData).map(([groupParty, weights]) => {
      const top15Weights = weights.sort((a, b) => b - a).slice(0, 15);
      const top15Sum = top15Weights.reduce((sum, weight) => sum + weight, 0);
  
      console.log(`Group: ${groupParty}, Top 15 Weights:`, top15Weights, `Sum: ${top15Sum}`);
  
      return {
        groupParty,
        top15Sum,
      };
    });
  
    const top15Groups = processedData
      .sort((a, b) => b.top15Sum - a.top15Sum) 
      .slice(0, 15); 
  
    console.log('Top 15 Groups:', top15Groups);
  
    return {
      labels: top15Groups.map(({ groupParty }) => groupParty), 
      datasets: [
        {
          label: 'Sum of Top 15 Weights',
          data: top15Groups.map(({ top15Sum }) => top15Sum / 1000), 
          fill: false,
          borderColor: '#4caf50', 
          tension: 0.1,
        }
      ]
    };
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


const[chartdata1,setChartData1]=useState({
  labels: [],
  datasets: [],
});

  
  const calculateTop15WeightRanges = (data) => {
    const sortedData = data.sort((a, b) => b.WT - a.WT);
    
    const top15 = sortedData.slice(0, 15);
    
    return top15;
  };
  useEffect(() => {
    fetch("http://localhost:8081/order_receive&new_design")
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);

        const allYears = new Set();
        const allMonths = new Set();
        const allDates = new Set();
        setIsLoading(false);
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
          const itemYear = itemDate.getFullYear();
          const itemMonth = itemDate.getMonth() + 1;
          const itemDateOnly = itemDate.getDate();

          return (
            (selectedYear.length === 0 || selectedYear.includes(itemYear)) &&
            (selectedMonth.length === 0 || selectedMonth.includes(itemMonth)) &&
            (selectedDate.length === 0 || selectedDate.includes(itemDateOnly))
          );
        });

        console.log("Selected Date:", selectedDate);
        console.log("Selected Month:", selectedMonth);
        console.log("Selected Year:", selectedYear);
        console.log("Filtered Data:", filteredData);

        setFilteredData(filteredData);
        const totalWeightFromAPI =
          filteredData.reduce((total, item) => total + (item.WT || 0), 0) /
          1000;
        setTotalWeight(totalWeightFromAPI);

        const yearData = filteredData.reduce((acc, item) => {
          const year = new Date(item.TRANSDATE).getFullYear();
          if (!acc[year]) acc[year] = 0;
          acc[year] += item.WT || 0;
          return acc;
        }, {});

        const monthData = filteredData.reduce((acc, item) => {
          const date = new Date(item.TRANSDATE);
          const year = date.getFullYear();
          const monthIndex = date.getMonth() + 1;
          const yearMonth = `${year}, ${getMonthName(monthIndex)}`;
          if (!acc[yearMonth]) acc[yearMonth] = 0;
          acc[yearMonth] += item.WT || 0;
          return acc;
        }, {});

        let sortedData = [...filteredData].sort((a, b) => b.WT - a.WT);
       console.log(sortedData)
        setYearlyData(yearData);
        setMonthlyData(monthData);

        const istop15 = isSelected_top15;
        const isSorting = isSorted;
        const istop_individual = individual_top15;

        const currentProjectData = getProject(filteredData);
        const currentProductData = getProduct(filteredData);
        const currentSubproductData = getsubproduct(filteredData);

        let sortedProjectData = currentProjectData;
        let sortedProductData = currentProductData;
        let sortedSubproductData = currentSubproductData;
        console.log("found");
        console.log("Top click", istop15);
        console.log("Sorted",isSorted)
        console.log("Individual",individual_top15)
        if (isSorting) {
          sortedProjectData = [...currentProjectData].sort(
            (a, b) => b.kg - a.kg
          );
          sortedProductData = [...currentProductData].sort(
            (a, b) => b.kg - a.kg
          );
          sortedSubproductData = [...currentSubproductData].sort(
            (a, b) => b.kg - a.kg
          );
        }


        if (individual_top15) {
          sortedProjectData = groupByProject(filteredData)
          // let currentProductData = groupByProduct_individual(filteredData)
          // let currentSubproductData = groupBysubproduct_individual(filteredData)
        
          // setProjectData(Currentproject);
          // setProduct(currentProductData);
          // setSubproduct(currentSubproductData);
          setChartData1({
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
          });
        }
        
        // if(istop_individual){
        //   let Currentproject = groupByProject_individual(filteredData);
        //   let currentProductData = groupByProduct_individual(filteredData);
        //   let currentSubproductData = groupBysubproduct_individual(filteredData);
        //   sortedProjectData = Currentproject.slice(0, 15);
        //   sortedProductData = currentProductData.slice(0, 15);
        //   sortedSubproductData = currentSubproductData.slice(0, 15);

        // }

        if (istop15 && isSorting) {
          let Currentproject = getProject(sortedData);
          let currentProductData = getProduct(sortedData);
          let currentSubproductData = getsubproduct(sortedData);

          sortedProjectData = [...Currentproject]
            .sort((a, b) => b.kg - a.kg)
            .slice(0, 15);
          sortedProductData = [...currentProductData]
            .sort((a, b) => b.kg - a.kg)
            .slice(0, 15);
          sortedSubproductData = [...currentSubproductData]
            .sort((a, b) => b.kg - a.kg)
            .slice(0, 15);
        } else if (istop15) {
          sortedProjectData = currentProjectData.slice(0, 15);
          sortedProductData = currentProductData.slice(0, 15);
          sortedSubproductData = currentSubproductData.slice(0, 15);
        }


       

        
        setChartData({
          labels: Object.keys(yearData),
          datasets: [
            {
              label: "KG Count per Year",
              data: Object.values(yearData).map((value) => value / 1000),
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
        setChartmonthData({
          labels: Object.keys(monthData),
          datasets: [
            {
              label: "KG Count per Month",
              data: Object.values(monthData).map((value) => value / 1000),
              backgroundColor: "rgba(240, 128, 128, 0.2)",
              borderColor: "#ec5f5f",
              borderWidth: 1,
            },
          ],
        });

        setPurityChartData({
          labels: getPurityData(filteredData).map((entry) => entry.purity),
          datasets: [
            {
              label: "KG Count by Purity",
              data: getPurityData(filteredData).map((entry) => entry.kg),
              backgroundColor: getPurityData(filteredData).map(
                (entry) => entry.color
              ),
              borderColor: getPurityData(filteredData).map((entry) =>
                entry.color.replace("0.3", "1")
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
              label: "KG Count by Product",
              data: sortedProductData.map((entry) => entry.kg),
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "#9900cc",
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
    //     setGroupParty({
    //       labels: Object.keys(groupedData), // X-axis labels
    // datasets: [
    //   {
    //     label: 'Total Weight',
    //     data: Object.values(groupedData).map(weight => weight / 1000), // Convert grams to kilograms
    //     fill: false,
    //     borderColor: '#4caf50', // Line color
    //     tension: 0.1,
    //   }
    // ]
    //     })
        setAllCharts([
          chartData,
          purityChartData,
          typeChartData,
          zoneChartData,
        ]);
        console.log(selectedDate, selectedMonth, selectedYear);
        console.log("Filtered Data:", filteredData);
        setIsloading_sort(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [theme, filter, isSorted, isSelected,isSelected_top15,individual_top15]);

  const chartComponents = [
    <div className="" key="total-weight">
      <div
        className={`order-1 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        }  p-4 rounded shadow-md overflow-x-auto h-[450px]`}
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
    </div>,
    <div className="" key="total-weight-month">
      <div
        className={`order-1 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        }  p-4 rounded shadow-md overflow-x-auto h-[450px]`}
      >
        {!isLoading && (
          <Bar
            data={chartmonthData}
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
    </div>,

    <div className="" key="kg-per-year-chart">
      <div
        className={`order-2 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        } p-4 rounded shadow-md h-[450px] flex flex-col`}
      >
        <h2
          className={`text-sm font-thin text-center ${
            theme === "light" ? "text-slate-800" : "text-slate-400"
          }`}
        >
          Purity
        </h2>
        {!isLoading && (
          <div className="flex-1 w-full h-full overflow-hidden">
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
                      usePointStyle: false,
                      boxWidth: 0,
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
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Purity",
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      color: theme === "light" ? "#e5e7eb" : "#4b5563",
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
                        color: theme === "light" ? "#e5e7eb" : "#4b5563",
                      },
                      ticks: {
                        color: theme === "light" ? "black" : "#94a3b8",
                      },
                      border: {
                        color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                      },
                    },
                  },
                  datalabels: {
                    display: true,
                    align: "end",
                    anchor: "end",
                    formatter: (value, context) => {
                      const totalWeight = getPurityData(filteredData).reduce(
                        (acc, entry) => acc + entry.kg,
                        0
                      );
                      if (totalWeight === 0) {
                        return `${value.toFixed(2)} KG (0%)`;
                      }

                      const percentage =
                        totalWeight > 0
                          ? Math.round((value / totalWeight) * 100)
                          : "0.00";

                      return `     (${percentage})%\n${value.toFixed(2)} KG`;
                    },
                    color: theme === "light" ? "black" : "white",
                    font: {
                      weight: "normal",
                    },
                  },
                },
              }}
              plugins={[ChartDataLabels]}
            />
          </div>
        )}
      </div>
    </div>,
    <div className="" key="purity-wise-chart">
      <div
        className={`order-2 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        }  p-4 rounded shadow-md   h-[450px]`}
      >
        <h2
          className={`text-sm font-thin ${
            theme === "light" ? "text-slate-800" : "text-slate-400"
          }`}
        >
          Order Weight by Zone
        </h2>
        <div className="w-full h-full">
          <Bar
            data={zoneChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: (event, elements) => {
                if (elements.length > 0) {
                  const elementIndex = elements[0].index;
                  const clickedZone = zoneChartData.labels[elementIndex];
                  navigate(`/zone-detail/${encodeURIComponent(clickedZone)}`);
                }
              }
            ,
              plugins: {
                datalabels: {
                  display: true,
                  align: "end",
                  anchor: "end",
                  formatter: (value, context) => {
                    const totalWeight = getZoneData(filteredData).reduce(
                      (acc, entry) => acc + entry.kg,
                      0
                    );
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
                      const totalWeight = getZoneData(filteredData).reduce(
                        (acc, entry) => acc + entry.kg,
                        0
                      );
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
            }}
            plugins={[ChartDataLabels]}
          />
        </div>
      </div>
    </div>,
    <div className="" key="zone-wise-chart">
      <div
        className={`order-2 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        } p-4 rounded shadow-md h-[700px] flex flex-col`}
      >
        <h2
          className={`text-sm font-thin ${
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
                            fillStyle: data.datasets[0].backgroundColor[index],
                            strokeStyle: data.datasets[0].borderColor[index],
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
    </div>,
    <div className="" key="color-wise-chart">
      <div
        className={`order-3 col-span-1 ${
          theme === "light" ? "bg-white " : "bg-slate-900"
        } p-4 rounded shadow-md overflow-auto h-[700px] custom-scrollbar`}
      >
        <h2
          className={`text-xl font-bold mb-4 mt-8 ${
            theme === "light" ? "text-slate-800" : "text-slate-400"
          }`}
        >
          Project Data
        </h2>

        <Bar
         data={projectData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
              datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value, context) => {
                  if (value !== undefined && value !== null && !isNaN(value)){
                  return ` ${value.toFixed(2)} KG`;
                 }
                 else{
                  return '0.00'
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
                    const totalWeight = getProject(filteredData).reduce(
                      (acc, entry) => acc + entry.kg,
                      0
                    );
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
                  text: "Project}",
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
          type="bar"
          plugins={[ChartDataLabels]}
        />
      </div>
    </div>,
    <div className="" key="project-wise-chart">
      <div
        className={`order-3 col-span-1 p-4 rounded shadow-md h-[790px] overflow-auto custom-scrollbar ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 mt-8 ${
            theme === "light" ? "text-slate-800" : "text-slate-400"
          }`}
        >
          Product Data
        </h2>

        <Bar
          data={product}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
              datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value, context) => {
                  if (value !== undefined && value !== null && !isNaN(value)){
                   return ` ${value.toFixed(2)} KG`;
                  }
                  else{
                   return '0.00'
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
                    const totalWeight = getProduct(filteredData).reduce(
                      (acc, entry) => acc + entry.kg,
                      0
                    );
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
                  text: "Products",
                  color: theme === "light" ? "black" : "#94a3b8",
                },
                ticks: {
                  autoSkip: true,
                  color: theme === "light" ? "black" : "#94a3b8",
                },
                grid: {
                  display: true,
                  color: theme === "light" ? "#e5e7eb" : "#374151",
                },
                border: {
                  color: theme === "light" ? "#e5e7eb" : "#94a3b8",
                },
              },
            },
          }}
          type="bar"
          plugins={[ChartDataLabels]}
        />
      </div>
    </div>,
    <div className="" key="product-wise-chart">
      <div
        className={`order-3 col-span-1 ${
          theme === "light" ? "bg-white" : "bg-slate-900"
        } p-4 rounded shadow-md overflow-auto h-[790px] custom-scrollbar`}
      >
        <h2
          className={`text-xl font-bold mb-4 mt-8 ${
            theme === "light" ? "text-slate-800" : "text-slate-400"
          }`}
        >
          Sub Product Distribution
        </h2>

        <Bar
          data={subproduct}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
              datalabels: {
                display: true,
                align: "end",
                anchor: "end",
                formatter: (value, context) => {
                  if (value !== undefined && value !== null && !isNaN(value)){
                  return ` ${value.toFixed(2)} KG`;
                 }
                 else{
                  return '0.00'
                 }
                },
                color: theme === "light" ? "black" : "white",
                font: {
                  weight: "normal",
                },
              },
              legend: {
                display: true,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const totalWeight = getsubproduct(filteredData).reduce(
                      (acc, entry) => acc + entry.kg,
                      0
                    );
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
                  text: "Color",
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
                  text: "Sub Products",
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
    </div>,
    <div key="group party-wise-chart">
    <div
    className={`order-1 col-span-1 ${
      theme === "light" ? "bg-white" : "bg-slate-900"
    }  p-4 rounded shadow-md overflow-x-auto h-[450px]`}
  >
    {!isLoading && (
       <Line
       data={groupparty}
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
               text: "Group Party",
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
    )}
  </div>
  </div>,

    
  ];
  const itemsPerPage = 4;
  const totalPages = Math.ceil(chartComponents.length / itemsPerPage);

  const currentPageCharts = chartComponents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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

  return (
    <div
      className={`min-h-screen w-[180%] md:w-[100%] flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header theme={theme} dark={setTheme} />
        {/* <div
          className={`p-4 ${
            theme == "light" ? "bg-white" : "bg-slate-900"
          } shadow-md flex justify-center items-center space-x-4 m-4`}
        >
         
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
          <div className="flex justify-between space-x-2">
            <button
              className={`p-2 rounded ${
                isSelected
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
              onClick={handleButtonClick}
            >
              {isSelected ? (
                <span className="flex items-center justify-between">
                  Sort charts
                  <span className="ml-2 border border-white rounded-full px-1">
                    X
                  </span>
                </span>
              ) : (
                "Sort charts"
              )}
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

            <button
              className={`p-2 rounded ${
                individual_top15
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : theme === "light"
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
              onClick={handle_individual_click}
            >
              {individual_top15 ? (
                <span className="flex items-center justify-between">
                  Top 15 individual
                  <span className="ml-2 border border-white rounded-full px-1">
                    X
                  </span>
                </span>
              ) : (
                "Top 15 individual"
              )}
            </button>

          </div>
        </div>
        {showDatePickerModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div
              className={` ${
                theme === "light" ? "bg-white" : "bg-gray-900"
              }  rounded-lg shadow-lg p-6 w-[50%]`}
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
                  label="Select Year"
                  isOpen={openDropdown === "year"}
                  onToggle={() => handleDropdownToggle("year")}
                  onClose={() => setOpenDropdown(null)}
                />
                <CustomMultiSelect
                  theme={theme}
                  options={months}
                  selectedOptions={selectedMonth}
                  setSelectedOptions={setSelectedMonth}
                  label="Select Month"
                  isOpen={openDropdown === "month"}
                  onToggle={() => handleDropdownToggle("month")}
                  onClose={() => setOpenDropdown(null)}
                />
                <CustomMultiSelect
                  theme={theme}
                  options={dates}
                  selectedOptions={selectedDate}
                  setSelectedOptions={setSelectedDate}
                  label="Select Date"
                  isOpen={openDropdown === "date"}
                  onToggle={() => handleDropdownToggle("date")}
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
        <div className="p-2">
          {/* <div className="col-span-1 lg:col-span-2 order-1">
          <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-900 text-slate-300'} p-6 rounded shadow-md text-center font-semibold`}>
            Total Weight: {totalWeight.toFixed(2)} KG
          </div>
        </div> */}
        </div>
        <div
          className={`m-6 px-10 border rounded-lg   ${
            theme === "light"
              ? "bg-white border-gray-300"
              : "bg-slate-900 border-zinc-800"
          }  shadow-lg`}
        >
          <h1
            className={`text-xl font-semibold p-2 pl-0 py-5 ${
              theme === "light" ? "text-slate-800" : "text-slate-300"
            }`}
          >
            Total Weight:{" "}
            <span className="text-red-500">{totalWeight.toFixed(2)} KG</span>
          </h1>
          <div
            className={`border-b ${
              theme === "light" ? "border-slate-300" : "border-slate-600"
            }`}
          >
            <button
              onClick={() => toggleAccordion(1)}
              className="w-full flex justify-between items-center py-5 text-slate-800"
            >
              <span
                className={`text-lg font-semibold ${
                  theme === "light" ? "text-slate-800" : "text-slate-300"
                }`}
              >
                Details
              </span>
              <span className="text-slate-800 transition-transform duration-300">
                {activeIndex === 1 ? (
                  <div>
                    <FiMinusCircle
                      className={` text-2xl ${
                        theme === "light" ? "text-gray-800" : "text-gray-300"
                      }`}
                    />
                  </div>
                ) : (
                  <div>
                    <IoIosAddCircleOutline
                      className={` text-2xl ${
                        theme === "light" ? "text-gray-800" : "text-gray-300"
                      }`}
                    />
                  </div>
                )}
              </span>
            </button>
            <div
              className={`${
                activeIndex === 1 ? "max-h-screen" : "max-h-0"
              } overflow-hidden transition-all duration-300 ease-in-out`}
            >
              <div
                className={`m-6 border rounded-lg ${
                  theme === "light"
                    ? "border-gray-300 bg-white"
                    : "border-slate-700 bg-slate-800"
                } shadow-lg`}
              >
                <h1
                  className={`text-xl font-semibold p-2 pl-10 py-5 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Based on year and month
                </h1>

                {/* Yearly Data Section */}
                <h2
                  className={`text-lg font-semibold p-2 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Yearly Data
                </h2>
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr
                      className={`${
                        theme === "light"
                          ? "bg-gray-300 text-gray-700"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      <th className="px-12 py-3 text-center font-semibold text-base">
                        Year
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-base">
                        Total Weight (KG)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(yearlyData).map(([year, weight], index) => (
                      <tr
                        key={index}
                        className={`${
                          theme === "light"
                            ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                            : "bg-slate-800 even:bg-slate-700 hover:bg-slate-600"
                        } transition-colors duration-200`}
                      >
                        <td
                          className={`px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base ${
                            theme === "light"
                              ? "text-slate-800"
                              : "text-slate-300"
                          }`}
                        >
                          {year}
                        </td>
                        <td
                          className={`px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base ${
                            theme === "light"
                              ? "text-slate-800"
                              : "text-slate-300"
                          }`}
                        >
                          {(weight / 1000).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Monthly Data Section */}
                <h2
                  className={`text-lg font-semibold p-2 ${
                    theme === "light" ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  Monthly Data
                </h2>
                <table className="w-full table-auto text-sm">
                  <thead>
                    <tr
                      className={`${
                        theme === "light"
                          ? "bg-gray-300 text-gray-700"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      <th className="px-0 py-3 text-center font-semibold text-base">
                        Year-Month
                      </th>
                      <th className="px-6 py-3 text-center font-semibold text-base">
                        Total Weight (KG)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlyData).map(
                      ([yearMonth, weight], index) => (
                        <tr
                          key={index}
                          className={`${
                            theme === "light"
                              ? "bg-white even:bg-gray-50 hover:bg-gray-200"
                              : "bg-slate-800 even:bg-slate-700 hover:bg-slate-600"
                          } transition-colors duration-200`}
                        >
                          <td
                            className={`px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base ${
                              theme === "light"
                                ? "text-slate-800"
                                : "text-slate-300"
                            }`}
                          >
                            {yearMonth}
                          </td>
                          <td
                            className={`px-6 py-4 text-center whitespace-nowrap overflow-hidden text-base ${
                              theme === "light"
                                ? "text-slate-800"
                                : "text-slate-300"
                            }`}
                          >
                            {(weight / 1000).toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
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

          {isloading_sort && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-40">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}

          {currentPageCharts}

          <div className="col-span-1 lg:col-span-2 flex justify-center mt-6">
            <button
              onClick={() =>
                setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
              }
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Order_rev;
