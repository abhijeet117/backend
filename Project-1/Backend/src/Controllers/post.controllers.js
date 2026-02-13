const postModel = require("../models/post.model");

const ImageKit = require("@imagekit/nodejs");
const { toFile } = require("@imagekit/nodejs");
const { message } = require("antd");
const jwt = require("jsonwebtoken");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function createPost(req, res) {
  console.log(req.body, req.file);

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not matched, Unauthorised access!",
    });
  }

  let decode; // Scoping to use in global

  try {
    decode = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "User not authorised...",
    });
  }

  const file = await imagekit.files.upload({
    file: await toFile(Buffer.from(req.file.buffer), "file"),
    fileName: "image",
    folder: "Cohort-2-insta-clone",
  });
   
  
  const post = await postModel.create({
    caption: req.body.tittle,
    img_url: file.url,
    user: decode.id,
  });

  res.status(201).json({
    message: "Post created successfully!",
    post,
  });
}

module.exports = { createPost };
