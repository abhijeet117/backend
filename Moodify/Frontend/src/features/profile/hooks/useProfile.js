import { useCallback, useContext, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { ProfileContext } from "../../../state/ProfileContext.jsx";
import { getExpressionHistoryApi, getProfileApi } from "../services/profile.api.js";

const MOOD_COLOR_MAP = {
  Happy: "var(--mood-happy)",
  Neutral: "var(--mood-neutral)",
  Shock: "var(--mood-shock)",
  Sad: "var(--mood-sad)",
};

function formatHistoryTime(isoDate) {
  if (!isoDate) {
    return "Now";
  }

  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Now";
  }

  const diffMinutes = Math.max(0, Math.floor((Date.now() - parsedDate.getTime()) / 60000));
  if (diffMinutes < 1) {
    return "Now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  return `${Math.floor(diffMinutes / 60)}h ago`;
}

function useProfile() {
  const auth = useAuth();
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider.");
  }

  const { profile, history, loading, error, setProfile, setHistory, setLoading, setError, resetProfileState } =
    context;

  useEffect(() => {
    if (!auth.user) {
      return;
    }

    setProfile((prevProfile) => ({
      ...(prevProfile || {}),
      id: auth.user.id || auth.user._id || prevProfile?.id || "",
      fullName: auth.user.fullName || prevProfile?.fullName || "",
      username: auth.user.username || prevProfile?.username || "",
      email: auth.user.email || prevProfile?.email || "",
    }));
  }, [auth.user, setProfile]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileResponse, historyResponse] = await Promise.all([getProfileApi(), getExpressionHistoryApi()]);
      setProfile(profileResponse.profile);
      setHistory(historyResponse.history);
      return {
        profile: profileResponse.profile,
        history: historyResponse.history,
      };
    } catch (requestError) {
      setError(requestError?.message || "Failed to load profile.");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [setError, setHistory, setLoading, setProfile]);

  const addHistoryEntry = useCallback(
    (entry) => {
      if (!entry) {
        return;
      }

      setHistory((prevHistory) => [entry, ...prevHistory]);
    },
    [setHistory]
  );

  const historyItems = useMemo(
    () =>
      history.map((item, index) => ({
        id: item?._id || `${item?.mood || "mood"}-${item?.capturedAt || index}-${index}`,
        mood: item?.mood || "Neutral",
        color: MOOD_COLOR_MAP[item?.mood] || "var(--mood-neutral)",
        timeLabel: formatHistoryTime(item?.capturedAt),
      })),
    [history]
  );

  return {
    profile,
    historyItems,
    loading,
    error,
    loadProfile,
    addHistoryEntry,
    resetProfileState,
  };
}

export { useProfile };
