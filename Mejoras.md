# Plan de Mejoras y Nuevas Funcionalidades: DERECHITO


## 1. Visualización del Historial de Postura
Actualmente, la vista de historial carga sin información. 

## 2. Actualización del Módulo de Configuración
El panel de configuración debe alinearse con el diseño base establecido en Figma, añadiendo el control de perfil y la gestión de sensibilidad de las alertas.

    *   Habilitar campos editables para que el usuario pueda actualizar su información de perfil (Nombre, etc.).
    *   Añadir lógica de guardado y validación para evitar enviar campos en blanco.

    *   Implementar los botones correspondientes en la interfaz para alternar entre modos: Modo Estándar: Mayor tolerancia en los ángulos y mayor tiempo de espera antes de emitir una alerta (ideal para el uso diario continuo). Modo Riguroso: Tolerancia mínima en la desviación de los hombros y cuello, con alertas rápidas (ideal para corrección postural activa).

## 3. Mejoras en el Reconocimiento Facial y Postural
Optimizar los algoritmos de detección para incluir monitoreo de fatiga y mejorar la clasificación geométrica del torso.

*   **Refinamiento de la Clasificación Postural:**
    *   Ajustar el cálculo de ángulos entre hombros, cuello y rostro para diferenciar con alta precisión tres estados exclusivos:
        1.  **Recto:** Postura ergonómica ideal.
        2.  **Jorobado:** Cabeza adelantada y hombros caídos hacia el frente.
        3.  **Hacia atrás:** Inclinación o recostamiento excesivo sobre la silla.
*   **Sistema de Alertas Activas:**
    *   Programar el disparo de alertas (visuales/sonoras) específicamente cuando el algoritmo clasifique el estado como **"Jorobado"**.
    *   Vincular estas alertas a la configuración de Modo Estándar/Riguroso para definir cuántos segundos el usuario debe estar jorobado antes de recibir la notificación, evitando falsos positivos por movimientos rápidos.