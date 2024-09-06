import Header from "./Header";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx"; // Import XLSX library

function Order_rev() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showSlider, setShowSlider] = useState(true);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // useEffect(() => {
  //   fetch("http://localhost:8081/order_receive&new_design")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setOrderData(data);
  //       setIsLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      fetch("http://localhost:8081/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sheetData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Data uploaded successfully:", data);
          alert("File uploaded and data stored in the database successfully!");
        })
        .catch((error) => {
          console.error("Error uploading data:", error);
          alert("Error uploading data. Check the console for details.");
        });
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  
  return (
    <div className={`min-h-[120vh] lg:min-h-screen min-w-screen w-[110%] md:w-[100%] lg:w-[100%] flex ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header theme={theme} dark={setTheme} />
        <main className="flex-1 overflow-y-auto p-5 px-0 md:px-16">
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        </main>
      </div>
    </div>
  );
}

export default Order_rev;
