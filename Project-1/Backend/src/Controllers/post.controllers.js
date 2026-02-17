const postModel = require("../models/post.model");

const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { message } = require("antd");
const jwt = require("jsonwebtoken");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function createPost(req, res) {
  const userId = req.user.id

  const file = await imagekit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "image",
    folder: "Cohort-2-insta-clone",
  });

  const post = await postModel.create({
    caption: req.body.tittle,
    img_url: file.url,
    user: userId,
  });

  res.status(201).json({
    message: "Post created successfully!",
    post,
  });
}

async function getAllPosts(req, res) {
  const userId = req.user.id

  const posts = await postModel.find({
    user: userId,
  });

  res.status(200).json({
    message: "post fetched successfully...",
    posts,
  });
}

async function findSpecPost(req, res) {
  const userId = req.user.id

  const postId = req.params.postId;

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json({
      message: "post not found by that id!",
    });
  }

  post.user.toString() === userId;

  const isValidUser = post.user.toString() === userId;

  if (!isValidUser) {
    return res.status(403).json({
      message: "Forbidden content!",
    });
  }

  return res.status(200).json({
    message: "Post fetched Successfully!",
    post,
  });
}

module.exports = { createPost, getAllPosts, findSpecPost };
