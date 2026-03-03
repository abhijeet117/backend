const EXPRESSION_TO_MOOD = {
  Smile: "Happy",
  Neutral: "Calm",
  Shock: "Energetic",
  Sad: "Melancholy",
};

const MOOD_VIEW_MODEL = {
  Happy: {
    title: "Makes You Dance ✓",
    mood: "Happy",
    description: "Bright upbeat tracks to amplify your joy and keep the energy flowing all day.",
    genre: "Feel-Good Pop",
    className: "happy",
  },
  Calm: {
    title: "breathe slowly ~",
    mood: "Calm",
    description: "Ambient soundscapes and soft instrumentals for your quietest, clearest moments.",
    genre: "Lo-Fi Ambient",
    className: "calm",
  },
  Energetic: {
    title: "let's go!!",
    mood: "Energetic",
    description: "High-octane beats and anthems engineered to push you past every limit.",
    genre: "Electro / EDM",
    className: "energetic",
  },
  Melancholy: {
    title: "it's okay to feel ♡",
    mood: "Melancholy",
    description: "Soulful indie and cinematic scores that sit with you through the hard ones.",
    genre: "Indie Soul",
    className: "sad",
  },
};

function mapExpressionToMood(expression) {
  return EXPRESSION_TO_MOOD[expression] || "Calm";
}

function getMoodViewModel(mood) {
  return mood ? MOOD_VIEW_MODEL[mood] || null : null;
}

function getMoodClassName(mood) {
  return getMoodViewModel(mood)?.className || "happy";
}

function getMoodLabel(mood) {
  return getMoodViewModel(mood)?.mood || "Ready to capture";
}

function getCameraStatusText(cameraError, isCameraReady) {
  if (cameraError) {
    return cameraError;
  }

  return isCameraReady ? "Camera live. Capture your current mood." : "Starting camera...";
}

export {
  getCameraStatusText,
  getMoodClassName,
  getMoodLabel,
  getMoodViewModel,
  mapExpressionToMood,
};
