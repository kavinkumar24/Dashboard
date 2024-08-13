
import './App.css'
import Exceldata from './components/Excel_read_Admin'
import { Route ,Routes} from 'react-router';
import DepartmentDetail from './components/Depart_Card';
function App() {

  return (
    <>
      <div>
      <Routes>
        <Route path='/' element={<Exceldata />} />
        <Route path="/department/:deptId" element={<DepartmentDetail />} />
      </Routes>
      </div>
      
    </>
  )
}

export default App
