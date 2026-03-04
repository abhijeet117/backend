function getScore(categories = [], categoryName) {
  if (typeof categoryName !== "string" || !categoryName.trim()) {
    return 0;
  }

  const target = categoryName.trim().toLowerCase();
  let bestScore = 0;

  for (const entry of categories) {
    if (typeof entry?.categoryName !== "string") {
      continue;
    }

    if (entry.categoryName.trim().toLowerCase() !== target) {
      continue;
    }

    bestScore = Math.max(bestScore, Number(entry?.score) || 0);
  }

  return bestScore;
}

function sideMax(categories = [], leftKey, rightKey) {
  return Math.max(getScore(categories, leftKey), getScore(categories, rightKey));
}

function getEmotionScores(categories = []) {
  const smileScore = sideMax(categories, "mouthSmileLeft", "mouthSmileRight");
  const jawOpenScore = getScore(categories, "jawOpen");
  const eyeWideScore = sideMax(categories, "eyeWideLeft", "eyeWideRight");
  const browInnerUpScore = getScore(categories, "browInnerUp");
  const mouthFunnelScore = getScore(categories, "mouthFunnel");

  const mouthFrownScore = sideMax(categories, "mouthFrownLeft", "mouthFrownRight");
  const mouthLowerDownScore = sideMax(categories, "mouthLowerDownLeft", "mouthLowerDownRight");
  const browDownScore = sideMax(categories, "browDownLeft", "browDownRight");

  // Shock/surprise is usually driven by jaw-open + eye-wide + raised inner brow.
  const shockScore = Math.max(
    jawOpenScore,
    eyeWideScore,
    (jawOpenScore + eyeWideScore + browInnerUpScore) / 3,
    jawOpenScore * 0.5 + eyeWideScore * 0.3 + browInnerUpScore * 0.2,
    (jawOpenScore + eyeWideScore + browInnerUpScore + mouthFunnelScore) / 4
  );

  // Sadness usually appears as frown + brow down, with some users also raising inner brow.
  const sadScore = Math.max(
    mouthFrownScore,
    (mouthFrownScore + browDownScore) / 2,
    (mouthFrownScore + browInnerUpScore) / 2,
    (mouthFrownScore + mouthLowerDownScore + browDownScore + browInnerUpScore) / 4,
    mouthFrownScore * 0.55 + browDownScore * 0.25 + browInnerUpScore * 0.2
  );

  return {
    smileScore,
    shockScore,
    // Backward-compatible alias used by old callers.
    surpriseScore: shockScore,
    sadScore,
    jawOpenScore,
    eyeWideScore,
    browInnerUpScore,
    mouthFunnelScore,
    mouthFrownScore,
    mouthLowerDownScore,
    browDownScore,
  };
}

function mapEmotionToMood(categories = [], precomputedScores = null) {
  const scores = precomputedScores || getEmotionScores(categories);
  const {
    smileScore,
    shockScore,
    sadScore,
    jawOpenScore,
    eyeWideScore,
    browInnerUpScore,
    mouthFunnelScore,
    mouthFrownScore,
    browDownScore,
  } = scores;

  const hasShockFacePattern =
    jawOpenScore >= 0.42 &&
    (eyeWideScore >= 0.22 || browInnerUpScore >= 0.24 || mouthFunnelScore >= 0.22);

  const hasSadFacePattern =
    mouthFrownScore >= 0.3 &&
    (browDownScore >= 0.2 || browInnerUpScore >= 0.24) &&
    jawOpenScore < 0.72;

  const hasHappyFacePattern = smileScore >= 0.58 && mouthFrownScore < 0.45;

  // Evaluate shock before happy to avoid smile-biased misses on surprised faces.
  if (shockScore >= 0.44 && hasShockFacePattern && smileScore < 0.78) {
    return "shock";
  }
  if (sadScore >= 0.35 && hasSadFacePattern && smileScore < 0.58) return "sad";
  if (hasHappyFacePattern) return "happy";
  return "neutral";
}

function mapRawExpressionToMood(expression) {
  if (typeof expression !== "string") {
    return "neutral";
  }

  const normalized = expression.trim().toLowerCase();
  if (normalized === "smile" || normalized === "happy") return "happy";
  if (normalized === "shock" || normalized === "surprise" || normalized === "surprised") return "shock";
  if (normalized === "sad") return "sad";
  return "neutral";
}

function toDisplayMood(mood) {
  if (typeof mood !== "string") {
    return "Neutral";
  }

  const normalized = mood.trim().toLowerCase();
  if (normalized === "happy") return "Happy";
  if (normalized === "shock") return "Shock";
  if (normalized === "sad") return "Sad";
  return "Neutral";
}

export { getEmotionScores, getScore, mapEmotionToMood, mapRawExpressionToMood, sideMax, toDisplayMood };
