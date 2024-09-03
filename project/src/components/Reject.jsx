import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function UploadExcel() {
  const [chartData, setChartData] = useState({
    overall: [],
    cad: [],
    cam: [],
    allRaisedDepts: [],
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        processData(jsonData);
      };
      reader.readAsBinaryString(file);
    }
  };

  const processData = (data) => {
    const raisedDeptCounts = data.reduce((acc, row) => {
      const raisedDept = row["RaisedDept"];
      const toDept = row["To Dept"];
      if (raisedDept && toDept) {
        const key = `${raisedDept} -> ${toDept}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const overallFormatted = Object.entries(raisedDeptCounts).map(
      ([key, count]) => {
        const [raisedDept, toDept] = key.split(" -> ");
        return { raisedDept, toDept, count };
      }
    );

    const cadData = overallFormatted.filter((item) => item.toDept === "CAD");
    const camData = overallFormatted.filter((item) => item.toDept === "CAM");
    const allRaisedDepts = Array.from(
      new Set(overallFormatted.map((item) => item.raisedDept))
    );

    setChartData({
      overall: overallFormatted,
      cad: cadData,
      cam: camData,
      allRaisedDepts,
    });
  };

  const CustomBarChart = ({ data, title, color }) => (
    <div className="p-4 bg-white shadow-md rounded-md border border-gray-200 w-[80%] sm:w-full h-[70%]">
      <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
      <div className="min-w-max">
        <BarChart width={350} height={300} data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="raisedDept"
            tick={{ angle: -45, textAnchor: "end" }}
            height={80}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill={color} />
        </BarChart>
      </div>
    </div>
  );

  const CustomPieChart = ({ data, title, colors }) => (
    <div className="p-4 bg-white shadow-md rounded-md border border-gray-200 overflow-x-hidden w-[80%] sm:w-full">
      <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
      <div className="min-w-max">
        <PieChart width={350} height={300}>
          <Pie
            data={data}
            dataKey="count"
            nameKey="raisedDept"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label
            paddingAngle={5}
          >
            
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="ml-2">{entry.raisedDept}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return { chartData, handleFileUpload, CustomBarChart, CustomPieChart };
}

function Reject() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [search, setSearch] = useState("");

  const { chartData, handleFileUpload, CustomBarChart, CustomPieChart } =
    UploadExcel();

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className={`min-h-screen lg:min-h-screen min-w-screen w-[124%] md:w-[100%] lg:w-[100%] flex ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-800'}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />

        <div className="flex justify-between mx-4">
          <h1 className="font-bold text-xl">Rejections</h1>
          {/* <button
            className={`mr-5 py-2 px-4 font-bold text-sm text-white rounded-lg ${
              theme === "light"
                ? "bg-blue-500 hover:bg-blue-700"
                : "bg-blue-600 hover:bg-blue-800"
            }`}
          >
            View Uploaded History
          </button> */}
        </div>

        <div className="upload-container pt-10 w-[80%] sm:w-full">
          <label
            htmlFor="uploadFile1"
            className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 mb-2 fill-gray-500"
              viewBox="0 0 32 32"
            >
              <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
              <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
            </svg>
            Import New Rejection file
            <input
              type="file"
              id="uploadFile1"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileUpload}
            />
            <p className="text-xs font-medium text-gray-400 mt-2">
              .xlsx file formats are only allowed.
            </p>
          </label>
        </div>

        {chartData.allRaisedDepts && chartData.allRaisedDepts.length > 0 && (
          <div className="px-4 py-6 md:py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <CustomBarChart
                data={chartData.cam}
                title="CAM Rejections"
                color="#FF8042"
              />
              <CustomPieChart
                data={chartData.cad}
                title="CAD Rejections"
                colors={[
                  "#2dd4bf",
                  "#FBBF24",
                  "#1f77b4",
                  "#ff7f0e",
                  "#2ca02c",
                  "#d62728",
                  "#9467bd",
                  "#8c564b",
                  "#e377c2",
                  "#7f7f7f",
                  "#bcbd22",
                  "#17becf",
                  "#f5b7b1",
                  "#c2c2f0",
                  "#ff6666",
                  "#ffcc99",
                  "#c2c2c2",
                  "#e5d8bd",
                  "#d8b365",
                  "#f4a582",
                  "#a6d854",
                  "#ffd92f",
                  "#e41a1c",
                  "#377eb8",
                  "#4daf4a",
                  "#ff69b4",
                  "#6a3d9a",
                  "#ff6347",
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reject;
