import axios from "axios";

const previewSongClient = axios.create({
  baseURL: "/api/preview-song",
  withCredentials: true,
});

async function getPreviewSongApi() {
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

export { getPreviewSongApi };
