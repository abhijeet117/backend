import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import FeedPostCard from "../components/FeedPostCard";
import FeedTopBar from "../components/FeedTopBar";
import LikesModal from "../components/LikesModal";
import StoriesBar from "../components/StoriesBar";
import { usePost } from "../hooks/usePost";
import "../style/feed.scss";

const Feed = ({ scope = "following" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, error, feed, stories, loadFeed, getPostById, toggleLike, addCommentToPost } = usePost();
  const [selectedLikePostId, setSelectedLikePostId] = useState(null);

  const currentUserName = user?.userName || "";
  const selectedLikePost = useMemo(() => getPostById(selectedLikePostId), [getPostById, selectedLikePostId]);
  const isAllPostsFeed = scope === "all";
  const emptyMessage = isAllPostsFeed
    ? "No posts available right now."
    : "Follow users to see posts in your feed.";

  useEffect(() => {
    loadFeed(scope);
  }, [loadFeed, scope]);

  const handleOpenPost = useCallback(
    (postId) => {
      navigate(`/post/${postId}`);
    },
    [navigate],
  );

  const handleToggleLike = useCallback(
    (postId) => {
      toggleLike(postId);
    },
    [toggleLike],
  );

  const handleAddComment = useCallback(
    (postId, text) => addCommentToPost(postId, text),
    [addCommentToPost],
  );

  const handleOpenProfile = useCallback(
    (userName) => {
      navigate(`/profile/${userName}`);
    },
    [navigate],
  );

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <FeedTopBar />
        <section className="ig-scroll-area">
          <StoriesBar stories={stories} />
          {error ? <p className="ig-error">{error}</p> : null}
          {loading && !feed.length ? <p className="ig-loading">Loading feed...</p> : null}
          {!loading && !error && !feed.length ? <p className="ig-loading">{emptyMessage}</p> : null}
          <div className="ig-post-list">
            {feed.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserName={currentUserName}
                onOpenPost={handleOpenPost}
                onToggleLike={() => handleToggleLike(post.id)}
                onOpenLikes={() => setSelectedLikePostId(post.id)}
                onOpenProfile={handleOpenProfile}
                onAddComment={(text) => handleAddComment(post.id, text)}
              />
            ))}
          </div>
        </section>
        <BottomNav active="home" currentUser={user} />
      </div>
      <LikesModal post={selectedLikePost} onClose={() => setSelectedLikePostId(null)} />
    </main>
  );
};

export default Feed;
