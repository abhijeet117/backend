import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import "./styles/main.scss";
import App from "./App.jsx";
import { AuthProvider } from "./state/AuthContext.jsx";
import { FaceMoodProvider } from "./state/FaceMoodContext.jsx";
import { ProfileProvider } from "./state/ProfileContext.jsx";
import { SongProvider } from "./features/music/state/song.context.jsx";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <SongProvider>
          <FaceMoodProvider>
            <App />
          </FaceMoodProvider>
        </SongProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>
);
