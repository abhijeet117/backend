function Icon({ children, className = "", filled = false, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ filled = false, ...props }) {
  return (
    <Icon filled={filled} {...props}>
      <path d="M3 10.75L12 3l9 7.75V21a1 1 0 0 1-1 1h-5.5v-5h-5v5H4a1 1 0 0 1-1-1z" />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.4-3.4" />
    </Icon>
  );
}

export function ReelsIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="4" />
      <path d="M3.5 8h17M8 4l3 4m4-4l3 4M10 12.5l4 2.5-4 2.5z" />
    </Icon>
  );
}

export function CreateIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </Icon>
  );
}

export function ActivityIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 21s-6.8-4.35-9.03-8.2A5.48 5.48 0 0 1 3.7 6.2C5.44 4.25 8.4 4 10.35 5.63L12 7.03l1.65-1.4C15.6 4 18.56 4.25 20.3 6.2a5.48 5.48 0 0 1 .73 6.6C18.8 16.65 12 21 12 21z" />
    </Icon>
  );
}

export function ProfileIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
      <circle cx="12" cy="12" r="9" />
    </Icon>
  );
}

export function DmIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 6L9.5 17.5l-1.8-5.2L2.5 10.5z" />
      <path d="M21 6L7.7 12.3" />
    </Icon>
  );
}

export function MoreIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </Icon>
  );
}

export function HeartIcon({ filled = false, ...props }) {
  return (
    <Icon filled={filled} {...props}>
      <path d="M12 21s-6.8-4.35-9.03-8.2A5.48 5.48 0 0 1 3.7 6.2C5.44 4.25 8.4 4 10.35 5.63L12 7.03l1.65-1.4C15.6 4 18.56 4.25 20.3 6.2a5.48 5.48 0 0 1 .73 6.6C18.8 16.65 12 21 12 21z" />
    </Icon>
  );
}

export function CommentIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H4l1.9-3.8A8.5 8.5 0 1 1 21 12z" />
    </Icon>
  );
}

export function ShareIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 3L9.5 14.5" />
      <path d="M21 3l-7 18-4-7-7-4z" />
    </Icon>
  );
}

export function BookmarkIcon({ filled = false, ...props }) {
  return (
    <Icon filled={filled} {...props}>
      <path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-3-6.5 3V4.5a1 1 0 0 1 1-1z" />
    </Icon>
  );
}

export function BackIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15.5 4.5L8 12l7.5 7.5" />
    </Icon>
  );
}
