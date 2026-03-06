import { useCallback, useContext, useMemo } from "react";
import { SongContext } from "../state/song.context.jsx";
import { getSongsByMoodApi } from "../services/song.api.js";

const ALLOWED_MOODS = new Set(["happy", "neutral", "shock", "sad"]);
const IS_DEBUG = Boolean(import.meta.env.DEV);

const DETECTED_TO_API_MOOD = {
  Happy: "happy",
  Neutral: "neutral",
  Shock: "shock",
  Sad: "sad",
  Smile: "happy",
  happy: "happy",
  neutral: "neutral",
  shock: "shock",
  sad: "sad",
  surprise: "shock",
  Surprise: "shock",
  surprised: "shock",
  Surprised: "shock",
  Calm: "neutral",
  Energetic: "shock",
  Melancholy: "sad",
};

function getRandomIndex(length, excludeIndex = -1) {
  if (!Number.isInteger(length) || length <= 0) {
    return -1;
  }

  if (length === 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * length);

  if (Number.isInteger(excludeIndex) && excludeIndex >= 0 && excludeIndex < length) {
    while (nextIndex === excludeIndex) {
      nextIndex = Math.floor(Math.random() * length);
    }
  }

  return nextIndex;
}

function findSongIndex(songList = [], targetSong = null) {
  if (!Array.isArray(songList) || songList.length === 0 || !targetSong) {
    return -1;
  }

  return songList.findIndex((song) => {
    if (song?._id && targetSong?._id) {
      return song._id === targetSong._id;
    }

    return song?.songUrl === targetSong?.songUrl;
  });
}

function resolveSelectedSong(songList = [], selectedSong = null, fallbackSong = null) {
  const selectedSongIndex = findSongIndex(songList, selectedSong);
  if (selectedSongIndex >= 0) {
    return songList[selectedSongIndex];
  }

  const fallbackIndex = findSongIndex(songList, fallbackSong);
  if (fallbackIndex >= 0) {
    return songList[fallbackIndex];
  }

  return null;
}

function normalizeMood(mood) {
  if (typeof mood !== "string") {
    return "";
  }

  const normalizedMood = mood.trim().toLowerCase();
  return ALLOWED_MOODS.has(normalizedMood) ? normalizedMood : "";
}

function mapDetectedMoodToSongMood(value) {
  if (typeof value !== "string") {
    return "";
  }

  return DETECTED_TO_API_MOOD[value] || value.trim().toLowerCase();
}

function useMoodSongs() {
  const context = useContext(SongContext);

  if (!context) {
    throw new Error("useMoodSongs must be used within SongProvider.");
  }

  const {
    songs,
    currentSong,
    currentMood,
    loading,
    error,
    setSongs,
    setCurrentSong,
    setCurrentMood,
    setLoading,
    setError,
    resetSongState,
  } = context;

  const fetchSongsByMood = useCallback(
    async (mood) => {
      const normalizedMood = normalizeMood(mapDetectedMoodToSongMood(mood));
      if (IS_DEBUG) {
        console.debug("[MoodSongs Hook] fetchSongsByMood called", {
          rawMood: mood,
          normalizedMood,
        });
      }

      if (!normalizedMood) {
        setSongs([]);
        setCurrentSong(null);
        setCurrentMood("");
        setError("Invalid mood. Expected happy, neutral, shock, or sad.");
        if (IS_DEBUG) {
          console.warn("[MoodSongs Hook] Mood normalization failed", { rawMood: mood });
        }
        return [];
      }

      setLoading(true);
      setError(null);
      setCurrentMood(normalizedMood);

      try {
        const response = await getSongsByMoodApi(normalizedMood);
        const nextSongs = (response?.songs || []).filter(
          (song) => typeof song?.songUrl === "string" && song.songUrl.trim().length > 0
        );
        const previousSongIndex = findSongIndex(nextSongs, currentSong);
        const apiSelectedSong = resolveSelectedSong(nextSongs, response?.selectedSong, currentSong);
        const randomSongIndex =
          apiSelectedSong || nextSongs.length === 0 ? -1 : getRandomIndex(nextSongs.length, previousSongIndex);
        const selectedSong = apiSelectedSong || (randomSongIndex >= 0 ? nextSongs[randomSongIndex] : null);

        setSongs(nextSongs);
        setCurrentSong(selectedSong);
        if (IS_DEBUG) {
          console.debug("[MoodSongs Hook] Songs loaded", {
            mood: normalizedMood,
            totalSongs: nextSongs.length,
            previousSongIndex,
            randomSongIndex,
            selectedSongTitle: selectedSong?.title || null,
            selectedSongUrl: selectedSong?.songUrl || null,
          });
        }

        return nextSongs;
      } catch (requestError) {
        setSongs([]);
        setCurrentSong(null);
        setError(requestError?.message || "Failed to fetch songs.");
        if (IS_DEBUG) {
          console.error("[MoodSongs Hook] Song fetch failed", {
            mood: normalizedMood,
            message: requestError?.message || "Unknown error",
            details: requestError,
          });
        }
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [currentSong, setCurrentMood, setCurrentSong, setError, setLoading, setSongs]
  );

  const selectSongByIndex = useCallback(
    (index) => {
      if (!Array.isArray(songs) || songs.length === 0) {
        setCurrentSong(null);
        return null;
      }

      const safeIndex = Number(index);
      if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex >= songs.length) {
        return currentSong || songs[0];
      }

      const nextSong = songs[safeIndex];
      setCurrentSong(nextSong);
      return nextSong;
    },
    [currentSong, setCurrentSong, songs]
  );

  const selectRandomSong = useCallback(
    (excludeCurrent = true) => {
      if (!Array.isArray(songs) || songs.length === 0) {
        setCurrentSong(null);
        return null;
      }

      const currentIndex = findSongIndex(songs, currentSong);

      const randomIndex = getRandomIndex(songs.length, excludeCurrent ? currentIndex : -1);
      const nextSong = randomIndex >= 0 ? songs[randomIndex] : songs[0];

      setCurrentSong(nextSong);
      return nextSong;
    },
    [currentSong, setCurrentSong, songs]
  );

  const currentSongIndex = useMemo(() => {
    if (!currentSong || songs.length === 0) {
      return -1;
    }

    return findSongIndex(songs, currentSong);
  }, [currentSong, songs]);

  const resetSongPlayback = useCallback(() => {
    resetSongState();
  }, [resetSongState]);

  return {
    songs,
    currentSong,
    currentMood,
    currentSongIndex,
    loading,
    error,
    fetchSongsByMood,
    selectSongByIndex,
    selectRandomSong,
    resetSongPlayback,
    mapDetectedMoodToSongMood,
  };
}

export { mapDetectedMoodToSongMood, useMoodSongs };
