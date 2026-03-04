const { getPreviewSongAsset } = require("../services/previewSong.service");

async function getPreviewSong(req, res) {
  try {
    const preview = await getPreviewSongAsset();

    return res.status(200).json({
      success: true,
      songUrl: preview.songUrl,
      sourceUrl: preview.sourceUrl,
      cached: Boolean(preview.cached),
      uploadedAt: preview.uploadedAt || null, 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to prepare preview song.",
      error: error.message,
    });
  }
}

module.exports = {
  getPreviewSong,
};
