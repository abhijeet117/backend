import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import LoginForm from "../features/moodify/components/auth/LoginForm.jsx";
import LoginPanel from "../features/moodify/components/auth/LoginPanel.jsx";
import MoodifyOverlays from "../features/moodify/components/common/MoodifyOverlays.jsx";
import {
  useMoodifyAuthEffects,
  useMoodifyCursorEffects,
} from "../features/moodify/runtime/useMoodifyEffects.js";

function LoginPage() {
  const navigate = useNavigate();
  const { error, loading, handleLogin, clearError } = useAuth();

  useMoodifyCursorEffects();
  useMoodifyAuthEffects();

  const goDashboard = useCallback(
    async (credentials) => {
      if (loading) {
        return;
      }

      try {
        await handleLogin(credentials);
        navigate("/dashboard", { replace: true });
      } catch {
        // Error state is handled by auth hook.
      }
    },
    [handleLogin, loading, navigate]
  );

  const goRegister = useCallback(() => {
    clearError();
    navigate("/register");
  }, [clearError, navigate]);

  const goHome = useCallback(() => {
    clearError();
    navigate("/");
  }, [clearError, navigate]);

  return (
    <>
      <MoodifyOverlays />
      <div id="page-login">
        <LoginPanel />
        <div className="auth-right">
          <LoginForm
            onLogin={goDashboard}
            onGoRegister={goRegister}
            onGoHome={goHome}
            errorMessage={error}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}

export default LoginPage;
