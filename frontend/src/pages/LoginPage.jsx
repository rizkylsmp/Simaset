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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border-2 border-black shadow-lg p-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 border-2 border-black flex items-center justify-center bg-white">
            <span className="text-sm font-bold text-black">LOGO</span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-2 border-2 border-black p-4">
          <h1 className="text-center font-bold text-gray-900 text-base">
            SISTEM MANAJEMEN ASET TANAH
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-6 border-2 border-black p-3">
          <p className="text-center text-gray-800 text-sm">
            Sekolah Tinggi Pertanahan Nasional
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 border-2 border-red-600 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <div className="border-2 border-black p-2">
              <Label htmlFor="username" className="text-xs">
                Username
              </Label>
            </div>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="[Input Username]"
              className="w-full text-xs"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="border-2 border-black p-2">
              <Label htmlFor="password" className="text-xs">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="[Input Password] [●]"
              className="w-full text-xs"
              required
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="w-full mt-6 font-bold text-sm h-12 rounded-none"
          >
            {loading ? "LOGGING IN..." : "[BUTTON] LOGIN"}
          </Button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 border-2 border-black p-3 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              toast("Coming soon!", { icon: "⏱️" });
            }}
            className="text-orange-600 hover:text-orange-800 font-semibold text-xs"
          >
            [Link] Lupa Password?
          </a>
        </div>

        {/* Demo Credentials */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 pt-4 border-t-2 border-gray-300">
            <p className="text-center text-gray-600 text-xs font-bold mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 bg-gray-50 p-2 text-xs">
              <div className="border border-gray-300 p-1">
                <strong>Admin:</strong> admin / admin123
              </div>
              <div className="border border-gray-300 p-1">
                <strong>Dinas:</strong> dinas_aset / dinas123
              </div>
              <div className="border border-gray-300 p-1">
                <strong>BPN:</strong> bpn_user / bpn123
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
