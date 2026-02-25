import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import FeedPostCard from "../components/FeedPostCard";
import LikesModal from "../components/LikesModal";
import { BackIcon } from "../components/icons";
import { addComment, likePost, unlikePost } from "../services/post.api";
import { followUser, getProfile, unfollowUser } from "../services/user.api";
import { normalizePost, uniqueUsers } from "../utils/post.utils";
import "../style/Profile.scss";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, handleLogout, loading: authLoading } = useAuth();
  const viewerUserName = user?.userName || "";

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

  const handleLogoutClick = useCallback(async () => {
    await handleLogout();
    navigate("/login");
  }, [handleLogout, navigate]);

  const handleEditProfile = useCallback(() => {
    if (!profile?.userName) {
      return;
    }
    navigate(`/profile/${profile.userName}/edit`);
  }, [navigate, profile?.userName]);

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
                  <button
                    type="button"
                    className="ig-profile__stat-btn"
                    onClick={() => navigate(`/profile/${profile.userName}/followers`)}
                  >
                    <strong>{profile.followersCount}</strong>
                    <span>followers</span>
                  </button>
                  <button
                    type="button"
                    className="ig-profile__stat-btn"
                    onClick={() => navigate(`/profile/${profile.userName}/following`)}
                  >
                    <strong>{profile.followingCount}</strong>
                    <span>following</span>
                  </button>
                </div>
              </div>

              <div className="ig-profile__meta">
                <h2>{profile.userName}</h2>
                <p>{profile.bio || ""}</p>
                {!profile.isOwnProfile ? (
                  <button type="button" className="ig-profile__follow-btn" disabled={followBusy} onClick={handleFollowToggle}>
                    {profile.isFollowing ? "Following" : "Follow"}
                  </button>
                ) : (
                  <>
                    <button type="button" className="ig-profile__edit-btn" onClick={handleEditProfile}>
                      Edit profile
                    </button>
                    <button
                      type="button"
                      className="ig-profile__logout-btn"
                      onClick={handleLogoutClick}
                      disabled={authLoading}
                    >
                      {authLoading ? "Logging out..." : "Logout"}
                    </button>
                  </>
                )}
              </div>

              <div className="ig-post-list">
                {posts.map((post) => (
                  <FeedPostCard
                    key={post.id}
                    post={post}
                    currentUserName={viewerUserName}
                    nameMode="username"
                    onToggleLike={() => handleToggleLike(post.id)}
                    onOpenPost={(postId) => navigate(`/post/${postId}`)}
                    onOpenLikes={() => setSelectedLikePostId(post.id)}
                    onOpenProfile={(name) => navigate(`/profile/${name}`)}
                    onAddComment={(text) => handleAddComment(post.id, text)}
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
