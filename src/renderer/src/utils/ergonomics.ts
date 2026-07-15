import { NormalizedLandmark } from "@mediapipe/tasks-vision";

// Reference from MediaPipe Pose:
// 0: nose, 1: left_eye_inner, 2: left_eye, 3: left_eye_outer, 4: right_eye_inner, 5: right_eye, 6: right_eye_outer
// 7: left_ear, 8: right_ear, 9: mouth_left, 10: mouth_right
// 11: left_shoulder, 12: right_shoulder
// 13: left_elbow, 14: right_elbow
// 15: left_wrist, 16: right_wrist

export interface PostureMetrics {
  cervicalAngle: number;
  shoulderTilt: number;
  headProjection: number; // approximate cm
  trunkLean: number; // Inclinación del tronco: < 0 joroba, > 0 inclinado atrás
  score: number;
}

/**
 * Calculates the angle of the neck relative to the vertical axis.
 * A forward head posture ("text neck") will result in a larger positive angle.
 */
export function calculateCervicalAngle(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 13) return 0;
  const ear = landmarks[7]; // left ear (assuming side view or slight angle)
  const shoulder = landmarks[11]; // left shoulder

  // We calculate angle from vertical (y-axis)
  const dx = ear.x - shoulder.x;
  const dy = ear.y - shoulder.y;
  
  if (dy === 0) return 0;
  
  // Angle in degrees from the vertical
  const radians = Math.atan2(Math.abs(dx), Math.abs(dy));
  let degrees = (radians * 180) / Math.PI;

  // If ear is in front of shoulder, it's a positive angle (forward head)
  // Assuming x grows to the right, if facing right, ear.x > shoulder.x is forward.
  // We'll just return the magnitude of deviation for simplicity.
  return parseFloat(degrees.toFixed(1));
}

/**
 * Calculates the tilt angle between left and right shoulders.
 * Perfect alignment is 0°.
 */
export function calculateShoulderTilt(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 13) return 0;
  const left = landmarks[11];
  const right = landmarks[12];

  const dx = right.x - left.x;
  const dy = right.y - left.y;

  const radians = Math.atan2(dy, dx);
  const degrees = (radians * 180) / Math.PI;
  return parseFloat(Math.abs(degrees).toFixed(1));
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
 * Uses shoulders (11, 12) and hips (23, 24).
 * Returns angle in degrees: negative = leaning forward (joroba), positive = leaning back.
 */
export function calculateTrunkLean(landmarks: NormalizedLandmark[]): number {
  if (landmarks.length < 25) return 0;
  
  const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
  const shoulderZ = (landmarks[11].z + landmarks[12].z) / 2;
  
  const hipY = (landmarks[23].y + landmarks[24].y) / 2;
  const hipZ = (landmarks[23].z + landmarks[24].z) / 2;
  
  const dz = shoulderZ - hipZ; // negative if shoulders are closer to camera
  const dy = hipY - shoulderY; // positive distance vertically
  
  if (dy === 0) return 0;
  
  const radians = Math.atan2(dz, dy);
  const degrees = (radians * 180) / Math.PI;
  
  return parseFloat(degrees.toFixed(1));
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

  return Math.max(0, Math.min(100, Math.round(score)));
}
