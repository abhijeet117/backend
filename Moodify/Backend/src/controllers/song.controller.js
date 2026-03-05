const songModel = require("../models/song.model");
const { uploadSong, uploadPoster, safeDeleteFromImageKit } = require("../services/imagekit.service");
const NodeID3 = require("node-id3");
const path = require("path");
const redis = require("../config/cache");

const ALLOWED_MOODS = new Set(["happy", "neutral", "shock", "sad"]);
const MOOD_QUERY_MAP = {
  happy: ["happy"],
  neutral: ["neutral", "calm"],
  shock: ["shock", "energetic"],
  sad: ["sad", "melancholy"],
};
const AUDIO_MIME_PREFIX = "audio/"; 
const IMAGE_MIME_PREFIX = "image/";
const DEFAULT_POSTER_URL = "https://placehold.co/600x600/png?text=Moodify";
const SONG_CACHE_TTL_SECONDS = Number(process.env.SONG_CACHE_TTL_SECONDS || 3600);
const MIME_TO_EXTENSION = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function debugSongLog(message, payload) {
  if (process.env.NODE_ENV === "production" && process.env.DEBUG_SONG_FLOW !== "true") {
    return;
  }

  if (payload === undefined) {
    console.debug(`[Songs API] ${message}`);
    return;
  }

  console.debug(`[Songs API] ${message}`, payload);
}

function getUploadedFile(req, fieldName) {
  const fieldFiles = req.files?.[fieldName];
  if (!Array.isArray(fieldFiles) || fieldFiles.length === 0) {
    return null;
  }

  return fieldFiles[0];
}

function isAudioFile(file) {
  return typeof file?.mimetype === "string" && file.mimetype.startsWith(AUDIO_MIME_PREFIX);
}

function isImageFile(file) {
  return typeof file?.mimetype === "string" && file.mimetype.startsWith(IMAGE_MIME_PREFIX);
}

async function safeDeleteImageKitFile(fileId) {
  await safeDeleteFromImageKit(fileId);
}

