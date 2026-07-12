import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud, Monitor, Clock, Cpu, History, Settings,
  PauseCircle, PlayCircle, RotateCcw, LogOut, Check,
  User, AlertTriangle, Bell, X,
} from "lucide-react";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { usePoseDetector } from "../../hooks/usePoseDetector";
import { useSync } from "../../hooks/useSync";
import { usePostureAlert } from "../../hooks/usePostureAlert";
import { useAppStore } from "../../store/useAppStore";
import { calculateCervicalAngle, calculateShoulderTilt, calculateHeadProjection, calculatePostureScore, PostureMetrics } from "../../utils/ergonomics";

/* ─── Skeleton SVG ─── */
function SkeletonFigure({ color = "#00E5BE", torsoOnly = false }: { color?: string; torsoOnly?: boolean }) {
  const dim = color === "#ff6b6b" ? "#ff6b6b" : "#4B9EFF";
  // torsoOnly: viewBox cropped to head + shoulders + spine + hip line only
  const viewBox = torsoOnly ? "30 20 140 150" : "0 0 200 260";
  return (
    <svg viewBox={viewBox} className="w-full h-full" fill="none">
      {/* Head */}
      <circle cx="100" cy="38" r="18" stroke={color} strokeWidth="2.5" />
      {/* Neck */}
      <line x1="100" y1="56" x2="100" y2="72" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Shoulders */}
      <line x1="100" y1="72" x2="55" y2="95" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="72" x2="145" y2="95" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Spine */}
      <line x1="100" y1="72" x2="100" y2="148" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Upper arms */}
      <line x1="55" y1="95" x2="38" y2="135" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="145" y1="95" x2="162" y2="135" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
      {/* Lower arms — hidden in torsoOnly */}
      {!torsoOnly && <>
        <line x1="38" y1="135" x2="28" y2="168" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="162" y1="135" x2="172" y2="168" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
      </>}
      {/* Hip line */}
      <line x1="100" y1="148" x2="75" y2="162" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="100" y1="148" x2="125" y2="162" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Legs — hidden in torsoOnly */}
      {!torsoOnly && <>
        <line x1="75" y1="162" x2="68" y2="210" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="68" y1="210" x2="62" y2="248" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="125" y1="162" x2="132" y2="210" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="210" x2="138" y2="248" stroke={dim} strokeWidth="2.5" strokeLinecap="round" />
      </>}
      {/* Key-point dots */}
      {(torsoOnly
        ? [[100,38],[100,72],[55,95],[145,95],[38,135],[162,135],[100,148],[75,162],[125,162]]
        : [[100,38],[100,72],[55,95],[145,95],[38,135],[162,135],[28,168],[172,168],[100,148],[75,162],[125,162],[68,210],[132,210],[62,248],[138,248]]
      ).map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill={color} stroke="#0a1628" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ─── Circular score gauge ─── */
function ScoreGauge({ score, label }: { score: number; label: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} stroke="#e5e7eb" strokeWidth="10" fill="none" />
          <circle cx="64" cy="64" r={r} stroke="#0033CC" strokeWidth="10" fill="none"
            strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <span className="mt-1 text-sm font-semibold text-[#0033CC]">{label}</span>
    </div>
  );
}

/* ─── Notifications panel ─── */
const NOTIFICATIONS = [
  {
    id: 1,
    type: "alert",
    icon: "&#9888;",
    title: "Alerta postural",
    body: "Desviacion cervical de 22° durante 45 segundos",
    time: "hace 12 min",
    border: "border-red-400",
    bg: "bg-red-50",
    titleColor: "text-red-600",
  },
  {
    id: 2,
    type: "pause",
    icon: "&#128336;",
    title: "Pausa activa",
    body: "Llevas 2 h continuas. Es momento de descansar.",
    time: "hace 45 min",
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    titleColor: "text-yellow-700",
  },
  {
    id: 3,
    type: "sync",
    icon: "&#9729;",
    title: "Sincronizacion completada",
    body: "Historial de hoy sincronizado correctamente con tu cuenta.",
    time: "hace 2 min",
    border: "border-blue-400",
    bg: "bg-blue-50",
    titleColor: "text-blue-600",
  },
  {
    id: 4,
    type: "report",
    icon: "&#128202;",
    title: "Reporte semanal enviado",
    body: "Tu postura mejoro un 8% esta semana. Revisa tu correo.",
    time: "hoy 8:00 AM",
    border: "border-blue-400",
    bg: "bg-blue-50",
    titleColor: "text-blue-600",
  },
];

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-gray-900 text-sm">Notificaciones</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className={`flex gap-3 px-4 py-3 border-l-4 ${n.border} ${n.bg}`}>
            <span className="text-base flex-shrink-0 mt-0.5" dangerouslySetInnerHTML={{ __html: n.icon }} />
            <div className="min-w-0">
              <div className={`text-xs font-bold mb-0.5 ${n.titleColor}`}>{n.title}</div>
              <div className="text-xs text-gray-700 leading-snug">{n.body}</div>
              <div className="text-[10px] text-gray-400 mt-1">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Logout confirmation modal ─── */
