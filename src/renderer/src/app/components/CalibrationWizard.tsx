import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, Camera, Cloud, Check, AlertTriangle,
  Monitor, ChevronLeft, ChevronRight, Zap, X,
} from "lucide-react";
import { usePoseDetector } from "../../hooks/usePoseDetector";
import { useAppStore } from "../../store/useAppStore";
import { calculateCervicalAngle, calculateShoulderTilt, calculateHeadProjection, PostureMetrics } from "../../utils/ergonomics";

type Step = 1 | 2 | 3;

/* ─── Animated skeleton drawn with SVG ─── */
function SkeletonFigure() {
  return (
    <svg viewBox="0 0 200 260" className="w-full h-full" fill="none">
      {/* Body segments — teal/green */}
      {/* Head */}
      <circle cx="100" cy="38" r="18" stroke="#00E5BE" strokeWidth="2.5" />
      {/* Neck */}
      <line x1="100" y1="56" x2="100" y2="72" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      {/* Shoulders */}
      <line x1="100" y1="72" x2="55" y2="95" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="72" x2="145" y2="95" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      {/* Spine */}
      <line x1="100" y1="72" x2="100" y2="148" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left arm */}
      <line x1="55" y1="95" x2="38" y2="135" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38" y1="135" x2="28" y2="168" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="145" y1="95" x2="162" y2="135" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="162" y1="135" x2="172" y2="168" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Hips */}
      <line x1="100" y1="148" x2="75" y2="162" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="148" x2="125" y2="162" stroke="#00E5BE" strokeWidth="2.5" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="75" y1="162" x2="68" y2="210" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="68" y1="210" x2="62" y2="248" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="125" y1="162" x2="132" y2="210" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="132" y1="210" x2="138" y2="248" stroke="#4B9EFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Key-point dots */}
      {[
        [100, 38], [100, 72], [55, 95], [145, 95],
        [38, 135], [162, 135], [28, 168], [172, 168],
        [100, 148], [75, 162], [125, 162],
        [68, 210], [132, 210], [62, 248], [138, 248],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#00E5BE" stroke="#0a1628" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─── Step 1 — Activar camara ─── */
function Step1({ onNext }: { onNext: () => void }) {
  // We assume permission is requested automatically when video starts, or we can just proceed.
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
      <div className="flex gap-10">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Camera className="w-5 h-5 text-[#0033CC]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Activar camara web</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            DERECHITO usa tu camara para detectar en tiempo real los puntos clave
            corporales. <span className="font-semibold text-gray-800">Ninguna imagen es almacenada ni enviada</span> a servidores externos.
          </p>

          <div className="border border-blue-200 rounded-lg p-4 mb-5">
            <div className="text-xs font-semibold text-gray-700 mb-3">Arquitectura de privacidad</div>
            <div className="space-y-2">
              {[
                "Procesamiento 100% local (Edge Computing)",
                "Algoritmo MediaPipe ejecutado en tu CPU",
                "Sin almacenamiento de video ni capturas de imagen",
                "Solo historial estadistico sincronizado con tu cuenta",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0033CC] flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-[#0033CC]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800">
              Asegurate de dar <span className="font-semibold">permisos de camara</span> en tu sistema.
            </p>
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-sm font-medium px-5 py-3 rounded-xl"
          >
            <Camera className="w-4 h-4" />
            Empezar calibracion
          </button>
        </div>

        {/* Right */}
        <div className="w-80 flex-shrink-0">
          <div className="relative bg-[#1a1f2e] rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-4">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#0033CC]/80 text-white text-[10px] font-semibold px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              PREPARADO
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Camera className="w-5 h-5 text-white/40" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <Monitor className="w-3.5 h-3.5" />
              Requisitos del sistema
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                "Camara web >= 720p",
                "Buena iluminacion frontal",
                "CPU >= Intel i5 / Ryzen 5",
                "RAM >= 4 GB disponibles",
              ].map((req) => (
                <div key={req} className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 — Posicionamiento ─── */
function Step2({ onPrev, onNext, videoRef, canvasRef }: { onPrev: () => void; onNext: () => void; videoRef: React.RefObject<HTMLVideoElement>; canvasRef: React.RefObject<HTMLCanvasElement> }) {
  // Simulate distance based on face width if needed, or just hardcode for MVP if we don't have depth.
  // We'll leave distance as a dummy since 2D cameras can't easily measure absolute depth without a reference.
  const distance = 72;
  const optimal = { min: 60, max: 90 };
  const maxDistance = 220;
  const pct = Math.min((distance / maxDistance) * 100, 100);
  const optMinPct = (optimal.min / maxDistance) * 100;
  const optMaxPct = (optimal.max / maxDistance) * 100;
  const isOptimal = distance >= optimal.min && distance <= optimal.max;

  const keypoints = [
    { label: "Cabeza", ok: true },
    { label: "Hombros", ok: true },
    { label: "Cadera", ok: true },
    { label: "Rodillas", ok: true },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
      <div className="flex gap-10">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ajusta tu posicion</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Ajusta tu posicion hasta que el indicador muestre el rango optimo de{" "}
            <span className="font-semibold text-gray-900">60 a 90 cm</span> frente al monitor;
            en tu postura de trabajo ideal.
          </p>

          {/* Distance meter */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-800">Distancia estimada</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">{distance} cm</span>
                {isOptimal && <Check className="w-4 h-4 text-green-500" />}
              </div>
            </div>

            {/* Bar */}
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
              {/* Optimal range highlight */}
              <div
                className="absolute top-0 h-full bg-green-100 rounded-full"
                style={{ left: `${optMinPct}%`, width: `${optMaxPct - optMinPct}%` }}
              />
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0 cm</span>
              <span className="text-green-600 font-medium">Optimo: 60-90 cm</span>
              <span>220cm</span>
            </div>
          </div>

          {/* Posture tips */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border border-green-200 bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-800">Postura ideal</span>
              </div>
              <ul className="space-y-1">
                {[
                  "Espalda recta en el respaldo",
                  "Hombros relajados y al nivel",
                  "Cuello alineado (0-5°)",
                  "Pies apoyados en el suelo",
                ].map((t) => (
                  <li key={t} className="text-[11px] text-green-700 flex items-start gap-1">
                    <span className="mt-0.5">&#x2022;</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-red-200 bg-red-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <X className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-800">A evitar</span>
              </div>
              <ul className="space-y-1">
                {[
                  "Encorvamiento dorsal",
                  '"Cuello de texto" (+15°)',
                  "Hombros elevados/caidos",
                  "Cruce de piernas prolongado",
                ].map((t) => (
                  <li key={t} className="text-[11px] text-red-700 flex items-start gap-1">
                    <span className="mt-0.5">&#x2022;</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium px-4 py-2.5 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              Paso anterior
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-xl"
            >
              <Check className="w-4 h-4" />
              Confirmar postura y capturar
            </button>
          </div>
        </div>

        {/* Right — live camera with skeleton */}
        <div className="w-80 flex-shrink-0">
          <div className="relative bg-[#0e1520] rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "4/3" }}>
            {/* EN VIVO badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              EN VIVO
            </div>
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#00E5BE] rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#00E5BE] rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#00E5BE] rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#00E5BE] rounded-br" />

            {/* Skeleton / Video Feed */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-60" />
              <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full -scale-x-100" />
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
              {[
                { color: "#00E5BE", label: "Cabeza" },
                { color: "#00E5BE", label: "Tronco" },
                { color: "#4B9EFF", label: "Extremidades" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keypoints */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Puntos clave detectados</span>
              <span className="text-[10px] font-bold text-[#0033CC]">17 / 17 &#x2713;</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keypoints.map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-xs text-gray-700">{label}</span>
                  {ok && <Check className="w-3 h-3 text-green-500" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3 — Captura de referencia ─── */
function Step3({ onPrev, onFinish, metrics }: { onPrev: () => void; onFinish: () => void; metrics: PostureMetrics | null }) {
  const displayMetrics = [
    { label: "Angulo cervical ideal", value: `+${metrics?.cervicalAngle || 0}°`, color: "text-[#0033CC]" },
    { label: "Desviacion hombros", value: `${metrics?.shoulderTilt || 0}°`, color: "text-[#0033CC]" },
    { label: "Curvatura lumbar", value: "Natural", color: "text-[#0033CC]" },
    { label: "Umbral de alerta", value: "15° / 30 s", color: "text-[#0033CC]" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-5xl mx-auto">
      <div className="flex gap-10">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Captura tu postura de referencia</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            El sistema registrara tu postura ideal como{" "}
            <span className="font-semibold text-gray-900">"linea base"</span> para todas las alertas
            futuras. Quedatee inmovil durante la cuenta regresiva de 3 segundos.
          </p>

          {/* Profile card */}
          <div className="border border-green-300 bg-green-50 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-green-800">Perfil ergonomico guardado</span>
            </div>

            <div className="space-y-3">
              {displayMetrics.map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-green-200 last:border-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span className={`text-sm font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sync note */}
          <div className="flex items-center gap-2 text-xs text-green-700 mb-6">
            <Cloud className="w-3.5 h-3.5 text-green-600" />
            Tu perfil ergonomico se sincronizara automaticamente con tu cuenta.
          </div>

          {/* CTA */}
          <button
            onClick={onFinish}
            className="w-full flex items-center justify-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white font-semibold text-sm py-3.5 rounded-xl mb-3"
          >
            <span>&#9654;</span>
            Iniciar Monitoreo
          </button>

          <button
            onClick={onPrev}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>&#8592;</span> Volver al paso anterior
          </button>
        </div>

        {/* Right — captured frame */}
        <div className="w-80 flex-shrink-0">
          <div className="relative bg-[#0e1520] rounded-xl overflow-hidden mb-3" style={{ aspectRatio: "4/3" }}>
            {/* CAPTURADO badge */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-green-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              CAPTURADO
            </div>

            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-green-400 rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-green-400 rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-green-400 rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-green-400 rounded-br" />

            {/* Faded skeleton in background */}
            <div className="absolute inset-0 flex items-center justify-center p-8 opacity-30">
              <SkeletonFigure />
            </div>

            {/* Success overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-500/40">
                <Check className="w-7 h-7 text-white" strokeWidth={3} />
              </div>
              <div className="text-white font-bold text-base">&#161;Perfil capturado!</div>
              <div className="text-white/60 text-xs mt-1">Esqueleto de referencia guardado localmente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main wizard shell ─── */
import { useEffect, useRef } from "react";

export function CalibrationWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromSignup = location.state?.from === "signup";
  const [step, setStep] = useState<Step>(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { landmarks, analyze } = usePoseDetector(videoRef, canvasRef);
  const { setBaselineProfile, baselineProfile } = useAppStore();

  const [currentMetrics, setCurrentMetrics] = useState<PostureMetrics | null>(null);

  // Compute metrics in real-time when in Step 2 or 3
  useEffect(() => {
    if (landmarks.length > 0) {
      setCurrentMetrics({
        cervicalAngle: calculateCervicalAngle(landmarks),
        shoulderTilt: calculateShoulderTilt(landmarks),
        headProjection: calculateHeadProjection(calculateCervicalAngle(landmarks)),
        score: 100 // baseline is 100 by definition
      });
    }
  }, [landmarks]);

  // Video loop
  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        analyze(performance.now());
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyze]);

  // Start camera when entering Step 2
  useEffect(() => {
    if (step >= 2) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }).catch(err => console.error("Camera error", err));
      }
    }
  }, [step]);

  const handleCapture = () => {
    if (currentMetrics) {
      setBaselineProfile(currentMetrics);
    }
    setStep(3);
  };

  const steps = [
    { num: 1, label: "Activar camara" },
    { num: 2, label: "Posicionamiento" },
    { num: 3, label: "Captura de referencia" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col text-sm">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0033CC] rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          <span className="text-[#0033CC] font-bold text-sm tracking-widest">DERECHITO</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <Cloud className="w-3.5 h-3.5" />
          Sincronizado
        </div>
      </div>

      {/* Blue sub-header */}
      <div className="bg-[#0033CC]">
        <div className="flex items-center gap-4 px-6 py-3">
          {!fromSignup && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver
            </button>
          )}
          <span className="text-white font-semibold text-sm">Asistente de Calibracion Ergonomica</span>
        </div>

        {/* Step tabs */}
        <div className="flex items-center px-6 pb-0">
          {steps.map((s, i) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? "bg-white text-[#0033CC] rounded-t-lg" : "text-white/60"
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    isDone ? "bg-green-400 text-white" : isActive ? "bg-[#0033CC] text-white" : "bg-white/20 text-white/70"
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-16 h-px bg-white/20 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 p-6">
        {step === 1 && <Step1 onNext={() => setStep(2)} />}
        {step === 2 && <Step2 onPrev={() => setStep(1)} onNext={handleCapture} videoRef={videoRef} canvasRef={canvasRef} />}
        {step === 3 && <Step3 onPrev={() => setStep(2)} onFinish={() => navigate("/monitor")} metrics={baselineProfile || currentMetrics} />}
      </div>

      {/* Bottom status bar */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-4 text-gray-400 text-[11px]">
          <span>&#x25CF; DERECHITO v1.0</span>
          <span>&#x25CF; CPU: 14% - RAM: 812 MB</span>
          <span>&#x25CF; MediaPipe Pose v0.10 - 30 fps</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-500 text-[11px] font-medium">
          <Cloud className="w-3 h-3" />
          Sync activo
        </div>
      </div>
    </div>
  );
}
