import "../style/Stories.scss";

const StoriesBar = ({ stories = [] }) => {
  return (
    <section className="ig-stories-wrap" aria-label="Stories">
      <div className="ig-stories">
        {stories.map((story) => (
          <button key={story.id} type="button" className="ig-story">
            <span className={`ig-story__ring ${story.isOwn ? "is-own" : ""}`}>
              <img src={story.profileImg} alt={story.userName} loading="lazy" />
              {story.isOwn ? <span className="ig-story__plus">+</span> : null}
            </span>
            <span className="ig-story__name">{story.userName}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default StoriesBar;
