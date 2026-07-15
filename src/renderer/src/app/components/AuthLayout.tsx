import { Outlet, Link, useLocation } from "react-router-dom";
import logoImg from "../../imports/Gemini_Generated_Image_7k82167k82167k82.png";
import leftPanelImg from "../../imports/WhatsApp_Image_2026-07-14_at_11.44.44_PM__1_.jpeg";

export function AuthLayout() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="h-screen flex overflow-hidden">


      {/* ── Panel izquierdo ── */}
      <div className="hidden md:flex w-[420px] flex-shrink-0 relative overflow-hidden">
        <img
          src={leftPanelImg}
          alt="Tu postura monitoreada en tiempo real"
          className="w-full h-full object-contain object-center"
          style={{ background: "linear-gradient(160deg, #0033CC 0%, #001a7a 100%)" }}
        />
      </div>

      {/* ── Panel derecho ── */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-4 min-h-0">

        {/* Logo compacto */}
        <div className="flex flex-col items-center mb-3 flex-shrink-0">
          <img
            src={logoImg}
            alt="Derechito — monitor postural inteligente"
            className="w-40 h-40 object-contain drop-shadow-sm"
          />
          <span className="text-[#0033CC] font-extrabold text-2xl tracking-widest uppercase mt-1">
            DERECHITO
          </span>
          <span className="text-gray-400 text-[11px] font-medium mt-0.5 tracking-wide">Monitor Postural Inteligente</span>
        </div>

        <div className="w-full max-w-sm flex-shrink-0">

          {/* Tabs */}
          <div className="bg-white rounded-xl p-1 flex mb-4 shadow-sm border border-gray-200">
            <Link
              to="/"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                !isSignup
                  ? "bg-[#0033CC] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/signup"
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                isSignup
                  ? "bg-[#0033CC] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
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
  );
}