function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 mx-4">
        <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-5 h-5 text-gray-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 text-center mb-1">Cerrar sesion</h3>
        <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
          Tu sesion activa se pausara. Podras retomar el monitoreo cuando vuelvas a iniciar sesion.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-[#0033CC] hover:bg-[#0029A3] text-white text-sm font-semibold transition-colors">
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function MonitorDashboard() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(10297);
  const [running, setRunning] = useState(true);
  const [simulateBad, setSimulateBad] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  
  const { cpu, ram } = useSystemMetrics();
  const { syncStatus } = useSync("temp-user");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { landmarks, analyze, isReady } = usePoseDetector(videoRef, canvasRef);
  
  const { baselineProfile, sessionStats } = useAppStore();
  const [currentMetrics, setCurrentMetrics] = useState<PostureMetrics | null>(null);

  // Hook for triggering alerts
  usePostureAlert(currentMetrics, running);

  // Compute metrics in real-time
  useEffect(() => {
    if (landmarks.length > 0 && running) {
      setCurrentMetrics({
        cervicalAngle: calculateCervicalAngle(landmarks),
        shoulderTilt: calculateShoulderTilt(landmarks),
        headProjection: calculateHeadProjection(calculateCervicalAngle(landmarks)),
        score: calculatePostureScore(
          {
            cervicalAngle: calculateCervicalAngle(landmarks),
            shoulderTilt: calculateShoulderTilt(landmarks),
            headProjection: 0,
            score: 0
          }, 
          baselineProfile
        )
      });
    }
  }, [landmarks, baselineProfile, running]);

  // Auto-analyze video frames
  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && running) {
        analyze(performance.now());
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyze, running]);

  // Handle camera stream
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }).catch(err => console.error("Camera error", err));
    }
  }, []);

  // Draw landmarks is now handled directly by usePoseDetector for better performance

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  // Close notifications on outside click
  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const realScore = currentMetrics?.score || 100;
  const score = simulateBad ? 42 : realScore;
  const postureOk = score >= 80;
  const scoreLabel = postureOk ? "Excelente" : "Mejorable";

  const metrics = [
    { label: "Angulo cervical",     value: simulateBad ? "+18.3°" : `+${currentMetrics?.cervicalAngle || 0}°` },
    { label: "Inclinacion hombros", value: simulateBad ? "8.5°"   : `${currentMetrics?.shoulderTilt || 0}°`  },
    { label: "Proyeccion cabeza",   value: simulateBad ? "7.2 cm" : `${currentMetrics?.headProjection || 0} cm`},
    { label: "Distancia camara",    value: "72 cm" }, // Placeholder for depth since 2D camera doesn't provide accurate depth easily
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-sm">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0033CC] rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          <span className="text-[#0033CC] font-bold tracking-widest">DERECHITO</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <Cloud className="w-3 h-3" /> Sincronizado
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 text-xs font-mono font-semibold bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3 text-gray-500" /> {fmt(elapsed)}
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-full">
            <Cpu className="w-3 h-3 text-gray-500" /> CPU: {cpu}%
          </div>
          {/* Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold pointer-events-none">
              3
            </div>
            {showNotifications && (
              <NotificationsPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#0033CC] rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-xs leading-tight">DERECHITO</div>
                <div className="text-[10px] text-gray-500">Monitor Postural</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium mb-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Sincronizado hace 2 min
            </div>
            <div className="text-[11px] text-gray-500">
              Sesion activa: <span className={`font-mono font-semibold ${running ? "text-gray-700" : "text-amber-500"}`}>{fmt(elapsed)}</span>
              {!running && <span className="ml-1 text-amber-500 font-medium">(pausado)</span>}
            </div>
          </div>

          <nav className="p-3 flex-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Navegacion</div>
            <div className="space-y-0.5 mb-4">
              {[
                { label: "Monitor", icon: <Monitor className="w-4 h-4" />, path: "/monitor", active: true },
                { label: "Historial", icon: <History className="w-4 h-4" />, path: "/historial", active: false },
                { label: "Configuracion", icon: <Settings className="w-4 h-4" />, path: "/config", active: false },
              ].map(({ label, icon, path, active }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-[#0033CC] text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Sesion</div>
            <div className="space-y-0.5">
              {/* Pause/Resume — always green, controls timer */}
              <button
                onClick={() => setRunning((v) => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
              >
                {running
                  ? <><PauseCircle className="w-4 h-4" /> Pausar monitor</>
                  : <><PlayCircle className="w-4 h-4" /> Reanudar monitor</>
                }
              </button>
              <button
                onClick={() => navigate("/calibration")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Recalibrar
              </button>
              <button
                onClick={() => setShowLogout(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar sesion
              </button>
            </div>
          </nav>

          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0033CC] rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Demo</div>
                <div className="text-[10px] text-gray-500">demo@derechito.app</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="p-6 flex flex-col gap-4 flex-1">
            <h1 className="text-lg font-bold text-gray-900">Monitor en tiempo real</h1>

            {/* Posture banner */}
            <div className={`rounded-xl px-5 py-4 flex items-center justify-between transition-colors ${
              !running ? "bg-gray-400" : postureOk ? "bg-green-500" : "bg-red-500"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  {!running
                    ? <PauseCircle className="w-4 h-4 text-white" />
                    : postureOk
                    ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    : <AlertTriangle className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">
                    {!running ? "Monitor en pausa" : postureOk ? "Postura Correcta" : "Postura Incorrecta"}
                  </div>
                  <div className="text-white/80 text-xs">
                    {!running
                      ? "Haz clic en Reanudar monitor para continuar"
                      : postureOk
                      ? "Tu columna vertebral esta correctamente alineada"
                      : "Corrige tu postura: encorvamiento detectado"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-bold text-3xl">{running ? score : "--"}</span>
                <span className="text-white/70 text-xs">puntos</span>
                {running && (
                  <button
                    onClick={() => setSimulateBad((v) => !v)}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors text-white text-xs font-medium px-3 py-2 rounded-lg"
                  >
                    <User className="w-3.5 h-3.5" />
                    Demo: {simulateBad ? "restaurar postura" : "simular mala postura"}
                  </button>
                )}
              </div>
            </div>

            {/* Content grid */}
            <div className="flex gap-4 flex-1">
              {/* Camera feed */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">Vista en tiempo real</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">MediaPipe Pose</span>
                    <span className={`flex items-center gap-1 font-semibold ${running ? "text-green-600" : "text-gray-400"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${running ? "bg-green-500" : "bg-gray-400"}`} />
                      {running ? "30 fps" : "pausado"}
                    </span>
                  </div>
                </div>

                <div className="relative bg-[#0e1520] rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                  <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 ${running ? "bg-red-600" : "bg-gray-600"}`}>
                    <div className={`w-1.5 h-1.5 bg-white rounded-full ${running ? "animate-pulse" : ""}`} />
                    {running ? "EN VIVO" : "EN PAUSA"}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                    {running ? "30 FPS" : "--"}
                  </div>
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#00E5BE] rounded-tl" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#00E5BE] rounded-tr" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#00E5BE] rounded-bl" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#00E5BE] rounded-br" />
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${running ? "opacity-100" : "opacity-30"}`}>
                    <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
                    <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full -scale-x-100" />
                  </div>
                  {!running && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/50 text-sm font-medium">Monitor en pausa</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex justify-center">
                  <ScoreGauge score={running ? score : 0} label={running ? scoreLabel : "Pausado"} />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Metricas en vivo</div>
                  <div className="space-y-2.5">
                    {metrics.map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">{label}</span>
                        <span className={`text-xs font-bold ${!running ? "text-gray-300" : simulateBad ? "text-red-500" : "text-[#0033CC]"}`}>
                          {running ? value : "--"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Hoy</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-500">{sessionStats?.alertsToday || 0}</div>
                      <div className="text-[10px] text-red-400 font-medium mt-0.5">alertas</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {sessionStats?.totalTimeMs > 0 
                          ? Math.round((sessionStats.correctTimeMs / sessionStats.totalTimeMs) * 100) 
                          : 100}%
                      </div>
                      <div className="text-[10px] text-green-500 font-medium mt-0.5">tiempo correcto</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0033CC] rounded-xl p-4 flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-white flex-shrink-0" />
                  <div>
                    <div className="text-white text-xs font-semibold">Sincronizacion activa</div>
                    <div className="text-white/70 text-[10px]">Datos enviados cada 5 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Bottom bar ── */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-gray-400 text-[11px]">
          <span>&#x25CF; DERECHITO v1.0</span>
          <span>&#x25CF; CPU: {cpu}% - RAM: {ram.usedMB} MB</span>
          <span>&#x25CF; MediaPipe Pose {isReady ? 'Ready' : 'Loading'} - 30 fps</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-500 text-[11px] font-medium">
          <Cloud className="w-3 h-3" /> Sync activo
        </div>
      </div>

      {showLogout && (
        <LogoutModal
          onConfirm={() => navigate("/")}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
