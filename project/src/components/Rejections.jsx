import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const UploadExcel = () => {
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

    console.log("Raised Dept Counts:", raisedDeptCounts);

    const overallFormatted = Object.entries(raisedDeptCounts).map(
      ([key, count]) => {
        const [raisedDept, toDept] = key.split(" -> ");
        return { raisedDept, toDept, count };
      }
    );

    console.log("Overall Formatted:", overallFormatted);

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

  const CustomBarChart = ({ data, title, color }) => {
    console.log("Chart Data:", data);

    return (
      <div className="p-4 bg-white shadow-md rounded-md border border-gray-200 w-[100%] h-[100%]">
        <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
        <div className="min-w-max">
          <BarChart width={400} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="raisedDept"
              tick={{ angle: -45, textAnchor: "end" }}
              height={80} 
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={color}>
            </Bar>
          </BarChart>
        </div>
      </div>
    );
  };
  const colorPalette = [
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
  ];

  const CustomPieChart = ({ data, title, colors }) => {
    return (
      <div className="p-4 bg-white shadow-md rounded-md border border-gray-200 overflow-x-hidden w-[100%]">
        <h2 className="text-lg font-semibold mb-4 text-center">{title}</h2>
        <div className="min-w-max">
          <PieChart width={450} height={400}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="raisedDept"
              cx="50%"
              cy="50%"
              outerRadius={150}
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
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        className="mb-6 p-2 border border-gray-300 rounded-md"
      />
      {chartData.allRaisedDepts && chartData.allRaisedDepts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-center items-center">
            {chartData.cad.length > 0 && (
              <>
                {/* <CustomBarChart
                  data={chartData.cad}
                  title="CAD Rejections by Raised Departments"
                  color="#8884d8"
                /> */}
                <CustomPieChart
                  data={chartData.cad}
                  title="CAD Rejections Distribution"
                  colors={[
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
              </>
            )}
          </div>
          <div className="flex justify-center items-center">
            {chartData.cam.length > 0 && (
              <CustomBarChart
                data={chartData.cam}
                title="CAM Rejections by Raised Departments"
                color="#ff7300"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadExcel;
