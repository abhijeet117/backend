const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption : {
        type : String,
        default : ""
    },
    img_url : {
        type : String,
        default : [true, "Image is require to post!"]
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        require : [true, "user is required to create post..."]
    }
})


const postModel = mongoose.model("posts" , postSchema);
module.exports = postModel