import HtmlFragment from "../common/HtmlFragment.jsx";
import "./MoodSection.scss";

const moodSectionHtml = `<section class="moods-section" id="moods">
    <div class="moods-label">Mood Intelligence</div>
    <h2 class="moods-heading">Every <em>feeling</em>, a soundtrack</h2>
    <div class="mood-cards-grid">
      <div class="mood-card reveal reveal-delay-1" data-mood="happy">
        <span class="mood-emoji">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" fill="#FFF3EE" stroke="#FF6B47" stroke-width="2"/>
            <circle cx="28" cy="32" r="4" fill="#FF6B47"/>
            <circle cx="52" cy="32" r="4" fill="#FF6B47"/>
            <path d="M24 50 Q40 66 56 50" stroke="#FF6B47" stroke-width="3" stroke-linecap="round" fill="none"/>
            <circle cx="28" cy="32" r="1.5" fill="#fff"/>
            <circle cx="52" cy="32" r="1.5" fill="#fff"/>
            <line x1="10" y1="18" x2="10" y2="26" stroke="#FF6B47" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            <line x1="6" y1="22" x2="14" y2="22" stroke="#FF6B47" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            <line x1="66" y1="14" x2="66" y2="22" stroke="#FF6B47" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
            <line x1="62" y1="18" x2="70" y2="18" stroke="#FF6B47" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </span>
        <span class="mood-annotation">makes you dance &#10003;</span>
        <div class="mood-title">Happy</div>
        <p class="mood-sub">Bright upbeat tracks to amplify joy and keep energy flowing.</p>
        <div class="mood-genre">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/></svg>
          Feel-Good Pop
        </div>
      </div>

      <div class="mood-card reveal reveal-delay-2" data-mood="neutral">
        <span class="mood-emoji">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" fill="#EDFAF9" stroke="#4ECDC4" stroke-width="2"/>
            <path d="M24 32 Q28 28 32 32" stroke="#4ECDC4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M48 32 Q52 28 56 32" stroke="#4ECDC4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M28 50 Q40 60 52 50" stroke="#4ECDC4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M12 42 Q16 38 20 42 Q24 46 28 42" stroke="#4ECDC4" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4"/>
            <path d="M52 42 Q56 38 60 42 Q64 46 68 42" stroke="#4ECDC4" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.4"/>
          </svg>
        </span>
        <span class="mood-annotation">just breathe ~</span>
        <div class="mood-title">Neutral</div>
        <p class="mood-sub">Balanced background music for focus and calm moments.</p>
        <div class="mood-genre">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
          Chill / Lo-Fi
        </div>
      </div>

      <div class="mood-card reveal reveal-delay-3" data-mood="shock">
        <span class="mood-emoji">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" fill="#F3F0FF" stroke="#9B8FD4" stroke-width="2"/>
            <path d="M22 24 Q28 18 34 24" stroke="#9B8FD4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
            <path d="M46 24 Q52 18 58 24" stroke="#9B8FD4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
            <circle cx="29" cy="34" r="6.5" fill="#9B8FD4"/>
            <circle cx="51" cy="34" r="6.5" fill="#9B8FD4"/>
            <circle cx="31" cy="32" r="2.2" fill="#fff"/>
            <circle cx="53" cy="32" r="2.2" fill="#fff"/>
            <ellipse cx="40" cy="52" rx="7" ry="10" fill="#9B8FD4"/>
            <ellipse cx="40" cy="52" rx="3.2" ry="5" fill="#F3F0FF" opacity="0.35"/>
            <line x1="12" y1="20" x2="16" y2="16" stroke="#9B8FD4" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <line x1="10" y1="28" x2="16" y2="26" stroke="#9B8FD4" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <line x1="64" y1="16" x2="68" y2="20" stroke="#9B8FD4" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
            <line x1="64" y1="26" x2="70" y2="28" stroke="#9B8FD4" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
          </svg>
        </span>
        <span class="mood-annotation">let's go!!</span>
        <div class="mood-title">Shock</div>
        <p class="mood-sub">High-energy beats and powerful drops for adrenaline moments.</p>
        <div class="mood-genre">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
          Electro / EDM
        </div>
      </div>

      <div class="mood-card reveal reveal-delay-4" data-mood="sad">
        <span class="mood-emoji">
          <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" fill="#EEEEFF" stroke="#6B7FD4" stroke-width="2"/>
            <path d="M24 30 Q28 26 32 30" stroke="#6B7FD4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <path d="M48 30 Q52 26 56 30" stroke="#6B7FD4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <circle cx="28" cy="34" r="3" fill="#6B7FD4"/>
            <circle cx="52" cy="34" r="3" fill="#6B7FD4"/>
            <path d="M28 56 Q40 46 52 56" stroke="#6B7FD4" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <ellipse cx="26" cy="44" rx="2" ry="3" fill="#6B7FD4" opacity="0.5"/>
            <ellipse cx="54" cy="44" rx="2" ry="3" fill="#6B7FD4" opacity="0.5"/>
            <line x1="18" y1="10" x2="16" y2="20" stroke="#6B7FD4" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
            <line x1="30" y1="6" x2="28" y2="16" stroke="#6B7FD4" stroke-width="1.5" stroke-linecap="round" opacity="0.25"/>
            <line x1="52" y1="8" x2="50" y2="18" stroke="#6B7FD4" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
          </svg>
        </span>
        <span class="mood-annotation">it's okay to feel &#9825;</span>
        <div class="mood-title">Sad</div>
        <p class="mood-sub">Emotional indie and soft cinematic songs.</p>
        <div class="mood-genre">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          Indie Soul
        </div>
      </div>
    </div>
  </section>`;

function MoodSection() {
  return <HtmlFragment html={moodSectionHtml} />;
}

export default MoodSection;
