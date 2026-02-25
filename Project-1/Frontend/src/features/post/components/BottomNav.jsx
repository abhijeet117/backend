import { useNavigate } from "react-router";

import { ActivityIcon, CreateIcon, HomeIcon, ProfileIcon, SearchIcon } from "./icons";

const BottomNav = ({ active = "home", currentUser }) => {
  const navigate = useNavigate();

  return (
    <nav className="ig-bottom-nav" aria-label="Primary navigation">
      <button
        type="button"
        className={`ig-bottom-nav__item ${active === "home" ? "is-active" : ""}`}
        onClick={() => {
          if (currentUser?.userName) {
            navigate(`/profile/${currentUser.userName}/feed`);
            return;
          }
          navigate("/");
        }}
        aria-label="Home"
      >
        <HomeIcon className="ig-icon" filled={active === "home"} />
      </button>
      <button type="button" className="ig-bottom-nav__item" aria-label="Search">
        <SearchIcon className="ig-icon" />
      </button>
      <button
        type="button"
        className={`ig-bottom-nav__item ${active === "create" ? "is-active" : ""}`}
        aria-label="Create post"
        onClick={() => navigate("/create")}
      >
        <CreateIcon className="ig-icon" />
      </button>
      <button
        type="button"
        className={`ig-bottom-nav__item ${active === "activity" ? "is-active" : ""}`}
        aria-label="Liked posts"
        onClick={() => navigate("/likes")}
      >
        <ActivityIcon className="ig-icon" filled={active === "activity"} />
      </button>
      <button
        type="button"
        className={`ig-bottom-nav__item ${active === "profile" ? "is-active" : ""}`}
        aria-label="Profile"
        onClick={() => {
          if (currentUser?.userName) {
            navigate(`/profile/${currentUser.userName}`);
          }
        }}
      >
        {currentUser?.profileImg ? (
          <img src={currentUser.profileImg} alt="Profile" className="ig-bottom-nav__avatar" />
        ) : (
          <ProfileIcon className="ig-icon" />
        )}
      </button>
    </nav>
  );
};

export default BottomNav;
