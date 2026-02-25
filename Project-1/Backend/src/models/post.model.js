const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    caption : {
        type : String,
        default : ""
    },
    comments: [
        {
            userName: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
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

postSchema.index({ user: 1, createdAt: -1 });

const postModel = mongoose.model("posts" , postSchema);
module.exports = postModel
