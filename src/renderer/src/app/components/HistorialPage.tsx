import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud, Clock, Cpu, Monitor, History, Settings,
  RotateCcw, LogOut, User, PlayCircle, Bell, X,
  Trophy, AlertTriangle, Flame, Calendar, Download,
  FileText, FileSpreadsheet, ChevronDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Sidebar shared shell ─── */
function Sidebar({
  elapsed,
  activeNav,
  onNavigate,
  onLogout,
}: {
  elapsed: number;
  activeNav: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const navItems = [
    { label: "Monitor", icon: <Monitor className="w-4 h-4" />, path: "/monitor" },
    { label: "Historial", icon: <History className="w-4 h-4" />, path: "/historial" },
    { label: "Configuracion", icon: <Settings className="w-4 h-4" />, path: "/config" },
  ];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#0033CC] rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-xs leading-tight">DERECHITO</div>
            <div className="text-[10px] text-gray-500">Monitor Postural IA</div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-semibold mb-0.5">
            <Cloud className="w-3 h-3" />
            Sincronizado
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
            <button
              key={path}
              onClick={() => onNavigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeNav === path
                  ? "bg-[#0033CC] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Sesion</div>
        <div className="space-y-0.5">
          <button
            onClick={() => onNavigate("/monitor")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
          >
            <PlayCircle className="w-4 h-4" /> Reanudar monitor
          </button>
          <button
            onClick={() => onNavigate("/calibration")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Recalibrar
          </button>
          <button
            onClick={onLogout}
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
  );
}

/* ─── Chart data ─── */
const weekData = [
  { day: "Lun", pct: 79 },
  { day: "Mar", pct: 83 },
  { day: "Mie", pct: 80 },
  { day: "Jue", pct: 88 },
  { day: "Vie", pct: 85 },
  { day: "Sab", pct: 84 },
  { day: "Dom", pct: 91 },
];

const monthData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  pct: 70 + Math.round(Math.sin(i / 3) * 10 + Math.random() * 8),
}));

const quarterData = Array.from({ length: 12 }, (_, i) => ({
  day: `S${i + 1}`,
  pct: 68 + Math.round(i * 1.5 + Math.random() * 6),
}));

const fatigueData = [
  { day: "L", buena: 5, regular: 2, mala: 1 },
  { day: "M", buena: 6, regular: 1, mala: 0.5 },
  { day: "X", buena: 4, regular: 2, mala: 2 },
  { day: "J", buena: 7, regular: 1, mala: 0 },
  { day: "V", buena: 5, regular: 3, mala: 1 },
  { day: "S", buena: 3, regular: 1, mala: 0 },
  { day: "D", buena: 2, regular: 0.5, mala: 0 },
];

const dailyLog = [
  { day: "Domingo",  pct: 94, time: "2h 15m", alerts: 1 },
  { day: "Sabado",   pct: 91, time: "4h 20m", alerts: 1 },
  { day: "Viernes",  pct: 88, time: "7h 00m", alerts: 3 },
  { day: "Jueves",   pct: 93, time: "8h 10m", alerts: 2 },
  { day: "Miercoles",pct: 80, time: "6h 45m", alerts: 4 },
  { day: "Martes",   pct: 95, time: "7h 30m", alerts: 1 },
];

