import {BrowserRouter, Routes, Route} from "react-router"
import Login from "../src/features/auth/pages/Login"
import Register from "../src/features/auth/pages/Register"
import Feed from "../src/features/post/pages/Feed"
import PostDetails from "../src/features/post/pages/PostDetails"
import Profile from "../src/features/post/pages/Profile"


const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Feed/>}/>
            <Route path="/profile/:username/feed" element={<Feed scope="all"/>}/>
            <Route path="/post/:postId" element={<PostDetails/>}/>
            <Route path="/profile/:username" element={<Profile/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="*" element={<Feed/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
