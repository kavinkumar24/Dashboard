import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function Uploads() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileType, setFileType] = useState("");
  const [typeMsg, setTypeMsg] = useState("");
  const [detailedData, setDetailedData] = useState([]);
  const [api, setApi] = useState("");
  const [mismatchData, setMismatchData] = useState([]);
  const currentTime = new Date().toLocaleString();


  const fetchPreviousFileID = async (fapi) => {
    try {
      const response = await fetch(fapi);
      const data = await response.json();
      return data.length ? data[data.length - 1].fileID : null;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      return null;
    }
  };

  const generateFileID = async (fileType) => {
    const currentDate = new Date();
    const dateFormatted = `${String(currentDate.getDate()).padStart(2, "0")}${String(currentDate.getMonth() + 1).padStart(2, "0")}${String(currentDate.getFullYear()).slice(-2)}`;
    const prefix = fileType === "rejection" ? "RE" : "";
    const fapi = `http://localhost:8081/api/${fileType}/upload`;
    
    const previousID = await fetchPreviousFileID(fapi);
    const newCount = previousID ? parseInt(previousID.slice(6), 10) + 1 : 1;

    return `${dateFormatted}${prefix}${String(newCount).padStart(2, "0")}`;
  };

  const handleFileInputClick = (event) => {
    if (fileType === "") {
      event.preventDefault();
      setTypeMsg("Please select the File Type before choosing a file.");
    }
  };

  const handleFileType = async (event) => {
    const selectedFileType = event.target.value;
    setFileType(selectedFileType);
    setTypeMsg("");

    const fileTypeDetails = {
      production: [
        [
          "JC ID", "Brief No", "PRE-BRIEF NO", "Sketch No", "Item ID", "Purity", "Empid", "Ref Empid", 
          "Name", "Jwl Type", "Project", "Sub Category", "CW Qty", "Qty", "From Dept", "To Dept", 
          "In Date", "Out Date", "Hours", "Days", "Description", "Design specification", "PRODUNITID", "Remarks"
        ],
        "http://localhost:8081/api/production/upload"
      ],
      pending: [
        [
          "TODEPT", "JCID1", "BRIEFNUM1", "MERCHANDISERBRIEF1", "SKETCHNUM1", "ITEMID", 
          "PERSONNELNUMBER1", "NAME1", "PLTCODE1", "PURITY1", "ARTICLECODE1", "COMPLEXITY1", 
          "JCPDSCWQTY1", "JCQTY1", "DATE1", "Textbox56", "Textbox87", "Textbox60", "DESIGNSPEC1", 
          "RECEIVED1", "RECVDATE1", "REMARKS1", "HALLMARKINCERTCODE1"
        ],
        "http://localhost:8081/api/pending/upload"
      ],
      rejection: [
        [
          "Yr", "MONTH", "Date", "Raised Date", "RaisedDept", "Reason Dept", "To Dept", "Sketch No", 
          "Jcid No", "Collections", "Type of Reason", "Problem arised", "Problem - 1", 
          "Problem arised -2", "COUNT", "Operator Name/ID"
        ],
        "http://localhost:8081/api/rejection/upload"
      ],
      orderRece_newDesi: [
        [
          "NAME1", "ACCOUNTNUM", "Itemcwqty2", "Itemqty2", "JCID", "TRANSDATE", "ORDERNO", "OrderType", 
          "SEGMENTID", "KNOWNAS", "OGPG", "PURITY", "ColorId", "JCCRATENAME", "JOBCARDTYPE1", "ITEMID", 
          "SKETCHNUM", "CRWINCEPTIONDATE", "subparty1", "PLTCODE", "HALLMARKINGCODE", 
          "MFG_CODE", "ARTICLE_CODE", "COMPLEXITY_CODE", "DESCRIPTION", "NIM_PROCATEGORY", 
          "TOPSUBCATEGORY", "GENDER", "NAMEALIAS", "PERSONNELNUMBER", "DesignerName2", "Itemcwqty", 
          "Itemqty"
        ],
        "http://localhost:8081/api/order/upload"
      ],
      task: [
        [
          "Brief number", "Pre-Brief", "Employe id", "Employe Name", "Design center", "Design specification", 
          "Jewel sub type", "Sub category", "Jewel type", "Document date", "Design type", 
          "Minimum Weight", "Maximum Weight", "No Of Design", "Deadline date", "Confirmed", 
          "Received", "Received by", "Received date", "Completed", "Created by", "Created date and time"
        ],
        "http://localhost:8081/api/design_center/upload"
      ],
      target: [
        [
          "PROJECT-1", "Product", "Sub_Product", "Total"
        ],
        "http://localhost:8081/api/target/upload"
      ]
    };

    if (fileTypeDetails[selectedFileType]) {
      setDetailedData(fileTypeDetails[selectedFileType][0]);
      setApi(fileTypeDetails[selectedFileType][1]);
      if (selectedFileType === "rejection") {
        const newFileID = await generateFileID(selectedFileType);
        console.log(newFileID);
      }
    } else {
      setDetailedData([]);
    }
  };

  const handleFileChange = (event) => {
    if (!fileType) {
      setTypeMsg("Please select the File Type before choosing a file.");
      event.target.value = null;
      return;
    }

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const uploadedColumns = jsonData[0];
      const mismatches = detailedData.filter(col => !uploadedColumns.includes(col));
      const mismatchedColumns = uploadedColumns.filter(col => !detailedData.includes(col));
      const combinedMismatches = mismatches.map((col, index) => ({
        original: col,
        mismatched: mismatchedColumns[index] || "",
      }));

      if (mismatchedColumns.length > mismatches.length) {
        for (let i = mismatches.length; i < mismatchedColumns.length; i++) {
          combinedMismatches.push({ original: "", mismatched: mismatchedColumns[i] });
        }
      }

      if (combinedMismatches.length > 0) {
        setMismatchData(combinedMismatches);
        setMessage("Column mismatch! Please review the table below.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("file_ID", currentTime);
      formData.append("file_type", fileType);

      try {
        const response = await axios.post(api, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage(response.data.message || "File uploaded successfully!");
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Failed to upload file");
      }
    };

    fileReader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className={`min-h-screen w-full flex ${theme === "light" ? "bg-gray-100" : "bg-gray-800"}`}>
      <Sidebar theme={theme} />
      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearch} theme={theme} dark={setTheme} />
        <div className="flex justify-between mx-4 mt-4">
          <h1 className="font-bold text-xl">Upload the Files</h1>
        </div>
        <label htmlFor="file-type" className="block mb-2 text-base font-medium text-slate-500 mx-4 mt-4">
          Select the Type of file to be Upload
        </label>
        <select
          id="file-type"
          className="mx-4 bg-gray-50 border-2 border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          onChange={handleFileType}
        >
          <option value="">Select file type</option>
          <option value="production">Production</option>
          <option value="pending">Pending</option>
          <option value="rejection">Rejection</option>
          <option value="orderRece_newDesi">Order Receipt New Design</option>
          <option value="task">Task</option>
          <option value="target">Target</option>
        </select>
        <p className="text-red-500 mx-4 mt-2">{typeMsg}</p>
        
        <div className="mx-4 mt-4">
  <label
    htmlFor="file"
    className={`bg-white text-gray-500 font-semibold text-base rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto ${
      fileType === "" ? "cursor-not-allowed opacity-50" : ""
    }`}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-11 mb-2 fill-gray-500"
      viewBox="0 0 32 32"
    >
      <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
      <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
    </svg>
    <input
      type="file"
      onChange={handleFileChange}
      className="hidden"
      id="file"
      disabled={fileType === ""}
    />
    <p className="text-xs font-medium text-gray-400 mt-2">
      .xlsx file formats are only allowed.
    </p>
  </label>

  {/* Error message */}
  {fileType === "" && (
    <p className="text-red-500 mt-2">Please select the File Type before choosing a file.</p>
  )}
</div>


        {mismatchData.length > 0 && (
          <div className="mx-4 mt-4 bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            <h2 className="font-bold">Column Mismatches:</h2>
            <ul>
              {mismatchData.map((item, index) => (
                <li key={index}>
                  Original: <strong>{item.original}</strong> - Mismatched: <strong>{item.mismatched}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-green-500 mx-4 mt-4">{message}</p>
      </div>
    </div>
  );
}

export default Uploads;
