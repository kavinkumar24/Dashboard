  import Header from "./Header";
  import Sidebar from "./Sidebar";
  import { useState, useEffect } from "react";

  function Order_rev() {
    const [theme, setTheme] = useState(
      () => localStorage.getItem("theme") || "light"
    );
    const [orderData, setOrderData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [showSlider, setShowSlider] = useState(true);

    useEffect(() => {
      localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
      fetch("http://localhost:8081/order_receive&new_design")
        .then((response) => response.json())
        .then((data) => {
          setOrderData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        });
    }, []);

    const calculateQuantitiesByDate = () => {
      const quantitiesByDate = {};

      orderData.forEach((order) => {
      
        const dateStr = order.TRANSDATE;
        const dateObj = new Date(dateStr);

        if (!isNaN(dateObj.getTime())) {
          const dateKey = dateObj.toISOString().split("T")[0];
          const itemQty = parseFloat(order.Itemqty);

          if (!quantitiesByDate[dateKey]) {
            quantitiesByDate[dateKey] = 0;
          }

          if (!isNaN(itemQty)) {
            if(order.JOBCARDTYPE1==='Auto')
            quantitiesByDate[dateKey] += itemQty;
          }
        }
      
      });

      return quantitiesByDate;
    };

    const convertToKilograms = (grams) => (grams ? grams / 1000 : 0);

    const filterData = () => {
      const quantitiesByDate = calculateQuantitiesByDate();
      if (selectedMonth !== null && selectedYear !== null) {
        return Object.entries(quantitiesByDate).filter(([date]) => {
          const dateObj = new Date(date);
          return (
            dateObj.getMonth() === selectedMonth &&
            dateObj.getFullYear() === selectedYear
          );
        });
      }
      return Object.entries(quantitiesByDate);
    };

    const handleMonthChange = (e) => setSelectedMonth(Number(e.target.value));
    const handleYearChange = (e) => setSelectedYear(Number(e.target.value));
    const handleApplyClick = () => setShowSlider(false);

    const filteredData = filterData();
    const noDataWarning = filteredData.length === 0 && !isLoading;

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

    return (
      <div
        className={`min-h-[120vh] lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
        }`}
      >
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header theme={theme} dark={setTheme} />
          <main className="flex-1 overflow-y-auto p-5 px-0 md:px-16">
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="flex  justify-between space-x-[500px]">
                <h1
                  className={`text-xl font-bold mr-4 mt-10 ${
                    theme === "light" ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  Order Review
                </h1>
                <div className={`flex items-center rounded-md p-3`}>
                  <div className="flex flex-col">
                    <label
                      className={`py-1 -mt-3 ${
                        theme === "light" ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      Month:
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="11"
                        step="1"
                        value={selectedMonth !== null ? selectedMonth : 0}
                        onChange={handleMonthChange}
                        className={`slider-month w-full h-6 p-2 rounded-full ${
                          theme === "light" ? "bg-white" : "bg-gray-600"
                        }`}
                        style={{ position: "relative", appearance: "none" }}
                      />
                      <div
                        className={`absolute top-[30px] left-0 transform -translate-x-1/2 text-xs rounded py-1 px-2 ${
                          theme === "light"
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-900 text-gray-400"
                        }`}
                        style={{
                          left: `${
                            ((selectedMonth !== null ? selectedMonth : 0) / 11) *
                            100
                          }%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {monthNames[selectedMonth] || "Select Month"}
                        <svg
                          className="absolute text-blue-500 w-3 h-2 left-1/2 top-full transform -translate-x-1/2"
                          x="0px"
                          y="0px"
                          viewBox="0 0 255 255"
                          xmlSpace="preserve"
                        >
                          <polygon
                            className="fill-current"
                            points="0,0 127.5,127.5 255,0"
                          ></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label
                      className={`${
                        theme === "light" ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      Year:
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min={2000}
                        max={new Date().getFullYear()}
                        step="1"
                        value={
                          selectedYear !== null
                            ? selectedYear
                            : new Date().getFullYear()
                        }
                        onChange={handleYearChange}
                        className={`slider-year w-full h-6 p-2 rounded-full ${
                          theme === "light" ? "bg-white" : "bg-gray-600"
                        }`}
                        style={{ position: "relative", appearance: "none" }}
                      />
                      <div
                        className={`absolute top-[30px] left-0 transform -translate-x-1/2 bg-gray-200  text-xs rounded py-1 px-2 ${
                          theme === "light"
                            ? "bg-gray-200 text-gray-500"
                            : "bg-gray-900 text-gray-400"
                        }`}
                        style={{
                          left: `${
                            ((selectedYear - 2000) /
                              (new Date().getFullYear() - 2000)) *
                            100
                          }%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        {selectedYear || "Select Year"}
                        <svg
                          className="absolute text-blue-500 w-3 h-2 left-1/2 top-full transform -translate-x-1/2"
                          x="0px"
                          y="0px"
                          viewBox="0 0 255 255"
                          xmlSpace="preserve"
                        >
                          <polygon
                            className="fill-current"
                            points="0,0 127.5,127.5 255,0"
                          ></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              {isLoading ? (
                <div>
                  <div className="animate-pulse flex space-x-4 mt-16">
                    <div className={`rounded-full h-10 w-10`}></div>

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
              ) : noDataWarning ? (
                <p className="text-red-500 mt-10">
                  No data available for the selected month and year.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
                  {filteredData.map(([date, totalQty]) => {
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString("en-GB");
                    const formattedMonth = dateObj.toLocaleString("en-US", {
                      month: "short",
                      year: "2-digit",
                    });
                    const formattedYear = dateObj.getFullYear();

                    return (
                      <div
                        key={date}
                        className={`${
                          theme === "light"
                            ? "bg-white"
                            : "bg-gray-700 text-gray-200"
                        } p-4 rounded shadow-md`}
                      >
                        <div>
                          <div className="grid grid-cols-2 mb-1">
                            <div
                              className={`font-semibold p-2 rounded-md  ${
                                theme === "light"
                                  ? "bg-slate-100"
                                  : "bg-slate-600"
                              }`}
                            >
                              Overall order:
                            </div>
                            <div className={`p-2  ${theme==='light'?'text-gray-900':'text-gray-300'}`}>
                              {convertToKilograms(totalQty).toFixed(2)} kg
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 mb-1">
                          <span
                            className={`font-semibold p-2 rounded-md  ${
                              theme === "light" ? "bg-slate-100" : "bg-slate-600"
                            }`}
                          >
                            Date:
                          </span>

                          <div className={`p-2  ${theme==='light'?'text-gray-900':'text-gray-300'}`}>{formattedDate}</div>
                        </div>
                        <div className="grid grid-cols-2 mb-1">
                          <span
                            className={`font-semibold p-3 rounded-md  ${
                              theme === "light" ? "bg-slate-100" : "bg-slate-600"
                            }`}
                          >
                            Month:
                          </span>{" "}
                          <div className={`p-2  ${theme==='light'?'text-gray-900':'text-gray-300'}`}>{formattedMonth}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <span
                            className={`font-semibold p-3 rounded-md  ${
                              theme === "light" ? "bg-slate-100" : "bg-slate-600"
                            }`}
                          >
                            Year:
                          </span>{" "}
                          <div className={`p-2  ${theme==='light'?'text-gray-900':'text-gray-300'}`}>{formattedYear}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  export default Order_rev;
