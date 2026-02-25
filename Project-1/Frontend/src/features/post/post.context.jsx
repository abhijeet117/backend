import { useCallback, useEffect, useMemo, useState } from "react";

import { mockFeedPosts } from "./data/mockFeed";
import { PostContext } from "./post.contextValue";
import { getFeed, getPostDetails, toggleLike as toggleLikePost } from "./services/post.api";
import { buildStoriesFromPosts, normalizeFeedResponse, normalizePost, uniqueUsers } from "./utils/post.utils";

const LIKE_STORE_KEY = "ig_like_state_v1";

function readStoredLikes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LIKE_STORE_KEY) || "{}");
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function mergeStoredLikes(posts, storedLikes) {
  return posts.map((post) => {
    const users = storedLikes[post.id];
    if (!Array.isArray(users)) {
      return post;
    }
    return {
      ...post,
      likedBy: uniqueUsers(users),
    };
  });
}

function updatePostInFeed(posts, postId, updater) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

export function PostProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);

  const getPostById = useCallback(
    (postId) => feed.find((post) => post.id === postId) || null,
    [feed],
  );

  const loadFeed = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getFeed();
      const normalizedFeed = normalizeFeedResponse(response);
      const baseFeed = normalizedFeed.length ? normalizedFeed : mockFeedPosts;
      const mergedFeed = mergeStoredLikes(baseFeed, readStoredLikes());
      setFeed(mergedFeed);
      setStories(buildStoriesFromPosts(mergedFeed));
    } catch {
      const mergedFeed = mergeStoredLikes(mockFeedPosts, readStoredLikes());
      setFeed(mergedFeed);
      setStories(buildStoriesFromPosts(mergedFeed));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPostDetails = useCallback(
    async (postId) => {
      const localPost = getPostById(postId);

      try {
        const response = await getPostDetails(postId);
        const normalized = normalizePost(response?.post);

        setFeed((prev) => {
          const exists = prev.some((post) => post.id === normalized.id);
          if (!exists) {
            return [normalized, ...prev];
          }
          return updatePostInFeed(prev, normalized.id, (post) => ({
            ...post,
            ...normalized,
            comments: normalized.comments.length ? normalized.comments : post.comments,
          }));
        });

        return normalized;
      } catch {
        const fallbackPost = localPost || mockFeedPosts.find((post) => post.id === postId) || null;
        if (fallbackPost && !localPost) {
          setFeed((prev) => [fallbackPost, ...prev]);
        }
        return fallbackPost;
      }
    },
    [getPostById],
  );

  const toggleLike = useCallback(async (postId, userName) => {
    if (!userName) {
      return;
    }

    setFeed((prev) =>
      updatePostInFeed(prev, postId, (post) => {
        const alreadyLiked = post.likedBy.includes(userName);
        const likedBy = alreadyLiked
          ? post.likedBy.filter((name) => name !== userName)
          : uniqueUsers([userName, ...post.likedBy]);

        return {
          ...post,
          likedBy,
        };
      }),
    );

    try {
      const response = await toggleLikePost(postId);
      if (!Array.isArray(response?.likedBy)) {
        return;
      }

      setFeed((prev) =>
        updatePostInFeed(prev, postId, (post) => ({
          ...post,
          likedBy: uniqueUsers(response.likedBy),
        })),
      );
    } catch {
      // Keep optimistic UI state when API isn't available.
    }
  }, []);

  useEffect(() => {
    if (!feed.length) {
      return;
    }

    const serialized = feed.reduce((acc, post) => {
      acc[post.id] = post.likedBy;
      return acc;
    }, {});

    localStorage.setItem(LIKE_STORE_KEY, JSON.stringify(serialized));
  }, [feed]);

  const value = useMemo(
    () => ({
      loading,
      feed,
      stories,
      loadFeed,
      loadPostDetails,
      getPostById,
      toggleLike,
    }),
    [loading, feed, stories, loadFeed, loadPostDetails, getPostById, toggleLike],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}
