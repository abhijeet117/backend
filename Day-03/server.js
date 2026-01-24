const express = require("express");

const app = express()
app.use(express.json());

let note = []

app.post('/note', (req, res)=>{

    note.push(req.body)
    res.send("note created")

})


app.get('/note', (req,res)=>{
    res.send(note);
})



app.listen(3000, ()=>{
    console.log("Server Started")
})