const mongoose = require("mongoose");
const { toFile } = require("@imagekit/nodejs");
const ImageKit = require("@imagekit/nodejs");

const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const likeModel = require("../models/likes.model");
const followerModel = require("../models/follower.model");

let imagekitClient = null;

function getImagekitClient() {
  if (imagekitClient) {
    return imagekitClient;
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return null;
  }

  imagekitClient = new ImageKit({ privateKey });
  return imagekitClient;
}

async function buildLikeMap(postIds) {
  if (!postIds.length) {
    return new Map();
  }

  const likes = await likeModel.find({ post: { $in: postIds } }).sort({ createdAt: -1 }).select("post user");
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

function serializePost(post, likeMap, viewerUserName) {
  const postId = post._id.toString();
  const likedBy = likeMap.get(postId) || [];

  return {
    ...post.toObject(),
    likedBy,
    likeCount: likedBy.length,
    isLikedByViewer: viewerUserName ? likedBy.includes(viewerUserName) : false,
  };
}

async function resolveViewer(req) {
  const viewer = await userModel.findById(req.user.id).select("userName");
  if (!viewer) {
    return null;
  }
  return viewer;
}

function isValidPostId(postId) {
  return Boolean(postId) && mongoose.Types.ObjectId.isValid(postId);
}

async function getSerializedPost(postId, viewerUserName) {
  const post = await postModel.findById(postId).populate("user", "userName profileImg bio");
  if (!post) {
    return null;
  }

  const likeMap = await buildLikeMap([post._id]);
  return serializePost(post, likeMap, viewerUserName);
}

async function createPost(req, res) {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({
      message: "Image is required to create a post!",
    });
  }

  const imagekit = getImagekitClient();
  if (!imagekit) {
    return res.status(503).json({
      message: "Image upload service is not configured",
    });
  }

  let file;
  try {
    file = await imagekit.files.upload({
      file: await toFile(Buffer.from(req.file.buffer), "file"),
      fileName: "image",
      folder: "Cohort-2-insta-clone",
    });
  } catch {
    return res.status(502).json({
      message: "Failed to upload image",
    });
  }

  const post = await postModel.create({
    caption: req.body.caption || req.body.title || req.body.tittle || "",
    img_url: file.url,
    user: userId,
    comments: Array.isArray(req.body.comments) ? req.body.comments : [],
  });

  return res.status(201).json({
    message: "Post created successfully!",
    post,
  });
}

