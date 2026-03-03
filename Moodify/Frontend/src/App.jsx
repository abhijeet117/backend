import AppRoutes from "./app/routing/AppRoutes.jsx";
import { useAuthInit } from "./features/auth/hooks/useAuthInit.js";
import "./features/moodify/assets/moodify.css";

function App() {
  const { isInitialized } = useAuthInit();

  if (!isInitialized) {
    return null;
  }

  return <AppRoutes />;
}

export default App;
