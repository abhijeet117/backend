const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        unique : [true, "Username already exits!"],
        required : [true, "Username is required"]
    },
    email : {
        type : String,
        unique : [true, "Email already exits"],
        required : [true, "Email is required"]
    },
    password : {
        type : String,
        required : [true, "password is required"],
        select : false
    },
    bio : String,
    profileImg : {
        type : String,
        default : "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel
