const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const cors = require("cors")
const mongoSanitize = require("./middleware/mongoSanitize.middleware")
const { xss } = require("express-xss-sanitizer")
const app = express()
require('dotenv').config()

const rawCorsOrigins = process.env.CORS_ORIGIN || ""
const allowedOrigins = rawCorsOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const devOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173"
]

const allowedOriginSet = new Set(allowedOrigins)
if (process.env.NODE_ENV !== "production") {
    devOrigins.forEach((origin) => {
        allowedOriginSet.add(origin)
    })
}

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true)
        }

        if (allowedOriginSet.size === 0 || allowedOriginSet.has(origin)) {
            return callback(null, true)
        }

        const corsError = new Error("CORS not allowed for this origin")
        corsError.status = 403
        return callback(corsError)
    },
    credentials: true
}

app.disable("x-powered-by")
app.use(helmet())
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.text({ type: "text/plain" }))
app.use(cookieParser())
app.use(mongoSanitize)
app.use(xss())

const authRoutes= require("./routes/auth.routes")
const songRoutes = require("./routes/song.route")
const previewSongRoutes = require("./routes/previewSong.route")

app.use("/api/auth", authRoutes)
app.use("/api/songs", songRoutes)
app.use("/api/preview-song", previewSongRoutes)

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error)
    }

    const statusCode = error?.status || 500
    const message = error?.message || "Internal server error."

    return res.status(statusCode).json({
        message: statusCode >= 500 ? "Internal server error." : message
    })
})

module.exports = app
