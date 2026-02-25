const userModel = require("../models/user.model");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function updateOwnProfile(req, res) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      message: "Invalid user!",
    });
  }

  const rawEmail = req.body?.email;
  const rawBio = req.body?.bio;
  const rawProfileImg = req.body?.profileImg;

  const hasEmail = rawEmail !== undefined;
  const hasBio = rawBio !== undefined;
  const hasProfileImg = rawProfileImg !== undefined;

  if (!hasEmail && !hasBio && !hasProfileImg) {
    return res.status(400).json({
      message: "Provide at least one field to update",
    });
  }

  const updates = {};

  if (hasEmail) {
    const email = String(rawEmail || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({
        message: "Email cannot be empty",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }
    updates.email = email;
  }

  if (hasBio) {
    const bio = String(rawBio || "").trim();
    if (bio.length > 200) {
      return res.status(400).json({
        message: "Bio must be 200 characters or less",
      });
    }
    updates.bio = bio;
  }

  if (hasProfileImg) {
    const profileImg = String(rawProfileImg || "").trim();
    if (!profileImg) {
      updates.profileImg = "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg";
    } else if (!isValidHttpUrl(profileImg)) {
      return res.status(400).json({
        message: "Profile image must be a valid http/https URL",
      });
    } else {
      updates.profileImg = profileImg;
    }
  }

  try {
    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
      .select("userName email bio profileImg");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        userName: updatedUser.userName,
        email: updatedUser.email,
        bio: updatedUser.bio || "",
        profileImg: updatedUser.profileImg,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
}

module.exports = {
  updateOwnProfile,
};
