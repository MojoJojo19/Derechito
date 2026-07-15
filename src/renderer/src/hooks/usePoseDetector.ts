import { useState, useEffect, useCallback, useRef } from 'react'
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'

const SMOOTHING_WINDOW = 5; // Average over last 5 frames

function averageLandmarks(buffer: NormalizedLandmark[][]): NormalizedLandmark[] {
  if (buffer.length === 0) return [];
  const numLandmarks = buffer[0].length;
  const result: NormalizedLandmark[] = [];

  for (let i = 0; i < numLandmarks; i++) {
    let sumX = 0, sumY = 0, sumZ = 0;
    let count = 0;
    for (const frame of buffer) {
      if (i < frame.length) {
        sumX += frame[i].x;
        sumY += frame[i].y;
        sumZ += frame[i].z;
        count++;
      }
    }
    if (count > 0) {
      result.push({
        x: sumX / count,
        y: sumY / count,
        z: sumZ / count,
        visibility: (buffer[buffer.length - 1][i] as any).visibility,
      } as NormalizedLandmark);
    }
  }
  return result;
}

export function usePoseDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null)
  const [throttledLandmarks, setThrottledLandmarks] = useState<NormalizedLandmark[]>([])
  
  const lastVideoTime = useRef(-1);
  const lastStateUpdate = useRef(0);
  const landmarkBuffer = useRef<NormalizedLandmark[][]>([]);

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        )
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        })
        if (active) {
          setPoseLandmarker(landmarker)
        }
      } catch (e) {
        console.error('Error initializing MediaPipe:', e)
      }
    }
    init()
    return () => { active = false }
  }, [])

  const analyze = useCallback((timestamp: number) => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    
    // Only detect if video frame has updated
    if (video.currentTime === lastVideoTime.current) return;
    lastVideoTime.current = video.currentTime;

    try {
      const result = poseLandmarker.detectForVideo(video, timestamp)
      
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        if (result.landmarks && result.landmarks.length > 0) {
          const rawLms = result.landmarks[0]
          
          // Add to smoothing buffer
          landmarkBuffer.current.push(rawLms);
          if (landmarkBuffer.current.length > SMOOTHING_WINDOW) {
            landmarkBuffer.current.shift();
          }

          // Draw raw points directly to canvas for visual smoothness (bypass React)
          ctx.fillStyle = '#00E5BE'
          for (const lm of rawLms) {
            ctx.beginPath()
            ctx.arc(lm.x * canvasRef.current.width, lm.y * canvasRef.current.height, 4, 0, 2 * Math.PI)
            ctx.fill()
          }

          // Throttle React state updates to 2 times per second for ergonomic math
          // Use SMOOTHED landmarks for stable metric calculation
          if (timestamp - lastStateUpdate.current > 500) {
            const smoothed = averageLandmarks(landmarkBuffer.current);
            setThrottledLandmarks(smoothed)
            lastStateUpdate.current = timestamp
          }
        }
      }
    } catch (err) {
      console.warn("Pose estimation skipped for this frame", err)
    }
  }, [poseLandmarker, videoRef, canvasRef])

  return { landmarks: throttledLandmarks, analyze, isReady: !!poseLandmarker }
}

