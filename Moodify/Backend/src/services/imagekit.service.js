const path = require("path");
const { toFile } = require("@imagekit/nodejs");
const { imageKitClient, isImageKitConfigured } = require("../config/imagekit");

const SONG_UPLOAD_ROOT = "cohort-2/moodify/songs";
const POSTER_UPLOAD_ROOT = "cohort-2/moodify/posters";
const PREVIEW_SONG_UPLOAD_ROOT = "cohort-2/moodify/preview-songs";

function normalizeFileNamePart(value, fallback) {
  const normalized = typeof value === "string" ? value : "";
  const safe = normalized
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return safe || fallback; 
}

function normalizeMood(value) {
  if (typeof value !== "string") {
    return "neutral";
  }

  return value.trim().toLowerCase();
}

function getFileExtension(file) {
  const extension = path.extname(file?.originalname || "").toLowerCase();
  if (extension) {
    return extension;
  }

  if (typeof file?.mimetype === "string") {
    const parts = file.mimetype.split("/");
    if (parts[1]) {
      return `.${parts[1].toLowerCase()}`;
    }
  }

  return "";
}

function buildUploadName(file, title, artist, suffix) {
  const safeTitle = normalizeFileNamePart(title, "track");
  const safeArtist = normalizeFileNamePart(artist, "artist");
  const extension = getFileExtension(file);

  return `${safeTitle}-${safeArtist}-${suffix}-${Date.now()}${extension}`;
}

function assertImageKitConfig() {
  if (!isImageKitConfigured() || !imageKitClient) {
    const error = new Error(
      "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT."
    );
    error.statusCode = 500;
    throw error;
  }
}

async function uploadSong(file, { title, artist, mood }) {
  assertImageKitConfig();

  const normalizedMood = normalizeMood(mood);
  const fileName = buildUploadName(file, title, artist, "song");

  const upload = await imageKitClient.files.upload({
    file: await toFile(file.buffer, fileName),
    fileName,
    folder: `/${SONG_UPLOAD_ROOT}/${normalizedMood}`,
    useUniqueFileName: false,
    tags: ["moodify", "song", normalizedMood],
  });

  return {
    songUrl: upload?.url || "",
    songFileId: upload?.fileId || "",
    songPath: upload?.filePath || "",
    raw: upload,
  };
}

async function uploadPoster(file, { title, artist, mood }) {
  assertImageKitConfig();

  const normalizedMood = normalizeMood(mood);
  const fileName = buildUploadName(file, title, artist, "poster");

  const upload = await imageKitClient.files.upload({
    file: await toFile(file.buffer, fileName),
    fileName,
    folder: `/${POSTER_UPLOAD_ROOT}/${normalizedMood}`,
    useUniqueFileName: false,
    tags: ["moodify", "poster", normalizedMood],
  });

  return {
    posterUrl: upload?.url || "",
    posterFileId: upload?.fileId || "",
    posterPath: upload?.filePath || "",
    raw: upload,
  };
}

async function uploadPreviewSong(fileBuffer, { fileName } = {}) {
  assertImageKitConfig();

  const safeFileName = typeof fileName === "string" && fileName.trim() ? fileName.trim() : `preview-${Date.now()}.mp3`;
  const upload = await imageKitClient.files.upload({
    file: await toFile(fileBuffer, safeFileName),
    fileName: safeFileName,
    folder: `/${PREVIEW_SONG_UPLOAD_ROOT}`,
    useUniqueFileName: false,
    tags: ["moodify", "preview-song"],
  });

  return {
    songUrl: upload?.url || "",
    songFileId: upload?.fileId || "",
    songPath: upload?.filePath || "",
    raw: upload,
  };
}

async function safeDeleteFromImageKit(fileId) {
  if (!fileId || !imageKitClient) {
    return;
  }

  try {
    await imageKitClient.files.delete(fileId);
  } catch (error) {
    console.warn("[ImageKit] Cleanup failed:", error?.message || error);
  }
}

module.exports = {
  uploadSong,
  uploadPoster,
  uploadPreviewSong,
  safeDeleteFromImageKit,
};
