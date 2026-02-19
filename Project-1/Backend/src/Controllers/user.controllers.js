const followerModel = require("../models/follower.model")
const userModel = require("../models/user.model")

async function followUser(req, res) {
    try {
        const followeeUsername = req.params.username
        if (!followeeUsername || !followeeUsername.trim()) {
            return res.status(400).json({
                message: "Username is required!"
            })
        }

        const followerUser = await userModel.findById(req.user.id)
        if (!followerUser) {
            return res.status(401).json({
                message: "Invalid user!"
            })
        }

        const followerUsername = followerUser.userName

        if (followeeUsername === followerUsername) {
            return res.status(400).json({
                message: "You can't follow yourself!"
            })
        }

        const followeeUser = await userModel.findOne({
            userName: followeeUsername
        })

        if (!followeeUser) {
            return res.status(404).json({
                message: "User you are trying to follow does not exist!"
            })
        }

        const isAlreadyFollowing = await followerModel.findOne({
            follower: followerUsername,
            followee: followeeUsername
        })

        if (isAlreadyFollowing) {
            return res.status(409).json({
                message: `You already follow ${followeeUsername}!`
            })
        }

        await followerModel.create({
            follower: followerUsername,
            followee: followeeUsername
        })

        return res.status(200).json({
            message: `You are now following ${followeeUsername}`
        })
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({
                message: "You already follow this user!"
            })
        }
        return res.status(500).json({
            message: "Failed to follow user!"
        })
    }
}

async function unfollowUser(req, res) {
    try {
        const followeeUsername = req.params.username
        if (!followeeUsername || !followeeUsername.trim()) {
            return res.status(400).json({
                message: "Username is required!"
            })
        }

        const followerUser = await userModel.findById(req.user.id)
        if (!followerUser) {
            return res.status(401).json({
                message: "Invalid user!"
            })
        }

        const followerUsername = followerUser.userName

        const isFollowing = await followerModel.findOne({
            follower: followerUsername,
            followee: followeeUsername
        })

        if (!isFollowing) {
            return res.status(404).json({
                message: `You are not following ${followeeUsername}`
            })
        }

        await followerModel.findByIdAndDelete(isFollowing._id)

        return res.status(200).json({
            message: `You unfollowed ${followeeUsername}`
        })
    } catch (err) {
        return res.status(500).json({
            message: "Failed to unfollow user!"
        })
    }
}






module.exports = {followUser, unfollowUser}
