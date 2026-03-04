import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMoodSongs } from "../hooks/useMoodSongs.js";
import SeekBar from "./SeekBar.jsx";
import "./MusicPlayer.scss";

const IS_DEBUG = Boolean(import.meta.env.DEV);
const YT_STATE_ENDED = 0;
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;
const YT_STATE_BUFFERING = 3;
const EQ_BAR_HEIGHTS = [10, 16, 22, 14, 18, 26, 12, 20, 8, 15, 24, 11, 17, 23, 13, 19, 9, 21, 25, 12, 18, 14, 20, 16];

let youtubeApiPromise = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

    const handleReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
      }
    };

    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReadyHandler === "function") {
        previousReadyHandler();
      }
      handleReady();
    };

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load YouTube Iframe API."));
    document.body.appendChild(script);
  });

  return youtubeApiPromise;
}

function getYouTubeVideoId(url) {
  if (typeof url !== "string" || !url.trim()) {
    return "";
  }

  const input = url.trim();

  try {
    const parsed = new URL(input);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\//, "").trim();
    }

    if (parsed.hostname.includes("youtube.com")) {
      const fromQuery = parsed.searchParams.get("v");
      if (fromQuery) {
        return fromQuery.trim();
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      const embedIndex = parts.findIndex((part) => part === "embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1].trim();
      }
    }
  } catch {
    return "";
  }

  return "";
}

