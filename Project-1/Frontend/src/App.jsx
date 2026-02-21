import AppRoutes from "./AppRoutes";
import "../src/style.scss";
import { AuthProvider } from "./features/auth/auth.context";

const App = () => {
  return (
    <>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  );
};

export default App;
