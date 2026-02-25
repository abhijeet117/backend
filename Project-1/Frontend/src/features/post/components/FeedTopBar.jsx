import { DmIcon } from "./icons";

const FeedTopBar = () => {
  return (
    <header className="ig-top-nav">
      <h1 className="ig-logo">Instagram</h1>
      <button type="button" className="ig-icon-btn" aria-label="Direct messages">
        <DmIcon className="ig-icon" />
      </button>
    </header>
  );
};

export default FeedTopBar;
