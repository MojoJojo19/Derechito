import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("demo@derechito.app");
  const [password, setPassword] = useState("********");
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/monitor");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido de vuelta</h2>
      <p className="text-sm text-gray-600 mb-8">Ingresa tus credenciales para continuar.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="demo@derechito.app"
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
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033CC] focus:border-transparent bg-white text-gray-900"
              placeholder="••••••••"
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

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0033CC] focus:ring-[#0033CC]"
            />
            <span className="text-sm text-gray-700">Mantener sesión iniciada</span>
          </label>
          <a href="#" className="text-sm text-[#0033CC] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-[#0033CC] text-white py-3.5 rounded-lg font-medium hover:bg-[#0029A3] transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
