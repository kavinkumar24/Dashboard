import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import login_img from "../assests/Login_img.png";

function Login() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogin = async () => {
    localStorage.setItem("Email", empId);
    try {
      const response = await axios.post("http://localhost:8081/api/login", {
        emp_id: empId,
        password,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);

      setSuccess(response.data.message);
      setError("");
      console.log("Login successful, token stored:", response.data.token);

      const role = response.data.user.role;

      // Redirect to a protected route after successful login
      // fetchProtectedData();

      // if()
      // navigate('/');
      if (role === "admin") {
        navigate("/");
      } else if (role === "user") {
        navigate("/task/view");
      }
    } catch (err) {
      setError(err.response ? err.response.data.message : "Login failed");
      setSuccess("");
    }
  };

  const fetchProtectedData = async () => {
    const token = localStorage.getItem("token"); // or sessionStorage.getItem('token');

    try {
      const response = await axios.get("http://localhost:8081/api/user-only", {
        headers: {
          Authorization: `Bearer ${token}`, // Set token in Authorization header
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error fetching protected data:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className={`font-[sans-serif] ${
        theme === "light" ? "bg-white" : "bg-slate-900"
      }`}
    >
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full">
          <div
            className={`border ${
              theme === "light" ? "border-gray-300" : "border-gray-600"
            }  rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto`}
          >
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="mb-8 flex flex-col items-center justify-center">
                <h1 className="text-xl text-gray-500 mb-5">
                  <span className="eb-garamond-normal font-bold text-indigo-600 text-5xl">
                    Ej
                  </span>
                  <span className="font-mono text-xl">Dashboard</span>
                </h1>
                <h3
                  className={` ${
                    theme === "light" ? "text-gray-800" : "text-gray-200"
                  } text-2xl font-extrabold font-sans`}
                >
                  Welcome Back
                </h3>
                <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                  Sign in to your account and explore a world of possibilities.
                  Your journey begins here.
                </p>
              </div>

              <div>
                <label
                  className={`text-sm mb-2 block ${
                    theme === "light" ? "text-gray-800 " : "text-gray-200 "
                  }`}
                >
                  Employee ID
                </label>
                <div className="relative flex items-center">
                  <input
                    name="username"
                    type="text"
                    required
                    className={`w-full text-sm border  px-4 py-3 rounded-lg outline-blue-600 ${
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-800 "
                        : "bg-slate-800 border-gray-900 text-gray-200 "
                    }`}
                    placeholder="Enter Employee ID or Email"
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-[18px] h-[18px] absolute right-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="10"
                      cy="7"
                      r="6"
                      data-original="#000000"
                    ></circle>
                    <path
                      d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>

              <div>
                <label
                  className={`text-sm mb-2 block ${
                    theme === "light" ? "text-gray-800 " : "text-gray-200 "
                  }`}
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    name="password"
                    type="password"
                    required
                    className={`w-full text-sm border  px-4 py-3 rounded-lg outline-blue-600 ${
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-800 "
                        : "bg-slate-800 border-gray-900 text-gray-200 "
                    }`}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#bbb"
                    stroke="#bbb"
                    className="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                    viewBox="0 0 128 128"
                  >
                    <path
                      d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                      data-original="#000000"
                    ></path>
                  </svg>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && (
                <p className="text-green-500 text-sm mt-2">{success}</p>
              )}

              <div className="!mt-8">
                <button
                  type="button"
                  className="w-full shadow-xl py-3 px-4 text-sm tracking-wide rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                  onClick={handleLogin}
                >
                  Log in
                </button>
              </div>
            </form>
          </div>
          <div
            className={`lg:h-[400px] md:h-[300px] max-md:mt-8 ${
              theme === "light" ? "bg-white" : "bg-slate-900 "
            }`}
          >
            {theme === "light" ? (
              <img
                src="https://readymadeui.com/login-image.webp"
                className="w-full h-full max-md:w-4/5 mx-auto block object-cover p-3"
                alt="Dining Experience"
              />
            ) : (
              <img
                src={login_img}
                className="w-full h-full max-md:w-4/5 mx-auto block object-cover p-3"
                alt="Dining Experience"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
