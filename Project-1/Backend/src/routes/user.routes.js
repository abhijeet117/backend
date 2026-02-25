const express = require("express")

const userRouter = express.Router()

const { followUser, unfollowUser, getUserProfile } = require("../Controllers/user.controllers")
const { getUserFollowers, getUserFollowing } = require("../Controllers/user.network.controllers")
const { updateOwnProfile } = require("../Controllers/user.profile.controllers")
const isValidUser = require("../middleware/auth.middleware")

userRouter.post("/follow/:username", isValidUser, followUser)
userRouter.post("/unfollow/:username", isValidUser, unfollowUser)
userRouter.get("/profile/:username", isValidUser, getUserProfile)
userRouter.get("/profile/:username/followers", isValidUser, getUserFollowers)
userRouter.get("/profile/:username/following", isValidUser, getUserFollowing)
userRouter.patch("/profile/edit", isValidUser, updateOwnProfile)


module.exports = userRouter
