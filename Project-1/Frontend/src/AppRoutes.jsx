import {BrowserRouter, Routes, Route} from "react-router"
import Login from "../src/features/auth/pages/Login"
import Register from "../src/features/auth/pages/Register"



const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes