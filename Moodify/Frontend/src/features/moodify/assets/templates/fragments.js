const loginFormHtml = String.raw`<div class="form-card">
      <div class="form-title">Sign In</div>
      <p class="form-subtitle">Let your face choose the soundtrack.</p>
      
      <div class="form-group">
        <label class="form-label" for="login-identifier">Email or Username</label>
        <input id="login-identifier" type="text" class="form-input" placeholder="you@example.com or username">
      </div>
      <div class="form-group">
        <label class="form-label" for="login-password">Password</label>
        <input id="login-password" type="password" class="form-input" placeholder="••••••••••">
      </div>
      <button class="btn-form-primary"><span>Sign In to Moodify</span></button>
      
      <div class="form-divider"><span>or</span></div>
      <p class="form-link-text">Don't have an account? <a class="form-link">Create one</a></p>
      <p class="form-link-text" style="margin-top:8px"><a class="form-link" style="font-size:0.8rem;font-weight:400">← Back to home</a></p>
    </div>

`;

const registerFormHtml = String.raw`<div class="form-card">
      <div class="form-title">Create Account</div>
      <p class="form-subtitle">Let your face choose your soundtrack.</p>
      
      <div class="form-group">
        <label class="form-label" for="register-full-name">Full Name</label>
        <input id="register-full-name" type="text" class="form-input" placeholder="Abhijeet">
      </div>
      <div class="form-group">
        <label class="form-label" for="register-email">Email</label>
        <input id="register-email" type="email" class="form-input" placeholder="you@example.com">
      </div>
      <div class="form-group">
        <label class="form-label" for="register-username">Username</label>
        <input id="register-username" type="text" class="form-input" placeholder="your_username">
      </div>
      <div class="form-group">
        <label class="form-label" for="register-password">Password</label>
        <input id="register-password" type="password" class="form-input" placeholder="Min. 8 characters">
      </div>
      <button class="btn-form-primary"><span>Create Your Moodify Account</span></button>
      
      <div class="form-divider"><span>or</span></div>
      <p class="form-link-text">Already have an account? <a class="form-link">Sign in</a></p>
      <p class="form-link-text" style="margin-top:8px"><a class="form-link" style="font-size:0.8rem;font-weight:400">← Back to home</a></p>
    </div>

`;

const footerHtml = String.raw`<footer>
    <div class="footer-inner">
    <div class="footer-logo">Moodify ✦</div>
    <p class="footer-text">© 2026 Moodify Inc. All rights reserved.</p>
    <div class="footer-links">
      <a href="#">Privacy</a>
      <a href="#">Terms</a>
      <a href="#">Blog</a>
      <a href="#">Contact</a>
      <div class="footer-social" aria-label="Social links">
        <a href="https://x.com/abhijeet117_" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="X (Twitter)">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/abhijeet-kumar-sah-35890a353/" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 9.55005C12.9181 8.61327 14.1121 8 15.501 8C18.5385 8 21.001 10.4624 21.001 13.5V21H19.001V13.5C19.001 11.567 17.434 10 15.501 10C13.568 10 12.001 11.567 12.001 13.5V21H10.001V8.5H12.001V9.55005ZM5.00098 6.5C4.17255 6.5 3.50098 5.82843 3.50098 5C3.50098 4.17157 4.17255 3.5 5.00098 3.5C5.8294 3.5 6.50098 4.17157 6.50098 5C6.50098 5.82843 5.8294 6.5 5.00098 6.5ZM4.00098 8.5H6.00098V21H4.00098V8.5Z"/></svg>
        </a>
        <a href="https://www.instagram.com/abhijeet117_" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97212 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z"/></svg>
        </a>
        <a href="https://github.com/abhijeet117" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.88401 18.6533C5.58404 18.4526 5.32587 18.1975 5.0239 17.8369C4.91473 17.7065 4.47283 17.1524 4.55811 17.2583C4.09533 16.6833 3.80296 16.417 3.50156 16.3089C2.9817 16.1225 2.7114 15.5499 2.89784 15.0301C3.08428 14.5102 3.65685 14.2399 4.17672 14.4263C4.92936 14.6963 5.43847 15.1611 6.12425 16.0143C6.03025 15.8974 6.46364 16.441 6.55731 16.5529C6.74784 16.7804 6.88732 16.9182 6.99629 16.9911C7.20118 17.1283 7.58451 17.1874 8.14709 17.1311C8.17065 16.7489 8.24136 16.3783 8.34919 16.0358C5.38097 15.3104 3.70116 13.3952 3.70116 9.63971C3.70116 8.40085 4.0704 7.28393 4.75917 6.3478C4.5415 5.45392 4.57433 4.37284 5.06092 3.15636C5.1725 2.87739 5.40361 2.66338 5.69031 2.57352C5.77242 2.54973 5.81791 2.53915 5.89878 2.52673C6.70167 2.40343 7.83573 2.69705 9.31449 3.62336C10.181 3.41879 11.0885 3.315 12.0012 3.315C12.9129 3.315 13.8196 3.4186 14.6854 3.62277C16.1619 2.69 17.2986 2.39649 18.1072 2.52651C18.1919 2.54013 18.2645 2.55783 18.3249 2.57766C18.6059 2.66991 18.8316 2.88179 18.9414 3.15636C19.4279 4.37256 19.4608 5.45344 19.2433 6.3472C19.9342 7.28337 20.3012 8.39208 20.3012 9.63971C20.3012 13.3968 18.627 15.3048 15.6588 16.032C15.7837 16.447 15.8496 16.9105 15.8496 17.4121C15.8496 18.0765 15.8471 18.711 15.8424 19.4225C15.8412 19.6127 15.8397 19.8159 15.8375 20.1281C16.2129 20.2109 16.5229 20.5077 16.6031 20.9089C16.7114 21.4504 16.3602 21.9773 15.8186 22.0856C14.6794 22.3134 13.8353 21.5538 13.8353 20.5611C13.8353 20.4708 13.836 20.3417 13.8375 20.1145C13.8398 19.8015 13.8412 19.599 13.8425 19.4094C13.8471 18.7019 13.8496 18.0716 13.8496 17.4121C13.8496 16.7148 13.6664 16.2602 13.4237 16.051C12.7627 15.4812 13.0977 14.3973 13.965 14.2999C16.9314 13.9666 18.3012 12.8177 18.3012 9.63971C18.3012 8.68508 17.9893 7.89571 17.3881 7.23559C17.1301 6.95233 17.0567 6.54659 17.199 6.19087C17.3647 5.77663 17.4354 5.23384 17.2941 4.57702L17.2847 4.57968C16.7928 4.71886 16.1744 5.0198 15.4261 5.5285C15.182 5.69438 14.8772 5.74401 14.5932 5.66413C13.7729 5.43343 12.8913 5.315 12.0012 5.315C11.111 5.315 10.2294 5.43343 9.40916 5.66413C9.12662 5.74359 8.82344 5.69492 8.57997 5.53101C7.8274 5.02439 7.2056 4.72379 6.71079 4.58376C6.56735 5.23696 6.63814 5.77782 6.80336 6.19087C6.94565 6.54659 6.87219 6.95233 6.61423 7.23559C6.01715 7.8912 5.70116 8.69376 5.70116 9.63971C5.70116 12.8116 7.07225 13.9683 10.023 14.2999C10.8883 14.3971 11.2246 15.4769 10.5675 16.0482C10.3751 16.2156 10.1384 16.7802 10.1384 17.4121V20.5611C10.1384 21.5474 9.30356 22.2869 8.17878 22.09C7.63476 21.9948 7.27093 21.4766 7.36613 20.9326C7.43827 20.5204 7.75331 20.2116 8.13841 20.1276V19.1381C7.22829 19.1994 6.47656 19.0498 5.88401 18.6533Z"/></svg>
        </a>
      </div>
    </div>
    </div>
  </footer>
`;

const musicPreviewHtml = String.raw`<section class="music-section">
    <div class="music-player-wrap">
      <div class="music-section-label">Preview</div>
      <h2 class="music-section-heading">Music that <em style="font-style:italic;color:var(--accent-lavender)">feels you</em></h2>
      <div class="player-card">
        <!-- EQ BG -->
        <div class="eq-bg" id="eqBg"></div>
        
        <div class="player-top">
          <div class="player-album">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <circle cx="30" cy="30" r="12" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none"/>
              <circle cx="30" cy="30" r="4" fill="rgba(255,255,255,0.7)"/>
              <path d="M30 10 L30 18" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M30 42 L30 50" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M10 30 L18 30" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M42 30 L50 30" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="30" cy="30" r="28" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
            </svg>
          </div>
          <div class="player-meta">
            <div class="player-mood-tag">
              <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-1 11.5v-7l5.25 3.5L9 13.5z"/></svg>
              Happy Mood
            </div>
            <div class="player-track-name">Golden Hour</div>
            <div class="player-track-artist">JVKE · 2024 Remaster</div>
          </div>
        </div>
        <div class="player-controls">
          <button class="ctrl-btn" title="Previous">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
          </button>
          <button class="ctrl-btn" title="Rewind">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z"/></svg>
          </button>
          <button class="play-btn" title="Play/Pause">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="ctrl-btn" title="Forward">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 18V6l8.5 6L13 18zm-2.5-6L2 6v12l8.5-6z"/></svg>
          </button>
          <button class="ctrl-btn" title="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-11 0v12l8.5-6L5 6z"/></svg>
          </button>
        </div>
        <div class="player-progress">
          <div class="progress-bar"><div class="progress-fill"></div></div>
          <div class="progress-times"><span>1:24</span><span>3:47</span></div>
        </div>
      </div>
    </div>
  </section>
`;

const backHomeHtml = String.raw`<button class="btn-secondary" style="width:100%;padding:14px;border-radius:14px;font-family:var(--font-body);font-size:0.9rem;font-weight:500;cursor:none;border:1.5px solid rgba(0,0,0,0.15);background:transparent;transition:all 250ms ease">← Back to Home</button>
`;

const moodHistoryHtml = String.raw`<div class="mood-history-card">
          <div class="mh-title">Today's Journey</div>
          <div class="mh-item">
            <div class="mh-dot" style="background:var(--mood-happy)"></div>
            <div class="mh-mood-name">Happy</div>
            <div class="mh-bar-wrap"><div class="mh-bar-fill" style="width:82%;background:var(--mood-happy)"></div></div>
            <div class="mh-time">Now</div>
          </div>
          <div class="mh-item">
            <div class="mh-dot" style="background:var(--mood-shock)"></div>
            <div class="mh-mood-name">Shock</div>
            <div class="mh-bar-wrap"><div class="mh-bar-fill" style="width:65%;background:var(--mood-shock)"></div></div>
            <div class="mh-time">2h ago</div>
          </div>
          <div class="mh-item">
            <div class="mh-dot" style="background:var(--mood-neutral)"></div>
            <div class="mh-mood-name">Neutral</div>
            <div class="mh-bar-wrap"><div class="mh-bar-fill" style="width:90%;background:var(--mood-neutral)"></div></div>
            <div class="mh-time">4h ago</div>
          </div>
          <div class="mh-item">
            <div class="mh-dot" style="background:var(--mood-sad)"></div>
            <div class="mh-mood-name">Sad</div>
            <div class="mh-bar-wrap"><div class="mh-bar-fill" style="width:40%;background:var(--mood-sad)"></div></div>
            <div class="mh-time">6h ago</div>
          </div>
        </div>
`;

const dashboardNavHtml = String.raw`<nav class="dash-nav">
    <div class="dash-logo"><div class="dot"></div>Moodify</div>
    <div class="dash-greeting">Good Evening, <strong>Abhijeet 👋</strong></div>
    <div class="dash-avatar">A</div>
  </nav>
`;

const sidebarPlayerHtml = String.raw`<div class="sidebar-player">
          <div class="sp-label">Auto-matched to your mood</div>
          <div class="sp-album">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="60">
              <circle cx="40" cy="40" r="20" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none"/>
              <circle cx="40" cy="40" r="6" fill="rgba(255,255,255,0.7)"/>
              <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
              <path d="M40 14 L40 24" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <path d="M40 56 L40 66" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 40 L24 40" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
              <path d="M56 40 L66 40" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="sp-track-name">Golden Hour</div>
          <div class="sp-track-artist">JVKE</div>
          <div class="sp-controls">
            <button class="sp-ctrl" title="Previous">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
            </button>
            <button class="sp-ctrl" title="Shuffle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            </button>
            <button class="sp-play" title="Play/Pause">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button class="sp-ctrl" title="Repeat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            </button>
            <button class="sp-ctrl" title="Next">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zm-11 0v12l8.5-6L5 6z"/></svg>
            </button>
          </div>
          <div class="sp-progress">
            <div class="sp-bar"><div class="sp-bar-fill"></div></div>
            <div class="sp-times"><span>1:24</span><span>3:47</span></div>
          </div>
          <div class="sp-eq" id="spEq"></div>
        </div>
`;

export {
  loginFormHtml,
  registerFormHtml,
  footerHtml,
  musicPreviewHtml,
  backHomeHtml,
  moodHistoryHtml,
  dashboardNavHtml,
  sidebarPlayerHtml,
};

