const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        unique : [true, "Username already exits!"],
        require : [true, "Username is required"]
    },
    email : {
        type : String,
        unique : [true, "Email already exits"],
        require : [true, "Email is required"]
    },
    password : {
        type : String,
        require : [true, "password is required"]
    },
    bio : String,
    profileImg : {
        type : String,
        default : "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg"
    }
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel