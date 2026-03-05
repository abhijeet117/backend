import "./DashboardTopBar.scss";
function DashboardTopBar({ displayName, avatarLabel, isMenuOpen, onToggleMenu, onDashboard, onProfile, onLogout }) {
  return (
    <nav className="dash-nav">
      <div className="dash-logo">
        <div className="dot"></div>
        Moodify
      </div>
      <div className="dash-greeting">
        Good Evening, <strong>{displayName}</strong>
      </div>

      <div className="dash-user-menu">
        <button
          type="button"
          className="dash-user-trigger"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen ? "true" : "false"}
          onClick={onToggleMenu}
        >
          <span className="dash-user-name">{displayName}</span>
          <span className="dash-avatar">{avatarLabel}</span>
        </button>

        {isMenuOpen ? (
          <div className="dash-user-dropdown" role="menu">
            <button type="button" className="dash-user-item" role="menuitem" onClick={onDashboard}>
              Dashboard
            </button>
            <button type="button" className="dash-user-item" role="menuitem" onClick={onProfile}>
              My Profile
            </button>
            <button type="button" className="dash-user-item dash-user-item-danger" role="menuitem" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export default DashboardTopBar;

