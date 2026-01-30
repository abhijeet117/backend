const mongoose = require("mongoose");

function connectToMongoose(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to database...")
    })
}

module.exports = connectToMongoose;