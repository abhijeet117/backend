const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const authRouter = require("./routes/auth.routes")
const postRouter = require("./routes/post.routes")
const userRouter = require("./routes/user.routes")

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]

function isLocalDevOrigin(origin) {
  return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true)
    }
    return callback(new Error("CORS origin not allowed"))
  },
  credentials: true,
}

// FIRST: CORS
app.use(cors(corsOptions))

// THEN: Other middlewares
app.use(express.json())
app.use(cookieParser())

// THEN: Routes
app.use("/api/auth", authRouter)
app.use("/api/post", postRouter)
app.use("/api/users", userRouter)

module.exports = app
