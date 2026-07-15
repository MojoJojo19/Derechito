import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Reference from MediaPipe Pose:
// 0: nose, 1: left_eye_inner, 2: left_eye, 3: left_eye_outer, 4: right_eye_inner, 5: right_eye, 6: right_eye_outer
// 7: left_ear, 8: right_ear, 9: mouth_left, 10: mouth_right
// 11: left_shoulder, 12: right_shoulder
// 13: left_elbow, 14: right_elbow
// 15: left_wrist, 16: right_wrist
// 23: left_hip, 24: right_hip

export interface PostureMetrics {
  cervicalAngle: number;
  shoulderTilt: number;
  headProjection: number; // approximate cm
  trunkLean: number; // Inclinación del tronco: < 0 joroba, > 0 inclinado atrás
  score: number;
}

/**
 * Checks if a landmark has sufficient visibility to be used in calculations.
 * MediaPipe landmarks have a `visibility` property (0-1) when available.
 */
function isVisible(lm: NormalizedLandmark, threshold = 0.5): boolean {
  // NormalizedLandmark may have visibility as optional field
  const vis = (lm as any).visibility;
  if (vis === undefined || vis === null) return true; // If no visibility data, assume visible
  return vis >= threshold;
}

/**
 * Calculates the angle of the neck relative to the vertical axis.
 * Uses BILATERAL averaging (both ears & both shoulders) for stability when seated.
 * A forward head posture ("text neck") will result in a larger positive angle.
 */
export function calculateCervicalAngle(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 13) return 0;

  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  // Use bilateral average for stability — both ears and both shoulders
  const leftEarVisible = isVisible(leftEar);
  const rightEarVisible = isVisible(rightEar);
  const leftShoulderVisible = isVisible(leftShoulder);
  const rightShoulderVisible = isVisible(rightShoulder);

  // Need at least one ear and one shoulder
  if (!leftEarVisible && !rightEarVisible) return 0;
  if (!leftShoulderVisible && !rightShoulderVisible) return 0;

  // Compute averaged ear position
  let earX: number, earY: number;
  if (leftEarVisible && rightEarVisible) {
    earX = (leftEar.x + rightEar.x) / 2;
    earY = (leftEar.y + rightEar.y) / 2;
  } else if (leftEarVisible) {
    earX = leftEar.x;
    earY = leftEar.y;
  } else {
    earX = rightEar.x;
    earY = rightEar.y;
  }

  // Compute averaged shoulder position
  let shoulderX: number, shoulderY: number;
  if (leftShoulderVisible && rightShoulderVisible) {
    shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  } else if (leftShoulderVisible) {
    shoulderX = leftShoulder.x;
    shoulderY = leftShoulder.y;
  } else {
    shoulderX = rightShoulder.x;
    shoulderY = rightShoulder.y;
  }

  const dx = earX - shoulderX;
  const dy = earY - shoulderY;
  
  if (dy === 0) return 0;
  
  // Angle in degrees from the vertical
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy));
  const degrees = (radians * 180) / Math.PI;

  return parseFloat(degrees.toFixed(1));
}

/**
 * Calculates the tilt angle between left and right shoulders.
 * Perfect alignment (level shoulders) = 0°.
 * 
 * FIXED: Uses abs(dy)/abs(dx) to get the angle FROM horizontal,
 * avoiding the atan2 sign issue where mirrored shoulder positions
 * gave ~180° instead of ~0° for level shoulders.
 */
export function calculateShoulderTilt(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 13) return 0;
  const left = landmarks[11];
  const right = landmarks[12];

  if (!isVisible(left) || !isVisible(right)) return 0;

  const dx = Math.abs(right.x - left.x);
  const dy = right.y - left.y; // Keep sign to know which shoulder is higher

  if (dx < 0.001) return 0; // Shoulders too close horizontally

  // atan2(vertical_displacement, horizontal_distance) gives tilt from horizontal
  const radians = Math.atan2(Math.abs(dy), dx);
  const degrees = (radians * 180) / Math.PI;
  return parseFloat(degrees.toFixed(1));
}

