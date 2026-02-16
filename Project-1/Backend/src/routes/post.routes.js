const express = require("express")

const postRouter = express.Router()
const {createPost, getAllPosts, findSpecPost} = require("../Controllers/post.controllers")

const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
 

postRouter.post("/" , upload.single("image"), createPost )

postRouter.get("/", getAllPosts)

postRouter.get("/details/:postId" , findSpecPost)

module.exports = postRouter;