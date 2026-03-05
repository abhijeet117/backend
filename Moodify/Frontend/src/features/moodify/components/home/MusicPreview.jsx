import { useCallback } from "react";
import { musicPreviewHtml } from "../../assets/templates/fragments.js";
import { getPreviewSongApi, prefetchPreviewSongApi } from "../../services/previewSong.api.js";
import HtmlFragment from "../common/HtmlFragment.jsx";
import "./MusicPreview.scss";

const PLAY_SVG = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
`;

const PAUSE_SVG = `
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
`;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function MusicPreview() {
  const handleReady = useCallback((node) => {
    const playButton = node.querySelector(".play-btn");
    const progressBar = node.querySelector(".progress-bar");
    const progressFill = node.querySelector(".progress-fill");
    const progressTimes = node.querySelectorAll(".progress-times span");

    if (!playButton || !progressBar || !progressFill || progressTimes.length < 2) {
      return undefined;
    }

    const elapsedLabel = progressTimes[0];
    const durationLabel = progressTimes[1];
    const audio = new Audio();
    audio.preload = "auto";

    let isLoading = false;
    let hasFetchedSong = false;
    let isDisposed = false;
    let idlePrefetchId = null;

    const setPlayButtonState = (playing) => {
      playButton.innerHTML = playing ? PAUSE_SVG : PLAY_SVG;
    };

    const syncProgressUi = () => {
      const duration = Number(audio.duration) || 0;
      const currentTime = Number(audio.currentTime) || 0;
      const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

      progressFill.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
      elapsedLabel.textContent = formatTime(currentTime);
      durationLabel.textContent = formatTime(duration);
    };

    const ensureSongLoaded = async () => {
      if (hasFetchedSong && audio.src) {
        return;
      }

      if (isLoading) {
        return;
      }

      isLoading = true;
      playButton.disabled = true;

      try {
        const preview = await getPreviewSongApi();
        if (isDisposed) {
          return;
        }
        audio.src = preview.songUrl;
        audio.load();
        hasFetchedSong = true;
      } finally {
        isLoading = false;
        playButton.disabled = false;
      }
    };

    const warmupPreviewAudio = async () => {
      try {
        const preview = await getPreviewSongApi();
        if (isDisposed || audio.src) {
          return;
        }

        audio.src = preview.songUrl;
        audio.load();
        hasFetchedSong = true;
      } catch {
        // Ignore warmup failures and fallback to click-time fetch.
      }
    };

    const handlePlayPause = async (event) => {
      event.preventDefault();

      try {
        await ensureSongLoaded();

        if (!audio.src) {
          return;
        }

        if (audio.paused) {
          await audio.play();
          setPlayButtonState(true);
          return;
        }

        audio.pause();
        setPlayButtonState(false);
      } catch (error) {
        setPlayButtonState(false);
        console.error("Preview playback failed:", error?.message || error);
      }
    };

    const handleLoadedMetadata = () => {
      syncProgressUi();
    };

    const handleTimeUpdate = () => {
      syncProgressUi();
    };

    const handleEnded = () => {
      audio.currentTime = 0;
      syncProgressUi();
      setPlayButtonState(false);
    };

    const handlePause = () => {
      setPlayButtonState(false);
    };

    const handleProgressSeek = (event) => {
      const rect = progressBar.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }

      const pointerX = event.clientX ?? event.touches?.[0]?.clientX;
      if (!Number.isFinite(pointerX)) {
        return;
      }

      const percent = Math.max(0, Math.min((pointerX - rect.left) / rect.width, 1));
      const duration = Number(audio.duration) || 0;

      if (duration <= 0) {
        return;
      }

      audio.currentTime = percent * duration;
      syncProgressUi();
    };

    setPlayButtonState(false);
    prefetchPreviewSongApi();

    if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
      idlePrefetchId = window.requestIdleCallback(() => {
        void warmupPreviewAudio();
      });
    } else {
      void warmupPreviewAudio();
    }

    playButton.addEventListener("click", handlePlayPause);
    progressBar.addEventListener("click", handleProgressSeek);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      isDisposed = true;
      if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function" && idlePrefetchId) {
        window.cancelIdleCallback(idlePrefetchId);
      }
      playButton.removeEventListener("click", handlePlayPause);
      progressBar.removeEventListener("click", handleProgressSeek);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audio.removeAttribute("src");
    };
  }, []);

  return <HtmlFragment html={musicPreviewHtml} onReady={handleReady} />;
}

export default MusicPreview;