function normalizeMood(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function isRedisReady() {
  return redis && typeof redis.get === "function" && redis.status === "ready";
}

function getMoodSongsCacheKey(mood) {
  return `songs:mood:${mood}`;
}

async function readMoodSongsFromCache(mood) {
  if (!isRedisReady()) {
    return null;
  }

  try {
    const rawValue = await redis.get(getMoodSongsCacheKey(mood));
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeMoodSongsToCache(mood, songs) {
  if (!isRedisReady() || !Array.isArray(songs)) {
    return;
  }

  try {
    const payload = JSON.stringify(songs);
    if (Number.isFinite(SONG_CACHE_TTL_SECONDS) && SONG_CACHE_TTL_SECONDS > 0) {
      await redis.set(getMoodSongsCacheKey(mood), payload, "EX", SONG_CACHE_TTL_SECONDS);
      return;
    }

    await redis.set(getMoodSongsCacheKey(mood), payload);
  } catch {
    // Cache write failures should not affect API response.
  }
}

async function invalidateMoodSongsCache() {
  if (!isRedisReady()) {
    return;
  }

  try {
    const keys = [...ALLOWED_MOODS].map((mood) => getMoodSongsCacheKey(mood));
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Cache invalidation failures should not break write flow.
  }
}

function fallbackTitleFromFileName(fileName) {
  const parsed = path.parse(fileName || "");
  const raw = parsed.name || "";

  return raw.replace(/[_-]+/g, " ").trim();
}

function extractId3Metadata(file) {
  try {
    const tags = NodeID3.read(file?.buffer);
    const image = tags?.image && typeof tags.image === "object" ? tags.image : null;
    const imageMime = typeof image?.mime === "string" ? image.mime.trim().toLowerCase() : "";
    const imageBuffer = Buffer.isBuffer(image?.imageBuffer) ? image.imageBuffer : null;

    return {
      title: typeof tags?.title === "string" ? tags.title.trim() : "",
      artist: typeof tags?.artist === "string" ? tags.artist.trim() : "",
      imageMime,
      imageBuffer,
    };
  } catch (error) {
    debugSongLog("ID3 metadata read failed", { error: error?.message || "Unknown ID3 error" });
    return {
      title: "",
      artist: "",
      imageMime: "",
      imageBuffer: null,
    };
  }
}

function buildPosterFileFromId3(songFile, id3Metadata) {
  if (!Buffer.isBuffer(id3Metadata?.imageBuffer)) {
    return null;
  }

  const mimeType = id3Metadata?.imageMime;
  if (!mimeType || !mimeType.startsWith(IMAGE_MIME_PREFIX)) {
    return null;
  }

  const songFileName = path.parse(songFile?.originalname || "track").name || "track";
  const extension = MIME_TO_EXTENSION[mimeType] || ".jpg";

  return {
    originalname: `${songFileName}-cover${extension}`,
    mimetype: mimeType,
    buffer: id3Metadata.imageBuffer,
  };
}

async function createSong(req, res) {
  let songUpload = null;
  let posterUpload = null;

  try {
    const inputTitle = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const inputArtist = typeof req.body?.artist === "string" ? req.body.artist.trim() : "";
    const requestedMood = normalizeMood(req.body?.mood);
    const mood = requestedMood || "neutral";
    debugSongLog("POST /api/songs requested", { inputTitle, inputArtist, mood });

    if (requestedMood && !ALLOWED_MOODS.has(requestedMood)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mood. Allowed values: happy, neutral, shock, sad.",
      });
    }

    const songFile = req.file || getUploadedFile(req, "songFile") || getUploadedFile(req, "song");

    if (!songFile) {
      return res.status(400).json({
        success: false,
        message: "No song file uploaded",
      });
    }

    if (!isAudioFile(songFile)) {
      return res.status(400).json({
        success: false,
        message: "songFile must be an audio file.",
      });
    }

    const id3Metadata = extractId3Metadata(songFile);
    const title = inputTitle || id3Metadata.title || fallbackTitleFromFileName(songFile.originalname) || "Untitled Track";
    const artist = inputArtist || id3Metadata.artist || "Unknown Artist";
    const posterFile = buildPosterFileFromId3(songFile, id3Metadata);

    debugSongLog("Resolved song metadata", {
      title,
      artist,
      usedId3Title: !inputTitle && Boolean(id3Metadata.title),
      usedId3Artist: !inputArtist && Boolean(id3Metadata.artist),
      usedId3Poster: Boolean(posterFile),
    });
    const uploadTasks = [uploadSong(songFile, { title, artist, mood })];
    if (posterFile && isImageFile(posterFile)) {
      uploadTasks.push(uploadPoster(posterFile, { title, artist, mood }));
    }

    const uploadResults = await Promise.all(uploadTasks);
    songUpload = uploadResults[0] || null;
    posterUpload = uploadResults[1] || null;

    debugSongLog("ImageKit upload completed", {
      songFileId: songUpload.songFileId,
      posterFileId: posterUpload?.posterFileId || null,
      songUrl: songUpload.songUrl,
      posterUrl: posterUpload?.posterUrl || DEFAULT_POSTER_URL,
    });

    const createdSong = await songModel.create({
      title,
      artist,
      mood,
      songUrl: songUpload.songUrl,
      posterUrl: posterUpload?.posterUrl || DEFAULT_POSTER_URL,
      imageKitSongFileId: songUpload.songFileId,
      imageKitPosterFileId: posterUpload?.posterFileId || "",
      imageKitSongPath: songUpload.songPath,
      imageKitPosterPath: posterUpload?.posterPath || "",
    });
    debugSongLog("Song document created", {
      id: createdSong?._id?.toString?.() || createdSong?._id,
      mood: createdSong.mood,
      songUrl: createdSong.songUrl,
    });
    await invalidateMoodSongsCache();

    return res.status(201).json({
      success: true,
      message: "Song uploaded to ImageKit and saved successfully.",
      song: createdSong,
    });
  } catch (error) {
    await safeDeleteImageKitFile(posterUpload?.posterFileId);
    await safeDeleteImageKitFile(songUpload?.songFileId);

    debugSongLog("POST /api/songs failed", {
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to upload and save song.",
      error: error.message,
    });
  }
}

async function getSongsByMood(req, res) {
  try {
    const mood = normalizeMood(req.params?.mood);
    debugSongLog("GET /api/songs/mood/:mood requested", { mood });

    if (!ALLOWED_MOODS.has(mood)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mood. Allowed values: happy, neutral, shock, sad.",
      });
    }

    const cachedSongs = await readMoodSongsFromCache(mood);
    if (cachedSongs) {
      debugSongLog("Songs cache hit", {
        mood,
        totalSongs: cachedSongs.length,
      });

      return res.status(200).json({
        success: true,
        songs: cachedSongs,
        cached: true,
      });
    }

    const moodFilter = MOOD_QUERY_MAP[mood] || [mood];
    const songs = await songModel
      .find({ mood: { $in: moodFilter } })
      .select("title artist mood songUrl posterUrl")
      .sort({ createdAt: -1 })
      .lean();
    void writeMoodSongsToCache(mood, songs);
    debugSongLog("Songs fetched for mood", {
      mood,
      totalSongs: songs.length,
      topSong: songs[0]?.title || null,
    });

    return res.status(200).json({
      success: true,
      songs,
    });
  } catch (error) {
    debugSongLog("GET /api/songs/mood/:mood failed", { error: error.message });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch songs by mood.",
      error: error.message,
    });
  }
}

module.exports = {
  createSong,
  getSongsByMood,
};
