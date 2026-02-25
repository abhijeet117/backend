import { memo, useMemo } from "react";

import { formatCount, formatPostTime } from "../utils/post.utils";
import { BookmarkIcon, CommentIcon, HeartIcon, MoreIcon, ShareIcon } from "./icons";
import "../style/Post.scss";

const FeedPostCard = ({
  post,
  currentUserName,
  expanded = false,
  onToggleLike,
  onOpenPost,
  onOpenLikes,
  onOpenProfile,
}) => {
  const isLiked = post.likedBy.includes(currentUserName);
  const commentsToShow = expanded ? post.comments : post.comments.slice(0, 2);

  const likedByLine = useMemo(() => {
    if (!post.likedBy.length) {
      return "Be the first to like this";
    }

    if (post.likedBy.length === 1) {
      return `Liked by ${post.likedBy[0]}`;
    }

    return `Liked by ${post.likedBy[0]} and ${formatCount(post.likedBy.length - 1)} others`;
  }, [post.likedBy]);

  return (
    <article className={`ig-post ${expanded ? "ig-post--detail" : ""}`}>
      <header className="ig-post__header">
        <div className="ig-post__author">
          <img src={post.user.profileImg} alt={post.user.userName} loading="lazy" />
          <div>
            <button type="button" className="ig-link-btn ig-post__username-btn" onClick={() => onOpenProfile?.(post.user.userName)}>
              <p className="ig-post__username">{post.user.userName}</p>
            </button>
            {post.user.location ? <p className="ig-post__location">{post.user.location}</p> : null}
          </div>
        </div>
        <button type="button" className="ig-icon-btn" aria-label="Post options">
          <MoreIcon className="ig-icon" />
        </button>
      </header>

      <button
        type="button"
        className="ig-post__media-btn"
        onClick={() => onOpenPost?.(post.id)}
        aria-label="Open post details"
        disabled={expanded}
      >
        {post.imageUrl ? (
          <img className="ig-post__image" src={post.imageUrl} alt={`${post.user.userName} post`} loading="lazy" />
        ) : (
          <div className="ig-post__image" aria-hidden="true" />
        )}
      </button>

      <div className="ig-post__actions">
        <div className="ig-post__actions-left">
          <button type="button" className={`ig-icon-btn ${isLiked ? "is-liked" : ""}`} onClick={onToggleLike}>
            <HeartIcon className="ig-icon" filled={isLiked} />
          </button>
          <button type="button" className="ig-icon-btn" onClick={() => onOpenPost?.(post.id)}>
            <CommentIcon className="ig-icon" />
          </button>
          <button type="button" className="ig-icon-btn" aria-label="Share post">
            <ShareIcon className="ig-icon" />
          </button>
        </div>
        <button type="button" className="ig-icon-btn" aria-label="Save post">
          <BookmarkIcon className="ig-icon" />
        </button>
      </div>

      <div className="ig-post__meta">
        <button type="button" className="ig-link-btn ig-post__likes" onClick={() => onOpenLikes?.(post.id)}>
          {formatCount(post.likedBy.length)} likes
        </button>
        <button type="button" className="ig-link-btn ig-post__liked-by" onClick={() => onOpenLikes?.(post.id)}>
          {likedByLine}
        </button>
        <p className="ig-post__caption">
          <button type="button" className="ig-link-btn ig-post__caption-user" onClick={() => onOpenProfile?.(post.user.userName)}>
            <strong>{post.user.userName}</strong>
          </button>{" "}
          {post.caption}
        </p>

        {!expanded && post.comments.length > 2 ? (
          <button type="button" className="ig-link-btn ig-post__all-comments" onClick={() => onOpenPost?.(post.id)}>
            View all {formatCount(post.comments.length)} comments
          </button>
        ) : null}

        <div className="ig-post__comments">
          {commentsToShow.map((comment) => (
            <p key={comment.id} className="ig-post__comment">
              <strong>{comment.userName}</strong> {comment.text}
            </p>
          ))}
        </div>
        <time className="ig-post__time">{formatPostTime(post.createdAt).toUpperCase()} AGO</time>
      </div>
    </article>
  );
};

export default memo(FeedPostCard);
