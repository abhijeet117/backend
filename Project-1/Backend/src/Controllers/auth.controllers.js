const userModel = require("../models/user.model")
const crypto = require("crypto")
const jwt = require('jsonwebtoken')


async function userRegister(req, res) {
  const { userName, email, password, bio, profileImg } = req.body;

  const alreadyExits = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (alreadyExits) {
    return res.status(409).json({
      message:
        "User already exists" + alreadyExits === email
          ? "email already exist"
          : "userName already exist",
    });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const user = await userModel.create({
    userName,
    email,
    password : hash,
    bio,
    profileImg
  })

  const token = jwt.sign({
    id : user._id,
  }, process.env.JWT_SECRET, {expire : '1d'})

  res.cookie("token", token)

  res.status(201).json({
    message : "user registered sucessfully!",
    user : {
        userName : user.userName,
        email : user.email,
        bio : user.bio,
        profileImg : user.profileImg
    }
  })


}

async function userLogin(req, res) {
  const {email , userName , password} = req.body

  const user = await userModel.findOne({
    $or : [
      {
        userName : userName
      },
      {
        email : email
      }
    ]
  })

  if(!user) {
    return res.status(404).json({
      message: "User not found!"
    })
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const isPassword = hash === user.password

  if(!isPassword) {
    return res.status(401).json({
      message : "Password is incorrect!"
    })
  }

  const token = jwt.sign(
    {id : user._id},
    process.env.JWT_SECRET, {expiresIn : '3d'}
  )

  res.cookie('token', token)

  res.status(200).json({
    message : "LoggedIn sucsessfullly...", 
    user : {
      userName : user.userName,
      email : user.email,
      bio : user.bio,
      profileImg : user.profileImg

    }
  })

}

module.exports = {userRegister , userLogin }