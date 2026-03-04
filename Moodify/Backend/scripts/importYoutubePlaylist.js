const path = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const songModel = require("../src/models/song.model");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MOODS = ["happy", "neutral", "shock", "sad"];

function parseArgs(argv) {
  const args = {
    playlist: "",
    max: 0,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if ((token === "--playlist" || token === "-p") && next) {
      args.playlist = next.trim();
      index += 1;
      continue;
    }

    if ((token === "--max" || token === "-m") && next) {
      const parsed = Number(next);
      args.max = Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
      index += 1;
    }
  }

  if (!args.playlist) {
    const positional = argv.find((token) => typeof token === "string" && /^https?:\/\//i.test(token.trim()));
    if (positional) {
      args.playlist = positional.trim();
    }
  }

  return args;
}

function runYtDlpDumpSingleJson(playlistUrl) {
  const result = spawnSync(
    "yt-dlp",
    ["--flat-playlist", "--dump-single-json", playlistUrl],
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }
  );

  if (result.error) {
    throw new Error(`yt-dlp failed: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || "yt-dlp returned a non-zero exit code.");
  }

  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    throw new Error(`Failed to parse yt-dlp response: ${error.message}`);
  }
}

function pickBestThumbnail(thumbnails, fallbackVideoId) {
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    const sorted = [...thumbnails].sort((a, b) => (b?.width || 0) - (a?.width || 0));
    if (typeof sorted[0]?.url === "string" && sorted[0].url.trim()) {
      return sorted[0].url.trim();
    }
  }

  if (fallbackVideoId) {
    return `https://i.ytimg.com/vi/${fallbackVideoId}/hqdefault.jpg`;
  }

  return "https://placehold.co/600x600/png?text=Moodify";
}

function normalizePlaylistEntries(payload) {
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];

  return entries
    .map((entry, index) => {
      const id = typeof entry?.id === "string" ? entry.id.trim() : "";
      const title = typeof entry?.title === "string" ? entry.title.trim() : "";
      const artist = (entry?.channel || entry?.uploader || "Unknown Artist").toString().trim();

      if (!id || !title) {
        return null;
      }

      const mood = MOODS[index % MOODS.length];

      return {
        title,
        artist,
        mood,
        songUrl: `https://www.youtube.com/watch?v=${id}`,
        posterUrl: pickBestThumbnail(entry?.thumbnails, id),
      };
    })
    .filter(Boolean);
}

async function importPlaylist({ playlist, max }) {
  if (!playlist) {
    throw new Error("Missing playlist URL. Use --playlist <url>");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in Backend/.env");
  }

  const playlistData = runYtDlpDumpSingleJson(playlist);
  const normalizedEntries = normalizePlaylistEntries(playlistData);
  const songsToImport = max > 0 ? normalizedEntries.slice(0, max) : normalizedEntries;

  if (songsToImport.length === 0) {
    throw new Error("No songs found in this playlist.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const operations = songsToImport.map((song) => ({
    updateOne: {
      filter: { songUrl: song.songUrl },
      update: {
        $set: {
          title: song.title,
          artist: song.artist,
          mood: song.mood,
          songUrl: song.songUrl,
          posterUrl: song.posterUrl,
        },
      },
      upsert: true,
    },
  }));

  const result = await songModel.bulkWrite(operations, { ordered: false });
  const moodBreakdown = await songModel.aggregate([
    {
      $match: {
        songUrl: { $in: songsToImport.map((song) => song.songUrl) },
      },
    },
    { $group: { _id: "$mood", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log("YouTube playlist import completed.");
  console.log(`Playlist title: ${playlistData?.title || "Unknown"}`);
  console.log(`Songs prepared: ${songsToImport.length}`);
  console.log(`Inserted new songs: ${result?.upsertedCount || 0}`);
  console.log(`Updated existing songs: ${result?.modifiedCount || 0}`);
  console.log(`Matched existing songs: ${result?.matchedCount || 0}`);
  console.log(`Mood distribution in imported set: ${JSON.stringify(moodBreakdown)}`);
}

const args = parseArgs(process.argv.slice(2));

importPlaylist(args)
  .catch((error) => {
    console.error("YouTube playlist import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
