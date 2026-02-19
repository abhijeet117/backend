const express = require("express")

const postRouter = express.Router()
const {createPost, getAllPosts, findSpecPost, likePost} = require("../Controllers/post.controllers")

const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

const isValidUser = require("../middleware/auth.middleware")
const likeModel = require("../models/likes.model")

 

postRouter.post("/" , isValidUser , upload.single("image"), createPost )

postRouter.get("/", isValidUser , getAllPosts)

postRouter.get("/details/:postId" , isValidUser , findSpecPost)

postRouter.post("/like/:postId",isValidUser, likePost )



module.exports = postRouter;