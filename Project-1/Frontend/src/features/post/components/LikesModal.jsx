import { formatCount } from "../utils/post.utils";

function initialFromName(name) {
  return (name || "U").slice(0, 1).toUpperCase();
}

const LikesModal = ({ post, onClose }) => {
  if (!post) {
    return null;
  }

  return (
    <div className="ig-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="ig-modal" role="dialog" aria-modal="true" aria-label="Likes list" onClick={(event) => event.stopPropagation()}>
        <div className="ig-modal__header">
          <h2>Likes ({formatCount(post.likedBy.length)})</h2>
          <button type="button" className="ig-link-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <ul className="ig-modal__list">
          {post.likedBy.map((name) => (
            <li key={`${post.id}-${name}`} className="ig-modal__item">
              <span className="ig-modal__avatar">{initialFromName(name)}</span>
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LikesModal;
