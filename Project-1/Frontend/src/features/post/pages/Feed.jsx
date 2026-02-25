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

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading, feed, stories, loadFeed, getPostById, toggleLike } = usePost();
  const [selectedLikePostId, setSelectedLikePostId] = useState(null);

  const currentUserName = user?.userName || "rahul";
  const selectedLikePost = useMemo(() => getPostById(selectedLikePostId), [getPostById, selectedLikePostId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleOpenPost = useCallback(
    (postId) => {
      navigate(`/post/${postId}`);
    },
    [navigate],
  );

  const handleToggleLike = useCallback(
    (postId) => {
      toggleLike(postId, currentUserName);
    },
    [currentUserName, toggleLike],
  );

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <FeedTopBar />
        <section className="ig-scroll-area">
          <StoriesBar stories={stories} />
          {loading && !feed.length ? <p className="ig-loading">Loading feed...</p> : null}
          <div className="ig-post-list">
            {feed.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserName={currentUserName}
                onOpenPost={handleOpenPost}
                onToggleLike={() => handleToggleLike(post.id)}
                onOpenLikes={() => setSelectedLikePostId(post.id)}
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
