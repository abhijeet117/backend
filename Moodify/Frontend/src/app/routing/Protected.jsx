import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth.js";

function Protected({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;
