const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const { getPreviewSongAsset } = require("../src/services/previewSong.service");

async function preparePreviewSong() {
  const preview = await getPreviewSongAsset();
  console.log("Preview song prepared successfully.");
  console.log(`URL: ${preview.songUrl}`);
  console.log(`Cached: ${Boolean(preview.cached)}`);
}

preparePreviewSong().catch((error) => {
  console.error("Failed to prepare preview song:", error.message);
  process.exitCode = 1;
});
