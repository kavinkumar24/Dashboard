import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import axios from "axios";
import debounce from "lodash.debounce";

function Projects() {
  const [productionData, setProductionData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [popupData, setPopupData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const [activeTab, setActiveTab] = useState("");
  const [spin, setSpin] = useState(false);
  const [skeleton, setSkeleton] = useState(true);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [departmentsToShow, setDepartmentsToShow] = useState([]);
  const [viewData, setviewData] = useState(false);
  const [jewelData, setJewelData] = useState([]);
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filter_on, setFilter_on] = useState(false);

  let clickTimeout = null;

  const handleDeptDoubleClick = (dept) => {
    // Clear any existing timeout to avoid triggering single click action
    clearTimeout(clickTimeout);

    // Filter pendingData based on PLTCODE1
    const selectedPendingDetails = pendingData.filter(
      (item) => item.PLTCODE1 === dept
    );

    // Create an object to count occurrences of each unique TODEPT
    const toDeptCounts = selectedPendingDetails.reduce((acc, item) => {
      const toDept = item.TODEPT;
      acc[toDept] = (acc[toDept] || 0) + 1; // Increment count
      return acc;
    }, {});

    // Set the popup data to show the counts
    setPopupData(
      Object.entries(toDeptCounts).map(([key, value]) => ({
        toDept: key,
        count: value,
      }))
    );
    setShowPopup(true); // Show the popup

    handleTabClick(dept);
  };

  const handleDeptClick = (dept) => {
    // Single click action (optional, if needed)
    clickTimeout = setTimeout(() => {
      handleTabClick(dept);
    }, 200); // Delay to determine if it's a double click
  };

  const handleProductCardClick = (product) => {
    // Filter pendingData based on a relevant property, like ITEMID
    const selectedPendingDetails = pendingData.filter(
      (item) => item.PLTCODE1 === product // Use the appropriate property to match
    );

    // Count occurrences of each unique TODEPT
    const toDeptCounts = selectedPendingDetails.reduce((acc, item) => {
      const toDept = item.TODEPT;
      acc[toDept] = (acc[toDept] || 0) + 1;
      return acc;
    }, {});

    // Set the popup data to show the counts
    setPopupData(Object.entries(toDeptCounts)); // Converts to [key, value] format
    setShowPopup(true); // Assuming this opens a modal or popup
  };

  const handleProductSearch = (e) => {
    setProductSearch(e.target.value);
  };
  const [productSearch, setProductSearch] = useState("");
  const sectionRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    setTimeout(() => {
      setSkeleton(false);
    }, 1000);
  }, [skeleton]);

  useEffect(() => {
    if (search !== "") {
      setTimeout(() => {
        if (sectionRef.current) {
          sectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 1000);
    }
  }, [search]);

  const debouncedSearch = debounce((value) => setSearch(value), 500);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productionRes, pendingRes, jewelRes] = await Promise.all([
          fetch("http://localhost:8081/api/production_data"),
          fetch("http://localhost:8081/api/pending_data"),
          axios.get("http://localhost:8081/api/jewel-master"),
        ]);

        const productionData = await productionRes.json();
        const pendingData = await pendingRes.json();
        const allJewelData = jewelRes.data;

        setProductionData(productionData);
        setPendingData(pendingData);
        setJewelData(allJewelData);

        const productionCounts = countDepartments(productionData);
        const pendingCounts = countDepartments(pendingData, true);

        const combinedCounts = {};
        departmentsToShow.forEach((dept) => {
          combinedCounts[dept] = {
            production: productionCounts[dept] || 0,
            pending: pendingCounts[dept] || 0,
            total: (productionCounts[dept] || 0) + (pendingCounts[dept] || 0),
          };
        });
        setDepartmentCounts(combinedCounts);

        const filteredProductDetails = allJewelData.filter(
          (item) =>
            item.Product?.toLowerCase().includes(search.toLowerCase()) ||
            item["sub Product"]?.toLowerCase().includes(search.toLowerCase())
        );
        setProductDetails(filteredProductDetails);

        if (!activeTab && !search) {
          const initialTab =
            departmentsToShow.find((dept) => combinedCounts[dept]?.total > 0) ||
            "";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      }
    };

    fetchData();
  }, [search, departmentsToShow]);

  useEffect(() => {
    const fetchPendingData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:8081/api/pending_data"
        );
        const pendingData = response.data;
        const uniquePLTCodes = [
          ...new Set(pendingData.map((item) => item.PLTCODE1)),
        ];
        setDepartmentsToShow(uniquePLTCodes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pending data:", error);
      }
    };

    fetchPendingData();
  }, []);

  const countDepartments = (data, isPending = false) => {
    const departmentCounts = {};
    data.forEach((item) => {
      const department = isPending
        ? item.PLTCODE1?.toUpperCase()
        : item.pltcode?.toUpperCase();
      if (department) {
        departmentCounts[department] = (departmentCounts[department] || 0) + 1;
      }
    });
    return departmentCounts;
  };

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const [groupedProducts, setGroupedProducts] = useState({});

  useEffect(() => {
    console.log("Pending Data:", pendingData);
    console.log("Product Details:", productDetails);
  }, [pendingData, productDetails]);

  const handleTabClick = async (dept) => {
    setActiveTab(dept);
    setSelectedProject(dept);
    setSpin(true);

    try {
      // Fetch both pending_data and department mappings
      const [pendingResponse, departmentMappingResponse, jewelResponse] =
        await Promise.all([
          axios.get("http://localhost:8081/api/pending_data"),
          axios.get("http://localhost:8081/api/department-mappings"),
          axios.get("http://localhost:8081/api/jewel-master"),
        ]);

      const pendingData = pendingResponse.data;
      const allJewelData = jewelResponse.data;

      const filteredPendingData = pendingData.filter(
        (item) => item.PLTCODE1.toLowerCase() === dept.toLowerCase()
      );

      // Get department mappings
      const departmentMappings = departmentMappingResponse.data;

      // Extract all "to" departments across the department mappings
      const allToDepartments = Object.values(departmentMappings)
        .flatMap((mapping) => mapping.to)
        .map((dept) => dept.trim().toLowerCase());

      console.log("All To Departments:", allToDepartments);

      // Filter pending data based on all "to" departments
      const filtered_pending_department = filteredPendingData.filter((item) =>
        allToDepartments.includes(item.TODEPT.toLowerCase())
      );

      console.log("Filtered Pendkkking dept:", filtered_pending_department);
      const complexities = filtered_pending_department.map((item) =>
        item.COMPLEXITY1.toLowerCase()
      );

      // Filter jewel data based on complexities
      const filteredJewelData = allJewelData.filter((item) =>
        complexities.includes(item.JewelCode.toLowerCase())
      );

      setProductDetails(filteredJewelData);

      // Group by product and count
      const groupedProducts = groupByProduct(
        filteredJewelData,
        filtered_pending_department
      );
      setGroupedProducts(groupedProducts);

      setJewelData(filteredJewelData);

      // console.log("Filtered Pending Data:", filteredPendingByDept);
      console.log("Filtered Jewel Data:", filteredJewelData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error fetching data");
    } finally {
      setSpin(false);
    }
  };

  const groupByProduct = (jewelData = [], pendingData = []) => {
    if (!jewelData || !pendingData) {
      console.log("jewelData", jewelData);
      console.error("jewelData or pendingData is undefined");
      return {};
    }

    return jewelData.reduce((acc, jewelItem) => {
      const matchingPendingData =
        pendingData?.filter(
          (pendingItem) => pendingItem.COMPLEXITY1 === jewelItem.JewelCode
        ) || [];

      if (!jewelItem.Product || matchingPendingData.length === 0) return acc;

      if (!acc[jewelItem.Product]) {
        acc[jewelItem.Product] = { count: 0, subProducts: {} };
      }

      // Increment product count based on matched pending data
      acc[jewelItem.Product].count += matchingPendingData.length;

      // Handle sub-products, default to 'Unknown' if not present
      const subProduct = jewelItem["sub Product"] || "Unknown";
      if (subProduct) {
        if (!acc[jewelItem.Product].subProducts[subProduct]) {
          acc[jewelItem.Product].subProducts[subProduct] = 0;
        }
        // Increment sub-product count based on matched pending data
        acc[jewelItem.Product].subProducts[subProduct] +=
          matchingPendingData.length;
      }

      return acc;
    }, {});
  };

  const filteredGroupedProducts = () => {
    const filteredProducts = Object.keys(groupByProduct(productDetails))
      .filter((product) =>
        product.toLowerCase().includes(productSearch.toLowerCase())
      )
      .reduce((acc, product) => {
        acc[product] = groupedProducts[product];
        return acc;
      }, {});

    Object.keys(filteredProducts).forEach((product) => {
      filteredProducts[product].subProducts = Object.keys(
        filteredProducts[product].subProducts
      )
        .filter((subProduct) =>
          subProduct.toLowerCase().includes(productSearch.toLowerCase())
        )
        .reduce((acc, subProduct) => {
          acc[subProduct] = filteredProducts[product].subProducts[subProduct];
          return acc;
        }, {});
    });

    return filteredProducts;
  };

  // const groupedProducts = groupByProduct(productDetails);
  // const productsToShow = filteredGroupedProducts();

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div
      className={`min-h-screen flex ${
        theme === "light" ? "bg-gray-100" : "bg-gray-800"
      }`}
    >
      {spin && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-200"
          } bg-opacity-50`}
        >
          <div className="flex gap-2 animate-bounce">
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-indigo-600"></div>
          </div>
        </div>
      )}

      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header
          onSearch={setSearch}
          theme={theme}
          dark={setTheme}
          onView={setviewData}
          view={viewData}
          on_filter={setFilter_on}
          filter={filter_on}
        />
        <main
          className={`flex-1 p-6 overflow-y-auto ${
            filter_on === true ? "opacity-10" : "opacity-100"
          }`}
        >
          {loading && (
            <div
              className={`border fixed shadow rounded-md p-4 max-w-full min-h-full inset-0 z-50 w-full md:w-[90%]  ml-0 md:ml-52 mx-auto ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-800 "
                  : "bg-white border-gray-200"
              } sm:ml-0`}
            >
              <div className="animate-pulse flex space-x-4 mt-16">
                <div className={`rounded-fullh-10 w-10`}></div>
                <div className="flex-1 space-y-6 py-10 md:py-1">
                  <div
                    className={`h-2 w-[90%] ${
                      theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                    } rounded`}
                  ></div>
                  <div className="space-y-5 md:space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`h-2 ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded col-span-2`}
                      ></div>
                      <div
                        className={`h-2 w-[70%] ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded col-span-1`}
                      ></div>
                    </div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`h-2 ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                      <div
                        className={`h-2  ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                    </div>

                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`h-2  ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                      <div
                        className={`h-2 ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                    </div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`h-2 ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                      <div
                        className={`h-2  ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                    </div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div
                      className={`h-2 w-[90%] ${
                        theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                      } rounded`}
                    ></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`h-2 ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                      <div
                        className={`h-2  ${
                          theme === "dark" ? "bg-slate-700" : "bg-slate-200"
                        } rounded`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col flex-grow p-4">
            {viewData ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={`${
                      theme === "light" ? "bg-gray-50" : "bg-gray-800"
                    }`}
                  >
                    <tr
                      className={`${
                        theme === "light"
                          ? "bg-slate-700 text-white"
                          : "bg-slate-900 text-white "
                      }`}
                    >
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                        Pending
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-300`}>
                    {departmentsToShow.map(
                      (dept, index) =>
                        departmentCounts[dept] && (
                          <tr
                            key={dept}
                            onClick={handleDeptDoubleClick(dept)}
                            className={`cursor-pointer ${
                              activeTab === dept
                                ? theme === "dark"
                                  ? "bg-gray-500 text-white"
                                  : "bg-slate-300 text-black"
                                : index % 2 === 0
                                ? theme === "dark"
                                  ? "bg-slate-700 text-gray-300"
                                  : "bg-slate-100 text-gray-700"
                                : theme === "dark"
                                ? "bg-gray-800 text-gray-300"
                                : "bg-[#FFFFFF] text-gray-700"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`text-sm font-medium ${
                                  theme === "light"
                                    ? "text-gray-900"
                                    : "text-gray-100"
                                }`}
                              >
                                {dept}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`rounded-lg shadow-md border-solid border w-full h-7 ${
                                  theme === "light"
                                    ? "bg-[#feffd1] border-[#e5ff00] text-[#879300]"
                                    : "bg-gray-800 border-[#7d8808] text-amber-300 shadow-md"
                                }`}
                              >
                                <p className="font-normal text-sm text-center p-1">
                                  Pending:{" "}
                                  <span
                                    className={`font-bold ${
                                      theme === "light"
                                        ? "text-gray-600"
                                        : "text-gray-200"
                                    }`}
                                  >
                                    {departmentCounts[dept].pending}
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-5">
                {departmentsToShow.map((dept) => {
                  const countData = departmentCounts[dept] || { pending: 0 };
                  return (
                    <button
                      key={dept}
                      onClick={() => handleTabClick(dept)}
                      className={`px-4 py-2 rounded-md ${
                        activeTab === dept
                          ? theme === "dark"
                            ? "bg-slate-500 text-white shadow-lg"
                            : "bg-[#CAD4E0] text-black shadow-lg"
                          : theme === "dark"
                          ? "bg-slate-700 text-gray-300 shadow-md"
                          : "bg-[#FFFFFF] text-gray-700 shadow-md"
                      }`}
                    >
                      <div className="flex flex-col space-y-3">
                        <h2
                          className={`font-bold text-lg text-center rounded-md ${
                            theme === "light"
                              ? "text-gray-500"
                              : "text-gray-300"
                          }`}
                        >
                          {dept}
                        </h2>
                        <div
                          className={`rounded-lg shadow-md border-solid border w-full ml-1 h-7 ${
                            theme === "light"
                              ? "bg-[#feffd1] border-[#e5ff00] text-[#879300]"
                              : "bg-gray-800 border-[#7d8808] text-amber-300 shadow-md"
                          }`}
                        >
                          <p className="font-normal text-sm text-center p-1">
                            Pending:{" "}
                            <span
                              className={`font-bold ${
                                theme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-200"
                              }`}
                            >
                              {countData.pending}
                            </span>
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <br></br>
            <div ref={sectionRef}>
              <input
                type="text"
                placeholder="Search Products"
                value={productSearch}
                onChange={handleProductSearch}
                className={`mb-4 p-2 rounded border ${
                  theme === "light" ? "border-gray-300" : "border-gray-600"
                }`}
              />

              {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">TODEPT Counts</h2>
                    <ul>
                      {popupData.map(([toDept, count]) => (
                        <li key={toDept} className="flex justify-between">
                          <span>{toDept}</span>
                          <span>{count}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setShowPopup(false)}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {activeTab && (
                <div className="mt-5">
                  <h1 className="text-lg mb-3">{selectedProject}</h1>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.keys(groupedProducts).map((product) => (
                      <div
                        key={product}
                        className={`p-4 rounded-lg shadow-md border-t-4 border-indigo-300 relative ${
                          theme === "light"
                            ? "text-gray-800 bg-white"
                            : "text-gray-300 bg-slate-600"
                        }`}
                      >
                        {/* <div className="text-xl font-semibold mb-2 flex justify-between flex-col">
              <div className={`p-1 rounded-md mb-6 font-normal text-md ${theme==='light'?'bg-blue-200 text-gray-800':'bg-blue-900 text-gray-300'}`}>
                {product}
              </div>
              <span className="bg-purple-200 text-black p-1 h-10">Count: {groupedProducts[product].count}</span>
            </div> */}

                        <div
                          className={`p-2 mt-2 rounded-lg ${
                            theme === "light" ? "bg-slate-100" : "bg-slate-500"
                          }`}
                        >
                          <h3 className="font-bold text-lg">{product}</h3>
                          <p>
                            Count :{" "}
                            <mark
                              className={` rounded-md  px-1 py-0.5  ${
                                theme === "light"
                                  ? "bg-purple-200 text-black"
                                  : "bg-purple-900 text-slate-50"
                              }`}
                            >
                              {groupedProducts[product].count}
                            </mark>
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {groupedProducts[product]?.subProducts &&
                          Object.keys(groupedProducts[product].subProducts)
                            .length > 0 ? (
                            Object.keys(
                              groupedProducts[product].subProducts
                            ).map((subProduct) => (
                              <div
                                key={subProduct}
                                className={`flex items-center justify-between shadow-md p-1 rounded-md border ${
                                  theme === "light"
                                    ? "bg-slate-100 border-slate-300"
                                    : "bg-slate-700 border-slate-500 "
                                } `}
                              >
                                <span className="font-medium">
                                  {subProduct}:
                                </span>{" "}
                                {
                                  groupedProducts[product].subProducts[
                                    subProduct
                                  ]
                                }
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">
                              No sub-products available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Projects;
