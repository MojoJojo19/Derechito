import { useState, useEffect, useCallback, useRef } from 'react'
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'

export function usePoseDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null)
  const [throttledLandmarks, setThrottledLandmarks] = useState<NormalizedLandmark[]>([])
  
  const lastVideoTime = useRef(-1);
  const lastStateUpdate = useRef(0);

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
          const lms = result.landmarks[0]
          
          // Draw points directly to canvas for 60fps smoothness (bypass React)
          ctx.fillStyle = '#00E5BE'
          for (const lm of lms) {
            ctx.beginPath()
            ctx.arc(lm.x * canvasRef.current.width, lm.y * canvasRef.current.height, 4, 0, 2 * Math.PI)
            ctx.fill()
          }

          // Throttle React state updates to 2 times per second for ergonomic math
          if (timestamp - lastStateUpdate.current > 500) {
            setThrottledLandmarks(lms)
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

