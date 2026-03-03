import { useEffect } from "react";
import DashboardTopBar from "../../dashboard/components/DashboardTopBar.jsx";
import { useDashboardUserMenu } from "../../dashboard/hooks/useDashboardUserMenu.js";
import MoodifyOverlays from "../../moodify/components/common/MoodifyOverlays.jsx";
import { useMoodifyCursorEffects } from "../../moodify/runtime/useMoodifyEffects.js";
import { useProfile } from "../hooks/useProfile.js";

function ProfilePage() {
  const { profile, historyItems, loading, error, loadProfile } = useProfile();
  const { isMenuOpen, displayName, avatarLabel, toggleMenu, goProfile, logout } = useDashboardUserMenu();

  useMoodifyCursorEffects();

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

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
              <div className="dash-section-label">My Profile</div>
              <div className="mood-status-card mood-result-card">
                <div className="mood-result-row">
                  <span className="mood-stat-label">Full Name</span>
                  <div className="mood-stat-value" style={{ fontSize: "1.25rem" }}>
                    {profile?.fullName || "-"}
                  </div>
                </div>
                <div className="mood-result-row">
                  <span className="mood-stat-label">Email</span>
                  <div className="mood-result-description">{profile?.email || "-"}</div>
                </div>
                <div className="mood-result-row">
                  <span className="mood-stat-label">Username</span>
                  <div className="mood-result-description">{profile?.username || "-"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-sidebar">
            <div>
              <div className="dash-section-label">Face Expression History</div>
              <div className="mood-history-card">
                <div className="mh-title">Recent Captures</div>
                {loading ? <div className="mh-time">Loading...</div> : null}
                {error ? <div className="mh-time" style={{ color: "var(--accent-coral)" }}>{error}</div> : null}
                {!loading && !error && historyItems.length === 0 ? <div className="mh-time">No captures yet.</div> : null}
                {!loading && !error
                  ? historyItems.map((item) => (
                      <div className="mh-item" key={item.id}>
                        <div className="mh-dot" style={{ background: item.color }}></div>
                        <div className="mh-mood-name">{item.mood}</div>
                        <div className="mh-time">{item.timeLabel}</div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
