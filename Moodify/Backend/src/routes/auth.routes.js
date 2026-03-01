const express = require("express")

const router  = express.Router()
const authUser = require("../middleware/auth.middleware")


const {registerUser, loginUser, getme, logout} = require("../controllers/auth.controllers")

router.post("/register", registerUser )

router.post("/login", loginUser )

router.get("/getme", authUser, getme)

router.post("/logout", authUser, logout)

module.exports = router
