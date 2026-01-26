const { message } = require("antd");
const express = require("express");
const app = express();
app.use(express.json());

const notes = [];

app.post("/notes", (req, res) => {
  notes.push(req.body)

  res.status(201).json({
    message: "Note created succussfully!"
  });

});

app.get("/notes", (req, res) => {

  res.status(200).json({
    message: notes
  });

});


app.delete("/notes/:index", (req, res) =>{
    delete notes[req.params.index]

    res.status(204).json({
        message : "Request data has been deleted!"
    })
})

app.patch("/notes/:index", (req ,res)=>{
    notes[req.params.index].tittle = req.body.tittle

    res.status(200).json({
        message : "Data modified!"
    })
})

module.exports = app;
