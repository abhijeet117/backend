const express = require("express");
const app = express();
app.use(express.json());

app.use(express.static("./public"))

const cors = require("cors");
app.use(cors());

const noteModel = require("./models/note.models.js");

app.post("https://backend-lsko.onrender.com/api/notes", async (req, res) => {
  const { tittle, description } = req.body;

  const note = await noteModel.create({
    tittle,
    description,
  });

  res.status(201).json({
    message: "Note created successfully!",
    note,
  });
});

app.get("/api/notes", async (req, res) => {
  const note = await noteModel.find();

  res.status(200).json({
    message: "Notes Fetched Successfully!",
    note,
  });
});

app.delete("https://backend-lsko.onrender.com/api/notes/:id", async (req, res) => {
  const id = req.params.id;
  console.log(id); // known what the id was

  const note = await noteModel.findByIdAndDelete(id);

  res.status(200).json({
    message: "Note deleted successfully!",
  });
});

app.patch("/api/notes/:id", async (req, res) => {
  const id = req.params.id;

  const { description } = req.body;

  const note = await noteModel.findByIdAndUpdate(id, { description });

  res.status(200).json({
    message: "Note updated successfully!",
  });
});

module.exports = app;
