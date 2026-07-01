import React, { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { UserAuthService } from "../../service/auth/auth.user";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/auth/authSlice";


const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const togglePasswordVisibility = () =>
    setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await UserAuthService.login({ email, password });

      // Store access token + user in Redux; refresh token is in the httpOnly cookie
      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: {
              id: res.data.user.id,
              name: res.data.user.name,
              email: res.data.user.email,
            },
            accessToken: res.data.accessToken,
          }),
        );
      }

      setSuccess(res.message || "Login successful!");
      navigate("/home");

      // Clear form
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5A0F3D] p-4">
      <div className="grid max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl md:grid-cols-2">

        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 relative p-8">
          <div className="absolute top-4 left-4 w-24 h-24 bg-pink-300 rounded-full opacity-30 mix-blend-screen" />
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-purple-300 rounded-full opacity-30 mix-blend-screen" />

          <h1 className="relative text-4xl font-bold text-white tracking-wider mb-2">
            LOGIN
          </h1>
          <p className="relative text-sm text-white/80">
            Welcome back
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col items-center justify-center p-8">

          {/* Profile icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <FaUser className="text-white text-2xl" />
          </div>

          <h2 className="text-3xl font-semibold text-white mb-6">
            LOGIN
          </h2>

          {/* Messages */}
          {error && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full mb-4 p-3 rounded-lg bg-green-500/20 border border-green-400/40 text-green-200 text-sm text-center">
              {success}
            </div>
          )}

          <form className="w-full space-y-4" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full font-medium hover:scale-105 transform transition disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>

          <p className="mt-4 text-sm text-white/80">
            Don’t have an account?{" "}
            <span className="text-pink-300 hover:underline cursor-pointer">
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;