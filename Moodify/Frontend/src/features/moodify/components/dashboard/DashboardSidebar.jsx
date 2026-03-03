import BackHomeButton from "./BackHomeButton.jsx";
import MoodHistory from "./MoodHistory.jsx";
import SidebarPlayer from "./SidebarPlayer.jsx";

function DashboardSidebar({ onBackHome }) {
  return (
    <div className="dash-sidebar">
      <div>
        <div className="dash-section-label">Now Playing</div>
        <SidebarPlayer />
      </div>

      <div>
        <div className="dash-section-label">Mood History</div>
        <MoodHistory />
      </div>

      <BackHomeButton onBackHome={onBackHome} />
    </div>
  );
}

export default DashboardSidebar;
