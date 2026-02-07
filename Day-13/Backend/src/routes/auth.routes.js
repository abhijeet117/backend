const { message } = require("antd")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
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

    const hash = crypto.createHash("md5").update(password).digest("hex")

    const user = await userModel.create({
        name, email, password: hash
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

authRouter.post("/login", async (req, res)=>{
    
    const {email, password} = req.body
    const user = await userModel.findOne({ email })


    if(!user){
        return res.status(404).json({
            message: "User not found With this email!!!"
        })
    }

    

    const isPassWordMatched = user.password === crypto.createHash("md5").update(password).digest("hex")

    if(!isPassWordMatched) {
        return  res.status(401).json({
            message : "Password Dosen't matched, Try again!!"
        })
    }
    

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_TOKEN )

    res.cookie("jwt_cookie", token)

    res.status(200).json({
        message: "User Logges in...",
        user
    })
})

module.exports = authRouter;

