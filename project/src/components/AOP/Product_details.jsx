import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../Header";
import Sidebar from "../Sidebar";

function ProductDetailsPage() {
    const { pltcode, dept } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [groupedProducts, setGroupedProducts] = useState({});
  const [productionData, setProductionData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});
  const [jewelMasterData, setJewelMasterData] = useState([]); // Declare state for jewel master data
  const [filter_on, setFilter_on] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Define fetchData function before useEffect
;

 
  
  useEffect(() => {
    fetchData();
  }, [])
  
  const groupProducts = (data) => {
    const filteredData = data.filter(
      (item) => item["PROJECT-1"].toLowerCase() === pltcode.toLowerCase()
    );
    const grouped = filteredData.reduce((acc, item) => {
      const product = item.Product;
      const subProduct = item.Sub_Product;
  
      if (!acc[product]) {
        acc[product] = { count: 0, subProducts: {} };
      }
  
      acc[product].count += item.Total;
  
      if (!acc[product].subProducts[subProduct]) {
        acc[product].subProducts[subProduct] = {
          total: 0,
          achieved: 0,
          pending: 0,
        };
      }
      acc[product].subProducts[subProduct].total += item.Total;
  
      return acc;
    }, {});
  
    return grouped; // Return grouped data to use in updateAchievedValues
  };
  
  const fetchData = async () => {
    try {
      const [targetResponse, productionResponse, mappingsResponse, jewelMasterResponse] =
        await Promise.all([
          axios.get("http://localhost:8081/api/target"),
          axios.get("http://localhost:8081/production_data"),
          axios.get("http://localhost:8081/department-mappings"),
          axios.get("http://localhost:8081/jewel-master"),
        ]);
  
      setData(targetResponse.data || []);
      setProductionData(productionResponse.data || []);
      setDepartmentMappings(mappingsResponse.data || {});
  
      const jewelMasterDataArray = Array.isArray(jewelMasterResponse.data) ? jewelMasterResponse.data : [];
      setJewelMasterData(jewelMasterDataArray);
  
      // Group products and update achieved values immediately after data is fetched
      const grouped = groupProducts(targetResponse.data);
      setGroupedProducts(grouped);
      updateAchievedValues(grouped);
    } catch (error) {
      setError("Error fetching data");
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const updateAchievedValues = (grouped) => {
    const updatedGrouped = { ...grouped };
  
    for (const product in updatedGrouped) {
      for (const subProduct in updatedGrouped[product].subProducts) {
        const achievedCount = calculateAchievedCount(subProduct);
        updatedGrouped[product].subProducts[subProduct].achieved = achievedCount;
      }
    }
  
    setGroupedProducts(updatedGrouped);
  };
  
  
  

  const calculateAchievedCount = (subProduct) => {
    let count = 0;

    // Get the department mappings for the passed `dept` or fallback to an empty object
    const deptMappings = departmentMappings[dept] || {};
    const fromDepartments = deptMappings.from || [];
    const toDepartments = deptMappings.to || [];

    // Check if jewelMasterData is an array
    if (Array.isArray(jewelMasterData)) {
        // Filter production data based on the pltcode and department mappings
        const filteredProductionData = productionData.filter((item) => {
            const isMatchingProject = item["Project"]?.toLowerCase() === pltcode.toLowerCase(); 
            const isMatchingDept =
                fromDepartments.includes(item["From Dept"]?.toUpperCase()) &&
                toDepartments.includes(item["To Dept"]?.toUpperCase());
            return isMatchingProject && isMatchingDept; 
        });

        console.log("filteredProductionData:", filteredProductionData);

        // Create a Set of jewel codes for quick lookup
        const jewelCodes = new Set(getJewelCodesForSubProduct(subProduct));
        console.log("jewelCodes:", Array.from(jewelCodes));

        // Create an object to hold counts for each sub category
        const subCategoryCounts = {};

        // For each filtered item, check if its Sub Category exists in jewelMasterData
        filteredProductionData.forEach((item) => {
            const subCategory = item["Sub Category"];

            // Check if the subCategory exists in jewelMasterData
            const jewelMatch = jewelMasterData.find(jewel => jewel["JewelCode"] === subCategory);
            console.log("jewelMatch:", jewelMatch);

            // Check if the jewelMatch exists and if the jewel code is in the set
            if (jewelMatch && jewelCodes.has(jewelMatch["JewelCode"])) {
                const cwQty = item["CW Qty"] || 0; // Default to 0 if CW Qty is not present

                // Aggregate CW Qty for each sub category
                if (subCategoryCounts[subCategory]) {
                    subCategoryCounts[subCategory].cwQty += cwQty;
                } else {
                    subCategoryCounts[subCategory] = {
                        product: jewelMatch["Product"],
                        subProduct: jewelMatch["sub Product"],
                        cwQty: cwQty
                    };
                }
            }
        });

        // Log the counts for each sub category along with their products and sub products
        console.log("Sub Category Counts:");
        for (const [subCategory, details] of Object.entries(subCategoryCounts)) {
            console.log(`Sub Category: ${subCategory}, Product: ${details.product}, Sub Product: ${details.subProduct}, Total CW Qty: ${details.cwQty}`);
        }

        // Sum the total count from the counts object
        count = Object.values(subCategoryCounts).reduce((sum, details) => sum + details.cwQty, 0);
    } else {
        console.warn("jewelMasterData is not an array:", jewelMasterData);
    }

    return count; 
};


useEffect(()=>{
  updateAchievedValues(groupedProducts);

},[productionData,departmentMappings,jewelMasterData])




  const getJewelCodesForSubProduct = (subProduct) => {
    const jewelCodes = [];
    if (Array.isArray(jewelMasterData)) {
      for (const item of jewelMasterData) {
        if (item["sub Product"].toLowerCase() === subProduct.toLowerCase()) {
          jewelCodes.push(item.JewelCode);
        }
      }
    }
    return jewelCodes;
  };

  if (loading) {
    return (
      <div className={`${theme === "light" ? "bg-slate-100" : "bg-slate-800"} min-h-screen flex items-center justify-center`}>
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

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className={`min-h-screen flex ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-gray-800 text-gray-100"}`}>
    <Sidebar theme={theme} className="w-64 h-screen p-0" />
  
    <div className="flex-1 flex flex-col">
      <Header theme={theme} dark={setTheme} className="p-0 m-0" on_filter={setFilter_on} filter={filter_on} />
  
      <main className={`flex-1 p-6 overflow-y-auto ${filter_on ? "opacity-10" : "opacity-100"}`}>
        <h1 className="text-2xl font-bold mb-4">Product Details for {pltcode}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(groupedProducts).length > 0 ? (
            Object.keys(groupedProducts).map((product) => (
              <div key={product} className={`p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative ${theme === "light" ? "text-gray-800 bg-white" : "text-gray-300 bg-slate-600"}`}>
                <div className={`p-2 mt-2 rounded-lg ${theme === "light" ? "bg-slate-100" : "bg-slate-500"}`}>
                  <h3 className="font-bold text-lg">{product}</h3>
                  <p>Count: <mark className={`rounded-md px-1 py-0.5 ${theme === "light" ? "bg-purple-200 text-black" : "bg-purple-900 text-slate-50"}`}>{Math.round(groupedProducts[product].count)}</mark></p>
                </div>
  
                <div className="mt-4">
                  {Object.keys(groupedProducts[product].subProducts).length > 0 ? (
                 <table className="w-full table-fixed border-collapse">
                 <thead className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}>
                   <tr>
                     <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>Sub-Product</th>
                     <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>Target</th>
                     <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>Achieved</th>
                     <th className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>Pending</th>
                   </tr>
                 </thead>
               
                      <tbody>
                        {Object.keys(groupedProducts[product].subProducts).map((subProduct, index) => {
                          const subProductData = groupedProducts[product].subProducts[subProduct];
                          const total = subProductData.total; // Total target
                          const achieved = subProductData.achieved; // Achieved CW Qty
                          const pending = total - achieved; // Calculate pending
  
                          return (
                            <tr key={subProduct} className={index % 2 === 0 ? (theme === "light" ? "bg-gray-100" : "bg-gray-700") : (theme === "light" ? "bg-white" : "bg-gray-800")}>
                              <td className={`border px-2 py-1 ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>{subProduct}</td>
                              <td className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>{total}</td>
                              <td className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>{achieved}</td>
                              <td className={`border px-2 py-1 text-center ${theme === "dark" ? "border-gray-600" : "border-gray-300"}`}>{pending}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p>No sub-products found.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No products found for the specified code.</p>
          )}
        </div>
      </main>
    </div>
  </div>
  
  
  );
}

export default ProductDetailsPage;
