import React, { useState } from "react";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { useToast } from "vue-toast-notification";
import Modal from 'react-modal';
import Select from 'react-select';
Modal.setAppElement('#root'); // Make sure to bind modal to your appElement


function Index() {
  const toast = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const [empId, setEmpId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [empName, setEmpName] = useState('');
  const [dept, setDept] = useState([]);
  const [newDept, setNewDept] = useState(''); // for handling new dept input
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  const [selectedPendingMonth, setSelectedPendingMonth] = useState(null);
  const [selectedPendingYear, setSelectedPendingYear] = useState(null);


  const handleDelete_pro_month = () =>{

    if (!selectedMonth || !selectedYear) {
      toast.error("Please select both month and year for production data.");
      return;
    }

    // Perform deletion logic for production data
    axios.delete(`http://localhost:8081/api/delete_pro_month`, {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Production data deleted successfully.");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete production data.");
        console.error(error);
      });
  }
  const handlePendingDelete = () => {
    if (!selectedPendingMonth || !selectedPendingYear) {
      toast.error("Please select both month and year for pending data.");
      return;
    }

    // Perform deletion logic for pending data
    axios.delete(`http://localhost:8081/api/deletePending`, {
      params: { month: selectedPendingMonth.value, year: selectedPendingYear.value },
    })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Pending data deleted successfully.");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete pending data.");
        console.error(error);
      });
  };


  ["Home", "AOP", "Project", "Pending days", "Task", "Rejection", "order receiving", "New Design"]
  const departmentOptions = [
    'AOP - Design center',
    'Task',
    'Order receiving',
    'New design',
    'Party visit',
    'Operational task',
    'Full',
    'Home',
    'AOP',
    'Uploads',
    'Design center',
  ];

  const monthOptions = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];

  const yearOptions = Array.from({ length: 15 }, (_, i) => ({
    value: 2024 + i,
    label: (2024 + i).toString(),
  }));


  const handleDelete = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select both month and year.");
      return;
    }

    // Perform deletion logic here
    axios.delete(`http://localhost:8081/api/delete`, {
      params: { month: selectedMonth.value, year: selectedYear.value },
    })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Data deleted successfully.");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete data.");
        console.error(error);
      });
  };

  
  // Function to handle adding a department to the array
  const addDept = () => {
    if (newDept && !dept.includes(newDept)) {
      setDept([...dept, newDept]); // Add new dept to the array
      setNewDept(''); // Reset input
    } else {
      toast.error('Please enter a valid department or avoid duplicates.');
    }
  };

  const promptCredentials = () => {
    const email = window.prompt("Please enter your email:");
    const password = window.prompt("Please enter your password:");

    if (email === "arun.sample@ejindia.com" && password === "123") {
      return { email, password };
    }
    if (!email || !password) {
      toast.error("Email and password are required to delete data!");
      return null;
    } else {
      toast.error("Invalid Credentials");
      return null;
    }
  };

  const delete_today_pro = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/deletetoday_pro`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Today Production Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Today Production. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_today_pen = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/deletetoday_pen`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Today Pending Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Today Pending. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_target = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-target`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Target Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Target. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_total_pro = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-total-pro`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Total Production Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Total Production. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_total_pen = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-total-pen`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Total Pending Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Total Pending. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_total_rejections = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-total-rejections`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Total Rejections Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Total Rejections. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_created_task = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-created-task`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Created Task Successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to delete Created Task. Invalid credentials.");
        console.log(error);
      });
  };

  const delete_total_design_center = () => {
    const credentials = promptCredentials();
    if (!credentials) {
      toast.error("Action canceled. Deletion requires valid credentials.");
      return;
    }

    axios
      .delete(`http://localhost:8081/api/delete-total-design-center`, {
        auth: { username: credentials.email, password: credentials.password },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Deleted Total Design Center Successfully");
        }
      })
      .catch((error) => {
        toast.error(
          "Failed to delete Total Design Center. Invalid credentials."
        );
        console.log(error);
      });
  };


  const create_user = () => {
    if (!empId || !email || !password || !role || !empName || dept.length === 0) {
      toast.error('Please fill out all fields and add at least one department.');
      return;
    }

    const newUser = {
      emp_id: empId,
      email: email,
      password: password,
      role: role,
      emp_name: empName,
      dept: dept, 
    };

    axios
      .post('http://localhost:8081/api/Add_users', newUser)
      .then((response) => {
        if (response.status === 200) {
          toast.success('User added successfully!');
          setEmpId('');
          setEmail('');
          setPassword('');
          setRole('');
          setEmpName('');
          setDept([]); // Clear dept array
          setIsModalOpen(false); // Close modal
        }
      })
      .catch((error) => {
        toast.error('Failed to add user. Please try again.');
        console.log(error);
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-sky-500 p-4 flex justify-between items-center">
        <div className="text-white text-xl font-bold">DB Tables</div>
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="text-white px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700"
          >
            Account
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </nav>


      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add User Modal"
        className="bg-white rounded-lg shadow-lg p-6 w-1/2 mx-auto mt-20"
      >
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        <div>
          <input
            type="text"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            placeholder="Employee ID"
            className="border border-gray-300 p-2 mb-2 w-full"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border border-gray-300 p-2 mb-2 w-full"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border border-gray-300 p-2 mb-2 w-full"
          />

          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role"
            className="border border-gray-300 p-2 mb-2 w-full"
          />

          <input
            type="text"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="Employee Name"
            className="border border-gray-300 p-2 mb-2 w-full"
          />

          {/* Input for new department */}
          <div className="flex items-center mb-2">
          <select
    value={newDept}
    onChange={(e) => setNewDept(e.target.value)}
    className="border border-gray-300 p-2 mr-2 w-full"
  >
    <option value="">Select Department</option>
    {departmentOptions.map((dept, index) => (
      <option key={index} value={dept}>
        {dept}
      </option>
    ))}
  </select>
            <button
              onClick={addDept}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            >
              Add Dept
            </button>
          </div>

          {/* Display selected departments */}
          <div className="mb-2">
            {dept.length > 0 && (
              <div>
                <p className="font-semibold">Selected Departments:</p>
                <ul className="list-disc pl-5">
                  {dept.map((d, index) => (
                    <li key={index} className="text-gray-700">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={create_user}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full"
          >
            Create User
          </button>
        </div>
      </Modal>
      <div className="container mx-auto py-10">
        {/* Today Uploads Section */}
        <h2 className="text-2xl font-bold mb-4">Today Uploads</h2>

        {/* Card for Today Uploads */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={delete_today_pro}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
            >
              Delete Today Production
            </button>
            <button
              onClick={delete_today_pen}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
            >
              Delete Today Pending
            </button>
          </div>
          <br></br>
          <h2 className="text-2xl font-semibold">Production Month and year wise</h2>

          <div className="mt-4">
          <Select
            options={monthOptions}
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="Select Month"
            className="mb-2"
          />
          <Select
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder="Select Year"
            className="mb-2"
          />
          <button
            onClick={handleDelete_pro_month}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Delete Production Data
          </button>
        </div>


<br></br>
        <h2 className="text-2xl font-semibold">Pending Month and year wise</h2>

        <div className="mt-4">
          <Select
            options={monthOptions}
            value={selectedPendingMonth}
            onChange={setSelectedPendingMonth}
            placeholder="Select Month"
            className="mb-2"
          />
          <Select
            options={yearOptions}
            value={selectedPendingYear}
            onChange={setSelectedPendingYear}
            placeholder="Select Year"
            className="mb-2"
          />
          <button
            onClick={handlePendingDelete}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
          >
            Delete Pending Data
          </button>
        </div>
        </div>

        {/* Divider */}
        <hr className="border-t-2 border-gray-300 mb-8" />

        {/* Overall Data Section */}
        <h2 className="text-2xl font-bold mb-4">Overall Data</h2>

        {/* Grid for Overall Data Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
            onClick={delete_total_pro}
          >
            Delete Production
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
            onClick={delete_total_pen}
          >
            Delete Pending
          </button>
          <button
            onClick={delete_total_rejections}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
          >
            Delete Rejections
          </button>
          <button
            onClick={delete_created_task}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
          >
            Delete Created Task
          </button>
          <button
            onClick={delete_target}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
          >
            Delete Target
          </button>
          <button
            onClick={delete_total_design_center}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md max-w-xs mx-auto"
          >
            Delete Design Center
          </button>
        </div>

        <br></br>
        <br></br>

        <hr className="border-t-2 border-gray-300 mb-8" />

        <h2 className="text-2xl font-bold mb-4">Add User</h2>

        <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-red-600 text-white py-2 px-4 rounded-md"
      >
        Add User
      </button>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Index;