function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function MusicPlayer() {
  const { songs, currentSong, currentMood, currentSongIndex, loading, error, selectSongByIndex, selectRandomSong } =
    useMoodSongs();

  const audioRef = useRef(null);
  const youtubeMountRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const youtubeProgressTimerRef = useRef(null);
  const isSeekingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTimeSeconds, setSeekTimeSeconds] = useState(0);
  const [autoplayError, setAutoplayError] = useState("");

  const currentYoutubeVideoId = useMemo(() => getYouTubeVideoId(currentSong?.songUrl || ""), [currentSong?.songUrl]);
  const isYouTubeSong = Boolean(currentYoutubeVideoId);
  const displayedTime = isSeeking ? seekTimeSeconds : currentTimeSeconds;
  const elapsedTime = useMemo(() => formatTime(displayedTime), [displayedTime]);
  const durationTime = useMemo(() => formatTime(durationSeconds), [durationSeconds]);
  const eqBars = useMemo(
    () =>
      EQ_BAR_HEIGHTS.map((height, index) => ({
        height,
        duration: (0.45 + (index % 5) * 0.15).toFixed(2),
        delay: (index % 7) * 0.08,
      })),
    []
  );

  useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  const stopYouTubeProgressTimer = useCallback(() => {
    if (youtubeProgressTimerRef.current) {
      clearInterval(youtubeProgressTimerRef.current);
      youtubeProgressTimerRef.current = null;
    }
  }, []);

  const syncYouTubeProgress = useCallback(() => {
    const player = youtubePlayerRef.current;
    if (!player || typeof player.getCurrentTime !== "function" || typeof player.getDuration !== "function") {
      return;
    }

    const currentTime = Number(player.getCurrentTime()) || 0;
    const duration = Number(player.getDuration()) || 0;

    setDurationSeconds(duration);
    if (!isSeekingRef.current) {
      setCurrentTimeSeconds(currentTime);
    }
  }, []);

  const startYouTubeProgressTimer = useCallback(() => {
    stopYouTubeProgressTimer();
    youtubeProgressTimerRef.current = setInterval(syncYouTubeProgress, 200);
  }, [stopYouTubeProgressTimer, syncYouTubeProgress]);

  const canControl = songs.length > 0 && Boolean(currentSong?.songUrl);

  const statusSubtitle = useMemo(() => {
    if (loading) {
      return "Matching tracks with your captured mood...";
    }

    if (error) {
      return error;
    }

    if (!currentSong) {
      return "Capture your mood to auto-play matching songs.";
    }

    return currentSong.artist || "Unknown artist";
  }, [loading, error, currentSong]);

  const handlePrevious = useCallback(() => {
    if (songs.length === 0) {
      return;
    }

    const previousIndex = currentSongIndex <= 0 ? songs.length - 1 : currentSongIndex - 1;
    selectSongByIndex(previousIndex);
  }, [currentSongIndex, selectSongByIndex, songs.length]);

  const handleNext = useCallback(() => {
    if (songs.length === 0) {
      return;
    }

    const nextIndex = currentSongIndex >= songs.length - 1 ? 0 : currentSongIndex + 1;
    selectSongByIndex(nextIndex);
  }, [currentSongIndex, selectSongByIndex, songs.length]);

  const handleRandom = useCallback(() => {
    if (songs.length === 0) {
      return;
    }

    selectRandomSong(true);
  }, [selectRandomSong, songs.length]);

  const seekToTime = useCallback(
    (targetSeconds) => {
      if (!canControl || durationSeconds <= 0) {
        return;
      }

      const safeTime = clamp(Number(targetSeconds) || 0, 0, durationSeconds);

      if (isYouTubeSong) {
        const player = youtubePlayerRef.current;
        if (!player || typeof player.seekTo !== "function") {
          return;
        }

        player.seekTo(safeTime, true);
        setCurrentTimeSeconds(safeTime);
        return;
      }

      if (!audioRef.current) {
        return;
      }

      audioRef.current.currentTime = safeTime;
      setCurrentTimeSeconds(safeTime);
    },
    [canControl, durationSeconds, isYouTubeSong]
  );

  const handleSeekStart = useCallback(() => {
    if (!canControl || durationSeconds <= 0) {
      return;
    }

    setIsSeeking(true);
    setSeekTimeSeconds(currentTimeSeconds);
  }, [canControl, currentTimeSeconds, durationSeconds]);

  const handleSeekChange = useCallback(
    (nextTimeSeconds) => {
      if (!canControl || durationSeconds <= 0) {
        return;
      }

      const safeTime = clamp(Number(nextTimeSeconds) || 0, 0, durationSeconds);
      setIsSeeking(true);
      setSeekTimeSeconds(safeTime);
      seekToTime(safeTime);
    },
    [canControl, durationSeconds, seekToTime]
  );

  const handleSeekEnd = useCallback(
    (finalTimeSeconds) => {
      if (!canControl || durationSeconds <= 0) {
        return;
      }

      const resolvedTime = Number.isFinite(finalTimeSeconds)
        ? finalTimeSeconds
        : Number.isFinite(seekTimeSeconds)
          ? seekTimeSeconds
          : currentTimeSeconds;

      const safeTime = clamp(Number(resolvedTime) || 0, 0, durationSeconds);
      seekToTime(safeTime);
      setCurrentTimeSeconds(safeTime);
      setSeekTimeSeconds(safeTime);
      setIsSeeking(false);
    },
    [canControl, currentTimeSeconds, durationSeconds, seekTimeSeconds, seekToTime]
  );

  useEffect(() => {
    return () => {
      stopYouTubeProgressTimer();
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.destroy === "function") {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [stopYouTubeProgressTimer]);

  useEffect(() => {
    if (!isYouTubeSong || !currentYoutubeVideoId) {
      if (youtubePlayerRef.current && typeof youtubePlayerRef.current.stopVideo === "function") {
        youtubePlayerRef.current.stopVideo();
      }
      stopYouTubeProgressTimer();
      return;
    }

    let cancelled = false;
    let resetFrameId = null;

    resetFrameId = requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }

      setCurrentTimeSeconds(0);
      setDurationSeconds(0);
      setSeekTimeSeconds(0);
      setIsSeeking(false);
      setAutoplayError("");
    });

    const bootstrapPlayer = async () => {
      try {
        const YT = await loadYouTubeIframeApi();
        if (cancelled || !youtubeMountRef.current) {
          return;
        }

        if (!youtubePlayerRef.current) {
          youtubePlayerRef.current = new YT.Player(youtubeMountRef.current, {
            videoId: currentYoutubeVideoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event) => {
                if (cancelled) {
                  return;
                }

                try {
                  event.target.playVideo();
                  setAutoplayError("");
                  syncYouTubeProgress();
                  startYouTubeProgressTimer();
                } catch {
                  setAutoplayError("Autoplay blocked by browser. Tap play to start.");
                  setIsPlaying(false);
                }
              },
              onStateChange: (event) => {
                const state = event?.data;

                if (state === YT_STATE_PLAYING || state === YT_STATE_BUFFERING) {
                  setIsPlaying(true);
                  setAutoplayError("");
                  syncYouTubeProgress();
                  startYouTubeProgressTimer();
                  return;
                }

                if (state === YT_STATE_PAUSED) {
                  setIsPlaying(false);
                  stopYouTubeProgressTimer();
                  return;
                }

                if (state === YT_STATE_ENDED) {
                  setIsPlaying(false);
                  stopYouTubeProgressTimer();
                  handleRandom();
                }
              },
              onError: () => {
                setIsPlaying(false);
                stopYouTubeProgressTimer();
                setAutoplayError("YouTube playback failed for this song.");
              },
            },
          });

          return;
        }

        youtubePlayerRef.current.loadVideoById(currentYoutubeVideoId);

        try {
          youtubePlayerRef.current.playVideo();
          setAutoplayError("");
          syncYouTubeProgress();
          startYouTubeProgressTimer();
        } catch {
          setAutoplayError("Autoplay blocked by browser. Tap play to start.");
          setIsPlaying(false);
        }
      } catch (error) {
        setAutoplayError("Unable to load YouTube player.");
        if (IS_DEBUG) {
          console.error("[MusicPlayer UI] YouTube API failed", {
            message: error?.message || "Unknown YouTube API error",
          });
        }
      }
    };

    void bootstrapPlayer();

    return () => {
      cancelled = true;
      if (resetFrameId !== null) {
        cancelAnimationFrame(resetFrameId);
      }
    };
  }, [
    currentYoutubeVideoId,
    handleRandom,
    isYouTubeSong,
    startYouTubeProgressTimer,
    stopYouTubeProgressTimer,
    syncYouTubeProgress,
  ]);

  useEffect(() => {
    if (isYouTubeSong || !currentSong?.songUrl || !audioRef.current) {
      return;
    }

    if (IS_DEBUG) {
      console.debug("[MusicPlayer UI] Attempting autoplay", {
        songUrl: currentSong?.songUrl,
      });
    }

    const playPromise = audioRef.current.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        setAutoplayError("Autoplay blocked by browser. Tap play to start.");
        setIsPlaying(false);
        if (IS_DEBUG) {
          console.warn("[MusicPlayer UI] Autoplay failed", {
            message: error?.message || "Unknown autoplay error",
          });
        }
      });
    }
  }, [currentSong?.songUrl, isYouTubeSong]);

  const handleTogglePlay = useCallback(async () => {
    if (!canControl) {
      return;
    }

    if (isYouTubeSong) {
      const player = youtubePlayerRef.current;
      if (!player || typeof player.getPlayerState !== "function") {
        return;
      }

      try {
        const state = player.getPlayerState();
        if (state === YT_STATE_PLAYING || state === YT_STATE_BUFFERING) {
          player.pauseVideo();
          return;
        }

        player.playVideo();
        setAutoplayError("");
        return;
      } catch {
        setIsPlaying(false);
        setAutoplayError("Unable to play this YouTube song right now.");
        return;
      }
    }

    if (!audioRef.current) {
      return;
    }

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setAutoplayError("");
      } catch {
        setIsPlaying(false);
        setAutoplayError("Unable to play this song. Check the source URL.");
      }
      return;
    }

    audioRef.current.pause();
  }, [canControl, isYouTubeSong]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    const currentTime = Number(audioRef.current.currentTime) || 0;
    const duration = Number(audioRef.current.duration) || 0;

    setDurationSeconds(duration);
    if (!isSeekingRef.current) {
      setCurrentTimeSeconds(currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    const duration = Number(audioRef.current.duration) || 0;
    setDurationSeconds(duration);
  }, []);

  const handleLoadStart = useCallback(() => {
    setCurrentTimeSeconds(0);
    setDurationSeconds(0);
    setSeekTimeSeconds(0);
    setIsSeeking(false);
    setIsPlaying(false);
    setAutoplayError("");
  }, []);

  return (
    <div className="sidebar-player">
      <div className="sp-label">
        Auto-matched to your mood{currentMood ? ` (${currentMood})` : ""}
      </div>

      <div className="sp-album">
        {currentSong?.posterUrl ? (
          <img
            src={currentSong.posterUrl}
            alt={currentSong.title || "Song poster"}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px" }}
          />
        ) : (
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
            <circle cx="40" cy="40" r="20" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
            <circle cx="40" cy="40" r="6" fill="rgba(255,255,255,0.7)" />
            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <path d="M40 14 L40 24" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 56 L40 66" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 40 L24 40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
            <path d="M56 40 L66 40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <div className="sp-track-name">
        {loading ? "Finding songs..." : currentSong?.title || "Capture to start playback"}
      </div>
      <div className="sp-track-artist">{statusSubtitle}</div>
      {autoplayError ? <div className="sp-track-artist">{autoplayError}</div> : null}
      {autoplayError && canControl ? (
        <button type="button" className="sp-play" onClick={handleTogglePlay}>
          Tap to Play
        </button>
      ) : null}

      <div className="sp-controls">
        <button type="button" className="sp-ctrl" title="Previous" onClick={handlePrevious} disabled={!canControl}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>
        <button
          type="button"
          className="sp-ctrl"
          title="Shuffle"
          onClick={handleRandom}
          disabled={!canControl || songs.length < 2}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        </button>
        <button
          type="button"
          className="sp-play"
          title="Play/Pause"
          onClick={handleTogglePlay}
          disabled={!canControl}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button type="button" className="sp-ctrl" title="Repeat" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>
        <button type="button" className="sp-ctrl" title="Next" onClick={handleNext} disabled={!canControl}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 6h2v12h-2zm-11 0v12l8.5-6L5 6z" />
          </svg>
        </button>
      </div>

      <div className="sp-progress">
        <SeekBar
          duration={durationSeconds}
          currentTime={displayedTime}
          canSeek={canControl}
          onSeekStart={handleSeekStart}
          onSeekChange={handleSeekChange}
          onSeekEnd={handleSeekEnd}
        />
        <div className="sp-times">
          <span>{elapsedTime}</span>
          <span>{durationTime}</span>
        </div>
      </div>

      <div className="sp-eq" id="spEq">
        {eqBars.map((bar, index) => (
          <div
            key={`eq-${index}`}
            className="sp-eq-bar"
            style={{
              "--h": `${bar.height}px`,
              "--d": `${bar.duration}s`,
              animationDelay: `${bar.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        ref={youtubeMountRef}
        style={{
          width: 1,
          height: 1,
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />

      {!isYouTubeSong ? (
        <audio
          ref={audioRef}
          src={currentSong?.songUrl || ""}
          autoPlay
          onLoadStart={handleLoadStart}
          onPlay={() => {
            setIsPlaying(true);
            setAutoplayError("");
          }}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleRandom}
          onError={() => {
            setAutoplayError("Audio failed to load. Please verify songUrl.");
            if (IS_DEBUG) {
              console.error("[MusicPlayer UI] Audio element error", {
                songUrl: currentSong?.songUrl || null,
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}

export default MusicPlayer;
