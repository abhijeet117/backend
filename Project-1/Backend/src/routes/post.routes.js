const express = require("express")

const postRouter = express.Router()
const {
  createPost,
  getAllPosts,
  findSpecPost,
  likePost,
  unlikePost,
  toggleLike,
  getPostLikes,
  addComment,
  userFeed,
  allPostsFeed,
  likedPostsFeed
} = require("../Controllers/post.controllers")

const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const isValidUser = require("../middleware/auth.middleware")

postRouter.post("/" , isValidUser , upload.single("image"), createPost )

postRouter.get("/", isValidUser , getAllPosts)

postRouter.get("/details/:postId" , isValidUser , findSpecPost)

postRouter.post("/like/:postId",isValidUser, likePost )
postRouter.delete("/unlike/:postId", isValidUser, unlikePost)
postRouter.post("/like-toggle/:postId", isValidUser, toggleLike)
postRouter.post("/comment/:postId", isValidUser, addComment)
postRouter.get("/likes/:postId", isValidUser, getPostLikes)

postRouter.get("/feed", isValidUser, userFeed)
postRouter.get("/all-feed", isValidUser, allPostsFeed)
postRouter.get("/liked", isValidUser, likedPostsFeed)



module.exports = postRouter;
