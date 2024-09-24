import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import Sidebar from '../Sidebar';

function ProductDetailsPage() {
  const { pltcode } = useParams();
  const { dept } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [groupedProducts, setGroupedProducts] = useState({});
  const [productionData, setProductionData] = useState([]);
  const [departmentMappings, setDepartmentMappings] = useState({});

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [targetResponse, productionResponse, mappingsResponse] = await Promise.all([
          axios.get('http://localhost:8081/api/target'),
          axios.get('http://localhost:8081/production_data'),
          axios.get('http://localhost:8081/department-mappings')
        ]);

        setData(targetResponse.data || []);
        setProductionData(productionResponse.data || []);
        setDepartmentMappings(mappingsResponse.data || {});

        // Group products after data is fetched
        groupProducts(targetResponse.data);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupProducts = (data) => {
    const filteredData = data.filter(item => item.Project.toLowerCase() === pltcode.toLowerCase());
    const grouped = filteredData.reduce((acc, item) => {
      const product = item.Product;
      const subProduct = item.SubProduct;

      if (!acc[product]) {
        acc[product] = { count: 0, subProducts: {} };
      }

      acc[product].count += item.Total;

      if (!acc[product].subProducts[subProduct]) {
        acc[product].subProducts[subProduct] = { total: 0, achieved: 0, pending: 0 };
      }
      acc[product].subProducts[subProduct].total += item.Total;

      return acc;
    }, {});

    setGroupedProducts(grouped);
    updateAchievedValues(grouped);
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
    const productMappings = departmentMappings['PHOTO'] || {};

    productionData.forEach(item => {
      if (item.SubCategory === subProduct && productMappings.from.includes(item["From Dept"]) && productMappings.to.includes(item["To Dept"])) {
        count += item["CW Qty"] || 0; // Default to 0 if CW Qty is not present
      }
    });

    return count;
  };

  if (loading) {
    return (
      <div className={`${
        theme === "light" ? "bg-slate-100" : "bg-slate-800"
      } min-h-screen flex items-center justify-center`}>
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
        <Header
          theme={theme}
          className="p-0 m-0"
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Product Details for {pltcode}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(groupedProducts).map(product => (
              <div key={product} className={`p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative ${theme === 'light' ? 'text-gray-800 bg-white' : 'text-gray-300 bg-slate-600'}`}>
                <div className={`p-2 mt-2 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-500'}`}>
                  <h3 className="font-bold text-lg">{product}</h3>
                  <p>Count: <mark className={`rounded-md px-1 py-0.5 ${theme === 'light' ? 'bg-purple-200 text-black' : 'bg-purple-900 text-slate-50'}`}>{Math.round(groupedProducts[product].count)}</mark></p>
                </div>

                <div className="mt-4">
                  {Object.keys(groupedProducts[product].subProducts).length > 0 ? (
                    <table className="w-full table-fixed border-collapse">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1 text-left">Sub-Product</th>
                          <th className="border px-2 py-1 text-center">Target</th>
                          <th className="border px-2 py-1 text-center">Achieved</th>
                          <th className="border px-2 py-1 text-center">Pending</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(groupedProducts[product].subProducts).map(subProduct => (
                          <tr key={subProduct}>
                            <td className="border px-2 py-1">{subProduct}</td>
                            <td className="border px-2 py-1 text-center">{Math.round(groupedProducts[product].subProducts[subProduct].total)}</td>
                            <td className="border px-2 py-1 text-center">{Math.round(groupedProducts[product].subProducts[subProduct].achieved)}</td>
                            <td className="border px-2 py-1 text-center">{Math.round(groupedProducts[product].subProducts[subProduct].total) -Math.round(groupedProducts[product].subProducts[subProduct].achieved) }</td>
                          </tr>
                        ))} 
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-sm text-gray-500">No sub-products available</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
