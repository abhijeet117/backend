import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useProfile } from "../../profile/hooks/useProfile.js";

function useDashboardUserMenu() {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const { resetProfileState } = useProfile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = useMemo(() => user?.fullName || user?.username || "User", [user]);
  const avatarLabel = useMemo(() => displayName.charAt(0).toUpperCase(), [displayName]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const goProfile = useCallback(() => {
    closeMenu();
    navigate("/profile");
  }, [closeMenu, navigate]);

  const goDashboard = useCallback(() => {
    closeMenu();
    navigate("/dashboard");
  }, [closeMenu, navigate]);

  const logout = useCallback(async () => {
    closeMenu();

    try {
      await handleLogout();
    } catch {
      // non-blocking; client state is still cleared in handleLogout finally
    } finally {
      resetProfileState();
      navigate("/login", { replace: true });
    }
  }, [closeMenu, handleLogout, navigate, resetProfileState]);

  return {
    isMenuOpen,
    displayName,
    avatarLabel,
    toggleMenu,
    closeMenu,
    goDashboard,
    goProfile,
    logout,
  };
}

export { useDashboardUserMenu };
