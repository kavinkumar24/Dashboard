import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function Uploads() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [fileType, setFileType] = useState("");
  const [typeMsg, setTypeMsg] = useState("");
  const [detailedData, setDetailedData] = useState([]);
  const [api, setApi] = useState("");
  const [mismatchData, setMismatchData] = useState([]); // New state for mismatch data
  const currentTime = new Date().toLocaleString();
  const [fileID, setFileID] = useState("");
  const[isloading,setIsloading] = useState(false)
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Function to fetch the previous fileID from the API
  const fetchPreviousFileID = async (fapi) => {
    try {
      const response = await fetch(fapi);
      const data = await response.json();

      if (data.length === 0) {
        return null;
      }
      const latestRecord = data[data.length - 1];
      const previousID = latestRecord.fileID;

      return previousID;
    } catch (error) {
      console.error("Error fetching data from API:", error);
      return null;
    }
  };

  const generateFileID = async (fileType) => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = String(currentDate.getFullYear()).slice(-2);
    const dateFormatted = `${day}${month}${year}`;
    let prefix;
    let fapi;

    if (fileType === "rejection") {
      prefix = "RE";
      fapi = "http://localhost:8081/api/rejection/upload";
    }

    const previousID = await fetchPreviousFileID(fapi);
    if (!previousID) {
      const newFileID = `${dateFormatted}${prefix}01`;
      return newFileID;
    }

    const dateAndPrefixLength = 6 + 2;
    const previousCount = parseInt(previousID.slice(dateAndPrefixLength), 10);

    const newCount = previousCount + 1;

    const newFileID = `${dateFormatted}${prefix}${String(newCount).padStart(
      2,
      "0"
    )}`;

    return newFileID;
  };

  generateFileID().then((newFileID) => {
    console.log(newFileID);
  });

  const handleFileType = async (event) => {
    const selectedFileType = event.target.value;
    setFileType(selectedFileType);
    if (selectedFileType) {
      setTypeMsg("");
    }
    if (selectedFileType === "production1") {
      setDetailedData([
        "JC ID",
        "Brief No",
        "PRE-BRIEF NO",
        "Sketch No",
        "Item ID",
        "Purity",
        "Empid",
        "Ref Empid",
        "Name",
        "Jwl Type",
        "Project",
        "Sub Category",
        "CW Qty",
        "Qty",
        "From Dept",
        "To Dept",
        "In Date",
        "Out Date",
        "Hours",
        "Days",
        "Description",
        "Design specification",
        "PRODUNITID",
        "Remarks",
      ]);

      setApi("http://localhost:8081/api/production/upload");
    }
    else if (selectedFileType === "production2") {
      setDetailedData([
        "JCID",
        "BRIEFNUM",
        "PRE-BRIEFNUM",
        "SKETCH NUM",
        "ITEMID",
        "PURITY",
        "EMP-ID",
        "REF-EMP-ID",
        "NAME",
        "JWTYPE",
        "PROJECT",
        "SUB-CATEGORY",
        "INPDSCWQTY",
        "INQTY",
        "RCVCWQTY",
        "RCVQTY",
        "FROMWH",
        "TOWH",
        "IN DATE & TIME",
        "OUT DATE & TIME",
        "Hours       ",
        "Days",
        "DESCRIPTION",
        "Design specification",
        "PRODUNITID",
        "REMARKS",
      ]);

      setApi("http://localhost:8081/api/production/upload");
    } 
    else if (selectedFileType === "pending1") {
      setDetailedData([
        "TODEPT",
        "JCID1",
        "BRIEFNUM1",
        "MERCHANDISERBRIEF1",
        "SKETCHNUM1",
        "ITEMID",
        "PERSONNELNUMBER1",
        "NAME1",
        "PLTCODE1",
        "PURITY1",
        "ARTICLECODE1",
        "COMPLEXITY1",
        "JCPDSCWQTY1",
        "JCQTY1",
        "DATE1",
        "Textbox56",
        "Textbox87",
        "Textbox60",
        "DESIGNSPEC1",
        "RECEIVED1",
        "RECVDATE1",
        "REMARKS1",
        "HALLMARKINCERTCODE1",
      ]);
      setApi("http://localhost:8081/api/pending/upload");
    } else if (selectedFileType === "pending2") {
      setDetailedData([
        "TOWH1",
        "JCID",
        "BRIEFNUM",
        "MERCHANDISERBRIEF",
        "SKETCHNUM",
        "ITEMID",
        "PERSONNELNUMBER",
        "NAME",
        "PLTCODE",
        "PURITY",
        "ARTICLECODE",
        "COMPLEXITY",
        "RCVCWQTY",
        "RCVQTY",
        "MODIFIEDDATETIME",
        "dd",
        "Textbox39",
        "Textbox42",
        "DESIGNSPEC",
        "RCVCWQTY2",
        "RCVQTY2",
      ]);
      setApi("http://localhost:8081/api/pending/upload");
    } else if (selectedFileType === "rejection") {
      setDetailedData([
        "Yr",
        "MONTH",
        "Date",
        "Raised Date",
        "RaisedDept",
        "Reason Dept",
        "To Dept",
        "Sketch No",
        "Jcid No",
        "Collections",
        "Type of Reason",
        "Problem arised",
        "Problem - 1",
        "Problem arised -2",
        "COUNT",
        "Operator Name/ID",
      ]);
      await generateFileID("rejection");
      setApi("http://localhost:8081/api/rejection/upload");
    } else if (selectedFileType === "orderRece_newDesi") {
      setDetailedData([
        "NAME1",
        "SUB PARTY",
        "Group party",
        "JCID",
        "TRANSDATE",
        "ORDERNO",
        "OrderType",
        "ZONE",
        "OGPG",
        "Purity",
        "Color",
        "PHOTO NO",
        "PHOTO NO 2",
        "PROJECT",
        "TYPE",
        "ITEM",
        "PRODUCT",
        "SUB PRODUCT",
        "QTY",
        "WT",
        "Avg",
        "Wt range",
        "PL-ST",
        "DD",
        "SKCHNI",
        "EMP",
        "Name",
        "CODE",
        "GENDER",
        "2024 Set Photo",
        "Po-new",
        "DD&month",
        "Dyr",
        "Brief",
        "Maketype",
        "collection",
        "Collection-1",
        "Collection-2",
      ]);

      setApi("http://localhost:8081/api/order/upload");
    } else if (selectedFileType === "task") {
      setDetailedData([
        "Brief number",
        "Pre-Brief",
        "Employe id",
        "Employe Name",
        "Design center",
        "Design specification",
        "Jewel sub type",
        "Sub category",
        "Jewel type",
        "Document date",
        "Design type",
        "Minimum Weight",
        "Maximum Weight",
        "No Of Design",
        "Deadline date",
        "Confirmed",
        "Received",
        "Received by",
        "Received date",
        "Completed",
        "Created by",
        "Created date and time",
      ]);
      setApi("http://localhost:8081/api/design_center/upload");
    } else if (selectedFileType === "target") {
      setDetailedData(["PROJECT-1", "Product", "Sub_Product", "Total"]);
      setApi("http://localhost:8081/api/target/upload");
    } else {
      setDetailedData([]);
    }
  };

  const handleFileChange = async (event) => {
    setIsloading(true)
    if (fileType === "") {
      setTypeMsg("Please select the File Type before choosing a file.");
      event.target.value = null;
      return;
    }
    

    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    await handleUpload(selectedFile);
    
  };

  const handleFileInputClick = (event) => {
    if (fileType === "") {
      event.preventDefault();
      setTypeMsg("Please select the File Type before choosing a file.");
    }
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

      const mismatches = detailedData.filter(
        (col) => !uploadedColumns.includes(col)
      );

      const mismatchedColumns = uploadedColumns.filter(
        (col) => !detailedData.includes(col)
      );

      const combinedMismatches = mismatches.map((col, index) => ({
        original: col,
        mismatched: mismatchedColumns[index] || "",
      }));

      if (mismatchedColumns.length > mismatches.length) {
        for (let i = mismatches.length; i < mismatchedColumns.length; i++) {
          combinedMismatches.push({
            original: "",
            mismatched: mismatchedColumns[i],
          });
        }
      }

      if (mismatches.length > 0 || mismatchedColumns.length > 0) {
        setMismatchData(combinedMismatches);
        setMessage("Column mismatch! Please review the table below.");
        setIsloading(false)
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("file_ID", currentTime);
      formData.append("file_type", fileType);

      try {
        const response = await axios.post(api, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMessage(response.data.message || "File uploaded successfully!");
    setIsloading(false)

      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Failed to upload file");
        setIsloading(false)
      }
    };

    fileReader.readAsArrayBuffer(selectedFile);
    

  };

  return (
    <>
      <div
        className={`min-h-screen w-full flex ${
          theme === "light" ? "bg-gray-100" : "bg-gray-800"
        }`}
      >
             {isloading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-35">
              <div className="flex gap-2 ml-9">
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
                <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
              </div>
            </div>
          )}
        <Sidebar theme={theme} />
        <div className="flex-1 flex flex-col">
          <Header onSearch={setSearch} theme={theme} dark={setTheme} />
          <div className="flex justify-between mx-4 mt-4">
            <h1
              className={`${
                theme === "light" ? "text-black" : "text-gray-300"
              } font-bold text-xl`}
            >
              Upload the Files
            </h1>
          </div>
          <label
            htmlFor="file-type"
            className={`block mb-2 text-base font-medium mx-4 mt-4 ${
              theme === "light" ? "text-slate-500" : "text-slate-300"
            }`}
          >
            Select the Type of file to be Upload
          </label>
          <select
            id="file-type"
            className={`mx-4 ${
              theme === "light"
                ? "bg-gray-50 border-gray-300 text-gray-900"
                : "bg-gray-700 border-gray-600 text-gray-200"
            } border-2 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/3 p-2.5`}
            onChange={handleFileType}
            value={fileType}
          >
            <option value="">Choose the File Type</option>
            <option value="production1">Production1 - non Gold</option>
            <option value="production2">Production2 - new </option>
            <option value="pending1">Pending1 - PDD</option>
            <option value="pending2">Pending2 - new</option>
            <option value="rejection">Rejection</option>
            <option value="orderRece_newDesi">
              Order Receiving & New Design
            </option>
            <option value="task">Task</option>
            <option value="target">Target</option>
          </select>

          {typeMsg && <p className="text-red-600 mx-4 mt-2">{typeMsg}</p>}
          <div className="upload-container pt-5">
            <label
              htmlFor="uploadFile1"
              className={`flex flex-col items-center justify-center max-w-md h-32 cursor-pointer border-2 border-dashed mx-auto ${
                theme === "light"
                  ? "bg-white text-gray-500 border-gray-300"
                  : "bg-gray-800 text-gray-200 border-gray-600"
              }`}
              onClick={handleFileInputClick} // Handle click to prevent file input opening
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-11 mb-2 ${
                  theme === "light" ? "fill-gray-500" : "fill-gray-300"
                }`}
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
                disabled={fileType === ""}
              />
              <p
                className={`text-xs font-medium mt-2 ${
                  theme === "light" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                .xlsx file formats are only allowed.
              </p>
            </label>

            {message && message === "File uploaded successfully!" ? (
              <div>
                <p className="m-4 text-green-500">{message} </p>{" "}
                <p className="m-4 text-red-500">
                  Attention Please!!! : If You want to upload another file or
                  reupload any file Please!! reload or refresh the Current Page
                </p>
              </div>
            ) : (
              <div>
                {" "}
                <p className="m-4 text-red-500">{message} </p>{" "}
                {message && message !== "File uploaded successfully!" && (
                  <p className="m-4 text-green-500">
                    Attention Please!!! : Please Correct the Column Name that
                    are Mismatched and try to reupload the file after refreshing
                    or reloading the current Page
                  </p>
                )}{" "}
              </div>
            )}
          </div>

          {detailedData.length > 0 && mismatchData.length <= 0 && !message && (
            <div
              className={`m-4 mt-6 p-4 border   rounded-lg max-h-60 overflow-y-auto transition-all ease-in-out duration-1000 ${
                theme === "light"
                  ? "border-blue-300 bg-blue-50"
                  : "bg-blue-950 border-blue-800"
              }`}
            >
              <h3
                className={`text-lg font-semibold   ${
                  theme === "light" ? "text-blue-800" : "text-blue-500"
                } mb-2`}
              >
                Expected Column Names for{" "}
                {fileType.charAt(0).toUpperCase() +
                  fileType.slice(1).toLowerCase()}{" "}
                File:{" "}
              </h3>
              <p className="text-red-500 mb-2">
                Please ensure that the uploaded file has the correct column
                names as shown below.
              </p>
              <ul className="list-disc ml-6">
                {detailedData.map((column, index) => (
                  <li
                    key={index}
                    className={` ${
                      theme === "light" ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {column}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mismatchData.length > 0 && (
            <div className="overflow-x-auto mx-4 mt-4">
              <table className="min-w-full text-sm text-left text-gray-500 border-collapse">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 w-1/2">
                      Exact Column Name Needed
                    </th>
                    <th className="px-6 py-3 w-1/2">
                      Wrong Column Name that you uploaded
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mismatchData.map((data, index) => (
                    <tr key={index} className="bg-white border-b">
                      <td className="px-6 py-4">{data.original || "N/A"}</td>
                      <td className="px-6 py-4">{data.mismatched || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Uploads;
