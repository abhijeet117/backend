import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MoodifyOverlays from "../features/moodify/components/common/MoodifyOverlays.jsx";
import Footer from "../features/moodify/components/home/Footer.jsx";
import Header from "../features/moodify/components/home/Header.jsx";
import Hero from "../features/moodify/components/home/Hero.jsx";
import HowItWorks from "../features/moodify/components/home/HowItWorks.jsx";
import MarqueeBand from "../features/moodify/components/home/MarqueeBand.jsx";
import MoodSection from "../features/moodify/components/home/MoodSection.jsx";
import MusicPreview from "../features/moodify/components/home/MusicPreview.jsx";
import {
  useMoodifyCursorEffects,
  useMoodifyHomeEffects,
} from "../features/moodify/runtime/useMoodifyEffects.js";

function HomePage() {
  const navigate = useNavigate();

  useMoodifyCursorEffects();
  useMoodifyHomeEffects();

  const scrollToSection = useCallback((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const goLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const goRegister = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  const goDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const goMoodSection = useCallback(() => {
    scrollToSection("moods");
  }, [scrollToSection]);

  const goHowItWorks = useCallback(() => {
    scrollToSection("how-it-works");
  }, [scrollToSection]);

  return (
    <>
      <MoodifyOverlays />
      <div id="page-landing">
        <Header
          onLogin={goLogin}
          onRegister={goRegister}
          onMood={goMoodSection}
          onHowItWorks={goHowItWorks}
        />
        <Hero onStartVibe={goDashboard} onHowItWorks={goHowItWorks} />
        <MoodSection />
        <MarqueeBand />
        <HowItWorks />
        <MusicPreview />
        <Footer />
      </div>
    </>
  );
}

export default HomePage;
