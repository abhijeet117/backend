const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    require: [true, "Follower is required"],
  },

  followe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    require: [true, "Follower is required"],
  },
  timestamps : true
})

const followerModel = mongoose.model("follower", followerSchema)

module.exports = followerModel;
