import { Outlet, Link, useLocation } from "react-router-dom";
import logoImg from "../../imports/Gemini_Generated_Image_7k82167k82167k82.png";
import leftPanelImg from "../../imports/WhatsApp_Image_2026-07-14_at_11.44.44_PM__1_.jpeg";

export function AuthLayout() {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo ── */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 relative overflow-hidden">
        <img
          src={leftPanelImg}
          alt="Tu postura monitoreada en tiempo real"
          className="w-full h-full object-contain object-center"
          style={{ background: "linear-gradient(160deg, #0033CC 0%, #001a7a 100%)" }}
        />
      </div>

      {/* ── Panel derecho ── */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8">

        {/* Logo grande — ocupa la parte superior */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoImg}
            alt="Derechito — monitor postural inteligente"
            className="w-72 h-72 object-contain drop-shadow-sm"
          />
          <span className="text-[#0033CC] font-extrabold text-3xl tracking-widest uppercase mt-2">
            DERECHITO
          </span>
          <span className="text-gray-400 text-xs font-medium mt-1 tracking-wide">Monitor Postural Inteligente</span>
        </div>

        <div className="w-full max-w-sm">

          {/* Tabs */}
          <div className="bg-white rounded-xl p-1.5 flex mb-6 shadow-sm border border-gray-200">
            <Link
              to="/"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                !isSignup
                  ? "bg-[#0033CC] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/signup"
              className={`flex-1 text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
