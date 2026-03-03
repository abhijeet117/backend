const express = require("express")

const router  = express.Router()
const authUser = require("../middleware/auth.middleware")


const {registerUser, loginUser, getme, logout, saveExpression, getExpressionHistory} = require("../controllers/auth.controllers")

router.post("/register", registerUser )

router.post("/login", loginUser )

router.get("/getme", authUser, getme)

router.get("/expressions", authUser, getExpressionHistory)

router.post("/expressions", authUser, saveExpression)

router.post("/logout", logout)

module.exports = router
