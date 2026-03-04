const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { uploadPreviewSong } = require("./imagekit.service");

const PREVIEW_SOURCE_URL = process.env.PREVIEW_SONG_SOURCE_URL || "https://youtu.be/FF-_QBizdZQ";
const PREVIEW_FILE_BASENAME = "moodify-preview-song";

let cachedPreview = null;
let inflightRequest = null; 

function runYtDlpDownload(tempDir, sourceUrl) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(tempDir, `${PREVIEW_FILE_BASENAME}-%(id)s.%(ext)s`);
    const args = [
      "--no-playlist",
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--output",
      outputTemplate,
      "--print",
      "after_move:filepath",
      sourceUrl,
    ];

    const ytDlp = spawn("yt-dlp", args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    ytDlp.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    ytDlp.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    ytDlp.on("error", (error) => {
      reject(new Error(`yt-dlp execution failed: ${error.message}`));
    });

    ytDlp.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp failed with exit code ${code}. ${stderr.trim()}`));
        return;
      }

      resolve(stdout);
    });
  });
}

function getVideoIdFromUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\//, "").trim();
    }

    if (parsed.hostname.includes("youtube.com")) {
      return (parsed.searchParams.get("v") || "").trim();
    }
  } catch {
    return "";
  }

  return "";
}

async function resolveDownloadedMp3Path(tempDir, ytDlpStdout) {
  const candidates = ytDlpStdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().endsWith(".mp3"));

  for (const candidate of candidates.reverse()) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue checking next candidate
    }
  }

  const files = await fs.readdir(tempDir);
  const mp3File = files.find((fileName) => fileName.toLowerCase().endsWith(".mp3"));

  if (!mp3File) {
    throw new Error("yt-dlp did not produce an mp3 output file.");
  }

  return path.join(tempDir, mp3File);
}

async function buildAndUploadPreviewSong() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "moodify-preview-"));

  try {
    const ytDlpStdout = await runYtDlpDownload(tempDir, PREVIEW_SOURCE_URL);
    const mp3Path = await resolveDownloadedMp3Path(tempDir, ytDlpStdout);
    const mp3Buffer = await fs.readFile(mp3Path);
    const videoId = getVideoIdFromUrl(PREVIEW_SOURCE_URL);
    const fileName = videoId
      ? `${PREVIEW_FILE_BASENAME}-${videoId}-${Date.now()}.mp3`
      : `${PREVIEW_FILE_BASENAME}-${Date.now()}.mp3`;

    const upload = await uploadPreviewSong(mp3Buffer, {
      fileName,
    });

    if (!upload?.songUrl) {
      throw new Error("ImageKit upload succeeded but no URL was returned.");
    }

    cachedPreview = {
      songUrl: upload.songUrl,
      sourceUrl: PREVIEW_SOURCE_URL,
      uploadedAt: new Date().toISOString(),
    };

    return {
      ...cachedPreview,
      cached: false,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function getPreviewSongAsset() {
  if (cachedPreview?.songUrl) {
    return {
      ...cachedPreview,
      cached: true,
    };
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = buildAndUploadPreviewSong()
    .catch((error) => {
      throw error;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}

module.exports = {
  getPreviewSongAsset,
};
