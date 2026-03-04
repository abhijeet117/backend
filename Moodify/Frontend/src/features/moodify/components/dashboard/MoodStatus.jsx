import "./MoodStatus.scss";
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
    </div>
  );
}

export default MoodStatus;

