import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Cloud, Clock, Cpu, Monitor, History, Settings,
  RotateCcw, LogOut, User, PlayCircle, Bell,
  Check, X, Shield, Sliders, RefreshCw, Download,
  Trash2, ChevronRight,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";

const NOTIFICATIONS = [
  { id: 1, icon: "&#9888;", title: "Alerta postural", body: "Desviacion cervical de 22° durante 45 segundos", time: "hace 12 min", border: "border-red-400", bg: "bg-red-50", titleColor: "text-red-600" },
  { id: 2, icon: "&#128336;", title: "Pausa activa", body: "Llevas 2 h continuas. Es momento de descansar.", time: "hace 45 min", border: "border-yellow-400", bg: "bg-yellow-50", titleColor: "text-yellow-700" },
  { id: 3, icon: "&#9729;", title: "Sincronizacion completada", body: "Historial de hoy sincronizado correctamente con tu cuenta.", time: "hace 2 min", border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600" },
  { id: 4, icon: "&#128202;", title: "Reporte semanal enviado", body: "Tu postura mejoro un 8% esta semana. Revisa tu correo.", time: "hoy 8:00 AM", border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600" },
];

const LEARNED_GESTURES = [
  { label: "Beber agua (inclinacion 35°)", type: "natural" },
  { label: "Mirar lateral (giro 45°)",     type: "natural" },
  { label: "Cabeza caida (>60° sostenido)", type: "bad"    },
];

/* ─── Toggle switch ─── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#0033CC]" : "bg-gray-300"}`}
      style={{ height: "22px", width: "40px" }}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/* ─── Sidebar (shared pattern) ─── */
function Sidebar({ elapsed, onNavigate, onLogout }: { elapsed: number; onNavigate: (p: string) => void; onLogout: () => void }) {
  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const navItems = [
    { label: "Monitor",       icon: <Monitor className="w-4 h-4" />,  path: "/monitor"   },
    { label: "Historial",     icon: <History className="w-4 h-4" />,  path: "/historial" },
    { label: "Configuracion", icon: <Settings className="w-4 h-4" />, path: "/config"    },
  ];
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#0033CC] rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xs">DERECHITO</div>
            <div className="text-[10px] text-gray-500">Monitor Postural IA</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-semibold mb-0.5">
            <Cloud className="w-3 h-3" /> Sincronizado
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full ml-auto" />
          </div>
          <div className="text-[10px] text-gray-500">hace 2 min</div>
        </div>
        <div className="text-[11px] text-gray-500">
          Sesion activa: <span className="font-mono font-semibold text-gray-700">{fmt(elapsed)}</span>
        </div>
      </div>

      <nav className="p-3 flex-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Navegacion</div>
        <div className="space-y-0.5 mb-4">
          {navItems.map(({ label, icon, path }) => (
            <button key={path} onClick={() => onNavigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                path === "/config" ? "bg-[#0033CC] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Sesion</div>
        <div className="space-y-0.5">
          <button onClick={() => onNavigate("/monitor")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
            <PlayCircle className="w-4 h-4" /> Reanudar monitor
          </button>
          <button onClick={() => onNavigate("/calibration")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            <RotateCcw className="w-4 h-4" /> Recalibrar
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
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
  );
}

/* ─── Section card ─── */
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-[#0033CC]">{icon}</div>
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── Slider row ─── */
function SliderRow({ label, value, tag }: { label: string; value: number; tag: string; tagColor?: string }) {
  const [val, setVal] = useState(value);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-700">{label}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
          tag === "Normal" ? "bg-green-100 text-green-700" :
          tag === "Mas estricto" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-600"
        }`}>{tag}</span>
      </div>
      <input
        type="range" min={0} max={100} value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full h-1.5 accent-[#0033CC] cursor-pointer"
      />
    </div>
  );
}

/* ─── Main ─── */
export function ConfiguracionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const learned = searchParams.get("learned") === "true";
  const [elapsed, setElapsed] = useState(10900);
  const [syncHistory, setSyncHistory] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [visualAlerts, setVisualAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [activeBreaks, setActiveBreaks] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { baselineProfile } = useAppStore();
  const { cpu, ram } = useSystemMetrics();

  const handleExportCSV = () => {
    const rows = [
      ["Fecha", "Postura correcta %", "Alertas", "Sesion (min)", "Angulo cervical", "Dist. hombro-oido"],
      ["2026-06-23", "94", "1", "135", "+5.2°", "14.8 cm"],
      ["2026-06-22", "91", "1", "260", "+4.9°", "15.1 cm"],
      ["2026-06-21", "88", "3", "420", "+6.1°", "14.2 cm"],
      ["2026-06-20", "93", "2", "490", "+4.7°", "15.0 cm"],
      ["2026-06-19", "80", "4", "405", "+7.3°", "13.9 cm"],
      ["2026-06-18", "95", "1", "450", "+4.5°", "15.3 cm"],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "derechito_historial.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    setShowDeleteConfirm(false);
    // In production: wipe user data via API
    alert("Todos los datos han sido eliminados. Cerrando sesion...");
    navigate("/");
  };

  useEffect(() => {
    if (!showNotifications) return;
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications]);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
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
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold pointer-events-none">3</div>
            {showNotifications && (
              <div className="absolute top-10 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-sm">Notificaciones</span>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
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
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <Sidebar elapsed={elapsed} onNavigate={navigate} onLogout={() => setShowLogout(true)} />

        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-5">Configuracion</h1>

          <div className="grid grid-cols-2 gap-5">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-5">

              {/* Cuenta y sincronización */}
              <Card title="Cuenta y sincronizacion" icon={<Cloud className="w-4 h-4" />}>
                {/* User row */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#0033CC] rounded-full flex items-center justify-center text-white text-sm font-bold">D</div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">Demo</div>
                      <div className="text-[10px] text-gray-500">demo@derechito.app</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Conectado
                  </span>
                </div>

                {/* Toggles */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Sincronizar historial</span>
                    <Toggle value={syncHistory} onChange={setSyncHistory} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">Reportes semanales por correo</span>
                    <Toggle value={weeklyReports} onChange={setWeeklyReports} />
                  </div>
                </div>

                {/* Sync frequency */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-700">Frecuencia de sincronizacion</span>
                  <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0033CC]">
                    <option>Cada 5 minutos</option>
                    <option>Cada 15 minutos</option>
                    <option>Cada hora</option>
                  </select>
                </div>

                {/* Last sync */}
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Ultima sincronizacion: hace 14:32</span>
                  <span className="text-[10px] font-semibold text-[#0033CC]">4748 transferidos</span>
                </div>
              </Card>

              {/* Tu postura de referencia */}
              <Card title="Tu postura de referencia" icon={<User className="w-4 h-4" />}>
                <div className="bg-blue-50 rounded-lg p-3 mb-4 text-xs text-blue-800 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estado</span>
                    <span className="font-semibold">{baselineProfile ? "Configurado" : "Usando perfil por defecto"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posición del cuello base</span>
                    <span className="font-semibold text-[#0033CC]">{baselineProfile ? `+${baselineProfile.cervicalAngle}°` : "0°"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nivel de los hombros</span>
                    <span className="font-semibold">{baselineProfile ? `${baselineProfile.shoulderTilt}°` : "0°"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Posición de la cabeza base</span>
                    <span className="font-semibold">{baselineProfile ? `${baselineProfile.headProjection} cm` : "0 cm"}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/calibration")}
                  className="w-full flex items-center justify-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-xs font-semibold py-2.5 rounded-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Volver a configurar postura
                </button>
              </Card>

              {/* Alertas y notificaciones */}
              <Card title="Alertas y notificaciones" icon={<Bell className="w-4 h-4" />}>
                <div className="space-y-3">
                  {[
                    { label: "Alertas visuales", sub: "Banner en pantalla", emoji: "🔔", value: visualAlerts, set: setVisualAlerts },
                    { label: "Alertas sonoras",  sub: "Bip suave tras 30 s", emoji: "🔊", value: soundAlerts,  set: setSoundAlerts  },
                    { label: "Pausas activas",   sub: "Recordatorio cada 2 h", emoji: "🌿", value: activeBreaks, set: setActiveBreaks },
                  ].map(({ label, sub, emoji, value, set }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{emoji}</span>
                        <div>
                          <div className="text-xs font-medium text-gray-800">{label}</div>
                          <div className="text-[10px] text-gray-500">{sub}</div>
                        </div>
                      </div>
                      <Toggle value={value} onChange={set} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Gestión de datos */}
              <Card title="Exportar y eliminar datos" icon={<Download className="w-4 h-4" />}>
                <div className="space-y-1">
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-gray-700 group-hover:text-[#0033CC]">
                      <Download className="w-4 h-4 text-[#0033CC]" />
                      <div className="text-left">
                        <div className="text-xs font-medium">Exportar historial (CSV)</div>
                        <div className="text-[10px] text-gray-400">Descarga tus datos posturales de los ultimos 30 dias</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0033CC]" />
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-red-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 text-red-500">
                      <Trash2 className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-xs font-medium">Eliminar todos los datos</div>
                        <div className="text-[10px] text-red-300">Esta accion es irreversible</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </Card>

              {/* Delete confirmation modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 text-center mb-2">
                      Eliminar todos los datos
                    </h3>
                    <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
                      Se eliminara permanentemente tu historial postural, perfil ergonomico y configuracion. Esta accion no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleDeleteAll}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                      >
                        Eliminar todo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-5">

              {/* Movimientos permitidos */}
              <Card title="Movimientos permitidos" icon={<Sliders className="w-4 h-4" />}>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-4">
                  Entrena el sistema para reconocer los movimientos cotidianos y no
                  generar falsas alertas. Reduce los falsos positivos del monitor.
                </p>

                <button
                  onClick={() => navigate("/learning-mode")}
                  className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg mb-4 transition-colors bg-[#0033CC] hover:bg-[#0029A3] text-white"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Activar Modo Entrenamiento - 10 minutos
                </button>

                {learned ? (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Diccionario actual ({LEARNED_GESTURES.length} gestos)
                    </div>
                    <div className="space-y-2">
                      {LEARNED_GESTURES.map((g) => (
                        <div key={g.label} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                          g.type === "natural" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                              g.type === "natural" ? "bg-green-500" : "bg-red-500"
                            }`}>
                              {g.type === "natural"
                                ? <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                : <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-xs text-gray-800">{g.label}</span>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            g.type === "natural" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {g.type === "natural" ? "Natural" : "Mala postura"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <SliderRow label="Beber agua (Umbral 40°)" value={50} tag="Normal" />
                    <SliderRow label="Mover lateral (giro 40°)" value={50} tag="Normal" />
                    <SliderRow label="Cabeza-codo (+150° undefined)" value={75} tag="Mas estricto" />
                  </div>
                )}
              </Card>

              {/* Privacidad garantizada */}
              <Card title="Privacidad garantizada" icon={<Shield className="w-4 h-4" />}>
                <div className="space-y-2.5">
                  {[
                    "Procesamiento 100% local",
                    "Solo historial estadistico sincronizado",
                    "Datos corporales anonimizados y eliminados",
                    "Video no capturado ni almacenado",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
                      </div>
                      <span className="text-xs text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-[10px] text-blue-700 leading-relaxed">
                    DERECHITO cumple con GDPR y CCPA. Puedes exportar o eliminar tus datos en cualquier momento desde tu perfil de cuenta.
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-gray-400 text-[11px]">
          <span>&#x25CF; DERECHITO v1.0</span>
          <span>&#x25CF; CPU: {cpu}% - RAM: {ram.usedMB} MB</span>
          <span>&#x25CF; MediaPipe Pose v0.10 - 30 fps</span>
        </div>
        <div className="flex items-center gap-1.5 text-green-500 text-[11px] font-medium">
          <Cloud className="w-3 h-3" /> Sync activo
        </div>
      </div>

      {showLogout && (
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
              <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => navigate("/")} className="flex-1 py-2.5 rounded-xl bg-[#0033CC] hover:bg-[#0029A3] text-white text-sm font-semibold transition-colors">
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
