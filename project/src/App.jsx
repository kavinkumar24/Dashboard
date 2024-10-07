import "./App.css";
import Exceldata from "./components/Home/Excel_read_Admin";
import { Route, Routes } from "react-router";
import DepartmentDetail from "./components/Home/Depart_Card";
import Projects from "./components/Projects";
import Daily_Report from "./components/Daily_Report";
import CreateTask from "./components/Task/Create_Task";
import ViewTasks from "./components/Task/View_Task";
import Reject from "./components/Reject";
import Order_rev from "./components/Order_receiving_detials/Order_rev";
import Skch_reject from "./components/Skch_reject";
import Department_reject from "./components/Department_reject";
import Upload from "./components/Uploads";
import New_Design from "./components/New_Design_detials/New_Design";
import ZoneDetail from "./components/Order_receiving_detials/Zonedetails";
import Login from "./components/Login";
import PurityDetail from "./components/Order_receiving_detials/Purity_detail";
import Project_Detail from "./components/Order_receiving_detials/Project_detail";
import Product_Detail from "./components/Order_receiving_detials/Product_detail";
import Subproduct_Detail from "./components/Order_receiving_detials/Subproduct_details";
import Group_Detail from "./components/Order_receiving_detials/Group_party_detail";
import Department_AOP from "./components/AOP/Department_AOP";
import Brief_id from "./components/Brief_id";
import Problem_Arised from "./components/Problem_Arised";
import Des_Cen_Task from "./components/AOP/Des_Cen_Task";
import Detailed_task from "./components/Task/Detailed_task";
import Color_Detail from "./components/Order_receiving_detials/Color_detail";
import Purity_detail from "./components/New_Design_detials/Purity_detail";
import Zone_Detail from "./components/New_Design_detials/Zone_detail";
import Plainstone_Detail from "./components/Order_receiving_detials/Plainstone_detail";
import ProductDetailsPage from "./components/AOP/Product_details";
import Color_detai_new_design from "./components/New_Design_detials/Color_detail";
import Product_detail_new_design from "./components/New_Design_detials/Product_detail";
import Plain_stone_detail_new_design from "./components/New_Design_detials/Plain_stone_details";
import Project_detail_new_design from "./components/New_Design_detials/Project_detail";
import Subproduct_detail_new_design from "./components/New_Design_detials/Subproduct_detail";
import PrivateRoute from "./PrivateRoute";
import Mail from "./components/Email";
import Operational_task from "./components/Operational_Task/Operational_task";
import Phase_view from "./components/Operational_Task/Phase_view";
import Party_form from "./components/Partyvisit/Party_form";
import Party_visit_view from "./components/Partyvisit/Party_visit_view";

