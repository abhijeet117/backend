import MusicPlayer from "../../../music/components/MusicPlayer.jsx";
import "./DashboardSidebar.scss";

function DashboardSidebar() {
  return (
    <div className="dash-sidebar">
      <div>
        <div className="dash-section-label">Now Playing</div>
        <MusicPlayer />
      </div>
    </div>
  );
}

export default DashboardSidebar;
