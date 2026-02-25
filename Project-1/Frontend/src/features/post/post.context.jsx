import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/hooks/useAuth";
import { PostContext } from "./post.contextValue";
import { getAllFeed, getFeed, getPostDetails, likePost, unlikePost } from "./services/post.api";
import { buildStoriesFromPosts, normalizeFeedResponse, normalizePost, uniqueUsers } from "./utils/post.utils";

function updatePostInFeed(posts, postId, updater) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

export function PostProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");

  const getPostById = useCallback(
    (postId) => feed.find((post) => post.id === postId) || null,
    [feed],
  );

  const loadFeed = useCallback(async (scope = "following") => {
    setLoading(true);
    setError("");

    try {
      const response = scope === "all" ? await getAllFeed() : await getFeed();
      const normalizedFeed = normalizeFeedResponse(response);
      setFeed(normalizedFeed);
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load feed";
      setError(message);
      setFeed([]);
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
        if (!normalized?.id) {
          return localPost;
        }

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
        return localPost;
      }
    },
    [getPostById],
  );

  const toggleLike = useCallback(async (postId) => {
    if (!user?.userName) {
      return;
    }

    const currentPost = feed.find((post) => post.id === postId);
    if (!currentPost) {
      return;
    }

    const alreadyLiked = currentPost.likedBy.includes(user.userName);

    setFeed((prev) =>
      updatePostInFeed(prev, postId, (post) => {
        const likedBy = alreadyLiked
          ? post.likedBy.filter((name) => name !== user.userName)
          : uniqueUsers([user.userName, ...post.likedBy]);

        return {
          ...post,
          likedBy,
          isLikedByViewer: !alreadyLiked,
        };
      }),
    );

    try {
      const response = alreadyLiked ? await unlikePost(postId) : await likePost(postId);
      if (!Array.isArray(response?.likedBy)) {
        return;
      }

      setFeed((prev) =>
        updatePostInFeed(prev, postId, (post) => ({
          ...post,
          likedBy: uniqueUsers(response.likedBy),
          isLikedByViewer: Boolean(response.isLikedByViewer),
        })),
      );
    } catch {
      setFeed((prev) =>
        updatePostInFeed(prev, postId, (post) => ({
          ...post,
          likedBy: alreadyLiked
            ? uniqueUsers([user.userName, ...post.likedBy])
            : post.likedBy.filter((name) => name !== user.userName),
          isLikedByViewer: alreadyLiked,
        })),
      );
    }
  }, [feed, user?.userName]);

  useEffect(() => {
    setStories(buildStoriesFromPosts(feed, user));
  }, [feed, user]);

  const value = useMemo(
    () => ({
      loading,
      error,
      feed,
      stories,
      loadFeed,
      loadPostDetails,
      getPostById,
      toggleLike,
    }),
    [loading, error, feed, stories, loadFeed, loadPostDetails, getPostById, toggleLike],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}
