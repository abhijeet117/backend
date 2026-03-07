import { useEffect } from "react";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getCurrentScrollY() {
  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

function mediaMatches(query) {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;
}

function isTouchOnlyDevice() {
  const hasCoarsePointer = mediaMatches("(pointer: coarse)") || mediaMatches("(any-pointer: coarse)");
  const hasFinePointer = mediaMatches("(pointer: fine)") || mediaMatches("(any-pointer: fine)");
  const hasHover = mediaMatches("(hover: hover)") || mediaMatches("(any-hover: hover)");

  return hasCoarsePointer && !hasFinePointer && !hasHover;
}

let moodCycleInterval = null;

export function activateCam() {
  const placeholder = document.querySelector(".webcam-placeholder-big");
  const card = document.getElementById("detectCard");
  if (!placeholder || !card) {
    return;
  }

  placeholder.innerHTML = `
    <div style="text-align:center">
      <div style="font-size:3rem;margin-bottom:12px;animation:pulse-dot 1s ease-in-out infinite">\u25CF</div>
      <p class="cam-text" style="color:rgba(255,107,71,0.8);font-weight:500;font-family:'Bricolage Grotesque',sans-serif">Scanning facial landmarks...</p>
      <p class="cam-text" style="font-size:0.78rem;margin-top:8px;font-family:'Caveat',cursive;font-size:1.1rem;color:rgba(255,107,71,0.5)">reading your vibe...</p>
    </div>
  `;

  const moods = ["happy", "neutral", "shock", "sad"];
  const moodData = {
    happy: { emoji: "H", name: "Happy", conf: "87%" },
    neutral: { emoji: "N", name: "Neutral", conf: "91%" },
    shock: { emoji: "S", name: "Shock", conf: "78%" },
    sad: { emoji: "D", name: "Sad", conf: "83%" },
  };

  if (moodCycleInterval) {
    clearInterval(moodCycleInterval);
    moodCycleInterval = null;
  }

  let idx = 0;
  const moodTag = card.querySelector(".mood-tag-card");

  moodCycleInterval = setInterval(() => {
    idx = (idx + 1) % moods.length;
    const mood = moods[idx];
    const data = moodData[mood];

    card.className = `webcam-detect-card ${mood}`;

    if (moodTag) {
      moodTag.textContent = `${data.emoji} ${data.name} · ${data.conf} confidence`;
    }

    const statEl = document.querySelector(
      ".mood-stat-value.happy, .mood-stat-value.neutral, .mood-stat-value.shock, .mood-stat-value.sad"
    );

    if (statEl) {
      statEl.textContent = data.name;
      statEl.className = `mood-stat-value ${mood}`;
    }
  }, 4000);
}

function stopCamSimulation() {
  if (moodCycleInterval) {
    clearInterval(moodCycleInterval);
    moodCycleInterval = null;
  }
}

export function useMoodifyCursorEffects() {
  useEffect(() => {
    const cursorRing = document.getElementById("cursorRing");
    const cursorGlow = document.getElementById("cursorGlow");
    const docStyle = document.documentElement.style;

    if (!cursorRing || !docStyle) {
      return undefined;
    }

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let glowX = 0;
    let glowY = 0;
    let ringScale = 1;
    let targetRingScale = 1;
    let hoveredCard = null;
    let animationFrameId = null;
    let tiltResetTimeoutId = null;

    const heroMouseParallax = (event) => {
      const hero = document.querySelector(".hero");
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (event.clientX - cx) / cx;
      const dy = (event.clientY - cy) / cy;

      document.querySelectorAll(".orb").forEach((orb, i) => {
        const strength = [18, 12, 8][i] || 10;
        const baseY = parseFloat(orb.style.transform.match(/translateY\(([^)]+)px\)/)?.[1] || 0);
        orb.style.transform = `translate(${dx * strength}px, ${dy * strength + baseY}px)`;
      });

      const heading = document.querySelector(".hero-heading");
      if (heading) {
        heading.style.transform = `translate(${dx * -3}px, ${dy * -2}px)`;
      }
    };

    const updateTilt = (event) => {
      if (!hoveredCard) return;
      const rect = hoveredCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hoveredCard.style.transform = `
        perspective(600px)
        rotateX(${-y * 8}deg)
        rotateY(${x * 8}deg)
        translateZ(8px)
        scale(1.02)
      `;
    };

    const handleMouseMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      docStyle.setProperty("--cx", `${mouseX}px`);
      docStyle.setProperty("--cy", `${mouseY}px`);
      heroMouseParallax(event);
      updateTilt(event);
    };

    const rafLoop = () => {
      ringX = lerp(ringX, mouseX, 0.1);
      ringY = lerp(ringY, mouseY, 0.1);
      glowX = lerp(glowX, mouseX, 0.05);
      glowY = lerp(glowY, mouseY, 0.05);
      ringScale = lerp(ringScale, targetRingScale, 0.1);

      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%) scale(${ringScale})`;

      if (cursorGlow) {
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;
      }

      animationFrameId = requestAnimationFrame(rafLoop);
    };

    const hoverElements = Array.from(document.querySelectorAll("button, a, input, .mood-card"));
    const hoverHandlers = hoverElements.map((el) => {
      const enter = () => {
        targetRingScale = 2.2;
        cursorRing.style.opacity = "0.25";
      };
      const leave = () => {
        targetRingScale = 1;
        cursorRing.style.opacity = "0.4";
      };

      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);

      return { el, enter, leave };
    });

    const moodCards = Array.from(document.querySelectorAll(".mood-card"));
    const cardHandlers = moodCards.map((card) => {
      const enter = () => {
        hoveredCard = card;
      };
      const leave = () => {
        hoveredCard = null;
        card.style.transform = "translateY(-8px) rotate(-1deg)";
        if (tiltResetTimeoutId) {
          clearTimeout(tiltResetTimeoutId);
        }
        tiltResetTimeoutId = setTimeout(() => {
          card.style.transform = "";
        }, 300);
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);

      return { card, enter, leave };
    });

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafLoop();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (tiltResetTimeoutId) {
        clearTimeout(tiltResetTimeoutId);
      }

      hoverHandlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });

      cardHandlers.forEach(({ card, enter, leave }) => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      });
    };
  }, []);
}

export function useMoodifyHomeEffects() {
  useEffect(() => {
    const landingRoot = document.getElementById("page-landing");
    if (!landingRoot) {
      return undefined;
    }

    const useNativeTouchScroll = isTouchOnlyDevice();

    let currentScroll = getCurrentScrollY();
    let targetScroll = currentScroll;
    let isScrolling = false;
    let touchStartY = 0;
    let scrollTicking = false;
    let rafId = null;
    let smoothScrollToRafId = null;

    const getMaxScroll = () => {
      const doc = document.documentElement;
      const body = document.body;
      const contentHeight = Math.max(doc ? doc.scrollHeight : 0, body ? body.scrollHeight : 0);
      return Math.max(0, contentHeight - window.innerHeight);
    };

    const setPageScroll = (y) => {
      const clamped = Math.max(0, Math.min(y, getMaxScroll()));
      window.scrollTo(0, clamped);
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = clamped;
      }
      document.documentElement.scrollTop = clamped;
      document.body.scrollTop = clamped;
      return clamped;
    };

    const updateScrollBar = (scrollY) => {
      const scrollBar = document.getElementById("scrollProgress");
      const maxScroll = getMaxScroll();
      if (scrollBar && maxScroll > 0) {
        scrollBar.style.width = `${(scrollY / maxScroll) * 100}%`;
      }
    };

    const checkReveals = () => {
      document.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          el.classList.add("visible");
        }
      });
    };

    const parallaxOnScroll = (scrollY) => {
      const orbs = document.querySelectorAll(".orb");
      orbs.forEach((orb, i) => {
        const speed = [0.25, 0.4, 0.15][i] || 0.2;
        const dir = i % 2 === 0 ? 1 : -1;
        orb.style.transform = `translateY(${scrollY * speed * dir}px)`;
      });

      const words = document.querySelectorAll(".parallax-word");
      words.forEach((word) => {
        const speed = parseFloat(word.dataset.speed || 0.3);
        const offset = scrollY * speed;
        const rotate = word.style.transform.match(/rotate\(([^)]+)\)/)?.[0] || "";
        word.style.transform = `translateY(${offset}px) ${rotate}`;
      });

      const webcamCard = document.querySelector("#page-landing .webcam-card");
      if (webcamCard) {
        webcamCard.style.transform = `translateY(${scrollY * 0.08}px)`;
      }

      const nav = document.querySelector("#page-landing nav");
      if (nav) {
        const blurVal = Math.min(20 + scrollY * 0.05, 40);
        const bgOpacity = Math.min(0.7 + scrollY * 0.001, 0.95);
        nav.style.backdropFilter = `blur(${blurVal}px)`;
        nav.style.background = `rgba(248,247,244,${bgOpacity})`;
      }

      const hiwSteps = document.querySelectorAll(".hiw-step");
      hiwSteps.forEach((step, i) => {
        const sectionTop = step.closest(".hiw-section")?.offsetTop || 0;
        const rel = scrollY - sectionTop + window.innerHeight;
        const dir = i % 2 === 0 ? 1 : -1;
        const drift = Math.max(0, rel) * 0.015 * dir;
        step.style.transform = `translateX(${drift}px)`;
      });

      const soundwave = document.getElementById("soundwaveBg");
      if (soundwave) {
        soundwave.style.transform = `translateY(${scrollY * 0.3}px)`;
      }
    };

    const applyScrollEffects = (scrollY) => {
      updateScrollBar(scrollY);
      if (!useNativeTouchScroll) {
        parallaxOnScroll(scrollY);
      }
      checkReveals();
    };

    const smoothScrollLoop = () => {
      currentScroll = lerp(currentScroll, targetScroll, 0.085);
      currentScroll = setPageScroll(currentScroll);
      applyScrollEffects(currentScroll);

      if (Math.abs(targetScroll - currentScroll) > 0.5) {
        rafId = requestAnimationFrame(smoothScrollLoop);
      } else {
        currentScroll = targetScroll;
        currentScroll = setPageScroll(currentScroll);
        isScrolling = false;
        rafId = null;
      }
    };

    const smoothScrollTo = (y, duration = 900) => {
      if (smoothScrollToRafId) {
        cancelAnimationFrame(smoothScrollToRafId);
        smoothScrollToRafId = null;
      }

      const destination = Math.max(0, Math.min(y, getMaxScroll()));
      if (useNativeTouchScroll) {
        window.scrollTo({
          top: destination,
          behavior: "smooth",
        });
        return;
      }

      currentScroll = getCurrentScrollY();
      targetScroll = currentScroll;
      const start = currentScroll;
      const dist = destination - start;
      const startTime = performance.now();

      const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        targetScroll = start + dist * ease(progress);
        currentScroll = targetScroll;
        currentScroll = setPageScroll(currentScroll);
        applyScrollEffects(currentScroll);
        if (progress < 1) {
          smoothScrollToRafId = requestAnimationFrame(step);
        } else {
          smoothScrollToRafId = null;
        }
      };

      smoothScrollToRafId = requestAnimationFrame(step);
    };

    const handleWheel = (event) => {
      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;

      event.preventDefault();
      if (smoothScrollToRafId) {
        cancelAnimationFrame(smoothScrollToRafId);
        smoothScrollToRafId = null;
      }
      targetScroll = Math.max(0, Math.min(targetScroll + event.deltaY * 0.9, maxScroll));
      if (!isScrolling) {
        isScrolling = true;
        rafId = requestAnimationFrame(smoothScrollLoop);
      }
    };

    const handleTouchStart = (event) => {
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      const maxScroll = getMaxScroll();
      if (maxScroll <= 0) return;

      const dy = touchStartY - event.touches[0].clientY;
      targetScroll = Math.max(0, Math.min(targetScroll + dy * 1.2, maxScroll));
      touchStartY = event.touches[0].clientY;

      if (!isScrolling) {
        isScrolling = true;
        rafId = requestAnimationFrame(smoothScrollLoop);
      }
    };

    const handleNativeScroll = () => {
      if (scrollTicking) {
        return;
      }

      scrollTicking = true;
      rafId = requestAnimationFrame(() => {
        currentScroll = getCurrentScrollY();
        applyScrollEffects(currentScroll);
        scrollTicking = false;
        rafId = null;
      });
    };

    const handleViewportChange = () => {
      currentScroll = getCurrentScrollY();
      targetScroll = currentScroll;
      applyScrollEffects(currentScroll);
    };

    const anchorHandlers = [];
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      const handler = (event) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") {
          return;
        }

        event.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          smoothScrollTo(target.offsetTop - 80);
        }
      };
      anchor.addEventListener("click", handler);
      anchorHandlers.push({ anchor, handler });
    });

    const homeHowItWorksButton = document.querySelector("#page-landing .hero .btn-secondary");
    const handleHowItWorksClick = () => {
      const target = document.getElementById("how-it-works");
      if (target) {
        smoothScrollTo(target.offsetTop - 80);
      }
    };

    homeHowItWorksButton?.addEventListener("click", handleHowItWorksClick);

    const buildSoundwave = () => {
      const soundwave = document.getElementById("soundwaveBg");
      if (!soundwave || soundwave.children.length > 0) return;

      for (let i = 0; i < 80; i += 1) {
        const bar = document.createElement("div");
        bar.className = "wave-bar";
        const h = 20 + Math.random() * 160;
        bar.style.cssText = `--h:${h}px;height:20px;animation-delay:${Math.random() * 2}s;animation-duration:${1 + Math.random() * 1.5}s`;
        soundwave.appendChild(bar);
      }
    };

    const buildEqBg = () => {
      const eq = document.getElementById("eqBg");
      if (!eq || eq.children.length > 0) return;

      for (let i = 0; i < 60; i += 1) {
        const bar = document.createElement("div");
        bar.className = "eq-bg-bar";
        const h = 20 + Math.random() * 100;
        bar.style.cssText = `--h:${h}px;--d:${0.5 + Math.random() * 1.5}s;animation-delay:${Math.random() * 2}s`;
        eq.appendChild(bar);
      }
    };

    if (useNativeTouchScroll) {
      window.addEventListener("scroll", handleNativeScroll, { passive: true });
      window.addEventListener("resize", handleViewportChange, { passive: true });
      window.addEventListener("orientationchange", handleViewportChange);
    } else {
      window.addEventListener("wheel", handleWheel, { passive: false });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    buildSoundwave();
    buildEqBg();
    applyScrollEffects(currentScroll);

    return () => {
      window.removeEventListener("scroll", handleNativeScroll);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);

      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (smoothScrollToRafId) {
        cancelAnimationFrame(smoothScrollToRafId);
      }

      anchorHandlers.forEach(({ anchor, handler }) => {
        anchor.removeEventListener("click", handler);
      });

      homeHowItWorksButton?.removeEventListener("click", handleHowItWorksClick);
    };
  }, []);
}

export function useMoodifyAuthEffects() {
  useEffect(() => {
    const inputs = Array.from(document.querySelectorAll(".form-input"));

    const handlers = inputs.map((input) => {
      const onFocus = () => {
        const label = input.parentElement?.querySelector(".form-label");
        if (label) {
          label.style.color = "var(--accent-coral)";
        }
      };

      const onBlur = () => {
        const label = input.parentElement?.querySelector(".form-label");
        if (label) {
          label.style.color = "";
        }
      };

      input.addEventListener("focus", onFocus);
      input.addEventListener("blur", onBlur);

      return { input, onFocus, onBlur };
    });

    return () => {
      handlers.forEach(({ input, onFocus, onBlur }) => {
        input.removeEventListener("focus", onFocus);
        input.removeEventListener("blur", onBlur);
      });
    };
  }, []);
}

export function useMoodifyDashboardEffects() {
  useEffect(() => {
    const eq = document.getElementById("spEq");
    if (eq && eq.children.length === 0) {
      for (let i = 0; i < 24; i += 1) {
        const bar = document.createElement("div");
        bar.className = "sp-eq-bar";
        const h = 8 + Math.random() * 22;
        bar.style.cssText = `--h:${h}px;--d:${0.4 + Math.random() * 0.8}s;animation-delay:${Math.random() * 1}s`;
        eq.appendChild(bar);
      }
    }

    const detectCard = document.getElementById("detectCard");

    const handleMouseMove = (event) => {
      if (!detectCard) return;

      const rect = detectCard.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      detectCard.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,107,71,0.04), transparent 60%)`;
    };

    const handleMouseLeave = () => {
      if (!detectCard) return;
      detectCard.style.background = "";
    };

    detectCard?.addEventListener("mousemove", handleMouseMove);
    detectCard?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      detectCard?.removeEventListener("mousemove", handleMouseMove);
      detectCard?.removeEventListener("mouseleave", handleMouseLeave);
      stopCamSimulation();
    };
  }, []);
}
