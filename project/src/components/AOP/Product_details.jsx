import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import Sidebar from '../Sidebar';

function ProductDetailsPage() {
  const { pltcode } = useParams();
  const [pendingData, setPendingData] = useState([]);
  const [jewelData, setJewelData] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending data
        const pendingResponse = await axios.get('http://localhost:8081/pending_data');
        setPendingData(pendingResponse.data);

        // Fetch jewel data
        const jewelResponse = await axios.get('http://localhost:8081/jewel-master');
        setJewelData(jewelResponse.data);

        // Process data after fetching
        const filteredPendingData = pendingResponse.data.filter(item => item.PLTCODE1 === pltcode);
        const complexities = filteredPendingData.map(item => item.COMPLEXITY1);

        const filteredJewelData = jewelResponse.data.filter(item => complexities.includes(item.JewelCode));
        setProductDetails(filteredJewelData);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pltcode]);

  const groupByProduct = (data) => {
    return data.reduce((acc, item) => {
      if (!item.Product) return acc; 
      if (!acc[item.Product]) {
        acc[item.Product] = { count: 0, subProducts: {} };
      }
      acc[item.Product].count += 1;
      const subProduct = item['sub Product'] || 'Unknown'; 
      if (subProduct) {
        if (!acc[item.Product].subProducts[subProduct]) {
          acc[item.Product].subProducts[subProduct] = 0;
        }
        acc[item.Product].subProducts[subProduct] += 1;
      }
      return acc;
    }, {});
  };

  if (loading) {
    return <div
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
    
  </div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const groupedProducts = groupByProduct(productDetails);

  return (
    <div
      className={`min-h-screen flex ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-gray-800 text-gray-100"
      }`}
    >
      {/* Sidebar */}
      <Sidebar theme={theme} className="w-64 h-screen p-0" />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          onSearch={setSearch}
          theme={theme}
          dark={setTheme}
          className="p-0 m-0"
        />

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Product Details for {pltcode}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(groupedProducts).map(product => (
              <div key={product} className={`shadow-md rounded-lg p-4 border-t-2 border-blue-400  ${theme === 'light' ? 'text-gray-800 bg-white' : 'text-gray-300 bg-slate-600 border-slate-500'}`}>
                <div className="text-xl font-semibold mb-2 flex justify-between">
                  <div className={` p-1 rounded-md mb-6 font-normal text-md ${theme==='light'?'bg-blue-200 text-gray-800':'bg-blue-900 text-gray-300'}`}>
                  {product}</div>
                  <span>Count: {groupedProducts[product].count}</span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  {Object.keys(groupedProducts[product].subProducts).map(subProduct => (
                    <div key={subProduct} className={`${theme==='light'?'bg-slate-100':'bg-slate-700'} p-2 rounded-md`}>
                      <span className="font-medium">{subProduct}:</span> {groupedProducts[product].subProducts[subProduct]}
                    </div>
                  ))}
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
