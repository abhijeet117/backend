const express = require("express")

const userRouter = express.Router()

const { followUser, unfollowUser, getUserProfile } = require("../Controllers/user.controllers")
const isValidUser = require("../middleware/auth.middleware")

userRouter.post("/follow/:username", isValidUser, followUser)
userRouter.post("/unfollow/:username", isValidUser, unfollowUser)
userRouter.get("/profile/:username", isValidUser, getUserProfile)


module.exports = userRouter

