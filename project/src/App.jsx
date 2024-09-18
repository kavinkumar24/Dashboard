
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
import Demo from './components/Demo';
import ZoneDetail from './components/Order_receiving_detials/Zonedetails';
import Login from './components/Login';
import PurityDetail from './components/Order_receiving_detials/Purity_detail';
import Project_Detail from './components/Order_receiving_detials/Project_detail';
import Product_Detail from './components/Order_receiving_detials/Product_detail';
import Subproduct_Detail from './components/Order_receiving_detials/Subproduct_details';
import Group_Detail from './components/Order_receiving_detials/Group_party_detail';
import Department_AOP from './components/AOP/Department_AOP';
import Brief_id from './components/Brief_id';
import Problem_Arised from './components/Problem_Arised';
import Des_Cen_Task from './components/Des_Cen_Task';
import Detailed_task from './components/Detailed_task';
import Color_Detail from './components/Order_receiving_detials/Color_detail';
import Purity_detail from './components/New_Design_detials/Purity_detail';
import Zone_Detail from './components/New_Design_detials/Zone_detail';
import Plainstone_Detail from './components/Order_receiving_detials/Plainstone_detail';
import ProductDetailsPage from './components/AOP/Product_details';
import Color_detai_new_design from './components/New_Design_detials/Color_detail';
import Product_detail_new_design from './components/New_Design_detials/Product_detail';
import Plain_stone_detail_new_design from './components/New_Design_detials/Plain_stone_details'
function App() {

  return (
    <>
      <div>
      <Routes>
        <Route path='/' element={<Exceldata />} />
        <Route path="/product-details/:pltcode" element={<ProductDetailsPage />} />
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
        <Route path = '/demo' element={<Demo />} />
        <Route path="/zone-detail-order_receiving/:zone" element={<ZoneDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/purity-detail-order_receiving/:purity" element={<PurityDetail />} />
        <Route path="/project-detail-order_receiving/:project" element={<Project_Detail />} />
        <Route path="/product-detail-order_receiving/:product" element={<Product_Detail />} />
        <Route path="/subproduct-detail-order_receiving/:subproduct" element={<Subproduct_Detail />} />
        <Route path="/color-detail-order_receiving/:color" element={<Color_Detail />} />

        <Route path="/group_party-detail-order_receiving/:group_party" element={<Group_Detail />} />

        <Route path="/plain-stone-detail-order_receiving/:plainstone" element={<Plainstone_Detail />} />

        <Route path="/purity-detail-new_design/:purity" element={<Purity_detail />} />
        <Route path="/zone-detail-new_design/:zone" element={<Zone_Detail />} />
        <Route path="/color-detail-new_design/:color" element={<Color_detai_new_design />} />
        <Route path="/PL-ST-detail-new_design/:plstone" element = {< Plain_stone_detail_new_design/>} />

        <Route path="/aop_schedule" element={<Department_AOP />} />
        <Route path='/rejections/problem_arised' element={<Problem_Arised/>}/>
        <Route path='/task/detailed_task/brief_id/:id' element={<Brief_id/>}/>
        <Route path='/task/detailed_task/brief_id' element={<Brief_id/>}/>
        <Route path='/task/design_center' element={<Des_Cen_Task/>}/>
        <Route path='/detailed_task' element = {<Detailed_task/>}/>
        <Route path="/product-detail-new_design/:product" element={<Product_detail_new_design />} />

        <Route path='/task/detailed_task' element = {<Detailed_task/>}/>
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
