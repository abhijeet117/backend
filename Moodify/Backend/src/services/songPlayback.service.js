const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const songModel = require("../models/song.model");
const redis = require("../config/cache");
const { uploadSong } = require("./imagekit.service");

const PLAYBACK_CACHE_TTL_SECONDS = Number(process.env.SONG_PLAYBACK_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7);
const YOUTUBE_URL_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i;

const inflightPlaybackRequests = new Map();

function isRedisReady() {
  return redis && typeof redis.get === "function" && redis.status === "ready";
}

function isYouTubeUrl(url) {
  return typeof url === "string" && YOUTUBE_URL_PATTERN.test(url.trim());
}

function getPlaybackCacheKey(songId) {
  return `songPlayback:${songId}`;
}

function sanitizePlaybackPayload(payload) {
  const songUrl = typeof payload?.songUrl === "string" ? payload.songUrl.trim() : "";
  if (!songUrl) {
    return null;
  }

  return {
    songUrl,
    sourceUrl: typeof payload?.sourceUrl === "string" ? payload.sourceUrl.trim() : "",
    uploadedAt: payload?.uploadedAt || null,
    direct: !isYouTubeUrl(songUrl),
    pending: Boolean(payload?.pending),
    cached: Boolean(payload?.cached),
  };
}

async function readPlaybackFromRedis(songId) {
  if (!isRedisReady() || !songId) {
    return null;
  }

  try {
    const rawValue = await redis.get(getPlaybackCacheKey(songId));
    if (!rawValue) {
      return null;
    }

    return sanitizePlaybackPayload(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

async function writePlaybackToRedis(songId, playback) {
  if (!isRedisReady() || !songId) {
    return;
  }

  try {
    const payload = JSON.stringify({
      songUrl: playback.songUrl,
      sourceUrl: playback.sourceUrl,
      uploadedAt: playback.uploadedAt,
      direct: playback.direct,
    });

    if (Number.isFinite(PLAYBACK_CACHE_TTL_SECONDS) && PLAYBACK_CACHE_TTL_SECONDS > 0) {
      await redis.set(getPlaybackCacheKey(songId), payload, "EX", PLAYBACK_CACHE_TTL_SECONDS);
      return;
    }

    await redis.set(getPlaybackCacheKey(songId), payload);
  } catch {
    // Playback cache is a performance optimization only.
  }
}

function getDirectPlaybackPayload(song) {
  const playbackUrl = typeof song?.playbackUrl === "string" ? song.playbackUrl.trim() : "";
  const songUrl = typeof song?.songUrl === "string" ? song.songUrl.trim() : "";
  const sourceUrl = typeof song?.sourceUrl === "string" ? song.sourceUrl.trim() : songUrl;
  const resolvedUrl = playbackUrl || songUrl;

  if (!resolvedUrl || isYouTubeUrl(resolvedUrl)) {
    return null;
  }

  return {
    songUrl: resolvedUrl,
    sourceUrl,
    uploadedAt: song?.playbackReadyAt || song?.updatedAt || song?.createdAt || null,
    direct: true,
    pending: false,
    cached: Boolean(playbackUrl),
  };
}

function createPendingPlaybackPayload(song) {
  const songUrl = typeof song?.songUrl === "string" ? song.songUrl.trim() : "";
  const sourceUrl = typeof song?.sourceUrl === "string" ? song.sourceUrl.trim() : songUrl;

  return {
    songUrl,
    sourceUrl,
    uploadedAt: song?.playbackReadyAt || null,
    direct: false,
    pending: true,
    cached: false,
  };
}

function runYtDlpDownload(tempDir, sourceUrl, songId) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(tempDir, `moodify-song-${songId}-%(id)s.%(ext)s`);
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
      // Keep looking for the produced file.
    }
  }

  const files = await fs.readdir(tempDir);
  const mp3File = files.find((fileName) => fileName.toLowerCase().endsWith(".mp3"));

  if (!mp3File) {
    throw new Error("yt-dlp did not produce an mp3 output file.");
  }

  return path.join(tempDir, mp3File);
}

