import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import FeedPostCard from "../components/FeedPostCard";
import LikesModal from "../components/LikesModal";
import { BackIcon } from "../components/icons";
import { usePost } from "../hooks/usePost";
import "../style/feed.scss";

const PostDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadPostDetails, getPostById, toggleLike, addCommentToPost } = usePost();

  const [loading, setLoading] = useState(true);
  const [selectedLikePostId, setSelectedLikePostId] = useState(null);

  const currentUserName = user?.userName || "";
  const post = getPostById(postId);
  const selectedLikePost = useMemo(() => getPostById(selectedLikePostId), [getPostById, selectedLikePostId]);

  useEffect(() => {
    let mounted = true;

    async function fetchPost() {
      setLoading(true);
      await loadPostDetails(postId);
      if (mounted) {
        setLoading(false);
      }
    }

    fetchPost();

    return () => {
      mounted = false;
    };
  }, [loadPostDetails, postId]);

  const handleToggleLike = useCallback(() => {
    if (postId) {
      toggleLike(postId);
    }
  }, [postId, toggleLike]);

  const handleAddComment = useCallback(
    (text) => {
      if (!postId) {
        return false;
      }
      return addCommentToPost(postId, text);
    },
    [addCommentToPost, postId],
  );

  if (loading && !post) {
    return (
      <main className="ig-feed-page">
        <div className="ig-phone-shell">
          <header className="ig-detail-nav">
            <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <BackIcon className="ig-icon" />
            </button>
            <p>Post</p>
          </header>
          <p className="ig-loading">Loading post...</p>
          <BottomNav active="home" currentUser={user} />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="ig-feed-page">
        <div className="ig-phone-shell">
          <header className="ig-detail-nav">
            <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <BackIcon className="ig-icon" />
            </button>
            <p>Post</p>
          </header>
          <p className="ig-loading">Post not found.</p>
          <BottomNav active="home" currentUser={user} />
        </div>
      </main>
    );
  }

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon className="ig-icon" />
          </button>
          <p>Post</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area">
          <FeedPostCard
            post={post}
            expanded
            currentUserName={currentUserName}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onOpenLikes={() => setSelectedLikePostId(post.id)}
            onOpenProfile={(userName) => navigate(`/profile/${userName}`)}
          />
        </section>

        <BottomNav active="home" currentUser={user} />
      </div>
      <LikesModal post={selectedLikePost} onClose={() => setSelectedLikePostId(null)} />
    </main>
  );
};

export default PostDetails;
