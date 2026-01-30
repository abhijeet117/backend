require("dotenv").config()
const app = require("./src/app");

const mongoose = require("mongoose");

const connectToMongoose = require("./src/config/database");
connectToMongoose();







app.listen(3000, ()=>{
    console.log("server is running...");
})