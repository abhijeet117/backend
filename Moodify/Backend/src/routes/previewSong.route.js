const express = require("express");
const { getPreviewSong } = require("../controllers/previewSong.controller");

const router = express.Router();

router.get("/", getPreviewSong);

module.exports = router;
 