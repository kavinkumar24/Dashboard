import React, { useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

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
  const currentTime = new Date().toISOString(); 


  const handleFileType = (event) => {
    const selectedFileType = event.target.value;
    setFileType(selectedFileType);
    if (selectedFileType) {
      setTypeMsg("");
    }
    if (selectedFileType === "production") {
        setDetailedData([
          "JC ID", "Brief No", "PRE-BRIEF NO", "Sketch No", "Item ID", "Purity",
          "Empid", "Ref Empid", "Name", "Jwl Type", "Project", "Sub Category",
          "CW Qty", "Qty", "From Dept", "To Dept", "In Date", "Out Date",
          "Hours", "Days", "Description", "Design specification", "PRODUNITID", "Remarks"
        ]);
        setApi("http://localhost:8081/api/production/upload")
      } else if (selectedFileType === "pending") {
        setDetailedData([
          "TODEPT", "JCID1", "BRIEFNUM1", "MERCHANDISERBRIEF1", "SKETCHNUM1", "ITEMID", 
          "PERSONNELNUMBER1", "NAME1", "PLTCODE1", "PURITY1", "ARTICLECODE1", 
          "COMPLEXITY1", "JCPDSCWQTY1", "JCQTY1", "DATE1", "Textbox56", "Textbox87", 
          "Textbox60", "DESIGNSPEC1", "RECEIVED1", "RECVDATE1", "REMARKS1", 
          "HALLMARKINCERTCODE1"
        ]);
        setApi("http://localhost:8081/api/pending/upload")
      } else if (selectedFileType === "rejection") {
        setDetailedData([
          "Yr", "MONTH", "Date", "Raised Date", "RaisedDept", "Reason Dept", 
          "To Dept", "Sketch No", "Jcid No", "Collections", "Type of Reason", 
          "Problem arised", "Problem - 1", "Problem arised -2", "COUNT", 
          "Operator Name/ID"
        ]);
        setApi("http://localhost:8081/api/rejection/upload")

      } else if (selectedFileType === "orderRece_newDesi") {
        setDetailedData([
          "NAME1", "ACCOUNTNUM", "Itemcwqty2", "Itemqty2", "JCID", "TRANSDATE", 
          "ORDERNO", "OrderType", "SEGMENTID", "KNOWNAS", "OGPG", "PURITY", 
          "ColorId", "JCCRATENAME", "JOBCARDTYPE1", "ITEMID", "SKETCHNUM", 
          "CRWINCEPTIONDATE", "subparty1", "PLTCODE", "HALLMARKINGCODE", 
          "MFG_CODE", "ARTICLE_CODE", "COMPLEXITY_CODE", "DESCRIPTION", 
          "NIM_PROCATEGORY", "TOPSUBCATEGORY", "GENDER", "NAMEALIAS", 
          "PERSONNELNUMBER", "DesignerName2", "Itemcwqty", "Itemqty"
        ]);
        setApi("http://localhost:8081/api/order/upload")
      }else {
        setDetailedData([]); // Clear the list if a different file type is selected
      }

  };

  const handleFileChange = (event) => {
    if (fileType === "") {
      setTypeMsg("Please select the File Type before choosing a file.");
      event.target.value = null; // Clear the file input
      return;
    }

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    handleUpload(selectedFile);
  };

  const handleFileInputClick = (event) => {
    if (fileType === "") {
      event.preventDefault(); // Prevent the file explorer from opening
      setTypeMsg("Please select the File Type before choosing a file.");
    }
  };

  const handleUpload = async (selectedFile) => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("file_ID", currentTime);

    

    try {
      const response = await axios.post(
        api,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage(response.data.message || "File uploaded successfully!");
      // fetchUploads(); // Define fetchUploads() or remove this line if not needed
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to upload file");
    }
    
  };

  return (
    <>
      <div
        className={`min-h-screen w-full flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
        }`}
      >
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <div className="flex justify-between mx-4 mt-4">
            <h1 className="font-bold text-xl">Upload the Files</h1>
          </div>
          <label
            htmlFor="file-type"
            className="block mb-2 text-base font-medium text-slate-500 mx-4 mt-4"
          >
            Select the Type of file to be Upload
          </label>
          <select
            id="file-type"
            className="mx-4 bg-gray-50 border-2 border-gray-300 text-gray-900 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/3 p-2.5"
            onChange={handleFileType}
            value={fileType}
          >
            <option value="">Choose the File Type</option>
            <option value="production">Production</option>
            <option value="pending">Pending</option>
            <option value="rejection">Rejection</option>
            <option value="orderRece_newDesi">Order Receiving & New Design</option>
          </select>
          {typeMsg && <p className="mx-4 mt-4 text-red-500">{typeMsg}</p>} {/* Updated text color to red for error messages */}
          

      
      <div className="upload-container pt-5">
            <label
              htmlFor="uploadFile1"
              className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto"
              onClick={handleFileInputClick} // Handle click to prevent file input opening
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
                onChange={handleFileChange}
                disabled={fileType === ""} // Disable the file input if fileType is not selected
              />
              <p className="text-xs font-medium text-gray-400 mt-2">
                .xlsx file formats are only allowed.
              </p>
            </label>
            {message && <p className="my-2 text-green-500">{message}</p>}
          </div>
          {detailedData.length > 0 && (
        <div className="m-4 mt-6 p-4 border border-blue-300 bg-blue-50 rounded-lg max-h-60 overflow-y-auto transition-all ease-in-out duration-1000">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Expected Column Names for {fileType.charAt(0).toUpperCase() + fileType.slice(1).toLowerCase()} File: </h3>
          <p className="text-red-500 mb-2">Please ensure that the uploaded file has the correct column names as shown below.</p>
          <ul className="list-disc ml-6">
            {detailedData.map((column, index) => (
              <li key={index} className="text-gray-700">
                {column}
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>
      </div>
    </>
  );
}

export default Uploads;
