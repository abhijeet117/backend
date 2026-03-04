import DashboardTopBar from "../features/dashboard/components/DashboardTopBar.jsx";
import { useFaceMood } from "../features/dashboard/hooks/useFaceMood.js";
import { useDashboardUserMenu } from "../features/dashboard/hooks/useDashboardUserMenu.js";
import DashboardSidebar from "../features/moodify/components/dashboard/DashboardSidebar.jsx";
import MoodStatus from "../features/moodify/components/dashboard/MoodStatus.jsx";
import WebcamCard from "../features/moodify/components/dashboard/WebcamCard.jsx";
import MoodifyOverlays from "../features/moodify/components/common/MoodifyOverlays.jsx";
import {
  useMoodifyCursorEffects,
  useMoodifyDashboardEffects,
} from "../features/moodify/runtime/useMoodifyEffects.js";

function DashboardPage() {
  const { isMenuOpen, displayName, avatarLabel, toggleMenu, goProfile, logout } = useDashboardUserMenu();
  const {
    videoRef,
    handleCapture,
    handleStartAgain,
    isCaptured,
    moodViewModel,
    moodClassName,
    moodLabel,
    cameraStatusText,
    canCapture,
    canStartAgain,
  } = useFaceMood();

  useMoodifyCursorEffects();
  useMoodifyDashboardEffects();

  return (
    <>
      <MoodifyOverlays />
      <div id="page-dashboard">
        <DashboardTopBar
          displayName={displayName}
          avatarLabel={avatarLabel}
          isMenuOpen={isMenuOpen}
          onToggleMenu={toggleMenu}
          onProfile={goProfile}
          onLogout={logout}
        />

        <div className="dash-body">
          <div className="dash-main">
            <div>
              <div className="dash-section-label">Live Face Detection</div>
              <WebcamCard
                videoRef={videoRef}
                onCapture={handleCapture}
                onStartAgain={handleStartAgain}
                isCaptured={isCaptured}
                moodClassName={moodClassName}
                moodLabel={moodLabel}
                cameraStatusText={cameraStatusText}
                canCapture={canCapture}
                canStartAgain={canStartAgain}
              />
            </div>

            <div>
              <div className="dash-section-label">Current Mood Profile</div>
              <MoodStatus mood={moodViewModel} />
            </div>
          </div>

          <DashboardSidebar />
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
