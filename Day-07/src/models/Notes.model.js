const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
    tittle : String,
    description: String,
})

const noteModel = mongoose.model("notes", noteSchema)

module.exports = noteModel;