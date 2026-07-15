import { useEffect, useRef } from 'react';
import { PostureMetrics } from '../utils/ergonomics';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';

export function usePostureAlert(
  currentMetrics: PostureMetrics | null,
  isRunning: boolean
) {
  const { baselineProfile, incrementAlerts, addSessionTime, addNotification } = useAppStore();
  
  // Track consecutive seconds of bad posture
  const badPostureSeconds = useRef(0);
  const lastUpdate = useRef(Date.now());
  
  // Track continuous usage for "pausa activa"
  const continuousMinutes = useRef(0);
  const lastPauseAlert = useRef(0); // timestamp of last pause alert
  
  // 15 degrees deviation for 10 consecutive seconds = ALERT
  const ANGLE_THRESHOLD = 15;
  const TIME_THRESHOLD_SEC = 10;
  const PAUSE_THRESHOLD_MIN = 120; // 2 hours

  useEffect(() => {
    if (!isRunning || !currentMetrics) {
      lastUpdate.current = Date.now();
      return;
    }

    const ref = baselineProfile || { cervicalAngle: 0, shoulderTilt: 0, headProjection: 0, trunkLean: 0, score: 100 };

    const now = Date.now();
    const dt = now - lastUpdate.current; // elapsed time in ms
    lastUpdate.current = now;

    // Track continuous usage (in minutes)
    continuousMinutes.current += dt / 60000;

    // Check if we should fire a "pausa activa" notification (every 2 hours)
    if (continuousMinutes.current >= PAUSE_THRESHOLD_MIN && 
        now - lastPauseAlert.current > 30 * 60 * 1000) { // Don't spam more than every 30min
      lastPauseAlert.current = now;
      
      const hours = Math.floor(continuousMinutes.current / 60);
      toast.warning('¡Pausa activa recomendada!', {
        description: `Llevas ${hours}h continuas. Es momento de descansar y estirarte.`,
        duration: 8000,
      });
      
      addNotification({
        type: 'pause',
        title: 'Pausa activa',
        body: `Llevas ${hours}h continuas frente a la pantalla. Es momento de descansar.`,
      });

      if (window.api?.showNotification) {
        window.api.showNotification(
          '¡Pausa activa recomendada!',
          `Llevas ${hours}h continuas. Toma un descanso de 5-10 minutos.`
        );
      }
    }

    // Check deviation
    const cervicalDev = Math.abs(currentMetrics.cervicalAngle - ref.cervicalAngle);
    const trunkLeanDev = currentMetrics.trunkLean || 0; // Negative means joroba, positive means back
    
    const isBadCervical = cervicalDev > ANGLE_THRESHOLD;
    const isBadTrunkLean = Math.abs(trunkLeanDev) > 10;
    
    const isBadPosture = isBadCervical || isBadTrunkLean;

    // Add time to session stats
    addSessionTime(!isBadPosture, dt);

    if (isBadPosture) {
      badPostureSeconds.current += (dt / 1000);
      
      // If we crossed the threshold
      if (badPostureSeconds.current >= TIME_THRESHOLD_SEC) {
        
        let alertTitle = '¡Postura incorrecta detectada!';
        let alertDesc = `Tu cuello ha estado inclinado ${Math.round(cervicalDev)}° por más de ${TIME_THRESHOLD_SEC}s. ¡Siéntate derecho!`;
        let alertBody = `Te estás encorvando demasiado (+${Math.round(cervicalDev)}°). Endereza tu espalda.`;
        
        if (isBadTrunkLean && !isBadCervical) {
          if (trunkLeanDev < 0) {
            alertTitle = '¡Estás encorvado!';
            alertDesc = 'Tu tronco está inclinado hacia adelante. ¡Endereza tu espalda!';
            alertBody = 'Estás formando joroba. ¡Siéntate derecho!';
          } else {
            alertTitle = '¡Estás muy recostado!';
            alertDesc = 'Tu tronco está inclinado hacia atrás. Mantén una postura recta.';
            alertBody = 'Estás inclinado hacia atrás. Ajusta tu silla y siéntate bien.';
          }
        }

        // Trigger alert!
        toast.error(alertTitle, {
          description: alertDesc,
          duration: 5000,
        });
        
        // Add real notification to store
        addNotification({
          type: 'alert',
          title: alertTitle,
          body: alertBody,
        });
        
        // Use Electron IPC to show a native Windows notification if available
        if (window.api?.showNotification) {
          window.api.showNotification(alertTitle, alertBody);
        } else if (window.electron?.ipcRenderer) {
          window.electron.ipcRenderer.send('show-notification', {
            title: alertTitle,
            body: alertBody,
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
  }, [currentMetrics, baselineProfile, isRunning, incrementAlerts, addSessionTime, addNotification]);
}
