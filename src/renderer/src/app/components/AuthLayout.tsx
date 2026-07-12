import { Outlet, Link, useLocation } from "react-router-dom";
import { User, Mail, Shield } from "lucide-react";

export function AuthLayout() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo azul */}
      <div className="w-[364px] bg-[#0033CC] text-white p-12 flex flex-col">
        {/* Logo y título */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#3366FF] rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">DERECHITO</div>
            </div>
          </div>
          <div className="text-sm text-white/80 ml-[60px]">Monitor Postural Inteligente</div>
        </div>

        {/* Descripción principal */}
        <div className="mb-12">
          <h1 className="text-[28px] font-bold leading-tight mb-4">
            Tu postura, monitoreada<br />en tiempo real
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Con una cuenta sincronizas tu historial postural en múltiples equipos, recibes reportes semanales por correo y accedes a tus datos desde cualquier lugar.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#3366FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm mb-0.5">Sincronización en la nube</div>
              <div className="text-xs text-white/70">Historial disponible en todos tus equipos</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#3366FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm mb-0.5">Reportes semanales por correo</div>
              <div className="text-xs text-white/70">Evolución postural y estadísticas</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-10 h-10 bg-[#3366FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm mb-0.5">La cámara siempre es local</div>
              <div className="text-xs text-white/70">Solo estadísticas suben a la nube, nunca video</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12">
          <div className="text-xs text-white/50">
            • DERECHITO v1.0 &nbsp;&nbsp;&nbsp; • CPU: 14% - RAM: 812 MB &nbsp;&nbsp;&nbsp; • MediaPipe Pose v0.10 - 30 fps
          </div>
        </div>
      </div>

      {/* Panel derecho blanco */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {/* Header con logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
          <div className="text-[#0033CC] font-bold text-sm">DERECHITO</div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="bg-white rounded-xl p-1.5 inline-flex mb-8 shadow-sm border border-gray-200">
              <Link
                to="/"
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  !isSignup
                    ? "bg-white text-[#0033CC] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/signup"
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isSignup
                    ? "bg-white text-[#00C896] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Crear cuenta
              </Link>
            </div>

            {/* Contenido dinámico */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
