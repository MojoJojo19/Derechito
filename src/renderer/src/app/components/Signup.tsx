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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta</h2>
      <p className="text-sm text-gray-600 mb-8">Lleva tu historial postural a cualquier dispositivo.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="Luis"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="González"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-600"
              placeholder="tu@correo.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-600"
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

        {/* Info blocks */}
        <div className="space-y-3">
          {/* Privacy info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-[#0033CC] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="text-gray-700">La cámara y el procesamiento ocurren </span>
                <span className="font-semibold text-[#0033CC]">100% localmente</span>
                <span className="text-gray-700"> en tu PC. Ningún video se envía a la nube.</span>
              </div>
            </div>
          </div>

          {/* Learning phase info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-green-800">Fase de Aprendizaje: </span>
                <span className="text-gray-700">Inmediatamente después de registrarte, el asistente de calibración tomará </span>
                <span className="font-semibold text-green-700">3 segundos</span>
                <span className="text-gray-700"> para escanear y aprender tus medidas ergonómicas ideales.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#0033CC] text-white py-3.5 rounded-lg font-medium hover:bg-[#0029A3] transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Crear cuenta y continuar
        </button>
      </form>
    </div>
  );
}
