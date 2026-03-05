import axios from "axios";

const previewSongClient = axios.create({
  baseURL: "/api/preview-song",
  withCredentials: true,
});

let cachedPreviewPayload = null;
let previewRequestPromise = null;

async function fetchPreviewSongFromServer() {
  const response = await previewSongClient.get("/");
  const payload = response?.data || {};

  if (!payload?.success || typeof payload?.songUrl !== "string" || !payload.songUrl.trim()) {
    throw new Error(payload?.message || "Preview song URL is missing.");
  }

  return {
    songUrl: payload.songUrl.trim(),
    sourceUrl: payload?.sourceUrl || "",
    cached: Boolean(payload?.cached),
    uploadedAt: payload?.uploadedAt || null,
  };
}

async function getPreviewSongApi({ forceRefresh = false } = {}) {
  if (!forceRefresh && cachedPreviewPayload?.songUrl) {
    return cachedPreviewPayload;
  }

  if (!forceRefresh && previewRequestPromise) {
    return previewRequestPromise;
  }

  previewRequestPromise = fetchPreviewSongFromServer()
    .then((preview) => {
      cachedPreviewPayload = preview;
      return preview;
    })
    .finally(() => {
      previewRequestPromise = null;
    });

  return previewRequestPromise;
}

function prefetchPreviewSongApi() {
  if (cachedPreviewPayload?.songUrl || previewRequestPromise) {
    return;
  }

  void getPreviewSongApi().catch(() => {
    // Best-effort prefetch.
  });
}

export { getPreviewSongApi, prefetchPreviewSongApi };
