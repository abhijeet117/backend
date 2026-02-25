import { useState } from "react";

const PostCommentComposer = ({ onAddComment, disabled = false }) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !onAddComment || disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddComment(trimmedText);
      if (success) {
        setText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ig-post__comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a comment..."
        className="ig-post__comment-input"
        maxLength={500}
        disabled={disabled || isSubmitting}
      />
      <button
        type="submit"
        className="ig-post__comment-submit"
        disabled={!text.trim() || disabled || isSubmitting}
      >
        {isSubmitting ? "..." : "Post"}
      </button>
    </form>
  );
};

export default PostCommentComposer;
