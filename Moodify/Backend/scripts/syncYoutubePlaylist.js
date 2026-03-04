const path = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const songModel = require("../src/models/song.model");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MOODS = ["happy", "neutral", "shock", "sad"];
const YOUTUBE_URL_PATTERN = /(?:youtube\.com\/watch\?v=|youtu\.be\/)/i;

function parseArgs(argv) {
  const args = {
    playlist: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if ((token === "--playlist" || token === "-p") && next) {
      args.playlist = next.trim();
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
    { encoding: "utf8", maxBuffer: 12 * 1024 * 1024 }
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
  const dedupeMap = new Map();

  entries.forEach((entry, index) => {
    const id = typeof entry?.id === "string" ? entry.id.trim() : "";
    const title = typeof entry?.title === "string" ? entry.title.trim() : "";
    const artist = (entry?.channel || entry?.uploader || "Unknown Artist").toString().trim();

    if (!id || !title) {
      return;
    }

    const songUrl = `https://www.youtube.com/watch?v=${id}`;
    if (dedupeMap.has(songUrl)) {
      return;
    }

    dedupeMap.set(songUrl, {
      title,
      artist,
      mood: MOODS[index % MOODS.length],
      songUrl,
      posterUrl: pickBestThumbnail(entry?.thumbnails, id),
    });
  });

  return Array.from(dedupeMap.values());
}

async function syncPlaylist({ playlist }) {
  if (!playlist) {
    throw new Error("Missing playlist URL. Use --playlist <url>");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in Backend/.env");
  }

  const playlistData = runYtDlpDumpSingleJson(playlist);
  const playlistSongs = normalizePlaylistEntries(playlistData);
  const playlistUrls = playlistSongs.map((song) => song.songUrl);

  if (playlistSongs.length === 0) {
    throw new Error("No songs found in this playlist.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const deletedSeeded = await songModel.deleteMany({ artist: "Moodify Sample" });
  const deletedStaleYoutube = await songModel.deleteMany({
    songUrl: {
      $regex: YOUTUBE_URL_PATTERN,
      $nin: playlistUrls,
    },
  });

  const bulkOps = playlistSongs.map((song) => ({
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

  const upsertResult = await songModel.bulkWrite(bulkOps, { ordered: false });
  const finalTotal = await songModel.countDocuments();
  const finalYoutube = await songModel.countDocuments({ songUrl: YOUTUBE_URL_PATTERN });
  const finalMoodBreakdown = await songModel.aggregate([
    { $group: { _id: "$mood", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log("Playlist sync completed.");
  console.log(`Playlist title: ${playlistData?.title || "Unknown"}`);
  console.log(`Playlist unique songs: ${playlistSongs.length}`);
  console.log(`Deleted old seeded songs: ${deletedSeeded?.deletedCount || 0}`);
  console.log(`Deleted stale YouTube songs: ${deletedStaleYoutube?.deletedCount || 0}`);
  console.log(`Inserted new songs: ${upsertResult?.upsertedCount || 0}`);
  console.log(`Updated existing songs: ${upsertResult?.modifiedCount || 0}`);
  console.log(`Total songs in DB now: ${finalTotal}`);
  console.log(`YouTube songs in DB now: ${finalYoutube}`);
  console.log(`Mood distribution now: ${JSON.stringify(finalMoodBreakdown)}`);
}

const args = parseArgs(process.argv.slice(2));

syncPlaylist(args)
  .catch((error) => {
    console.error("Playlist sync failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
