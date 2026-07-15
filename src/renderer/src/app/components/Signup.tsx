import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, UserPlus, Shield } from "lucide-react";

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("Luis");
  const [lastName, setLastName] = useState("González");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/calibration", { state: { from: "signup" } });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Crea tu cuenta</h2>
      <p className="text-sm text-gray-600 mb-4">Lleva tu historial postural a cualquier dispositivo.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="Luis"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="González"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-600"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-600"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Privacy info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex gap-2">
            <Shield className="w-4 h-4 text-[#0033CC] flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-gray-700">La cámara y el procesamiento ocurren </span>
              <span className="font-semibold text-[#0033CC]">100% localmente</span>
              <span className="text-gray-700"> en tu PC. Solo tu historial estadístico se sincroniza con la nube.</span>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#0033CC] text-white py-3 rounded-lg font-medium hover:bg-[#0029A3] transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Crear cuenta y continuar
        </button>
      </form>
    </div>
  );
}

