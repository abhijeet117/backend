const express = require("express")
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: "text/plain" }))

const authRoutes= require("./routes/auth.routes")

app.use("/api/auth", authRoutes)

module.exports = app
