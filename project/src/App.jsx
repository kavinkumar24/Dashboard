
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
        <Route path = '/sketch_rejections' element={<Skch_reject />} />
        <Route path = '/dep_rejections' element={<Department_reject />} />
      </Routes>
      </div>
      
    </>
  )
}

export default App
