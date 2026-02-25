import {BrowserRouter, Routes, Route} from "react-router"
import Login from "../src/features/auth/pages/Login"
import Register from "../src/features/auth/pages/Register"
import Feed from "../src/features/post/pages/Feed"
import PostDetails from "../src/features/post/pages/PostDetails"
import Profile from "../src/features/post/pages/Profile"
import CreatePost from "../src/features/post/pages/CreatePost"
import FollowList from "../src/features/post/pages/FollowList"
import EditProfile from "../src/features/post/pages/EditProfile"
import LikedPosts from "../src/features/post/pages/LikedPosts"
import Home from "../src/features/home/pages/Home"


const AppRoutes = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/feed" element={<Feed/>}/>
            <Route path="/profile/:username/feed" element={<Feed scope="all"/>}/>
            <Route path="/create" element={<CreatePost/>}/>
            <Route path="/likes" element={<LikedPosts/>}/>
            <Route path="/post/:postId" element={<PostDetails/>}/>
            <Route path="/profile/:username/edit" element={<EditProfile/>}/>
            <Route path="/profile/:username" element={<Profile/>}/>
            <Route path="/profile/:username/followers" element={<FollowList listType="followers"/>}/>
            <Route path="/profile/:username/following" element={<FollowList listType="following"/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="*" element={<Home/>}/>
        </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
