import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import MoodifyOverlays from "../features/moodify/components/common/MoodifyOverlays.jsx";
import RegisterForm from "../features/moodify/components/auth/RegisterForm.jsx";
import RegisterPanel from "../features/moodify/components/auth/RegisterPanel.jsx";
import {
  useMoodifyAuthEffects,
  useMoodifyCursorEffects,
} from "../features/moodify/runtime/useMoodifyEffects.js";

function RegisterPage() {
  const navigate = useNavigate();
  const { error, loading, handleRegister, clearError } = useAuth();

  useMoodifyCursorEffects();
  useMoodifyAuthEffects();

  const goDashboard = useCallback(
    async (payload) => {
      if (loading) {
        return;
      }

      try {
        await handleRegister(payload);
        navigate("/dashboard", { replace: true });
      } catch {
        // Error state is handled by auth hook.
      }
    },
    [handleRegister, loading, navigate]
  );

  const goLogin = useCallback(() => {
    clearError();
    navigate("/login");
  }, [clearError, navigate]);

  const goHome = useCallback(() => {
    clearError();
    navigate("/");
  }, [clearError, navigate]);

  return (
    <>
      <MoodifyOverlays />
      <div id="page-register">
        <RegisterPanel />
        <div className="auth-right">
          <RegisterForm onRegister={goDashboard} onGoLogin={goLogin} onGoHome={goHome} />
          {loading ? (
            <p className="form-link-text" style={{ marginTop: "12px" }}>
              Creating account...
            </p>
          ) : null}
          {error ? (
            <p className="form-link-text" role="alert" style={{ marginTop: "8px", color: "var(--accent-coral)" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
