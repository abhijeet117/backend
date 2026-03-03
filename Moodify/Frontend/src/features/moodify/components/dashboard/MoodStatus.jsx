function MoodStatus({ mood }) {
  if (!mood) {
    return null;
  }

  return (
    <div className="mood-status-card mood-result-card">
      <div className="mood-result-title">{mood.title}</div>

      <div className="mood-result-row">
        <span className="mood-stat-label">Mood</span>
        <span className={`mood-stat-value ${mood.className}`}>{mood.mood}</span>
      </div>

      <div className="mood-result-row">
        <span className="mood-stat-label">Description</span>
        <p className="mood-result-description">{mood.description}</p>
      </div>

      <div className="mood-result-row">
        <span className="mood-stat-label">Genre</span>
        <div className="mood-result-genre">{mood.genre}</div>
      </div>
    </div>
  );
}

export default MoodStatus;
