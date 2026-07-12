import { useEffect, useRef } from 'react';
import { PostureMetrics } from '../utils/ergonomics';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';

export function usePostureAlert(
  currentMetrics: PostureMetrics | null,
  isRunning: boolean
) {
  const { baselineProfile, incrementAlerts, addSessionTime } = useAppStore();
  
  // Track consecutive seconds of bad posture
  const badPostureSeconds = useRef(0);
  const lastUpdate = useRef(Date.now());
  
  // 15 degrees deviation for 10 consecutive seconds = ALERT
  const ANGLE_THRESHOLD = 15;
  const TIME_THRESHOLD_SEC = 10;

  useEffect(() => {
    if (!isRunning || !currentMetrics) {
      lastUpdate.current = Date.now();
      return;
    }

    const ref = baselineProfile || { cervicalAngle: 0, shoulderTilt: 0, headProjection: 0, score: 100 };

    const now = Date.now();
    const dt = now - lastUpdate.current; // elapsed time in ms
    lastUpdate.current = now;

    // Check deviation
    const cervicalDev = Math.abs(currentMetrics.cervicalAngle - ref.cervicalAngle);
    const isBadPosture = cervicalDev > ANGLE_THRESHOLD;

    // Add time to session stats
    addSessionTime(!isBadPosture, dt);

    if (isBadPosture) {
      badPostureSeconds.current += (dt / 1000);
      
      // If we crossed the threshold
      if (badPostureSeconds.current >= TIME_THRESHOLD_SEC) {
        // Trigger alert!
        toast.error('¡Postura incorrecta detectada!', {
          description: `Desviación cervical de ${Math.round(cervicalDev)}° por más de ${TIME_THRESHOLD_SEC}s. ¡Siéntate derecho!`,
          duration: 5000,
        });
        
        // Use Electron IPC to show a native Windows notification if available
        if (window.electron?.ipcRenderer) {
          window.electron.ipcRenderer.send('show-notification', {
            title: 'Alerta de Postura DERECHITO',
            body: `Te estás encorvando demasiado (+${Math.round(cervicalDev)}°). Endereza tu espalda.`,
          });
        }
        
        incrementAlerts();
        
        // Reset counter after firing to avoid spamming
        badPostureSeconds.current = -10; // Gives a 10s cooldown
      }
    } else {
      // Good posture, reset counter
      // Slowly decay bad posture counter to allow for minor slips, or just reset
      badPostureSeconds.current = Math.max(0, badPostureSeconds.current - (dt / 500));
    }
  }, [currentMetrics, baselineProfile, isRunning, incrementAlerts, addSessionTime]);
}
