const app = require("./src/app");

const mongoose = require("mongoose");

require('dotenv').config();

const connectToDatabase = require("./src/config/database")

connectToDatabase();



app.listen(3000, ()=>{
    console.log("Server is running...")
});