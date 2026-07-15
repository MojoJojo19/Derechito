import { useState, useEffect, useCallback, useRef } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { useAppStore } from '../store/useAppStore'
import { toast } from 'sonner'

// Eye landmark indices for FaceLandmarker (468 face mesh points)
// Left eye contour points for EAR calculation
const LEFT_EYE_TOP = [159, 145]; // Upper eyelid
const LEFT_EYE_BOTTOM = [23, 130]; // Lower eyelid  
const LEFT_EYE_LEFT = 33;
const LEFT_EYE_RIGHT = 133;

// Right eye contour points
const RIGHT_EYE_TOP = [386, 374];
const RIGHT_EYE_BOTTOM = [253, 359];
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 263;

/**
 * Calculate Eye Aspect Ratio (EAR) - Soukupová and Čech (2016)
 * EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
 * When eyes are open: EAR ≈ 0.2-0.3
 * When eyes are closed: EAR < 0.15
 */
function calculateEAR(
  landmarks: any[],
  topIndices: number[],
  bottomIndices: number[],
  leftIdx: number,
  rightIdx: number
): number {
  if (!landmarks || landmarks.length === 0) return 0.3; // Default open

  const top1 = landmarks[topIndices[0]];
  const top2 = landmarks[topIndices[1]];
  const bottom1 = landmarks[bottomIndices[0]];
  const bottom2 = landmarks[bottomIndices[1]];
  const left = landmarks[leftIdx];
  const right = landmarks[rightIdx];

  if (!top1 || !top2 || !bottom1 || !bottom2 || !left || !right) return 0.3;

  const dist = (a: any, b: any) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const vertical1 = dist(top1, bottom1);
  const vertical2 = dist(top2, bottom2);
  const horizontal = dist(left, right);

  if (horizontal === 0) return 0.3;

  return (vertical1 + vertical2) / (2 * horizontal);
}

interface EyeDetectorResult {
  eyesOpen: boolean;
  ear: number; // Current Eye Aspect Ratio
  closedSeconds: number; // How long eyes have been closed
  isReady: boolean;
  warningActive: boolean; // True when we're about to lock
}

/**
 * Hook that detects eye closure using MediaPipe FaceLandmarker.
 * If eyes are closed for more than `thresholdSeconds`, it locks the screen.
 */
export function useEyeDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  isRunning: boolean,
  thresholdSeconds: number = 15
): EyeDetectorResult {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null)
  const [eyesOpen, setEyesOpen] = useState(true)
  const [ear, setEar] = useState(0.3)
  const [closedSeconds, setClosedSeconds] = useState(0)
  const [warningActive, setWarningActive] = useState(false)
  
  const closedStartTime = useRef<number | null>(null)
  const lastAnalysisTime = useRef(0)
  const hasLockedRecently = useRef(false)
  const warningShown = useRef(false)
  const lastVideoTime = useRef(-1)
  const addNotification = useAppStore((s) => s.addNotification)

  // Initialize FaceLandmarker
  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
        )
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        })
        if (active) {
          setFaceLandmarker(landmarker)
        }
      } catch (e) {
        console.error('Error initializing FaceLandmarker:', e)
      }
    }
    init()
    return () => { active = false }
  }, [])

  // Analyze eye state - runs at lower frequency than pose (every 500ms)
  const analyzeEyes = useCallback((timestamp: number) => {
    if (!faceLandmarker || !videoRef.current || !isRunning) return
    
    // Only run every 500ms to save CPU
    if (timestamp - lastAnalysisTime.current < 500) return
    lastAnalysisTime.current = timestamp
    
    const video = videoRef.current
    if (video.currentTime === lastVideoTime.current) return
    lastVideoTime.current = video.currentTime

    try {
      const result = faceLandmarker.detectForVideo(video, timestamp)
      
      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks = result.faceLandmarks[0]
        
        // Calculate EAR for both eyes
        const leftEAR = calculateEAR(landmarks, LEFT_EYE_TOP, LEFT_EYE_BOTTOM, LEFT_EYE_LEFT, LEFT_EYE_RIGHT)
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE_TOP, RIGHT_EYE_BOTTOM, RIGHT_EYE_LEFT, RIGHT_EYE_RIGHT)
        const avgEAR = (leftEAR + rightEAR) / 2
        
        setEar(avgEAR)
        
        const EAR_THRESHOLD = 0.15 // Below this = eyes closed
        const areEyesClosed = avgEAR < EAR_THRESHOLD
        
        setEyesOpen(!areEyesClosed)
        
        if (areEyesClosed) {
          if (closedStartTime.current === null) {
            closedStartTime.current = Date.now()
          }
          
          const elapsed = (Date.now() - closedStartTime.current) / 1000
          setClosedSeconds(elapsed)
          
          // Warning at 10 seconds (5 seconds before lock)
          if (elapsed >= thresholdSeconds - 5 && !warningShown.current) {
            warningShown.current = true
            setWarningActive(true)
            toast.warning('¡Ojos cerrados detectados!', {
              description: `Si no abres los ojos en 5 segundos, se bloqueará la pantalla.`,
              duration: 5000,
            })
          }
          
          // Lock screen after threshold
          if (elapsed >= thresholdSeconds && !hasLockedRecently.current) {
            hasLockedRecently.current = true
            
            addNotification({
              type: 'info',
              title: 'Equipo suspendido',
              body: `Se detectaron ojos cerrados por más de ${thresholdSeconds}s. El equipo se suspendió.`,
            })
            
            // Call IPC to suspend PC
            if (window.api?.suspendPC) {
              window.api.suspendPC()
            }
            
            toast.info('Equipo suspendido', {
              description: 'Se detectaron ojos cerrados prolongadamente.',
              duration: 5000,
            })
          }
        } else {
          // Eyes open - reset everything
          closedStartTime.current = null
          setClosedSeconds(0)
          setWarningActive(false)
          warningShown.current = false
          hasLockedRecently.current = false
        }
      }
    } catch (err) {
      // Silently ignore frame errors
    }
  }, [faceLandmarker, videoRef, isRunning, thresholdSeconds, addNotification])

  // Run analysis loop
  useEffect(() => {
    if (!isRunning || !faceLandmarker) return
    
    let animationFrameId: number
    const loop = () => {
      analyzeEyes(performance.now())
      animationFrameId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animationFrameId)
  }, [analyzeEyes, isRunning, faceLandmarker])

  return {
    eyesOpen,
    ear,
    closedSeconds,
    isReady: !!faceLandmarker,
    warningActive,
  }
}
