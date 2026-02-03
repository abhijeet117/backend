const mongoose = require("mongoose");

function connectToDatabase() {
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to database");
})
}


module.exports = connectToDatabase