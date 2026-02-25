import { mockStories } from "../data/mockFeed";

const DEFAULT_PROFILE =
  "https://images.unsplash.com/photo-1546961329-78bef0414d7c?auto=format&fit=crop&w=200&q=80";
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1200&q=80";

const fallbackComments = [
  { userName: "foodie_fran", text: "This is unreal." },
  { userName: "style_icon", text: "Love this shot." },
  { userName: "tech_enthusiast", text: "Clean composition." },
];

const fallbackLocations = ["New York, NY", "London, UK", "Paris, France", "Mumbai, IN"];

export function uniqueUsers(users = []) {
  return [...new Set((users || []).filter(Boolean))];
}

function buildFallbackComments(postId) {
  return fallbackComments.map((comment, index) => ({
    id: `${postId}-fallback-${index + 1}`,
    userName: comment.userName,
    text: comment.text,
  }));
}

function normalizeComment(comment, postId, index) {
  if (typeof comment === "string") {
    return {
      id: `${postId}-comment-${index + 1}`,
      userName: "user",
      text: comment,
    };
  }

  return {
    id: comment?._id || comment?.id || `${postId}-comment-${index + 1}`,
    userName: comment?.userName || comment?.user || "user",
    text: comment?.text || comment?.comment || "",
  };
}

export function normalizePost(post, index = 0) {
  const id = post?._id || post?.id || `post-${index + 1}`;
  const userName = post?.user?.userName || post?.userName || `user_${index + 1}`;
  const profileImg = post?.user?.profileImg || post?.profileImg || DEFAULT_PROFILE;
  const commentsRaw = Array.isArray(post?.comments) ? post.comments : [];
  const comments = commentsRaw.length
    ? commentsRaw.map((comment, commentIndex) => normalizeComment(comment, id, commentIndex))
    : buildFallbackComments(id);

  return {
    id,
    user: {
      userName,
      profileImg,
      location: post?.user?.location || post?.location || fallbackLocations[index % fallbackLocations.length],
    },
    imageUrl: post?.img_url || post?.imgUrl || post?.image || post?.imageUrl || DEFAULT_IMAGE,
    caption: post?.caption || "",
    comments,
    likedBy: uniqueUsers(post?.likedBy || post?.likes || []),
    createdAt: post?.createdAt || new Date(Date.now() - (index + 1) * 3600 * 1000).toISOString(),
  };
}

export function normalizeFeedResponse(payload) {
  const rawPosts = payload?.posts || payload?.post || [];
  if (!Array.isArray(rawPosts)) {
    return [];
  }
  return rawPosts.map((post, index) => normalizePost(post, index));
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

export function buildStoriesFromPosts(posts, currentUser) {
  const postStories = posts.map((post) => ({
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
    ...mockStories.filter((story) => !story.isOwn),
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
