import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud, Clock, Cpu, Monitor, History, Settings,
  RotateCcw, LogOut, User, PlayCircle, Bell, X,
  Trophy, AlertTriangle, Flame, Calendar, Download,
  FileText, FileSpreadsheet, ChevronDown, BarChart3,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { useAppStore } from "../../store/useAppStore";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";

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

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-sm font-bold text-gray-700 mb-1">Sin datos de historial</h3>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        Inicia el monitor postural para comenzar a registrar tu actividad. Los datos aparecerán aquí automáticamente.
      </p>
    </div>
  );
}

/* ─── Notifications Panel (real) ─── */
function NotificationsPanelInline({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useAppStore();

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const getNotifStyle = (type: string) => {
    switch (type) {
      case 'alert': return { border: "border-red-400", bg: "bg-red-50", titleColor: "text-red-600", icon: "⚠️" };
      case 'pause': return { border: "border-yellow-400", bg: "bg-yellow-50", titleColor: "text-yellow-700", icon: "🕐" };
      case 'sync': return { border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600", icon: "☁️" };
      case 'info': return { border: "border-blue-400", bg: "bg-blue-50", titleColor: "text-blue-600", icon: "ℹ️" };
      default: return { border: "border-gray-400", bg: "bg-gray-50", titleColor: "text-gray-600", icon: "📋" };
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "ahora";
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="absolute top-10 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-gray-900 text-sm">Notificaciones</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <div className="text-sm text-gray-400 font-medium">Sin notificaciones</div>
          </div>
        ) : (
          notifications.map((n) => {
            const style = getNotifStyle(n.type);
            return (
              <div key={n.id} className={`flex gap-3 px-4 py-3 border-l-4 ${style.border} ${style.bg}`}>
                <span className="text-base flex-shrink-0 mt-0.5">{style.icon}</span>
                <div className="min-w-0">
                  <div className={`text-xs font-bold mb-0.5 ${style.titleColor}`}>{n.title}</div>
                  <div className="text-xs text-gray-700 leading-snug">{n.body}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{formatTime(n.timestamp)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ─── Day name helper ─── */
const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00'); // avoid timezone issues
  return DAY_NAMES[d.getDay()] || dateStr;
}

/* ─── Main ─── */
export function HistorialPage() {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [range, setRange] = useState<"7" | "30" | "90">("7");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [showExport, setShowExport] = useState(false);
  const [exportMode, setExportMode] = useState<"day" | "range" | null>(null);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const exportRef = useRef<HTMLDivElement>(null);

  const { cpu, ram } = useSystemMetrics();
  const { notifications, sessionStartTime } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Real data from database
  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyLog, setDailyLog] = useState<any[]>([]);
  const [todaySummary, setTodaySummary] = useState<{ pct_correct: number; pct_regular: number; pct_bad: number; total_points: number } | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const userId = 'local';
        const days = parseInt(range);

        const [historyRaw, dailyLogRaw, todayRaw, weeklyRaw] = await Promise.all([
          window.api?.getHistory(userId, days),
          window.api?.getDailyLog(userId, days),
          window.api?.getTodaySummary(userId),
          window.api?.getWeeklyStats(userId),
        ]);

        // Transform history data for chart
        if (historyRaw && historyRaw.length > 0) {
          const transformed = historyRaw.map((row: any) => ({
            day: range === "7" ? getDayName(row.day).slice(0, 3) : row.day.slice(8), // Short day name or day number
            correcta: Math.round(row.pct_correct || 0),
            regular: Math.round(Math.max(0, 100 - (row.pct_correct || 0) - (row.pct_bad || 0))),
            mala: Math.round(row.pct_bad || 0),
          }));
          setChartData(transformed);
        } else {
          setChartData([]);
        }

        // Daily log
        if (dailyLogRaw && dailyLogRaw.length > 0) {
          const transformedLog = dailyLogRaw.map((row: any) => ({
            day: getDayName(row.day),
            pct: Math.round(row.pct_correct || 0),
            time: `${Math.round((row.total_points * 30) / 60)}m`, // Each point = 30s
            points: row.total_points,
          }));
          setDailyLog(transformedLog);
        } else {
          setDailyLog([]);
        }

        // Today summary
        if (todayRaw && todayRaw.total_points > 0) {
          setTodaySummary(todayRaw);
        } else {
          setTodaySummary(null);
        }

        // Weekly stats
        setWeeklyStats(weeklyRaw || null);
      } catch (err) {
        console.error('Error loading history data:', err);
      }
      setLoading(false);
    };

    loadData();
  }, [range]);

  // Elapsed from session start
  useEffect(() => {
    const t = setInterval(() => {
      if (sessionStartTime > 0) {
        setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [sessionStartTime]);

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

  // Build today's posture data for pie chart
  const todayPostureData = todaySummary ? [
    { name: "Correcta", value: Math.round(todaySummary.pct_correct || 0), color: "#22c55e" },
    { name: "Regular", value: Math.round(todaySummary.pct_regular || 0), color: "#f59e0b" },
    { name: "Mala", value: Math.round(todaySummary.pct_bad || 0), color: "#ef4444" },
  ] : [];

  // Build stat cards from real data
  const statCards = [
    {
      label: "SEMANA",
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      value: weeklyStats?.thisWeekAvg != null ? `${weeklyStats.thisWeekAvg}%` : "--",
      sub: weeklyStats?.lastWeekAvg != null 
        ? `${weeklyStats.thisWeekAvg >= weeklyStats.lastWeekAvg ? '+' : ''}${weeklyStats.thisWeekAvg - weeklyStats.lastWeekAvg}% vs semana anterior`
        : "Sin datos previos",
      subColor: weeklyStats?.thisWeekAvg >= (weeklyStats?.lastWeekAvg || 0) ? "text-green-500" : "text-red-400",
    },
    {
      label: "MEJOR DIA",
      icon: <Trophy className="w-4 h-4 text-yellow-400" />,
      value: weeklyStats?.bestDay ? getDayName(weeklyStats.bestDay) : "--",
      sub: weeklyStats?.bestDayScore ? `${weeklyStats.bestDayScore}% postura correcta` : "Sin datos",
      subColor: "text-gray-500",
      valueClass: "text-2xl",
    },
    {
      label: "ALERTAS",
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      value: weeklyStats?.alertsThisWeek?.toString() || "0",
      sub: weeklyStats?.alertsLastWeek != null
        ? `${weeklyStats.alertsThisWeek <= weeklyStats.alertsLastWeek ? '' : '+'}${weeklyStats.alertsThisWeek - weeklyStats.alertsLastWeek} vs semana anterior`
        : "Sin datos previos",
      subColor: weeklyStats?.alertsThisWeek <= (weeklyStats?.alertsLastWeek || 0) ? "text-green-500" : "text-red-400",
    },
    {
      label: "DIAS ACTIVOS",
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      value: weeklyStats?.activeDays ? `${weeklyStats.activeDays} dias` : "0 dias",
      sub: weeklyStats?.activeDays >= 5 ? "¡Gran constancia! 🔥" : "Sigue así 💪",
      subColor: "text-orange-400",
      valueClass: "text-2xl",
    },
  ];

  const hasData = chartData.length > 0 || dailyLog.length > 0;

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
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold pointer-events-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
            {showNotifications && (
              <NotificationsPanelInline onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <Sidebar elapsed={elapsed} activeNav="/historial" onNavigate={navigate} onLogout={() => setShowLogout(true)} />

        <main className="flex-1 overflow-auto p-6">
          <h1 className="text-lg font-bold text-gray-900 mb-5">Historial Postural</h1>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-3 border-[#0033CC] border-t-transparent rounded-full" />
            </div>
          ) : !hasData ? (
            <EmptyState />
          ) : (
            <>
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
              {chartData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Historial de postura</div>
                      <div className="flex items-center gap-1.5 text-[11px] text-green-600 font-medium mt-0.5">
                        <Cloud className="w-3 h-3" /> Datos reales de tu sesión
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
                      <BarChart data={chartData} margin={{ top: 20, right: 4, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: any, name: string | number | undefined) => {
                            const label = typeof name === "string" ? name : "Postura";
                            return [`${value}%`, label.charAt(0).toUpperCase() + label.slice(1)];
                          }}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                          cursor={{ fill: "#f3f4f6" }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="correcta" name="Correcta" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="regular" name="Regular" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="mala" name="Mala" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Today summary (pie chart) + Daily log side by side */}
              <div className="flex gap-5 mb-5">
                {/* Resumen de hoy (Pie Chart) */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 flex-1">
                  <div className="font-semibold text-gray-900 text-sm mb-4">Resumen de Hoy</div>
                  {todaySummary ? (
                    <>
                      <div className="h-36 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={todayPostureData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                              stroke="none"
                            >
                              {todayPostureData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [`${value}%`]}
                              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">{Math.round(todaySummary.pct_correct || 0)}%</div>
                            <div className="text-[10px] text-gray-500 font-medium leading-none">Correcto</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-3">
                        {todayPostureData.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-gray-600">{entry.name} ({entry.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-36 text-center">
                      <div className="text-sm text-gray-400 font-medium">Sin datos de hoy</div>
                      <div className="text-xs text-gray-300 mt-1">Usa el monitor para generar datos</div>
                    </div>
                  )}
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
                {dailyLog.length > 0 ? (
                  <div className="space-y-3">
                    {dailyLog.map(({ day, pct, time }) => (
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-sm text-gray-400">Sin registros diarios</div>
                  </div>
                )}
              </div>
            </>
          )}
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
