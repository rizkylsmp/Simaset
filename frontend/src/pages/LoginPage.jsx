import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../services/api";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }

      const response = await authService.login(username, password);
      
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-900 px-8 py-8 text-center">
          <div className="w-20 h-20 bg-white rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl font-black text-gray-900">S</span>
          </div>
          <h1 className="text-white font-bold text-xl tracking-wide">SINKRONA</h1>
          <p className="text-gray-400 text-sm mt-1">Sistem Manajemen Aset Tanah</p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          <div className="text-center mb-6">
            <h2 className="text-gray-900 font-semibold text-lg">Selamat Datang</h2>
            <p className="text-gray-500 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                placeholder="Masukkan username"
                className="w-full h-12 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Masukkan password"
                className="w-full h-12 px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                required
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              variant="default"
              className="w-full font-semibold text-sm h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast("Fitur dalam pengembangan!", { icon: "🔧" });
              }}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Lupa password?
            </a>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-gray-50 px-8 py-5 border-t border-gray-100">
          <p className="text-center text-gray-500 text-xs font-semibold mb-3 uppercase tracking-wide">
            Demo Credentials
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-gray-400 transition-colors cursor-pointer"
                 onClick={() => { setUsername("admin"); setPassword("admin123"); }}>
              <div className="font-bold text-gray-900">Admin</div>
              <div className="text-gray-500 text-[10px]">admin123</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-gray-400 transition-colors cursor-pointer"
                 onClick={() => { setUsername("dinas_aset"); setPassword("dinas123"); }}>
              <div className="font-bold text-gray-900">Dinas</div>
              <div className="text-gray-500 text-[10px]">dinas123</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-gray-400 transition-colors cursor-pointer"
                 onClick={() => { setUsername("bpn_user"); setPassword("bpn123"); }}>
              <div className="font-bold text-gray-900">BPN</div>
              <div className="text-gray-500 text-[10px]">bpn123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
