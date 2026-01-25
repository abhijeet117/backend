const express = require("express");
const app = express()

app.use(express.json())

let notes = [];

app.post('/notes', (req, res)=>{
    notes.push(req.body)
    res.send("Note Saved Successfully...");
    console.log(req.body);
})

app.get('/notes', (req, res)=>{
    res.send(notes)
})

app.delete('/notes/:index', (req, res)=>{
    delete notes[req.params.index]

    res.send("Deleted successfully...")
})

app.patch('/notes/:index', (req, res)=>{
    notes[ req.params.index ].description = req.body.description

    res.send("description updated successfully...")
})


module.exports = app;