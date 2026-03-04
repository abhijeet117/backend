const express = require("express")
const cookieParser = require("cookie-parser")
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: "text/plain" }))
app.use(cookieParser())

const authRoutes= require("./routes/auth.routes")
const songRoutes = require("./routes/song.route")
const previewSongRoutes = require("./routes/previewSong.route")

app.use("/api/auth", authRoutes)
app.use("/api/songs", songRoutes)
app.use("/api/preview-song", previewSongRoutes)

module.exports = app
