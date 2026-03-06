const mongoose = require("mongoose");

const ALLOWED_MOODS = ["happy", "neutral", "shock", "sad"];
const URL_PATTERN = /^https?:\/\/.+/i;

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required."],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, "Song artist is required."],
      trim: true,
    },
    mood: {
      type: String,
      required: [true, "Song mood is required."],
      enum: ALLOWED_MOODS,
      lowercase: true,
      trim: true,
    },
    songUrl: {
      type: String,
      required: [true, "Song URL is required."],
      trim: true,
      validate: {
        validator: (value) => URL_PATTERN.test(value),
        message: "songUrl must be a valid URL.",
      },
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => !value || URL_PATTERN.test(value),
        message: "sourceUrl must be a valid URL.",
      },
    },
    playbackUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (value) => !value || URL_PATTERN.test(value),
        message: "playbackUrl must be a valid URL.",
      },
    },
    posterUrl: {
      type: String,
      required: [true, "Poster URL is required."],
      trim: true,
      validate: {
        validator: (value) => URL_PATTERN.test(value),
        message: "posterUrl must be a valid URL.",
      },
    },
    imageKitSongFileId: {
      type: String,
      trim: true,
      default: "",
    },
    imageKitPosterFileId: {
      type: String,
      trim: true,
      default: "",
    },
    imageKitSongPath: {
      type: String,
      trim: true,
      default: "",
    },
    imageKitPosterPath: {
      type: String,
      trim: true,
      default: "",
    },
    audioFormat: {
      type: String,
      trim: true,
      default: "",
    },
    audioBitrateKbps: {
      type: Number,
      default: null,
      min: 1,
    },
    audioBytes: {
      type: Number,
      default: null,
      min: 1,
    },
    playbackReadyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

songSchema.index({ mood: 1, createdAt: -1 });

const songModel = mongoose.models.Song || mongoose.model("Song", songSchema);

module.exports = songModel;
