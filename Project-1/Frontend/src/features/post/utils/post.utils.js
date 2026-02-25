const DEFAULT_PROFILE =
  "https://ik.imagekit.io/ysl3ilfeg/insta_default_pic.jpg";

export function uniqueUsers(users = []) {
  return [...new Set((users || []).filter(Boolean))];
}

function capitalizeWord(value) {
  if (!value) {
    return "";
  }
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function getDisplayName(userName = "") {
  const raw = String(userName || "").trim();
  if (!raw) {
    return "";
  }

  const localPart = raw.split("@")[0];
  const splitParts = localPart.split(/[_.]+/).filter(Boolean);

  if (splitParts.length > 1) {
    const readableParts = splitParts.filter((part) => !/^\d+$/.test(part));
    if (!readableParts.length) {
      return localPart;
    }
    return readableParts.map(capitalizeWord).join(" ");
  }

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function normalizeComment(comment, postId, index) {
  if (typeof comment === "string") {
    return {
      id: `${postId}-comment-${index + 1}`,
      userName: "",
      text: comment,
    };
  }

  return {
    id: comment?._id || comment?.id || `${postId}-comment-${index + 1}`,
    userName: comment?.userName || comment?.user || "",
    text: comment?.text || comment?.comment || "",
  };
}

export function normalizePost(post) {
  const id = post?._id || post?.id;
  if (!id) {
    return null;
  }

  const userName = post?.user?.userName || post?.userName || "";
  const profileImg = post?.user?.profileImg || post?.profileImg || DEFAULT_PROFILE;
  const commentsRaw = Array.isArray(post?.comments) ? post.comments : [];
  const comments = commentsRaw.map((comment, commentIndex) => normalizeComment(comment, id, commentIndex));

  return {
    id,
    user: {
      userName,
      profileImg,
      location: post?.user?.location || post?.location || "",
    },
    imageUrl: post?.img_url || post?.imgUrl || post?.image || post?.imageUrl || "",
    caption: post?.caption || "",
    comments,
    likedBy: uniqueUsers(post?.likedBy || post?.likes || []),
    createdAt: post?.createdAt || null,
  };
}

export function normalizeFeedResponse(payload) {
  const rawPosts = payload?.posts || payload?.post || [];
  if (!Array.isArray(rawPosts)) {
    return [];
  }
  return rawPosts.map((post, index) => normalizePost(post, index)).filter(Boolean);
}

export function formatCount(value = 0) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, value));
}

export function formatPostTime(dateValue) {
  const createdDate = new Date(dateValue);
  if (Number.isNaN(createdDate.getTime())) {
    return "Recently";
  }

  const diffMs = Date.now() - createdDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y`;
}

export function buildStoriesFromPosts(posts, currentUser, followingUserNames = []) {
  const followingSet = new Set((followingUserNames || []).filter(Boolean));
  const filteredPosts = followingSet.size
    ? posts.filter((post) => followingSet.has(post?.user?.userName))
    : [];

  const postStories = filteredPosts.map((post) => ({
    id: `story-${post.id}`,
    userName: post.user.userName,
    profileImg: post.user.profileImg || DEFAULT_PROFILE,
  }));

  const combined = [
    {
      id: "story-own",
      userName: "Your story",
      profileImg: currentUser?.profileImg || DEFAULT_PROFILE,
      isOwn: true,
    },
    ...postStories,
  ];

  const seen = new Set();
  return combined.filter((story) => {
    if (seen.has(story.userName)) {
      return false;
    }
    seen.add(story.userName);
    return true;
  });
}
