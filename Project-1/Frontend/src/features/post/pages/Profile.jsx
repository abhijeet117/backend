import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import FeedPostCard from "../components/FeedPostCard";
import LikesModal from "../components/LikesModal";
import { BackIcon } from "../components/icons";
import { likePost, unlikePost } from "../services/post.api";
import { followUser, getProfile, unfollowUser } from "../services/user.api";
import { normalizePost, uniqueUsers } from "../utils/post.utils";
import "../style/Profile.scss";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedLikePostId, setSelectedLikePostId] = useState(null);
  const [followBusy, setFollowBusy] = useState(false);

  const selectedLikePost = useMemo(
    () => posts.find((post) => post.id === selectedLikePostId) || null,
    [posts, selectedLikePostId],
  );

  const loadProfile = useCallback(async () => {
    if (!username) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getProfile(username);
      const fetchedProfile = response?.profile || null;
      setProfile(fetchedProfile);
      setPosts((fetchedProfile?.posts || []).map((post, index) => normalizePost(post, index)));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile");
      setProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollowToggle = useCallback(async () => {
    if (!profile || profile.isOwnProfile || followBusy) {
      return;
    }

    setFollowBusy(true);
    setError("");

    try {
      const response = profile.isFollowing ? await unfollowUser(profile.userName) : await followUser(profile.userName);
      setProfile((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          isFollowing: Boolean(response?.isFollowing),
          followersCount: typeof response?.followersCount === "number" ? response.followersCount : prev.followersCount,
        };
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update follow status");
    } finally {
      setFollowBusy(false);
    }
  }, [followBusy, profile]);

  const handleToggleLike = useCallback(
    async (postId) => {
      if (!user?.userName) {
        return;
      }

      const currentPost = posts.find((post) => post.id === postId);
      if (!currentPost) {
        return;
      }

      const alreadyLiked = currentPost.likedBy.includes(user.userName);
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId
            ? post
            : {
                ...post,
                likedBy: alreadyLiked
                  ? post.likedBy.filter((name) => name !== user.userName)
                  : uniqueUsers([user.userName, ...post.likedBy]),
              },
        ),
      );

      try {
        const response = alreadyLiked ? await unlikePost(postId) : await likePost(postId);
        if (!Array.isArray(response?.likedBy)) {
          return;
        }
        setPosts((prev) =>
          prev.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedBy: uniqueUsers(response.likedBy),
                },
          ),
        );
      } catch {
        setPosts((prev) =>
          prev.map((post) =>
            post.id !== postId
              ? post
              : {
                  ...post,
                  likedBy: alreadyLiked
                    ? uniqueUsers([user.userName, ...post.likedBy])
                    : post.likedBy.filter((name) => name !== user.userName),
                },
          ),
        );
      }
    },
    [posts, user?.userName],
  );

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon className="ig-icon" />
          </button>
          <p>{username}</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area">
          {error ? <p className="ig-error">{error}</p> : null}
          {loading ? <p className="ig-loading">Loading profile...</p> : null}

          {!loading && profile ? (
            <section className="ig-profile">
              <div className="ig-profile__head">
                <img src={profile.profileImg} alt={profile.userName} className="ig-profile__avatar" />
                <div className="ig-profile__stats">
                  <div>
                    <strong>{posts.length}</strong>
                    <span>posts</span>
                  </div>
                  <div>
                    <strong>{profile.followersCount}</strong>
                    <span>followers</span>
                  </div>
                  <div>
                    <strong>{profile.followingCount}</strong>
                    <span>following</span>
                  </div>
                </div>
              </div>

              <div className="ig-profile__meta">
                <h2>{profile.userName}</h2>
                <p>{profile.bio || ""}</p>
                {!profile.isOwnProfile ? (
                  <button type="button" className="ig-profile__follow-btn" disabled={followBusy} onClick={handleFollowToggle}>
                    {profile.isFollowing ? "Following" : "Follow"}
                  </button>
                ) : null}
              </div>

              <div className="ig-post-list">
                {posts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUserName={user?.userName || ""}
                    onToggleLike={() => handleToggleLike(post.id)}
                    onOpenPost={(postId) => navigate(`/post/${postId}`)}
                    onOpenLikes={() => setSelectedLikePostId(post.id)}
                    onOpenProfile={(name) => navigate(`/profile/${name}`)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </section>

        <BottomNav active="profile" currentUser={user} />
      </div>
      <LikesModal post={selectedLikePost} onClose={() => setSelectedLikePostId(null)} />
    </main>
  );
};

export default Profile;
