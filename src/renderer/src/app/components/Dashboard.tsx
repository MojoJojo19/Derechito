import { useNavigate } from "react-router-dom";
import { Cloud, Settings, CheckCircle, Cpu, Camera } from "lucide-react";

interface DashboardProps {
  userName?: string;
}

export function Dashboard({ userName = "Demo" }: DashboardProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0033CC] via-[#0044EE] to-[#1a5fff] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
          </div>
          <span className="text-white font-bold text-sm tracking-widest">DERECHITO</span>
        </div>
        <button className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-medium px-4 py-2 rounded-full border border-white/20">
          <Cloud className="w-3.5 h-3.5" />
          Sincronización
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#0033CC]">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-white text-3xl font-bold mb-3">
          ¡Hola, {userName}! 👋
        </h1>
        <p className="text-white/70 text-sm max-w-sm leading-relaxed mb-10">
          Antes de comenzar el monitoreo reconocemos la postura ergonómica correcta en tu
          postura de referencia. Solo toma 30 segundos.
        </p>

        {/* Stats row */}
        <div className="flex gap-4 mb-10">
          <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1 justify-center">
              <Cpu className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Motor de IA</span>
            </div>
            <div className="text-white font-bold text-sm">MediaPipe</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1 justify-center">
              <CheckCircle className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Privacidad local</span>
            </div>
            <div className="text-white font-bold text-sm">100%</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1 justify-center">
              <Camera className="w-4 h-4 text-white/70" />
              <span className="text-white/70 text-xs">Análisis fluido</span>
            </div>
            <div className="text-white font-bold text-sm">30 fps</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate("/calibration")}
            className="flex items-center justify-center gap-2 bg-white text-[#0033CC] font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-white/95 transition-colors shadow-lg"
          >
            <Settings className="w-4 h-4" />
            Configurar mi perfil
          </button>
          <button className="flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white font-medium text-sm px-6 py-3.5 rounded-xl hover:bg-white/10 transition-colors">
            Ya tengo perfil configurado
          </button>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-white/10">
        <div className="flex items-center gap-4 text-white/40 text-[11px]">
          <span>● DERECHITO v1.0</span>
          <span>● CPU: 14% - RAM: 812 MB</span>
          <span>● MediaPipe Pose v0.10 - 30 fps</span>
        </div>
        <div className="text-white/40 text-[11px]">
          demo@derechito.app
        </div>
      </div>
    </div>
  );
}
