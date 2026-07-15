import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Cloud, Clock, Cpu, Monitor, History, Settings,
  RotateCcw, LogOut, User, PlayCircle, Bell,
  Check, X, Shield, Sliders, RefreshCw, Download,
  Trash2, ChevronRight, ChevronDown, Zap, Target, Edit2, Eye, EyeOff,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { toast } from "sonner";

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
  const { userProfile } = useAppStore();
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
          <div className="w-8 h-8 bg-[#0033CC] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {userProfile.name.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">{userProfile.name}</div>
            <div className="text-[10px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">{userProfile.email}</div>
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

/* ─── Input field ─── */
function FieldRow({ label, value, type = "text", onChange }: { label: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#0033CC] focus:border-[#0033CC]"
      />
    </div>
  );
}

/* ─── Main ─── */
export function ConfiguracionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const learned = searchParams.get("learned") === "true";
  const [elapsed, setElapsed] = useState(0);
  const [syncHistory, setSyncHistory] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [visualAlerts, setVisualAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [activeBreaks, setActiveBreaks] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [precisionOpen, setPrecisionOpen] = useState(true);
  const [showRigorousConfirm, setShowRigorousConfirm] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { baselineProfile, sessionStartTime, userProfile, setUserProfile, alertMode, setAlertMode, eyeDetectionEnabled, setEyeDetectionEnabled, eyeSuspendThreshold, setEyeSuspendThreshold } = useAppStore();
  const { cpu } = useSystemMetrics();

  // Local state for profile edits
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);

  const handleSaveProfile = () => {
    if (!editName.trim() || !editEmail.trim()) {
      toast.error("El nombre y correo no pueden estar vacíos");
      return;
    }
    setUserProfile({ name: editName.trim(), email: editEmail.trim() });
    toast.success("Perfil actualizado correctamente");
  };

  const applyMode = (mode: string) => {
    if (mode === "riguroso") {
      setAlertMode("rigorous");
      toast.success("Modo Riguroso activado");
    }
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
    const updateElapsed = () => {
      if (sessionStartTime) {
        setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
      }
    };
    updateElapsed();
    const t = setInterval(updateElapsed, 1000);
    return () => clearInterval(t);
  }, [sessionStartTime]);

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col text-sm overflow-hidden">

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
          <h1 className="text-lg font-bold text-gray-900 mb-5">Ajustes</h1>

          <div className="grid grid-cols-2 gap-5">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-5">

              {/* Tu cuenta */}
              <Card title="Tu cuenta" icon={<Cloud className="w-4 h-4" />}>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#0033CC] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {userProfile.name.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{userProfile.name}</div>
                      <div className="text-[10px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">{userProfile.email}</div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Conectado
                  </span>
                </div>
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-700">Frecuencia de sincronizacion</span>
                  <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0033CC]">
                    <option>Cada 5 minutos</option>
                    <option>Cada 15 minutos</option>
                    <option>Cada hora</option>
                  </select>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Ultima sincronizacion: hace 14:32</span>
                  <span className="text-[10px] font-semibold text-[#0033CC]">4748 transferidos</span>
                </div>
              </Card>

              {/* Datos personales */}
              <Card title="Tus datos personales" icon={<Edit2 className="w-4 h-4" />}>
                <FieldRow label="Nombre completo" value={editName} onChange={setEditName} />
                <FieldRow label="Correo electronico" value={editEmail} type="email" onChange={setEditEmail} />
                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label="Contrasena" value="" type="password" onChange={() => {}} />
                  <FieldRow label="Confirmar contrasena" value="" type="password" onChange={() => {}} />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  className="w-full mt-1 flex items-center justify-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-xs font-semibold py-2.5 rounded-lg"
                >
                  Guardar cambios
                </button>
              </Card>

              {/* Características físicas */}
              <Card title="Caracteristicas fisicas" icon={<User className="w-4 h-4" />}>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  Esta informacion ayuda a calibrar mejor el sistema para tu cuerpo y detectar posturas con mayor precision.
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <FieldRow label="Altura (cm)" value="170" type="number" onChange={() => {}} />
                  <FieldRow label="Peso (kg)" value="70" type="number" onChange={() => {}} />
                  <FieldRow label="Edad" value="28" type="number" onChange={() => {}} />
                </div>
                <div className="mb-3">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Actividad fisica habitual</label>
                  <select className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-[#0033CC]">
                    <option>Sedentario (trabajo de escritorio)</option>
                    <option>Ligera (caminatas ocasionales)</option>
                    <option>Moderada (ejercicio 3 veces por semana)</option>
                    <option>Activo (ejercicio diario)</option>
                  </select>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-xs font-semibold py-2.5 rounded-lg">
                  Actualizar perfil fisico
                </button>
              </Card>

              {/* Modo de monitoreo */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-[#0033CC]">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">Modo de monitoreo</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  Elige con que nivel de exigencia quieres que el sistema controle tu postura.
                </p>
                <div className="flex gap-3">
                  {/* Modo Estándar */}
                  <button
                    onClick={() => { setAlertMode("standard"); toast.success("Modo Estándar activado"); }}
                    className={`flex-1 rounded-xl p-4 border-2 text-left transition-all ${
                      alertMode === "standard"
                        ? "border-[#0033CC] bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        alertMode === "standard" ? "border-[#0033CC] bg-[#0033CC]" : "border-gray-300"
                      }`}>
                        {alertMode === "standard" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-bold ${alertMode === "standard" ? "text-[#0033CC]" : "text-gray-700"}`}>
                        Modo Estandar
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Monitoreo relajado. Recibiras alertas solo cuando la postura sea notablemente mala durante 15s.
                    </p>
                  </button>

                  {/* Modo Riguroso */}
                  <button
                    onClick={() => { setShowRigorousConfirm(true); }}
                    className={`flex-1 rounded-xl p-4 border-2 text-left transition-all ${
                      alertMode === "rigorous"
                        ? "border-[#7c3aed] bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        alertMode === "rigorous" ? "border-[#7c3aed] bg-[#7c3aed]" : "border-gray-300"
                      }`}>
                        {alertMode === "rigorous" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-bold ${alertMode === "rigorous" ? "text-[#7c3aed]" : "text-gray-700"}`}>
                        Modo Riguroso
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Deteccion estricta. El sistema avisa ante cualquier encorvamiento en solo 5s.
                    </p>
                  </button>
                </div>
              </div>

              {/* Detección de ojos */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">Deteccion de ojos</span>
                </div>
                <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
                  Si el sistema detecta que tus ojos estan cerrados por mucho tiempo (posiblemente dormido), suspendera automaticamente el equipo para ahorrar energia.
                </p>

                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {eyeDetectionEnabled ? <Eye className="w-4 h-4 text-purple-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    <div>
                      <div className="text-xs font-semibold text-gray-800">Suspension automatica</div>
                      <div className="text-[10px] text-gray-500">Suspender PC si detecta ojos cerrados</div>
                    </div>
                  </div>
                  <Toggle value={eyeDetectionEnabled} onChange={(v) => { setEyeDetectionEnabled(v); toast.success(v ? 'Detección de ojos activada' : 'Detección de ojos desactivada'); }} />
                </div>

                {eyeDetectionEnabled && (
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Umbral de tiempo (segundos con ojos cerrados)</label>
                    <select
                      value={eyeSuspendThreshold}
                      onChange={(e) => { setEyeSuspendThreshold(Number(e.target.value)); toast.success(`Umbral cambiado a ${e.target.value}s`); }}
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value={10}>10 segundos — Muy sensible</option>
                      <option value={15}>15 segundos — Recomendado</option>
                      <option value={20}>20 segundos — Moderado</option>
                      <option value={30}>30 segundos — Relajado</option>
                    </select>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                      Si tus ojos permanecen cerrados por {eyeSuspendThreshold} segundos consecutivos, el equipo se suspendera automaticamente.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-5">

              {/* Optimizar Precisión — collapsible group */}
              <div className="bg-white rounded-xl border-2 border-indigo-100 overflow-hidden">
                <button
                  onClick={() => setPrecisionOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#0033CC] to-[#7c3aed] rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Optimizar Precision</div>
                      <div className="text-[10px] text-gray-500">Calibra y entrena el sistema para tu cuerpo</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${precisionOpen ? "rotate-180" : ""}`} />
                </button>

                {precisionOpen && (
                  <div className="p-4 flex flex-col gap-4 bg-gray-50/50">

                    {/* Tu configuración de postura */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center text-[#0033CC]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xs">Tu configuracion de postura</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 mb-3 text-xs text-blue-800 space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estado</span>
                          <span className="font-semibold">{baselineProfile ? "Configurado" : "Predeterminado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alineacion de cabeza</span>
                          <span className="font-semibold">{baselineProfile ? "Personalizada" : "Estandar"}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/calibration")}
                        className="w-full flex items-center justify-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-xs font-semibold py-2 rounded-lg"
                      >
                        <RefreshCw className="w-3 h-3" /> Recalibrar perfil
                      </button>
                    </div>

                    {/* Reconocimiento de movimientos */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center text-[#7c3aed]">
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xs">Reconocimiento de movimientos</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed mb-1">
                        Entrena el sistema para reconocer los movimientos cotidianos y no
                        generar falsas alertas. Reduce los falsos positivos del monitor.
                      </p>
                      
                      {learned && (
                        <div className="mb-3 mt-3">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Movimientos aprendidos ({LEARNED_GESTURES.length})
                          </div>
                          <div className="space-y-1.5">
                            {LEARNED_GESTURES.map((g) => (
                              <div key={g.label} className={`flex items-center justify-between p-2 rounded-lg border ${
                                g.type === "natural" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                              }`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    g.type === "natural" ? "bg-green-500" : "bg-red-500"
                                  }`}>
                                    {g.type === "natural"
                                      ? <Check className="w-2 h-2 text-white" strokeWidth={3} />
                                      : <X className="w-2 h-2 text-white" strokeWidth={3} />}
                                  </div>
                                  <span className="text-[11px] text-gray-800">{g.label}</span>
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
                      )}

                      <button
                        onClick={() => navigate("/learning-mode")}
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 mt-3 rounded-lg transition-colors bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
                      >
                        <Monitor className="w-3 h-3" />
                        {learned ? "Repetir Modo Aprendizaje" : "Activar Modo Aprendizaje"}
                      </button>
                    </div>

                  </div>
                )}
              </div>

              {/* Privacidad garantizada */}
              <Card title="Tus datos estan protegidos" icon={<Shield className="w-4 h-4" />}>
                <div className="flex gap-3 text-gray-500">
                  <Shield className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div className="text-[11px] leading-relaxed">
                    Todo el analisis postural se realiza localmente en tu equipo usando inteligencia artificial optimizada. 
                    <strong className="text-gray-700"> Ningun video ni imagen es enviado a la nube.</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {showRigorousConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-84 mx-4" style={{ maxWidth: "360px" }}>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 text-center mb-2">Activar Modo Riguroso</h3>
            <p className="text-xs text-gray-600 text-center leading-relaxed mb-3">
              En este modo, <strong>la pantalla se bloqueara</strong> cada vez que recibas una alerta o ejercicio de estiramiento, hasta que lo completes.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>Ten en cuenta:</strong> este modo puede interrumpirte en medio de un proceso critico que estes realizando en otro programa (como una videollamada, una presentacion o un archivo sin guardar).
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRigorousConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { applyMode("riguroso"); setShowRigorousConfirm(false); }}
                className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-semibold transition-colors"
              >
                Activar de todas formas
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 mx-4">
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Cerrar sesion</h3>
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-5">
              ¿Estas seguro que deseas salir? El monitoreo postural se pausara.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => navigate("/")} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Cerrar sesion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
