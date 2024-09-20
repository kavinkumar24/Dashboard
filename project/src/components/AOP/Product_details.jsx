import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import Sidebar from '../Sidebar';

function ProductDetailsPage() {
  const { pltcode } = useParams();
  const {dept} = useParams();
  const [pendingData, setPendingData] = useState([]);
  const [jewelData, setJewelData] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [depart_mapping, setdepart_mapping] = useState({});

  const [search, setSearch] = useState("");

  const [groupedProducts, setGroupedProducts] = useState({});
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    const fetchData = async () => {
      try {
          const pendingResponse = await axios.get('http://localhost:8081/pending_data');
          setPendingData(pendingResponse.data);  

          const depart_mapping_response = await axios.get('http://localhost:8081/department-mappings');
          
          const jewelResponse = await axios.get('http://localhost:8081/jewel-master');
          setJewelData(jewelResponse.data || []);  
          let departMappingArray = Array.isArray(depart_mapping_response.data)
          ? depart_mapping_response.data
          : Object.entries(depart_mapping_response.data).map(([key, value]) => ({ key, ...value }));

      setdepart_mapping(departMappingArray);
      console.log("sets", departMappingArray);
          
        const filteredPendingData = pendingResponse.data?.filter(item => item.PLTCODE1 === pltcode) || [];

        const selected_department = departMappingArray.filter(item => item.key === dept);
        console.log("selected_department", selected_department);
        console.log("selected_department", selected_department[0].to);

    

        const filtered_pending_department = filteredPendingData.filter(item =>
          selected_department[0].to.some(dept => dept.trim().toLowerCase() === item.TODEPT.toLowerCase()) // Trim to remove any extra spaces
      );
        console.log("filtered_pending_departmefcsdxnt", filtered_pending_department);
        const complexities = filtered_pending_department.map(item => item.COMPLEXITY1);
        console.log("complexities", complexities);
  
        
        const filteredJewelData = jewelResponse.data?.filter(item => complexities.includes(item.JewelCode)) || [];
        console.log("filtered", filteredJewelData);
        setProductDetails(filteredJewelData);
  
        // Group by product and count
        const groupedProducts = groupByProduct(filteredJewelData, filtered_pending_department);
        setGroupedProducts(groupedProducts);
        console.log("groupedProducts", groupedProducts);
      } catch (error) {
        setError('Error fetching data');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [pltcode]);
  
  
  
  const groupByProduct = (jewelData = [], pendingData = []) => {
    if (!jewelData || !pendingData) {
      console.log("jewelData", jewelData);
      console.error("jewelData or pendingData is undefined");
      return {};  
    }
  
    return jewelData.reduce((acc, jewelItem) => {
      // Ensure we have the necessary fields before proceeding
      const matchingPendingData = pendingData?.filter(pendingItem => pendingItem.COMPLEXITY1 === jewelItem.JewelCode) || [];
  
      if (!jewelItem.Product || matchingPendingData.length === 0) return acc;
  
      // Initialize product count if not already in accumulator
      if (!acc[jewelItem.Product]) {
        acc[jewelItem.Product] = { count: 0, subProducts: {} };
      }
  
      // Increment product count based on matched pending data
      acc[jewelItem.Product].count += matchingPendingData.length;
  
      // Handle sub-products, default to 'Unknown' if not present
      const subProduct = jewelItem['sub Product'] || 'Unknown';
      if (subProduct) {
        if (!acc[jewelItem.Product].subProducts[subProduct]) {
          acc[jewelItem.Product].subProducts[subProduct] = 0;
        }
        // Increment sub-product count based on matched pending data
        acc[jewelItem.Product].subProducts[subProduct] += matchingPendingData.length;
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
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{Object.keys(groupedProducts).map(product => (
        <div key={product} className={`p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative ${theme === 'light' ? 'text-gray-800 bg-white' : 'text-gray-300 bg-slate-600'}`}>
            {/* <div className="text-xl font-semibold mb-2 flex justify-between flex-col">
              <div className={`p-1 rounded-md mb-6 font-normal text-md ${theme==='light'?'bg-blue-200 text-gray-800':'bg-blue-900 text-gray-300'}`}>
                {product}
              </div>
              <span className="bg-purple-200 text-black p-1 h-10">Count: {groupedProducts[product].count}</span>
            </div> */}
        


          <div className={`p-2 mt-2 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-500'}`}>
              <h3 className="font-bold text-lg">{product}</h3>
              <p>Count : <mark className={` rounded-md  px-1 py-0.5  ${theme==='light'?'bg-purple-200 text-black':'bg-purple-900 text-slate-50'}`}>
              {groupedProducts[product].count}
                </mark></p>

             
            </div>
           
          <div className="mt-4 grid grid-cols-2 gap-2">
            {groupedProducts[product]?.subProducts && Object.keys(groupedProducts[product].subProducts).length > 0 ? (
              Object.keys(groupedProducts[product].subProducts).map(subProduct => (
                <div key={subProduct} className={`flex items-center justify-between shadow-md p-1 rounded-md border ${theme==='light'?'bg-slate-100 border-slate-300':'bg-slate-700 border-slate-500 '} `}>
                  <span className="font-medium">{subProduct}:</span> {groupedProducts[product].subProducts[subProduct]}
                </div>
              ))
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
 