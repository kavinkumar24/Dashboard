
import './App.css'
import Exceldata from './components/Excel_read_Admin'
import { Route ,Routes} from 'react-router';
import DepartmentDetail from './components/Depart_Card';
import Projects from './components/Projects';
import Daily_Report from './components/Daily_Report';
import CreateTask from './components/Create_Task';
import ViewTasks from './components/View_Task';
import Reject from './components/Reject';
import Order_rev from './components/Order_rev';
import Skch_reject from './components/Skch_reject';
import Department_reject from './components/Department_reject';
import Upload from './components/Uploads';
import New_Design from './components/New_Design';
import Login from './components/Login';


function App() {

  return (
    <>
      <div>
      <Routes>
        <Route path='/' element={<Exceldata />} />
        <Route path="/department/:deptId/:type" element={<DepartmentDetail />} />
        <Route path="/projects" element={<Projects />} />
        <Route path='/daily-report' element={<Daily_Report />} />
        <Route path='/task/create' element={<CreateTask />} />
        <Route path='/task/view' element={<ViewTasks />} />
        <Route path = '/rejections' element={<Reject />} />
        <Route path = '/order_receiving&new_design' element={<Order_rev />} />
        <Route path = '/rejections/detailed_rejections' element={<Skch_reject />} />
        <Route path = '/rejections/dept_rejections' element={<Department_reject />} />
        <Route path = '/uploads' element={<Upload />} />
        <Route path = '/new_design' element={<New_Design />} />
        <Route path='/login' element={<Login/>} />
      </Routes>
      </div>
      
    </>
  )
}

export default App

// import './App.css';
// import Exceldata from './components/Excel_read_Admin';
// import { Route, Routes, Navigate } from 'react-router';
// import DepartmentDetail from './components/Depart_Card';
// import Projects from './components/Projects';
// import Daily_Report from './components/Daily_Report';
// import CreateTask from './components/Create_Task';
// import ViewTasks from './components/View_Task';
// import Reject from './components/Reject';
// import Order_rev from './components/Order_rev';
// import Skch_reject from './components/Skch_reject';
// import Department_reject from './components/Department_reject';
// import Upload from './components/Uploads';
// import New_Design from './components/New_Design';
// import Login from './components/Login';
// import { useState, useEffect } from 'react';
// import jwt_decode from 'jwt-decode';  // Correct import



// function App() {
//   const [role, setRole] = useState(null);

//   // Fetch the role from the JWT token
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       const decodedToken = jwt_decode(token);  // Correct usage of jwt_decode
//       setRole(decodedToken.role); // Set the user role from token
//     }
//   }, []);

//   // Role-based route protection component
//   const ProtectedRoute = ({ children, allowedRoles }) => {
//     if (!role) return <Navigate to="/login" />;
//     if (!allowedRoles.includes(role)) return <Navigate to="/" />;
//     return children;
//   };

//   return (
//     <>
//       <div>
//         <Routes>
//           <Route path="/" element={<Exceldata />} />
//           <Route path="/department/:deptId/:type" element={<DepartmentDetail />} />
//           <Route 
//             path="/projects" 
//             element={
//               <ProtectedRoute allowedRoles={['admin']}>
//                 <Projects />
//               </ProtectedRoute>
//             } 
//           />
//           <Route path="/daily-report" element={<Daily_Report />} />
//           <Route path="/task/create" element={<CreateTask />} />
//           <Route 
//             path="/task/view" 
//             element={
//               <ProtectedRoute allowedRoles={['admin', 'user']}>
//                 <ViewTasks />
//               </ProtectedRoute>
//             } 
//           />
//           <Route path="/rejections" element={<Reject />} />
//           <Route path="/order_receiving&new_design" element={<Order_rev />} />
//           <Route path="/rejections/detailed_rejections" element={<Skch_reject />} />
//           <Route path="/rejections/dept_rejections" element={<Department_reject />} />
//           <Route path="/uploads" element={<Upload />} />
//           <Route path="/new_design" element={<New_Design />} />
//           <Route path="/login" element={<Login />} />
//         </Routes>
//       </div>
//     </>
//   );
// }

// export default App;
