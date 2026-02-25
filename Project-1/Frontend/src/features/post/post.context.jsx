import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth/hooks/useAuth";
import { PostContext } from "./post.contextValue";
import { addComment, getAllFeed, getFeed, getPostDetails, likePost, unlikePost } from "./services/post.api";
import { getFollowingList } from "./services/user.network.api";
import { buildStoriesFromPosts, normalizeFeedResponse, normalizePost, uniqueUsers } from "./utils/post.utils";

function updatePostInFeed(posts, postId, updater) {
  return posts.map((post) => (post.id === postId ? updater(post) : post));
}

function normalizeSingleComment(comment, fallbackId) {
  return {
    id: comment?._id || comment?.id || fallbackId,
    userName: comment?.userName || "",
    text: comment?.text || "",
  };
}

export function PostProvider({ children }) {
  const { user } = useAuth();
  const viewerUserName = user?.userName || "";
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState([]);
  const [stories, setStories] = useState([]);
  const [followingUserNames, setFollowingUserNames] = useState([]);
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
    if (!viewerUserName) {
      return;
    }

    const currentPost = feed.find((post) => post.id === postId);
    if (!currentPost) {
      return;
    }

    const alreadyLiked = currentPost.likedBy.includes(viewerUserName);

    setFeed((prev) =>
      updatePostInFeed(prev, postId, (post) => {
        const likedBy = alreadyLiked
          ? post.likedBy.filter((name) => name !== viewerUserName)
          : uniqueUsers([viewerUserName, ...post.likedBy]);

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
            ? uniqueUsers([viewerUserName, ...post.likedBy])
            : post.likedBy.filter((name) => name !== viewerUserName),
          isLikedByViewer: alreadyLiked,
        })),
      );
    }
  }, [feed, viewerUserName]);

  const addCommentToPost = useCallback(async (postId, text) => {
    if (!viewerUserName) {
      return false;
    }

    const trimmedText = String(text || "").trim();
    if (!trimmedText) {
      return false;
    }

    const tempComment = {
      id: `temp-${postId}-${Date.now()}`,
      userName: viewerUserName,
      text: trimmedText,
    };

    setFeed((prev) =>
      updatePostInFeed(prev, postId, (post) => ({
        ...post,
        comments: [...post.comments, tempComment],
      })),
    );

    try {
      const response = await addComment(postId, trimmedText);

      if (response?.post) {
        const normalizedPost = normalizePost(response.post);
        if (normalizedPost?.id) {
          setFeed((prev) =>
            updatePostInFeed(prev, postId, (post) => ({
              ...post,
              ...normalizedPost,
            })),
          );
          return true;
        }
      }

      if (response?.comment) {
        const normalizedComment = normalizeSingleComment(
          response.comment,
          `comment-${Date.now()}`,
        );
        setFeed((prev) =>
          updatePostInFeed(prev, postId, (post) => ({
            ...post,
            comments: [
              ...post.comments.filter((comment) => comment.id !== tempComment.id),
              normalizedComment,
            ],
          })),
        );
        return true;
      }

      return true;
    } catch {
      setFeed((prev) =>
        updatePostInFeed(prev, postId, (post) => ({
          ...post,
          comments: post.comments.filter((comment) => comment.id !== tempComment.id),
        })),
      );
      return false;
    }
  }, [viewerUserName]);

  useEffect(() => {
    let mounted = true;

    async function loadFollowingUsers() {
      if (!viewerUserName) {
        setFollowingUserNames([]);
        return;
      }

      try {
        const response = await getFollowingList(viewerUserName);
        const following = Array.isArray(response?.following) ? response.following : [];
        const names = following.map((entry) => entry.userName).filter(Boolean);
        if (mounted) {
          setFollowingUserNames(names);
        }
      } catch {
        if (mounted) {
          setFollowingUserNames([]);
        }
      }
    }

    loadFollowingUsers();

    return () => {
      mounted = false;
    };
  }, [viewerUserName]);

  useEffect(() => {
    setStories(buildStoriesFromPosts(feed, user, followingUserNames));
  }, [feed, user, followingUserNames]);

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
      addCommentToPost,
    }),
    [loading, error, feed, stories, loadFeed, loadPostDetails, getPostById, toggleLike, addCommentToPost],
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}
