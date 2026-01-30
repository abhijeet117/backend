const express = require("express");

const app = express();
app.use(express.json());

const noteModel = require("./models/Notes.model.js");


app.post("/notes", async (req,res)=>{

    const {tittle, description} = req.body;

    const note = await noteModel.create({
        tittle, description
    })

    res.status(201).json({
        message: "Note created successfully",
        note
    })
});


app.get("/notes", async (req, res)=>{
    const note = await noteModel.find();

    res.status(200).json({
        message: "Here is your Note!", 
        note
    })
});

module.exports = app;