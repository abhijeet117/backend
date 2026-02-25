const mongoose = require("mongoose");
const { toFile } = require("@imagekit/nodejs");
const ImageKit = require("@imagekit/nodejs");

const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const likeModel = require("../models/likes.model");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function buildLikeMap(postIds) {
  if (!postIds.length) {
    return new Map();
  }

  const likes = await likeModel
    .find({ post: { $in: postIds } })
    .sort({ createdAt: -1 })
    .select("post user");

  const likeMap = new Map();
  for (const like of likes) {
    const postId = like.post.toString();
    if (!likeMap.has(postId)) {
      likeMap.set(postId, []);
    }
    likeMap.get(postId).push(like.user);
  }

  return likeMap;
}

function serializePost(post, likeMap) {
  const postId = post._id.toString();
  const likedBy = likeMap.get(postId) || [];

  return {
    ...post.toObject(),
    likedBy,
    likeCount: likedBy.length,
  };
}

async function createPost(req, res) {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      message: "Image is required to create a post!",
    });
  }

  const file = await imagekit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "image",
    folder: "Cohort-2-insta-clone",
  });

  const post = await postModel.create({
    caption: req.body.caption || req.body.title || req.body.tittle || "",
    img_url: file.url,
    user: userId,
  });

  res.status(201).json({
    message: "Post created successfully!",
    post,
  });
}

async function getAllPosts(req, res) {
  const userId = req.user.id;

  const posts = await postModel
    .find({ user: userId })
    .populate("user", "userName profileImg bio")
    .sort({ createdAt: -1 });

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap));

  res.status(200).json({
    message: "Posts fetched successfully",
    posts: enrichedPosts,
  });
}

async function findSpecPost(req, res) {
  const { postId } = req.params;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const post = await postModel
    .findById(postId)
    .populate("user", "userName profileImg bio");

  if (!post) {
    return res.status(404).json({
      message: "Post not found!",
    });
  }

  const likes = await likeModel.find({ post: postId }).sort({ createdAt: -1 }).select("user");
  const likedBy = likes.map((like) => like.user);

  return res.status(200).json({
    message: "Post fetched successfully!",
    post: {
      ...post.toObject(),
      likedBy,
      likeCount: likedBy.length,
    },
  });
}

async function likePost(req, res) {
  const { postId } = req.params;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const post = await postModel.findById(postId);
  if (!post) {
    return res.status(404).json({
      message: "No post found!",
    });
  }

  const userName = user.userName;
  const existingLike = await likeModel.findOne({
    post: postId,
    user: userName,
  });

  let liked = false;
  if (existingLike) {
    await likeModel.deleteOne({ _id: existingLike._id });
  } else {
    await likeModel.create({
      post: postId,
      user: userName,
    });
    liked = true;
  }

  const likes = await likeModel.find({ post: postId }).sort({ createdAt: -1 }).select("user");
  const likedBy = likes.map((like) => like.user);

  return res.status(200).json({
    message: liked ? "Post liked successfully" : "Post unliked successfully",
    liked,
    likeCount: likedBy.length,
    likedBy,
  });
}

async function getPostLikes(req, res) {
  const { postId } = req.params;

  if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const likes = await likeModel.find({ post: postId }).sort({ createdAt: -1 }).select("user");
  const likedBy = likes.map((like) => like.user);

  return res.status(200).json({
    likedBy,
    likeCount: likedBy.length,
  });
}

async function userFeed(req, res) {
  const posts = await postModel
    .find()
    .populate("user", "userName profileImg bio")
    .sort({ createdAt: -1 });

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap));

  res.status(200).json({
    message: "Success",
    posts: enrichedPosts,
    post: enrichedPosts,
  });
}

module.exports = {
  createPost,
  getAllPosts,
  findSpecPost,
  likePost,
  getPostLikes,
  userFeed,
};
