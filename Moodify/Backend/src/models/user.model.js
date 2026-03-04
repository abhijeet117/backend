const mongoose =  require("mongoose");

const expressionHistorySchema = new mongoose.Schema(
    {
        mood: {
            type: String,
            enum: ["Happy", "Neutral", "Shock", "Sad"],
            required: true
        },
        capturedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        _id: true
    }
)

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true,
        default: ""
    },
    username : {
        type : String,
        required : [true, "Username is required "],
        unique : true,
        trim : true
    },
    email : {
        type : String,
        required : [true, "Email is required "],
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : [true, "Password is required "],
        select : false
    },
    expressionHistory: {
        type: [expressionHistorySchema],
        default: []
    }
}, {timestamps : true})

const userModel = mongoose.model("User", userSchema)
module.exports = userModel