function App() {
  return (
    <>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Exceldata />
              </PrivateRoute>
            }
          />
          <Route path="/mail" element={<Mail />} />
          <Route
            path="/product-details/:pltcode/:dept"
            element={
              <PrivateRoute>
                <ProductDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/department/:deptId/:type"
            element={
              <PrivateRoute>
                <DepartmentDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/daily-report"
            element={
              <PrivateRoute>
                <Daily_Report />
              </PrivateRoute>
            }
          />
          <Route
            path="/task/create"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <CreateTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/task/view"
            element={
              <PrivateRoute>
                <ViewTasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/rejections"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Reject />
              </PrivateRoute>
            }
          />
          <Route
            path="/order_receiving&new_design"
            element={
              <PrivateRoute>
                <Order_rev />
              </PrivateRoute>
            }
          />
          <Route
            path="/rejections/detailed_rejections"
            element={
              <PrivateRoute>
                <Skch_reject />
              </PrivateRoute>
            }
          />
          <Route
            path="/rejections/dept_rejections"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Department_reject />
              </PrivateRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Upload />
              </PrivateRoute>
            }
          />
          <Route
            path="/new_design"
            element={
              <PrivateRoute>
                <New_Design />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PrivateRoute>
                <Login />
              </PrivateRoute>
            }
          />
          <Route
            path="/zone-detail-order_receiving/:zone"
            element={
              <PrivateRoute>
                <ZoneDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/purity-detail-order_receiving/:purity"
            element={
              <PrivateRoute>
                <PurityDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/project-detail-order_receiving/:project"
            element={
              <PrivateRoute>
                <Project_Detail />
              </PrivateRoute>
            }
          />
          <Route
            path="/product-detail-order_receiving/:product"
            element={
              <PrivateRoute>
                <Product_Detail />
              </PrivateRoute>
            }
          />
          <Route
            path="/subproduct-detail-order_receiving/:subproduct"
            element={
              <PrivateRoute>
                <Subproduct_Detail />
              </PrivateRoute>
            }
          />
          <Route
            path="/color-detail-order_receiving/:color"
            element={
              <PrivateRoute>
                <Color_Detail />
              </PrivateRoute>
            }
          />

          <Route
            path="/group_party-detail-order_receiving/:group_party"
            element={
              <PrivateRoute>
                <Group_Detail />
              </PrivateRoute>
            }
          />

          <Route
            path="/plain-stone-detail-order_receiving/:plainstone"
            element={
              <PrivateRoute>
                <Plainstone_Detail />
              </PrivateRoute>
            }
          />

          <Route
            path="/purity-detail-new_design/:purity"
            element={
              <PrivateRoute>
                <Purity_detail />
              </PrivateRoute>
            }
          />
          <Route
            path="/zone-detail-new_design/:zone"
            element={
              <PrivateRoute>
                <Zone_Detail />
              </PrivateRoute>
            }
          />
          <Route
            path="/color-detail-new_design/:color"
            element={
              <PrivateRoute>
                <Color_detai_new_design />
              </PrivateRoute>
            }
          />
          <Route
            path="/PL-ST-detail-new_design/:plstone"
            element={
              <PrivateRoute>
                <Plain_stone_detail_new_design />
              </PrivateRoute>
            }
          />
          <Route
            path="/project-detail-new_design/:project"
            element={
              <PrivateRoute>
                <Project_detail_new_design />
              </PrivateRoute>
            }
          />
          {/* <Route path="/subproduct-detail-new_design/:subproduct" element={<Subproduct_detail_new_design />} /> */}
          <Route
            path="/subproduct-detail-new_design/:subproduct"
            element={
              <PrivateRoute>
                <Subproduct_detail_new_design />
              </PrivateRoute>
            }
          />

          <Route
            path="/aop_schedule"
            element={
              <PrivateRoute>
                <Department_AOP />
              </PrivateRoute>
            }
          />
          <Route
            path="/rejections/problem_arised"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Problem_Arised />
              </PrivateRoute>
            }
          />
          <Route
            path="/task/detailed_task/brief_id/:id"
            element={
              <PrivateRoute>
                <Brief_id />
              </PrivateRoute>
            }
          />

          <Route
            path="/AOP/design_center"
            element={
              <PrivateRoute>
                <Des_Cen_Task />
              </PrivateRoute>
            }
          />
          <Route
            path="/detailed_task"
            element={
              <PrivateRoute>
                <Detailed_task />
              </PrivateRoute>
            }
          />
          <Route
            path="/product-detail-new_design/:product"
            element={
              <PrivateRoute>
                <Product_detail_new_design />
              </PrivateRoute>
            }
          />

          <Route
            path="/task/detailed_task"
            element={
              <PrivateRoute>
                <Detailed_task />
              </PrivateRoute>
            }
          />
          <Route path="/task/operational_task" element={<Operational_task />} />
          <Route
            path="/task/operational_task/phase_view"
            element={<Phase_view />}
          />
          <Route
            path="/party_visit/new"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Party_form />
              </PrivateRoute>
            }
          />

          <Route
            path="/party_visit/view"
            element={
              <PrivateRoute>
                <Party_visit_view />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
