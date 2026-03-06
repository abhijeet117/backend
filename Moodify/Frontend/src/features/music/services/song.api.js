import axios from "axios";
import { withApiBase } from "../../../config/apiBaseUrl";

const SONG_BASE_URL = withApiBase("/api/songs");
const IS_DEBUG = Boolean(import.meta.env.DEV);

class SongApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "SongApiError";
    this.status = status;
    this.details = details;
  }
}

const songApiClient = axios.create({
  baseURL: SONG_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function getSongsByMoodApi(mood) {
  try {
    if (IS_DEBUG) {
      console.debug("[Song API] GET /mood/:mood request", { mood, baseURL: SONG_BASE_URL });
    }

    const response = await songApiClient.get(`/mood/${encodeURIComponent(mood)}`);
    const payload = response?.data || {};

    const normalizedSongs = Array.isArray(payload?.songs) ? payload.songs : [];

    if (IS_DEBUG) {
      console.debug("[Song API] GET /mood/:mood response", {
        success: payload?.success,
        totalSongs: normalizedSongs.length,
        firstSongUrl: normalizedSongs[0]?.songUrl || null,
      });
    }

    return {
      success: Boolean(payload?.success),
      songs: normalizedSongs,
    };
  } catch (error) {
    const status = error?.response?.status || 0;
    const payload = error?.response?.data || null;
    const message = payload?.message || error?.message || "Song request failed.";

    if (IS_DEBUG) {
      console.error("[Song API] GET /mood/:mood failed", {
        mood,
        status,
        message,
        payload,
      });
    }

    throw new SongApiError(message, status, payload);
  }
}

export { SongApiError, getSongsByMoodApi };
