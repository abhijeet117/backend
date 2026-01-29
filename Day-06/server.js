const app = require("./src/app.js");

const mongoose = require("mongoose");

function connectToMongoose(){
    mongoose.connect('mongodb+srv://abhijeetkumarsah92_db_user:DFlD0QSlQkBDsX6y@cluster0.cf8kh7w.mongodb.net/day-06')
    .then(()=>{
        console.log("Connected to database...");
    })
}

connectToMongoose();

app.listen(3000, ()=>{
    console.log("Server is running...")
});  

