const express = require("express")
const cookieparser = require("cookie-parser")
const authRouter = require("./routes/auth.routes")

const postRouter = require("./routes/post.routes")

const userRouter = require("./routes/user.routes")



const app = express()
app.use(express.json())
app.use("/api/auth", authRouter)
app.use(cookieparser())
app.use("/api/post", postRouter)

app.use('/api/users', userRouter)









module.exports = app