async function getAllPosts(req, res) {
  const userId = req.user.id;
  const viewer = await resolveViewer(req);

  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const posts = await postModel
    .find({ user: userId })
    .populate("user", "userName profileImg bio")
    .sort({ createdAt: -1 });

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap, viewer.userName));

  return res.status(200).json({
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

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const post = await postModel.findById(postId).populate("user", "userName profileImg bio");
  if (!post) {
    return res.status(404).json({
      message: "Post not found!",
    });
  }

  const likeMap = await buildLikeMap([post._id]);
  const serializedPost = serializePost(post, likeMap, viewer.userName);

  return res.status(200).json({
    message: "Post fetched successfully!",
    post: serializedPost,
  });
}

async function likePost(req, res) {
  const { postId } = req.params;
  if (!isValidPostId(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const post = await postModel.findById(postId).select("_id");
  if (!post) {
    return res.status(404).json({
      message: "No post found!",
    });
  }

  const existingLike = await likeModel.findOne({ post: postId, user: viewer.userName });
  if (existingLike) {
    return res.status(409).json({
      message: "You already liked this post!",
    });
  }

  try {
    await likeModel.create({
      post: postId,
      user: viewer.userName,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: "You already liked this post!",
      });
    }
    throw err;
  }

  const likes = await likeModel.find({ post: postId }).sort({ createdAt: -1 }).select("user");
  const likedBy = likes.map((like) => like.user);

  return res.status(200).json({
    message: "Post liked successfully",
    likeCount: likedBy.length,
    likedBy,
    isLikedByViewer: true,
  });
}

async function unlikePost(req, res) {
  const { postId } = req.params;
  if (!isValidPostId(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const deleted = await likeModel.findOneAndDelete({ post: postId, user: viewer.userName });
  if (!deleted) {
    return res.status(404).json({
      message: "You have not liked this post yet!",
    });
  }

  const likes = await likeModel.find({ post: postId }).sort({ createdAt: -1 }).select("user");
  const likedBy = likes.map((like) => like.user);

  return res.status(200).json({
    message: "Post unliked successfully",
    likeCount: likedBy.length,
    likedBy,
    isLikedByViewer: false,
  });
}

async function toggleLike(req, res) {
  const { postId } = req.params;
  if (!isValidPostId(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const existingLike = await likeModel.findOne({ post: postId, user: viewer.userName });
  if (existingLike) {
    return unlikePost(req, res);
  }
  return likePost(req, res);
}

async function getPostLikes(req, res) {
  const { postId } = req.params;
  if (!isValidPostId(postId)) {
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

async function addComment(req, res) {
  const { postId } = req.params;
  if (!isValidPostId(postId)) {
    return res.status(400).json({
      message: "Invalid post id!",
    });
  }

  const text = String(req.body?.text || req.body?.comment || "").trim();
  if (!text) {
    return res.status(400).json({
      message: "Comment text is required!",
    });
  }

  if (text.length > 500) {
    return res.status(400).json({
      message: "Comment must be 500 characters or less",
    });
  }

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const post = await postModel.findById(postId).select("_id comments");
  if (!post) {
    return res.status(404).json({
      message: "Post not found!",
    });
  }

  post.comments.push({
    userName: viewer.userName,
    text,
  });

  await post.save();
  const addedComment = post.comments[post.comments.length - 1];
  const enrichedPost = await getSerializedPost(postId, viewer.userName);

  return res.status(201).json({
    message: "Comment added successfully",
    comment: addedComment,
    post: enrichedPost,
  });
}

async function userFeed(req, res) {
  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const relationships = await followerModel.find({ follower: viewer.userName }).select("followee");
  const followeeUserNames = relationships.map((row) => row.followee);

  if (!followeeUserNames.length) {
    return res.status(200).json({
      message: "Success",
      posts: [],
    });
  }

  const followeeUsers = await userModel.find({ userName: { $in: followeeUserNames } }).select("_id");
  const followeeIds = followeeUsers.map((user) => user._id);

  const posts = await postModel
    .find({ user: { $in: followeeIds } })
    .populate("user", "userName profileImg bio")
    .sort({ createdAt: -1 })
    .limit(200);

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap, viewer.userName));

  return res.status(200).json({
    message: "Success",
    posts: enrichedPosts,
  });
}

async function allPostsFeed(req, res) {
  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const posts = await postModel
    .find({})
    .populate("user", "userName profileImg bio")
    .sort({ createdAt: -1 })
    .limit(300);

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap, viewer.userName));

  return res.status(200).json({
    message: "Success",
    posts: enrichedPosts,
  });
}

async function likedPostsFeed(req, res) {
  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const likedRows = await likeModel
    .find({ user: viewer.userName })
    .sort({ createdAt: -1 })
    .select("post");

  const likedPostIds = likedRows.map((row) => row.post).filter(Boolean);
  if (!likedPostIds.length) {
    return res.status(200).json({
      message: "Success",
      posts: [],
    });
  }

  const posts = await postModel
    .find({ _id: { $in: likedPostIds } })
    .populate("user", "userName profileImg bio");

  const likedOrderMap = new Map(
    likedPostIds.map((postId, index) => [postId.toString(), index]),
  );

  posts.sort(
    (left, right) =>
      likedOrderMap.get(left._id.toString()) -
      likedOrderMap.get(right._id.toString()),
  );

  const likeMap = await buildLikeMap(posts.map((post) => post._id));
  const enrichedPosts = posts.map((post) => serializePost(post, likeMap, viewer.userName));

  return res.status(200).json({
    message: "Success",
    posts: enrichedPosts,
  });
}

module.exports = {
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
  likedPostsFeed,
};
