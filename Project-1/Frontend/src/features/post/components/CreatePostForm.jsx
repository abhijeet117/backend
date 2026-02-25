const CreatePostForm = ({
  caption,
  onCaptionChange,
  onFileChange,
  onSubmit,
  previewUrl,
  isSubmitting,
  error,
}) => {
  return (
    <form className="ig-create-form" onSubmit={onSubmit}>
      <label className="ig-create-form__field">
        <span>Image</span>
        <input type="file" accept="image/*" onChange={onFileChange} required />
      </label>

      {previewUrl ? (
        <img src={previewUrl} alt="Selected post" className="ig-create-form__preview" />
      ) : null}

      <label className="ig-create-form__field">
        <span>Caption</span>
        <textarea
          value={caption}
          onChange={onCaptionChange}
          placeholder="Write a caption..."
          rows={4}
          maxLength={2200}
        />
      </label>

      {error ? <p className="ig-error">{error}</p> : null}

      <button className="ig-create-form__submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Share Post"}
      </button>
    </form>
  );
};

export default CreatePostForm;
