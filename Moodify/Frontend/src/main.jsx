import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./state/AuthContext.jsx";
import { FaceMoodProvider } from "./state/FaceMoodContext.jsx";
import { ProfileProvider } from "./state/ProfileContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <FaceMoodProvider>
          <App />
        </FaceMoodProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>
);
