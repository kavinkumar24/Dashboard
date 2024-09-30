import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";

function Party_visit_view() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const loggedInEmail = localStorage.getItem("Email");
  const userRole = localStorage.getItem("role"); // Assuming you store the role in localStorage

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/party_visit");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = userRole === "admin" 
    ? data 
    : data.filter(item => 
        item.Assign_Person.split(",").some(email => email.trim() === loggedInEmail)
      );

  return (
    <div className={`min-h-screen flex ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <div
            className={`flex flex-col p-5 relative shadow-xl rounded-lg mx-10 my-5 
              ${theme === "light" ? "bg-white" : "bg-gray-900"} 
              max-w-full md:max-w-lg lg:max-w-xl xl:max-w-screen-lg 2xl:max-w-screen-7xl`}
          >
            <h2 className={`text-2xl font-semibold mb-6 ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
              View Party Visit
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === "light" ? "bg-gray-200" : "bg-gray-800"}>
                  <tr>
                    {["SL NO", "Visit Date", "Party Name", "Description", "Assigned Person", "Status", "Brief", "Quantity", "Complete Date", "Order rec Wt"].map((header) => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === "light" ? "text-gray-500" : "text-gray-200"}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === "light" ? "bg-white divide-gray-200" : "bg-gray-700 text-slate-100 divide-gray-600"}`}>
                  {filteredData.map((item, index) => (
                    <tr key={item.SL_NO} className={`${index % 2 === 0 ? (theme === "light" ? "bg-gray-100" : "bg-gray-700") : (theme === "light" ? "bg-white" : "bg-gray-800")}`}>
                      <td className="px-6 py-4 whitespace-nowrap">{item.SL_NO}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Party_Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.visit_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.Assign_Person.split(",").map((email, idx) => (
                          <div key={idx}>{email.trim()}</div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Status_data}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Brief_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Complete_date.slice(0, 10)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{item.Order_rev_wt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Party_visit_view;
