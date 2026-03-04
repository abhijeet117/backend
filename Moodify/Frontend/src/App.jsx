import AppRoutes from "./app/routing/AppRoutes.jsx";
import { useAuthInit } from "./features/auth/hooks/useAuthInit.js";

function App() {
  const { isInitialized } = useAuthInit();

  if (!isInitialized) {
    return null;
  }

  return <AppRoutes />;
}

export default App;
