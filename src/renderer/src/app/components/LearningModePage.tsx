import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cloud, Check, X, Brain, Pencil, Save } from "lucide-react";
import { usePoseDetector } from "../../hooks/usePoseDetector";

const TOTAL = 600; // 10 minutes in seconds (demo uses 60 for speed)

const GESTURES = [
  { label: "Beber agua (inclinación 35°)", type: "natural", appearsAt: 0.25 },
  { label: "Mirar lateral (giro 45°)",     type: "natural", appearsAt: 0.55 },
  { label: "Cabeza caída (>60° sostenido)", type: "bad",    appearsAt: 0.80 },
];

export function LearningModePage() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  const [gestureTypes, setGestureTypes] = useState<Record<string, string>>(
    Object.fromEntries(GESTURES.map((g) => [g.label, g.type]))
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyze, isReady } = usePoseDetector(videoRef, canvasRef);

  // Use 60 s demo duration so the gestures appear quickly in the UI
  const DEMO = 60;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= DEMO) {
          clearInterval(intervalRef.current!);
          setDone(true);
          return DEMO;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, []);

  // Auto-analyze video frames
  useEffect(() => {
    let animationFrameId: number;
    const renderLoop = () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && !done) {
        analyze(performance.now());
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [analyze, done]);

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

  const progress = elapsed / DEMO;

  // Countdown shown as 10:00 → 00:00 mapped onto DEMO seconds
  const displayMin = String(Math.floor((TOTAL * (1 - progress)) / 60)).padStart(2, "0");
  const displaySec = String(Math.floor(TOTAL * (1 - progress)) % 60).padStart(2, "0");

  const visibleGestures = GESTURES.filter((g) => progress >= g.appearsAt);

  const handleFinish = () => {
    // Pass learned=true so ConfiguracionPage can show the stabilised dict
    navigate("/config?learned=true");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-sm">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0033CC] rounded-md flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          <span className="text-[#0033CC] font-bold tracking-widest">DERECHITO</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <Cloud className="w-3 h-3" /> Sincronizado
        </div>
      </div>

      {/* Purple sub-header */}
      <div className="bg-[#7c3aed] px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a configuracion
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-white" />
          <span className="text-white font-semibold text-sm">Movimientos permitidos — Modo Entrenamiento</span>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">Avanzado</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex gap-6 max-w-5xl mx-auto w-full">

        {/* Left — camera + progress */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Status card */}
          {!done ? (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-purple-800">Modo Entrenamiento activo</span>
                </div>
                <span className="text-lg font-bold text-purple-700 font-mono">{displayMin}:{displaySec}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-purple-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-xs text-purple-600">
                Realiza movimientos cotidianos: beber agua, girar la cabeza, alcanzar el teclado...
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-green-800">Entrenamiento completado — {visibleGestures.length} gestos capturados</span>
              </div>
              <button
                onClick={handleFinish}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Guardar y volver
              </button>
            </div>
          )}

          {/* Camera feed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Vista en tiempo real</span>
              <span className="flex items-center gap-1 text-purple-600 text-xs font-semibold">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                Analizando gestos
              </span>
            </div>
            <div className="relative bg-[#0e1520] rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                EN VIVO
              </div>
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-purple-400 rounded-tl" />
              <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-purple-400 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-purple-400 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-purple-400 rounded-br" />

              <div className="absolute inset-0 flex items-center justify-center transition-opacity">
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
                <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full -scale-x-100" />
              </div>

              {/* Gesture detected flash */}
              {visibleGestures.length > 0 && !done && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600/90 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full">
                  Gesto detectado: {visibleGestures[visibleGestures.length - 1].label}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — gesture dictionary */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Gestos capturados</div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-semibold text-gray-500">
                DICCIONARIO ACTUAL ({visibleGestures.length} GESTOS)
              </div>
              {done && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#0033CC] hover:text-blue-800 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </button>
              )}
              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-green-600 hover:text-green-800 transition-colors"
                >
                  <Save className="w-3 h-3" /> Guardar
                </button>
              )}
            </div>

            <div className="space-y-2">
              {GESTURES.map((g) => {
                const visible = progress >= g.appearsAt;
                const currentType = gestureTypes[g.label] ?? g.type;
                return (
                  <div
                    key={g.label}
                    className={`p-3 rounded-xl border transition-all duration-700 ${
                      visible
                        ? currentType === "natural"
                          ? "bg-green-50 border-green-200 opacity-100"
                          : "bg-red-50 border-red-200 opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          currentType === "natural" ? "bg-green-500" : "bg-red-500"
                        }`}>
                          {currentType === "natural"
                            ? <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            : <X className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs text-gray-800 truncate">{g.label}</span>
                      </div>
                      {!editing ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${
                          currentType === "natural" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {currentType === "natural" ? "Natural" : "Mala postura"}
                        </span>
                      ) : (
                        <select
                          value={currentType}
                          onChange={(e) => setGestureTypes((prev) => ({ ...prev, [g.label]: e.target.value }))}
                          className="text-[10px] font-semibold border border-gray-300 rounded-lg px-1.5 py-1 ml-2 flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-[#0033CC] bg-white"
                        >
                          <option value="natural">Natural</option>
                          <option value="bad">Mala postura</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pending slots */}
              {Array.from({ length: Math.max(0, 3 - visibleGestures.length) }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="h-2.5 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
            <p className="text-[11px] text-purple-700 leading-relaxed">
              Muevete con naturalidad. El sistema distingue automaticamente entre movimientos cotidianos y mala postura sostenida.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-gray-400 text-[11px]">
          <span>&#x25CF; DERECHITO v1.0</span>
          <span>&#x25CF; CPU: 14% - RAM: 812 MB</span>
          <span>&#x25CF; Sistema de detección v0.10 - {isReady ? 'Activo' : 'Cargando'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-500 text-[11px] font-medium">
          <Cloud className="w-3 h-3" /> Sync activo
        </div>
      </div>
    </div>
  );
}
