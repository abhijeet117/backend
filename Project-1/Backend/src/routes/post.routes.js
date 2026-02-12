const express = require("express")

const postRouter = express.Router()
const {createPost} = require("../Controllers/post.controllers")

const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
 

postRouter.post("/" , upload.single("image"), createPost )

module.exports = postRouter;