async function preparePlaybackAsset(song) {
  const songId = song?._id?.toString?.() || song?._id;
  if (!songId) {
    throw new Error("Song id is required to prepare playback.");
  }

  const cachedPlayback = await readPlaybackFromRedis(songId);
  if (cachedPlayback?.direct) {
    return cachedPlayback;
  }

  const directPlayback = getDirectPlaybackPayload(song);
  if (directPlayback?.direct) {
    void writePlaybackToRedis(songId, directPlayback);
    return directPlayback;
  }

  if (!isYouTubeUrl(song?.songUrl)) {
    return sanitizePlaybackPayload({
      songUrl: song?.songUrl,
      sourceUrl: song?.sourceUrl || song?.songUrl,
      uploadedAt: song?.updatedAt || song?.createdAt || null,
      direct: true,
    });
  }

  if (inflightPlaybackRequests.has(songId)) {
    return inflightPlaybackRequests.get(songId);
  }

  const requestPromise = (async () => {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "moodify-song-"));

    try {
      const ytDlpStdout = await runYtDlpDownload(tempDir, song.songUrl, songId);
      const downloadedPath = await resolveDownloadedMp3Path(tempDir, ytDlpStdout);
      const audioBuffer = await fs.readFile(downloadedPath);
      const uploadedSong = await uploadSong(
        {
          buffer: audioBuffer,
          originalname: path.basename(downloadedPath),
          mimetype: "audio/mpeg",
        },
        {
          title: song.title || "track",
          artist: song.artist || "artist",
          mood: song.mood || "neutral",
        }
      );

      if (!uploadedSong?.songUrl) {
        throw new Error("ImageKit upload succeeded but no song URL was returned.");
      }

      const uploadedAt = new Date().toISOString();
      const playbackPayload = {
        songUrl: uploadedSong.songUrl,
        sourceUrl: song.sourceUrl || song.songUrl,
        uploadedAt,
        direct: true,
        pending: false,
        cached: false,
      };

      await songModel.updateOne(
        { _id: songId },
        {
          $set: {
            sourceUrl: song.sourceUrl || song.songUrl,
            playbackUrl: uploadedSong.songUrl,
            playbackReadyAt: uploadedAt,
            audioFormat: uploadedSong.audioFormat || "mp3",
            audioBitrateKbps: uploadedSong.audioBitrateKbps || null,
            audioBytes: uploadedSong.optimizedBytes || uploadedSong.audioBytes || null,
          },
        }
      );

      void writePlaybackToRedis(songId, playbackPayload);
      return playbackPayload;
    } finally {
      inflightPlaybackRequests.delete(songId);
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  })();

  inflightPlaybackRequests.set(songId, requestPromise);
  return requestPromise;
}

async function getSongPlaybackAsset(songId, { waitForPreparation = false } = {}) {
  const song = await songModel.findById(songId).lean();
  if (!song) {
    const error = new Error("Song not found.");
    error.statusCode = 404;
    throw error;
  }

  const directPlayback = getDirectPlaybackPayload(song);
  if (directPlayback) {
    void writePlaybackToRedis(songId, directPlayback);
    return directPlayback;
  }

  const cachedPlayback = await readPlaybackFromRedis(songId);
  if (cachedPlayback?.direct) {
    return cachedPlayback;
  }

  if (!waitForPreparation) {
    warmSongPlaybackAsset(song);
    return createPendingPlaybackPayload(song);
  }

  return preparePlaybackAsset(song);
}

function warmSongPlaybackAsset(song) {
  const songId = song?._id?.toString?.() || song?._id;
  if (!songId || inflightPlaybackRequests.has(songId)) {
    return;
  }

  const directPlayback = getDirectPlaybackPayload(song);
  if (directPlayback?.direct) {
    void writePlaybackToRedis(songId, directPlayback);
    return;
  }

  if (!isYouTubeUrl(song?.songUrl)) {
    return;
  }

  void preparePlaybackAsset(song).catch(() => {
    // Background warmup is best-effort.
  });
}

module.exports = {
  getSongPlaybackAsset,
  isYouTubeUrl,
  warmSongPlaybackAsset,
};
