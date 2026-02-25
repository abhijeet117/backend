const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: String,
      ref: "user",
      required: [true, "Follower is required"],
    },
    followee: {
      type: String,
      ref: "user",
      required: [true, "Followee is required"],
    },
  },
  { timestamps: true }
);

followerSchema.index({ follower: 1, followee: 1 }, { unique: true });
followerSchema.index({ followee: 1 });

const followerModel = mongoose.model("follower", followerSchema);

module.exports = followerModel;
