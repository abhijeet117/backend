const express = require("express");
const multer = require("multer");

const router = express.Router();
const authUser = require("../middleware/auth.middleware");
const { createSong, getSongsByMood } = require("../controllers/song.controller");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 2,
  }, 
});

const uploadSong = upload.fields([
  { name: "song", maxCount: 1 },
  { name: "songFile", maxCount: 1 },
]);

function handleSongUpload(req, res, next) {
  uploadSong(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        message: `Upload error: ${error.message}`,
      });
    }

    return res.status(400).json({
      message: "Invalid upload request.",
      error: error.message,
    });
  });
}

router.post("/", handleSongUpload, createSong);
router.get("/mood/:mood", authUser, getSongsByMood);

module.exports = router;
