const express = require("express")
const authRouter = express.Router()

const {userRegister , userLogin } = require("../Controllers/auth.controllers")


authRouter.post("/register", userRegister );

authRouter.post("/login", userLogin )




module.exports = authRouter