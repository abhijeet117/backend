const followerModel = require("../models/follower.model");
const userModel = require("../models/user.model");
const postModel = require("../models/post.model");
const likeModel = require("../models/likes.model");

async function resolveViewer(req) {
  const viewer = await userModel.findById(req.user.id).select("userName");
  return viewer;
}

async function followUser(req, res) {
  try {
    const followeeUsername = req.params.username?.trim();
    if (!followeeUsername || !followeeUsername.trim()) {
      return res.status(400).json({
        message: "Username is required!",
      });
    }

    const followerUser = await resolveViewer(req);
    if (!followerUser) {
      return res.status(401).json({
        message: "Invalid user!",
      });
    }

    const followerUsername = followerUser.userName;
    if (followeeUsername === followerUsername) {
      return res.status(400).json({
        message: "You can't follow yourself!",
      });
    }

    const followeeUser = await userModel.findOne({ userName: followeeUsername }).select("userName");
    if (!followeeUser) {
      return res.status(404).json({
        message: "User you are trying to follow does not exist!",
      });
    }

    const isAlreadyFollowing = await followerModel.findOne({
      follower: followerUsername,
      followee: followeeUsername,
    });
    if (isAlreadyFollowing) {
      return res.status(409).json({
        message: `You already follow ${followeeUsername}!`,
      });
    }

    await followerModel.create({
      follower: followerUsername,
      followee: followeeUsername,
    });

    const [followersCount, followingCount] = await Promise.all([
      followerModel.countDocuments({ followee: followeeUsername }),
      followerModel.countDocuments({ follower: followerUsername }),
    ]);

    return res.status(200).json({
      message: `You are now following ${followeeUsername}`,
      isFollowing: true,
      followersCount,
      followingCount,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        message: "You already follow this user!",
      });
    }

    return res.status(500).json({
      message: "Failed to follow user!",
    });
  }
}

async function unfollowUser(req, res) {
  try {
    const followeeUsername = req.params.username?.trim();
    if (!followeeUsername || !followeeUsername.trim()) {
      return res.status(400).json({
        message: "Username is required!",
      });
    }

    const followerUser = await resolveViewer(req);
    if (!followerUser) {
      return res.status(401).json({
        message: "Invalid user!",
      });
    }

    const followerUsername = followerUser.userName;
    const isFollowing = await followerModel.findOne({
      follower: followerUsername,
      followee: followeeUsername,
    });

    if (!isFollowing) {
      return res.status(404).json({
        message: `You are not following ${followeeUsername}`,
      });
    }

    await followerModel.findByIdAndDelete(isFollowing._id);

    const [followersCount, followingCount] = await Promise.all([
      followerModel.countDocuments({ followee: followeeUsername }),
      followerModel.countDocuments({ follower: followerUsername }),
    ]);

    return res.status(200).json({
      message: `You unfollowed ${followeeUsername}`,
      isFollowing: false,
      followersCount,
      followingCount,
    });
  } catch {
    return res.status(500).json({
      message: "Failed to unfollow user!",
    });
  }
}

async function getUserProfile(req, res) {
  const targetUsername = req.params.username?.trim();
  if (!targetUsername || !targetUsername.trim()) {
    return res.status(400).json({
      message: "Username is required!",
    });
  }

  const viewer = await resolveViewer(req);
  if (!viewer) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const profileUser = await userModel
    .findOne({ userName: targetUsername })
    .select("_id userName email bio profileImg");

  if (!profileUser) {
    return res.status(404).json({
      message: "User not found!",
    });
  }

  const [followersCount, followingCount, isFollowingRecord, posts] = await Promise.all([
    followerModel.countDocuments({ followee: targetUsername }),
    followerModel.countDocuments({ follower: targetUsername }),
    followerModel.findOne({ follower: viewer.userName, followee: targetUsername }),
    postModel.find({ user: profileUser._id }).sort({ createdAt: -1 }),
  ]);

  const postIds = posts.map((post) => post._id);
  const likes = postIds.length
    ? await likeModel.find({ post: { $in: postIds } }).sort({ createdAt: -1 }).select("post user")
    : [];

  const likeMap = new Map();
  for (const like of likes) {
    const postId = like.post.toString();
    if (!likeMap.has(postId)) {
      likeMap.set(postId, []);
    }
    likeMap.get(postId).push(like.user);
  }

  const serializedPosts = posts.map((post) => {
    const likedBy = likeMap.get(post._id.toString()) || [];
    return {
      ...post.toObject(),
      user: {
        userName: profileUser.userName,
        profileImg: profileUser.profileImg,
        bio: profileUser.bio,
      },
      likedBy,
      likeCount: likedBy.length,
      isLikedByViewer: likedBy.includes(viewer.userName),
    };
  });

  return res.status(200).json({
    profile: {
      id: profileUser._id,
      userName: profileUser.userName,
      email: profileUser.email,
      bio: profileUser.bio,
      profileImg: profileUser.profileImg,
      followersCount,
      followingCount,
      isFollowing: Boolean(isFollowingRecord),
      isOwnProfile: viewer.userName === profileUser.userName,
      posts: serializedPosts,
    },
  });
}

module.exports = { followUser, unfollowUser, getUserProfile };
