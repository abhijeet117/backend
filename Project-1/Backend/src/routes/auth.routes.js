const express = require("express")
const authRouter = express.Router()

const {userRegister , userLogin, getData, userLogout } = require("../Controllers/auth.controllers")

const identifyUser = require("../middleware/auth.middleware")


authRouter.post("/register", userRegister );

authRouter.post("/login", userLogin )

authRouter.post("/get-me", identifyUser, getData )
authRouter.post("/logout", identifyUser, userLogout)




module.exports = authRouter
