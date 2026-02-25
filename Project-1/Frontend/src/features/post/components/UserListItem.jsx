import { getDisplayName } from "../utils/post.utils";

const DEFAULT_PROFILE_IMG = "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg";

const UserListItem = ({ user, onOpenProfile }) => {
  const displayName = getDisplayName(user.userName);

  return (
    <button
      type="button"
      className="ig-user-list__item"
      onClick={() => onOpenProfile?.(user.userName)}
    >
      <img
        src={user.profileImg || DEFAULT_PROFILE_IMG}
        alt={user.userName}
        className="ig-user-list__avatar"
      />
      <div className="ig-user-list__meta">
        <p className="ig-user-list__name">{displayName}</p>
        {displayName !== user.userName ? <p className="ig-user-list__username">@{user.userName}</p> : null}
        {user.bio ? <p className="ig-user-list__bio">{user.bio}</p> : null}
      </div>
      <span className="ig-user-list__chip">
        {user.isViewer ? "You" : user.isFollowedByViewer ? "Following" : "Profile"}
      </span>
    </button>
  );
};

export default UserListItem;
