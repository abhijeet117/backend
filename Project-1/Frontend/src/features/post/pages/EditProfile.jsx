import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import { BackIcon } from "../components/icons";
import { getProfile, updateProfile } from "../services/user.api";
import "../style/EditProfile.scss";

const DEFAULT_PROFILE_IMG = "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg";

const EditProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [profileImg, setProfileImg] = useState("");
  const [initialValues, setInitialValues] = useState({
    email: "",
    bio: "",
    profileImg: "",
  });

  const previewImg = useMemo(() => profileImg.trim() || DEFAULT_PROFILE_IMG, [profileImg]);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!username) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getProfile(username);
        const profile = response?.profile;

        if (!mounted) {
          return;
        }

        if (!profile?.isOwnProfile) {
          setCanEdit(false);
          setError("You can edit only your own profile");
          return;
        }

        const values = {
          email: profile.email || "",
          bio: profile.bio || "",
          profileImg: profile.profileImg || "",
        };

        setEmail(values.email);
        setBio(values.bio);
        setProfileImg(values.profileImg);
        setInitialValues(values);
        setCanEdit(true);
      } catch (err) {
        if (mounted) {
          setCanEdit(false);
          setError(err?.response?.data?.message || "Failed to load profile");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate, username]);

  const hasChanges = useMemo(
    () =>
      email.trim() !== initialValues.email ||
      bio.trim() !== initialValues.bio ||
      profileImg.trim() !== initialValues.profileImg,
    [bio, email, initialValues.bio, initialValues.email, initialValues.profileImg, profileImg],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!hasChanges || saving) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        const payload = {
          email: email.trim(),
          bio: bio.trim(),
          profileImg: profileImg.trim(),
        };

        const response = await updateProfile(payload);
        await refreshUser();

        const nextUserName = response?.user?.userName || username || user?.userName;
        if (nextUserName) {
          navigate(`/profile/${nextUserName}`);
          return;
        }
        navigate("/");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to update profile");
      } finally {
        setSaving(false);
      }
    },
    [bio, email, hasChanges, navigate, profileImg, refreshUser, saving, user?.userName, username],
  );

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button type="button" className="ig-icon-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <BackIcon className="ig-icon" />
          </button>
          <p>Edit profile</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area ig-edit-profile">
          {error ? <p className="ig-error">{error}</p> : null}
          {loading ? <p className="ig-loading">Loading profile...</p> : null}

          {!loading && canEdit ? (
            <form className="ig-edit-profile__form" onSubmit={handleSubmit}>
              <img src={previewImg} alt="Profile preview" className="ig-edit-profile__avatar" />

              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <label htmlFor="profile-bio">Bio</label>
              <textarea
                id="profile-bio"
                value={bio}
                maxLength={200}
                rows={3}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Write something about you"
              />

              <label htmlFor="profile-image">Profile image URL</label>
              <input
                id="profile-image"
                type="url"
                value={profileImg}
                onChange={(event) => setProfileImg(event.target.value)}
                placeholder="https://..."
              />

              <button type="submit" disabled={!hasChanges || saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </form>
          ) : null}
        </section>

        <BottomNav active="profile" currentUser={user} />
      </div>
    </main>
  );
};

export default EditProfile;
