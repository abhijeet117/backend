const EXPRESSION_TO_MOOD = {
  Smile: "Happy",
  Happy: "Happy",
  happy: "Happy",
  Neutral: "Neutral",
  neutral: "Neutral",
  Shock: "Shock",
  shock: "Shock",
  Surprise: "Shock",
  surprise: "Shock",
  Sad: "Sad",
  sad: "Sad",
};

const MOOD_VIEW_MODEL = {
  Happy: {
    title: "makes you dance \u2713",
    mood: "Happy",
    description: "Bright upbeat tracks to amplify joy and keep energy flowing.",
    genre: "Feel-Good Pop",
    className: "happy",
  },
  Neutral: {
    title: "just breathe ~",
    mood: "Neutral",
    description: "Balanced background music for focus and calm moments.",
    genre: "Chill / Lo-Fi",
    className: "neutral",
  },
  Shock: {
    title: "let's go!!",
    mood: "Shock",
    description: "High-energy beats and powerful drops for adrenaline moments.",
    genre: "Electro / EDM",
    className: "shock",
  },
  Sad: {
    title: "it's okay to feel \u2661",
    mood: "Sad",
    description: "Emotional indie and soft cinematic songs.",
    genre: "Indie Soul",
    className: "sad",
  },
};

function mapExpressionToMood(expression) {
  return EXPRESSION_TO_MOOD[expression] || "Neutral";
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
