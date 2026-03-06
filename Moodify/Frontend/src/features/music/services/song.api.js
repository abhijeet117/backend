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

const playbackUrlCache = new Map();
const playbackRequestCache = new Map();

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
      selectedSong: payload?.selectedSong || null,
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

async function getSongPlaybackApi(songId, { forceRefresh = false, waitForReady = false } = {}) {
  const normalizedSongId = typeof songId === "string" ? songId.trim() : "";
  if (!normalizedSongId) {
    throw new SongApiError("Song id is required.", 400);
  }

  const cacheKey = `${normalizedSongId}:${waitForReady ? "wait" : "now"}`;
  if (!forceRefresh && waitForReady === false && playbackUrlCache.has(normalizedSongId)) {
    return playbackUrlCache.get(normalizedSongId);
  }

  if (!forceRefresh && playbackRequestCache.has(cacheKey)) {
    return playbackRequestCache.get(cacheKey);
  }

  const requestPromise = songApiClient
    .get(`/playback/${encodeURIComponent(normalizedSongId)}`, {
      params: waitForReady ? { wait: 1 } : undefined,
    })
    .then((response) => {
      const payload = response?.data || {};
      if (!payload?.success || typeof payload?.songUrl !== "string" || !payload.songUrl.trim()) {
        throw new SongApiError(payload?.message || "Playback URL is missing.", response?.status || 500, payload);
      }

      const normalizedPayload = {
        songId: normalizedSongId,
        songUrl: payload.songUrl.trim(),
        sourceUrl: typeof payload?.sourceUrl === "string" ? payload.sourceUrl.trim() : "",
        pending: Boolean(payload?.pending),
        direct: Boolean(payload?.direct),
        cached: Boolean(payload?.cached),
        uploadedAt: payload?.uploadedAt || null,
      };

      if (!normalizedPayload.pending) {
        playbackUrlCache.set(normalizedSongId, normalizedPayload);
      }

      return normalizedPayload;
    })
    .catch((error) => {
      const status = error?.response?.status || error?.status || 0;
      const payload = error?.response?.data || error?.details || null;
      const message = payload?.message || error?.message || "Playback request failed.";
      throw new SongApiError(message, status, payload);
    })
    .finally(() => {
      playbackRequestCache.delete(cacheKey);
    });

  playbackRequestCache.set(cacheKey, requestPromise);
  return requestPromise;
}

export { SongApiError, getSongPlaybackApi, getSongsByMoodApi };
