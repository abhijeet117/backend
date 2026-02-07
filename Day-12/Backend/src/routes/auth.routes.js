const { message } = require("antd")
const jwt = require("jsonwebtoken")
const userModel = require("../model/user.model")

const express = require("express")

const authRouter = express.Router()


authRouter.post("/register", async (req, res)=>{
    
    const {name, email, password} = req.body

    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists) {
        return res.status(400).json({
            message: "user already exist with this email address!"
        })
    }

    const user = await userModel.create({
        name, email, password
    })

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_TOKEN,
    )

    res.cookie("jwt_token", token)

    res.status(201).json({
        message: "User Data saved successfully!",
        user,
        token
    })

})


module.exports = authRouter

