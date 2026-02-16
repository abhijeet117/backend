const postModel = require("../models/post.model");

const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { message } = require("antd");
const jwt = require("jsonwebtoken");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function createPost(req, res) {
  console.log(req.body, req.file);

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not matched, Unauthorised access!",
    });
  }

  let decode; // Scoping to use in global

  try {
    decode = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "User not authorised...",
    });
  }

  const file = await imagekit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "image",
    folder: "Cohort-2-insta-clone",
  });

  const post = await postModel.create({
    caption: req.body.tittle,
    img_url: file.url,
    user: decode.id,
  });

  res.status(201).json({
    message: "Post created successfully!",
    post,
  });
}

async function getAllPosts(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not found!",
    });
  }

  let decoded = "";

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(402).json({
      message: "Token invalid",
    });
  }

  const userId = decoded.id;

  const posts = await postModel.find({
    user: userId,
  });

  res.status(200).json({
    message: "post fetched successfully...",
    posts,
  });
}

async function findSpecPost(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorised access!",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token!",
    });
  }

  const userId = decoded.id;

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