/* ─── Main ─── */
const NOTIFICATIONS = [
  { id: 1, icon: "&#9888;", title: "Alerta postural", body: "Desviacion cervical de 22° durante 45 segundos", time: "hace 12 min", border: "border-red-400", bg: "bg-red-50", titleColor: "text-red-600" },
  { id: 2, icon: "&#128336;", title: "Pausa activa", body: "Llevas 2 h continuas. Es momento de descansar.", time: "hace 45 min", border: "border-yellow-400", bg: "bg-yellow-50", titleColor: "text-yellow-700" },
  { id: 3, icon: "&#9729;", title: "Sincronizacion completada", body: "Historial de hoy sincronizado correctamente con tu cuenta.", time: "hace 2 min", border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600" },
  { id: 4, icon: "&#128202;", title: "Reporte semanal enviado", body: "Tu postura mejoro un 8% esta semana. Revisa tu correo.", time: "hoy 8:00 AM", border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600" },
];

export function HistorialPage() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(10640);
  const [range, setRange] = useState<"7" | "30" | "90">("7");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportMode, setExportMode] = useState<"day" | "range" | null>(null);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showExport) return;
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
        setExportMode(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExport]);

  const handleExport = (format: "pdf" | "excel") => {
    const label = format === "pdf" ? "PDF" : "Excel";
    const dateInfo = exportMode === "day"
      ? exportFrom || "hoy"
      : `${exportFrom || "inicio"} al ${exportTo || "hoy"}`;
    alert(`Exportando ${label} — ${dateInfo}\n(En produccion esto generaria el archivo real)`);
    setShowExport(false);
    setExportMode(null);
  };

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

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

  const chartData = range === "7" ? weekData : range === "30" ? monthData : quarterData;

  const statCards = [
    {
      label: "SEMANA",
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      value: "84%",
      sub: "+8% vs semana anterior",
      subColor: "text-green-500",
    },
    {
      label: "MEJOR DIA",
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      value: "Martes",
      sub: "93% postura correcta",
      subColor: "text-gray-500",
      valueClass: "text-2xl",
    },
    {
      label: "ALERTAS",
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      value: "17",
      sub: "-5 vs semana anterior",
      subColor: "text-red-400",
    },
    {
      label: "RACHA",
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      value: "5 dias",
      sub: "Mejora continua 🔥",
      subColor: "text-orange-400",
      valueClass: "text-2xl",
    },
  ];

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
            <Cpu className="w-3 h-3 text-gray-500" /> CPU: 14%
          </div>
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
        <Sidebar elapsed={elapsed} activeNav="/historial" onNavigate={navigate} onLogout={() => setShowLogout(true)} />

        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-5">Historial Postural</h1>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {statCards.map(({ label, icon, value, sub, subColor, valueClass }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                  {icon}
                </div>
                <div className={`font-bold text-gray-900 mb-1 ${valueClass ?? "text-3xl"}`}>{value}</div>
                <div className={`text-[11px] font-medium ${subColor}`}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Posture history chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="font-semibold text-gray-900 text-sm">Historial de postura</div>
                <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium mt-0.5">
                  <Cloud className="w-3 h-3" /> Sincronizado con tu cuenta
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {(["7", "30", "90"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {r} dias
                  </button>
                ))}
              </div>
            </div>

            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0033CC" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0033CC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "Postura correcta"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  />
                  <Area
                    type="monotone" dataKey="pct"
                    stroke="#0033CC" strokeWidth={2.5}
                    fill="url(#blueGrad)"
                    dot={{ r: 4, fill: "#0033CC", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fatigue map + Daily log side by side */}
          <div className="flex gap-5 mb-5">
            {/* Fatigue heatmap */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
              <div className="font-semibold text-gray-900 text-sm mb-4">Mapa de fatiga — semana</div>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fatigueData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Area type="monotone" dataKey="buena" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="regular" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="mala" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-3">
                {[
                  { color: "bg-green-500", label: "Buena" },
                  { color: "bg-amber-400", label: "Regular" },
                  { color: "bg-red-500", label: "Mala" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-900 text-sm">Registro diario</div>
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => { setShowExport((v) => !v); setExportMode(null); }}
                  className="flex items-center gap-2 bg-[#0033CC] hover:bg-[#0029A3] transition-colors text-white text-xs font-medium px-3 py-2 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar por fecha
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showExport && (
                  <div className="absolute right-0 top-9 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Format + range selector */}
                    {!exportMode && (
                      <div className="p-3">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Rango</div>
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setExportMode("day")}
                            className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-[#0033CC] hover:text-[#0033CC] transition-colors"
                          >
                            Por dia
                          </button>
                          <button
                            onClick={() => setExportMode("range")}
                            className="flex-1 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-[#0033CC] hover:text-[#0033CC] transition-colors"
                          >
                            Por intervalo
                          </button>
                        </div>
                      </div>
                    )}

                    {exportMode && (
                      <div className="p-3">
                        <button
                          onClick={() => setExportMode(null)}
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mb-3"
                        >
                          &#8592; Volver
                        </button>
                        <div className="space-y-2 mb-3">
                          <div>
                            <label className="text-[10px] font-medium text-gray-500 block mb-1">
                              {exportMode === "day" ? "Fecha" : "Desde"}
                            </label>
                            <input
                              type="date"
                              value={exportFrom}
                              onChange={(e) => setExportFrom(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0033CC]"
                            />
                          </div>
                          {exportMode === "range" && (
                            <div>
                              <label className="text-[10px] font-medium text-gray-500 block mb-1">Hasta</label>
                              <input
                                type="date"
                                value={exportTo}
                                onChange={(e) => setExportTo(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0033CC]"
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Formato</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleExport("pdf")}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors text-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </button>
                          <button
                            onClick={() => handleExport("excel")}
                            className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors text-xs font-semibold"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {dailyLog.map(({ day, pct, time, alerts }) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-20 text-xs font-medium text-gray-700 flex-shrink-0">{day}</div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 90 ? "bg-green-500" : pct >= 80 ? "bg-blue-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-10 text-xs font-bold text-gray-900 text-right">{pct}%</div>
                  <div className="w-14 text-xs text-gray-500 text-right">{time}</div>
                  <div className={`w-16 text-xs font-medium text-right ${alerts >= 3 ? "text-red-500" : "text-orange-400"}`}>
                    {alerts} alerta{alerts !== 1 ? "s" : ""}
                  </div>
                  <button className="text-gray-400 hover:text-[#0033CC] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 flex items-center justify-between px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-4 text-gray-400 text-[11px]">
          <span>&#x25CF; DERECHITO v1.0</span>
          <span>&#x25CF; CPU: 14% - RAM: 812 MB</span>
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
