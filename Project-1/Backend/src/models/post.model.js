const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption : {
        type : String,
        default : ""
    },
    img_url : {
        type : String,
        required : [true, "Image is require to post!"]
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true, "user is required to create post..."]
    }
}, { timestamps: true })


const postModel = mongoose.model("posts" , postSchema);
module.exports = postModel