/**
 * Approximates how far the head is projected forward (in cm)
 * based on a rough 2D approximation.
 */
export function calculateHeadProjection(cervicalAngle: number): number {
  // Rough estimate: every 5 degrees of cervical angle corresponds to ~2cm of forward head posture.
  const projection = (cervicalAngle / 5) * 2;
  return parseFloat(projection.toFixed(1));
}

/**
 * Calculates trunk lean (joroba / inclinación hacia atrás)
 * Uses shoulders (11, 12) and hips (23, 24) with Y-based calculation.
 * 
 * FIXED for seated: Instead of using unreliable z-depth from a 2D camera,
 * we now use the relative Y position and nose-shoulder vertical alignment.
 * When hips are not visible (common when seated), we fall back to
 * nose-to-shoulder vertical displacement as a proxy for trunk lean.
 * 
 * Returns angle in degrees: negative = leaning forward (joroba), positive = leaning back.
 */
export function calculateTrunkLean(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 13) return 0;

  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const nose = landmarks[0];

  if (!isVisible(leftShoulder) || !isVisible(rightShoulder) || !isVisible(nose)) return 0;

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

  // Check if hips are available and visible (may not be when seated)
  const hipsAvailable = landmarks.length >= 25 && 
    isVisible(landmarks[23], 0.3) && isVisible(landmarks[24], 0.3);

  if (hipsAvailable) {
    const hipMidX = (landmarks[23].x + landmarks[24].x) / 2;
    const hipMidY = (landmarks[23].y + landmarks[24].y) / 2;

    // Use X displacement between shoulders and hips to detect lean
    // (More reliable than z-depth for 2D camera)
    const dx = shoulderMidX - hipMidX; // Positive = shoulders right of hips
    const dy = hipMidY - shoulderMidY; // Positive distance vertically

    if (dy < 0.01) return 0; // Hips above shoulders = unreliable

    const radians = Math.atan2(dx, dy);
    const degrees = (radians * 180) / Math.PI;
    return parseFloat(degrees.toFixed(1));
  }

  // FALLBACK for seated (no visible hips):
  // Use nose-to-shoulder-midpoint relationship as proxy.
  // If nose is significantly in front of (above in Y) the shoulders, 
  // the person is leaning forward.
  const noseToShoulderDx = nose.x - shoulderMidX;
  const noseToShoulderDy = shoulderMidY - nose.y; // Positive = nose above shoulders (normal)

  if (noseToShoulderDy < 0.01) return 0;

  // If nose is far forward/back of shoulder center, that indicates lean
  const radians = Math.atan2(noseToShoulderDx, noseToShoulderDy);
  const degrees = (radians * 180) / Math.PI;
  
  // Scale down since nose displacement is a weaker signal than hip displacement
  return parseFloat((degrees * 0.6).toFixed(1));
}

/**
 * Calculates an overall posture score (0-100) based on deviation from a baseline.
 */
export function calculatePostureScore(current: PostureMetrics, baseline: PostureMetrics | null): number {
  // If no baseline is captured, we evaluate against an "absolute ideal" (0 degrees deviation).
  const ref = baseline || { cervicalAngle: 0, shoulderTilt: 0, headProjection: 0, trunkLean: 0, score: 100 };

  let score = 100;

  // Penalize for cervical angle deviation (neck)
  const cervicalDiff = Math.abs(current.cervicalAngle - ref.cervicalAngle);
  if (cervicalDiff > 5) score -= (cervicalDiff - 5) * 2;

  // Penalize for shoulder tilt
  const tiltDiff = Math.abs(current.shoulderTilt - ref.shoulderTilt);
  if (tiltDiff > 3) score -= (tiltDiff - 3) * 3;

  // Penalize for trunk lean
  const trunkDiff = Math.abs(current.trunkLean - (ref.trunkLean || 0));
  if (trunkDiff > 5) score -= (trunkDiff - 5) * 1.5;

  return Math.max(0, Math.min(100, Math.round(score)));
}
