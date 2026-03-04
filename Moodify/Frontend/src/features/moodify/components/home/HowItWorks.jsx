import HtmlFragment from "../common/HtmlFragment.jsx";
import "./HowItWorks.scss";

const howItWorksHtml = `<section class="hiw-section" id="how-it-works">
    <div class="hiw-label">The Process</div>
    <h2 class="hiw-heading">Three seconds to your soundtrack</h2>
    <div class="hiw-steps">
      <div class="hiw-step reveal">
        <div class="hiw-step-num">01</div>
        <span class="hiw-step-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="10" width="32" height="28" rx="5" stroke="rgba(255,107,71,0.7)" stroke-width="2" fill="rgba(255,107,71,0.06)"/>
            <circle cx="24" cy="24" r="7" stroke="rgba(255,107,71,0.7)" stroke-width="2" fill="rgba(255,107,71,0.1)"/>
            <circle cx="24" cy="24" r="3" fill="rgba(255,107,71,0.6)"/>
            <rect x="20" y="4" width="8" height="6" rx="2" stroke="rgba(255,107,71,0.5)" stroke-width="1.5" fill="none"/>
            <line x1="24" y1="10" x2="24" y2="10" stroke="rgba(255,107,71,0.5)" stroke-width="2" stroke-linecap="round"/>
            <path d="M14 14 L34 14" stroke="rgba(255,107,71,0.2)" stroke-width="1" stroke-dasharray="2 3"/>
          </svg>
        </span>
        <div class="hiw-step-title">Camera scans your face</div>
        <p class="hiw-step-text">MediaPipe Face Landmarker maps 478 facial points in real-time &#8212; zero data stored, fully private.</p>
      </div>
      <div class="hiw-arrow reveal reveal-delay-1">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16 H26 M20 10 L26 16 L20 22" stroke="rgba(255,107,71,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="hiw-step reveal reveal-delay-2">
        <div class="hiw-step-num">02</div>
        <span class="hiw-step-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 8 C16 8 10 14 10 20 C10 24 12 27 10 30 C8 33 10 38 14 39 C16 43 20 44 24 44 C28 44 32 43 34 39 C38 38 40 33 38 30 C36 27 38 24 38 20 C38 14 32 8 24 8Z" stroke="rgba(255,107,71,0.6)" stroke-width="1.8" fill="rgba(255,107,71,0.06)"/>
            <path d="M18 20 Q24 16 30 20" stroke="rgba(255,107,71,0.5)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M16 28 Q24 24 32 28" stroke="rgba(255,107,71,0.5)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <circle cx="18" cy="20" r="2" fill="rgba(255,107,71,0.6)"/>
            <circle cx="30" cy="20" r="2" fill="rgba(255,107,71,0.6)"/>
            <circle cx="24" cy="16" r="1.5" fill="rgba(255,107,71,0.4)"/>
            <circle cx="16" cy="28" r="2" fill="rgba(255,107,71,0.6)"/>
            <circle cx="32" cy="28" r="2" fill="rgba(255,107,71,0.6)"/>
            <circle cx="24" cy="34" r="1.5" fill="rgba(255,107,71,0.4)"/>
          </svg>
        </span>
        <div class="hiw-step-title">AI reads your mood</div>
        <p class="hiw-step-text">On-device AI classifies your expression into one of four emotional states with 94% accuracy.</p>
      </div>
      <div class="hiw-arrow reveal reveal-delay-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16 H26 M20 10 L26 16 L20 22" stroke="rgba(255,107,71,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="hiw-step reveal reveal-delay-4">
        <div class="hiw-step-num">03</div>
        <span class="hiw-step-icon">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 24 C12 16 17.4 10 24 10 C30.6 10 36 16 36 24" stroke="rgba(255,107,71,0.6)" stroke-width="2" fill="none" stroke-linecap="round"/>
            <rect x="8" y="22" width="8" height="12" rx="4" fill="rgba(255,107,71,0.15)" stroke="rgba(255,107,71,0.6)" stroke-width="1.8"/>
            <rect x="32" y="22" width="8" height="12" rx="4" fill="rgba(255,107,71,0.15)" stroke="rgba(255,107,71,0.6)" stroke-width="1.8"/>
            <path d="M20 30 Q24 26 28 30" stroke="rgba(255,107,71,0.4)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <path d="M18 34 Q24 28 30 34" stroke="rgba(255,107,71,0.25)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          </svg>
        </span>
        <div class="hiw-step-title">Music plays automatically</div>
        <p class="hiw-step-text">A handcrafted playlist for your exact mood loads and plays &#8212; adaptive, fluid, and always evolving.</p>
      </div>
    </div>
  </section>`;

function HowItWorks() {
  return <HtmlFragment html={howItWorksHtml} />;
}

export default HowItWorks;
