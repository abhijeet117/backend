const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')


async function userRegister(req, res) {
  const { email, password, bio, profileImg } = req.body;
  const userName = req.body.userName || req.body.username;

  if (!userName || !email || !password) {
    return res.status(400).json({
      message: "userName, email and password are required!",
    })
  }

  const alreadyExits = await userModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (alreadyExits) {
    const duplicateField = alreadyExits.email === email ? "email already exist" : "userName already exist";
    return res.status(409).json({
      message: `User already exists: ${duplicateField}`,
    });
  }

  const hash = await bcrypt.hash(password, 10)

  const user = await userModel.create({
    userName,
    email,
    password : hash,
    bio,
    profileImg
  })

  const token = jwt.sign({
    id : user._id,
  }, process.env.JWT_SECRET, {expiresIn : '7d'})

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
  const {email , password} = req.body
  const userName = req.body.userName || req.body.username

  if ((!email && !userName) || !password) {
    return res.status(400).json({
      message: "Provide userName/email and password",
    })
  }

  const user = await userModel.findOne({
    $or : [
      {
        userName : userName
      },
      {
        email : email
      }
    ]
  }).select("+password userName email bio profileImg")

  if(!user) {
    return res.status(404).json({
      message: "User not found!"
    })
  }

  /* onst hash = crypto.createHash("sha256").update(password).digest("hex");

  const isPassword = hash === user.password */

  const isPassword = await bcrypt.compare(password, user.password)



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

async function getData(req, res) {
  const userId = req.user.id

  const user = await userModel.findById(userId)
  if (!user) {
    return res.status(404).json({
      message: "User not found!",
    })
  }

  res.status(200).json({
    user : {
      userName : user.userName,
      email : user.email,
      bio : user.bio,
      profileImg : user.profileImg
    }
  })
}

async function userLogout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
  });
}

module.exports = {userRegister , userLogin , getData, userLogout };
