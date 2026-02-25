import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import FeedPostCard from "../components/FeedPostCard";
import LikesModal from "../components/LikesModal";
import { BackIcon } from "../components/icons";
import { addComment, getLikedPosts, likePost, unlikePost } from "../services/post.api";
import { normalizePost, uniqueUsers } from "../utils/post.utils";
import "../style/LikedPosts.scss";

const LikedPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerUserName = user?.userName || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedLikePostId, setSelectedLikePostId] = useState(null);

  const selectedLikePost = useMemo(
    () => posts.find((post) => post.id === selectedLikePostId) || null,
    [posts, selectedLikePostId],
  );

  const loadLikedFeed = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getLikedPosts();
      const normalizedPosts = (response?.posts || [])
        .map((post, index) => normalizePost(post, index))
        .filter(Boolean);
      setPosts(normalizedPosts);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load liked posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLikedFeed();
  }, [loadLikedFeed]);

  const handleToggleLike = useCallback(
    async (postId) => {
      if (!viewerUserName) {
        return;
      }

      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) {
        return;
      }

      const alreadyLiked = currentPost.likedBy.includes(viewerUserName);
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                likedBy: alreadyLiked
                  ? post.likedBy.filter((name) => name !== viewerUserName)
                  : uniqueUsers([viewerUserName, ...post.likedBy]),
              },
        ),
      );

      try {
        const response = alreadyLiked ? await unlikePost(postId) : await likePost(postId);
        const nextLikedBy = Array.isArray(response?.likedBy) ? uniqueUsers(response.likedBy) : null;
        if (!nextLikedBy) {
          return;
        }

        setPosts((prev) => {
          const updated = prev.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedBy: nextLikedBy,
                },
          );

          return alreadyLiked ? updated.filter((post) => post.id !== postId) : updated;
        });
      } catch {
        setPosts((prev) =>
          prev.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedBy: alreadyLiked
                    ? uniqueUsers([viewerUserName, ...post.likedBy])
                    : post.likedBy.filter((name) => name !== viewerUserName),
                },
          ),
        );
      }
    },
    [posts, viewerUserName],
  );

  const handleAddComment = useCallback(async (postId, text) => {
    if (!viewerUserName) {
      return false;
    }

    const trimmedText = String(text || "").trim();
    if (!trimmedText) {
      return false;
    }

    try {
      const response = await addComment(postId, trimmedText);

      if (response?.post) {
        const normalized = normalizePost(response.post);
        if (normalized?.id) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    ...normalized,
                  }
                : post,
            ),
          );
          return true;
        }
      }

      if (response?.comment) {
        const normalizedComment = {
          id: response.comment._id || response.comment.id || `comment-${Date.now()}`,
          userName: response.comment.userName || viewerUserName,
          text: response.comment.text || trimmedText,
        };
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...post.comments, normalizedComment],
                }
              : post,
          ),
        );
        return true;
      }

      return false;
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add comment");
      return false;
    }
  }, [viewerUserName]);

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon className="ig-icon" />
          </button>
          <p>Liked posts</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area">
          {error ? <p className="ig-error">{error}</p> : null}
          {loading ? <p className="ig-loading">Loading liked posts...</p> : null}
          {!loading && !error && !posts.length ? (
            <p className="ig-loading">You have not liked any posts yet.</p>
          ) : null}

          <div className="ig-post-list">
            {posts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserName={viewerUserName}
                onOpenPost={(postId) => navigate(`/post/${postId}`)}
                onToggleLike={() => handleToggleLike(post.id)}
                onOpenLikes={() => setSelectedLikePostId(post.id)}
                onOpenProfile={(name) => navigate(`/profile/${name}`)}
                onAddComment={(text) => handleAddComment(post.id, text)}
              />
            ))}
          </div>
        </section>

        <BottomNav active="activity" currentUser={user} />
      </div>
      <LikesModal post={selectedLikePost} onClose={() => setSelectedLikePostId(null)} />
    </main>
  );
};

export default LikedPosts;
