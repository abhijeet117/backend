const mongoose = require("mongoose")

function connectToDatabase() {
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected To Database...")
    })
}

module.exports = connectToDatabase;