
import './App.css'
import Exceldata from './components/Excel_read_Admin'
import { Route ,Routes} from 'react-router';
import DepartmentDetail from './components/Depart_Card';
import Projects from './components/Projects';
function App() {

  return (
    <>
      <div>
      <Routes>
        <Route path='/' element={<Exceldata />} />
        <Route path="/department/:deptId" element={<DepartmentDetail />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      </div>
      
    </>
  )
}

export default App
