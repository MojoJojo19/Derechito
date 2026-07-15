import { useEffect, useRef } from 'react';
import { PostureMetrics, classifyPosture } from '../utils/ergonomics';
import { useAppStore } from '../store/useAppStore';
import { toast } from 'sonner';

export function usePostureAlert(
  currentMetrics: PostureMetrics | null,
  isRunning: boolean
) {
  const { baselineProfile, alertMode, incrementAlerts, addSessionTime, addNotification } = useAppStore();
  
  // Track consecutive seconds of being "jorobado"
  const badPostureSeconds = useRef(0);
  const lastUpdate = useRef(Date.now());
  
  // Track continuous usage for "pausa activa"
  const continuousMinutes = useRef(0);
  const lastPauseAlert = useRef(0); // timestamp of last pause alert
  
  const PAUSE_THRESHOLD_MIN = 120; // 2 hours

  useEffect(() => {
    if (!isRunning || !currentMetrics) {
      lastUpdate.current = Date.now();
      return;
    }

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

    // Determine the time threshold based on configuration
    const timeThresholdSec = alertMode === 'rigorous' ? 3 : 15;
    // Rigorous: shorter cooldown (3s vs 10s) and slower counter decay
    const cooldownSec = alertMode === 'rigorous' ? 3 : 10;
    const decayFactor = alertMode === 'rigorous' ? 0.7 : 2;

    // Classify posture
    const postureState = classifyPosture(currentMetrics, baselineProfile, alertMode);
    
    // Add time to session stats (consider 'atras' as correct time for stats, only punish 'jorobado')
    const isGood = postureState === 'recto' || postureState === 'atras';
    addSessionTime(isGood, dt);

    // Only trigger active alerts if the user is explicitly "Jorobado"
    if (postureState === 'jorobado') {
      badPostureSeconds.current += (dt / 1000);
      
      // If we crossed the threshold
      if (badPostureSeconds.current >= timeThresholdSec) {
        
        const alertTitle = alertMode === 'rigorous' 
          ? '⚠️ ¡ALERTA RIGUROSA — Postura incorrecta!'
          : '¡Postura encorvada detectada!';
        const alertDesc = alertMode === 'rigorous' 
          ? `¡Detección rigurosa! Llevas ${Math.round(badPostureSeconds.current)}s encorvado. ¡Enderézate YA!`
          : `Llevas más de ${timeThresholdSec}s encorvado. ¡Siéntate derecho!`;
        const alertBody = alertMode === 'rigorous'
          ? `Modo riguroso activo. Tu cabeza o hombros están caídos hacia el frente. Corrige inmediatamente.`
          : 'Tu cabeza o tus hombros están caídos hacia el frente.';
        
        // Trigger alert!
        toast.error(alertTitle, {
          description: alertDesc,
          duration: alertMode === 'rigorous' ? 8000 : 5000,
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
        
        // Reset counter after alert (cooldown depends on mode)
        badPostureSeconds.current = -cooldownSec;
      }
    } else {
      // User corrected posture.
      if (badPostureSeconds.current > 0) {
        // Decrease the counter — rigorous mode decays much slower (harder to "reset" by briefly sitting straight)
        badPostureSeconds.current = Math.max(0, badPostureSeconds.current - (dt / 1000) * decayFactor);
      } else if (badPostureSeconds.current < 0) {
        // Recover from cooldown slowly
        badPostureSeconds.current = Math.min(0, badPostureSeconds.current + (dt / 1000));
      }
    }
  }, [currentMetrics, isRunning, alertMode, baselineProfile, addSessionTime, incrementAlerts, addNotification]);
}
