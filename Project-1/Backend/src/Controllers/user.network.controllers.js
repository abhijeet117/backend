const followerModel = require("../models/follower.model");
const userModel = require("../models/user.model");

async function resolveViewer(req) {
  return userModel.findById(req.user.id).select("userName");
}

async function resolveTargetUser(targetUsername) {
  return userModel.findOne({ userName: targetUsername }).select("userName");
}

async function buildUserMap(userNames) {
  const users = await userModel
    .find({ userName: { $in: userNames } })
    .select("_id userName profileImg bio");
  return new Map(users.map((user) => [user.userName, user]));
}

async function buildViewerFollowingSet(viewerUserName, userNames) {
  if (!viewerUserName || !userNames.length) {
    return new Set();
  }

  const followingRows = await followerModel
    .find({ follower: viewerUserName, followee: { $in: userNames } })
    .select("followee -_id");

  return new Set(followingRows.map((row) => row.followee));
}

function serializeUsers(userNames, userMap, viewerFollowingSet, viewerUserName) {
  return userNames.map((userName) => {
    const user = userMap.get(userName);

    return {
      id: user?._id || null,
      userName,
      profileImg: user?.profileImg || "",
      bio: user?.bio || "",
      isViewer: viewerUserName === userName,
      isFollowedByViewer: viewerFollowingSet.has(userName),
    };
  });
}

async function getUserFollowers(req, res) {
  const targetUsername = req.params.username?.trim();
  if (!targetUsername) {
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

  const targetUser = await resolveTargetUser(targetUsername);
  if (!targetUser) {
    return res.status(404).json({
      message: "User not found!",
    });
  }

  const followerRows = await followerModel
    .find({ followee: targetUsername })
    .sort({ createdAt: -1 })
    .select("follower -_id");
  const followerUserNames = followerRows.map((row) => row.follower).filter(Boolean);

  const [userMap, viewerFollowingSet] = await Promise.all([
    buildUserMap(followerUserNames),
    buildViewerFollowingSet(viewer.userName, followerUserNames),
  ]);

  const followers = serializeUsers(
    followerUserNames,
    userMap,
    viewerFollowingSet,
    viewer.userName,
  );

  return res.status(200).json({
    userName: targetUsername,
    totalFollowers: followers.length,
    followers,
  });
}

async function getUserFollowing(req, res) {
  const targetUsername = req.params.username?.trim();
  if (!targetUsername) {
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

  const targetUser = await resolveTargetUser(targetUsername);
  if (!targetUser) {
    return res.status(404).json({
      message: "User not found!",
    });
  }

  const followingRows = await followerModel
    .find({ follower: targetUsername })
    .sort({ createdAt: -1 })
    .select("followee -_id");
  const followingUserNames = followingRows.map((row) => row.followee).filter(Boolean);

  const [userMap, viewerFollowingSet] = await Promise.all([
    buildUserMap(followingUserNames),
    buildViewerFollowingSet(viewer.userName, followingUserNames),
  ]);

  const following = serializeUsers(
    followingUserNames,
    userMap,
    viewerFollowingSet,
    viewer.userName,
  );

  return res.status(200).json({
    userName: targetUsername,
    totalFollowing: following.length,
    following,
  });
}

module.exports = {
  getUserFollowers,
  getUserFollowing,
};
