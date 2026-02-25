import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useAuth } from "../../auth/hooks/useAuth";
import BottomNav from "../components/BottomNav";
import CreatePostForm from "../components/CreatePostForm";
import { BackIcon } from "../components/icons";
import { createPostApi } from "../services/post.create.api";
import "../style/CreatePost.scss";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [imageFile, setImageFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!imageFile) {
      return "";
    }
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    if (!user?.userName) {
      navigate("/login");
    }
  }, [navigate, user?.userName]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await createPostApi({ imageFile, caption });
      const createdPostId = response?.post?._id;

      if (createdPostId) {
        navigate(`/post/${createdPostId}`);
        return;
      }

      if (user?.userName) {
        navigate(`/profile/${user.userName}`);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="ig-feed-page">
      <div className="ig-phone-shell">
        <header className="ig-detail-nav">
          <button
            type="button"
            className="ig-icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon className="ig-icon" />
          </button>
          <p>Create Post</p>
          <span className="ig-detail-nav__spacer" />
        </header>

        <section className="ig-scroll-area ig-create-post">
          <CreatePostForm
            caption={caption}
            onCaptionChange={(event) => setCaption(event.target.value)}
            onFileChange={(event) => setImageFile(event.target.files?.[0] || null)}
            onSubmit={handleSubmit}
            previewUrl={previewUrl}
            isSubmitting={isSubmitting}
            error={error}
          />
        </section>

        <BottomNav active="home" currentUser={user} />
      </div>
    </main>
  );
};

export default CreatePost;
