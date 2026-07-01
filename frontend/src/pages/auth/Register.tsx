import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { UserAuthService } from "../../service/auth/auth.user";
import { useNavigate } from "react-router-dom";


const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate()
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await UserAuthService.register({ name, email, password });
      setSuccess(res.message || "Registration successful!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const gotoLogin =()=>{
    navigate("/login")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5A0F3D] p-4">
      <div className="grid max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl md:grid-cols-2">
        {/* Left decorative panel */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 relative p-8">
          {/* Decorative shapes */}
          <div className="absolute top-4 left-4 w-24 h-24 bg-pink-300 rounded-full opacity-30 mix-blend-screen" />
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-purple-300 rounded-full opacity-30 mix-blend-screen" />
          <h1 className="relative text-4xl font-bold text-white tracking-wider mb-2">REGISTER</h1>
          <p className="relative text-sm text-white/80">Create your account</p>
        </div>
        {/* Right form panel */}
        <div className="flex flex-col items-center justify-center p-8">
          {/* Profile icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <FaUser className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-6">REGISTER</h2>

          {/* Status messages */}
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
            {/* Full Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              />
            </div>
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
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {/* Sign Up button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-pink-400 to-pink-600 text-white rounded-full font-medium hover:scale-105 transform transition disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? "SIGNING UP..." : "SIGN UP"}
            </button>
          </form>
          <p className="mt-4 text-sm text-white/80">
            Already have an account? <span onClick={gotoLogin} className="text-pink-300 hover:underline cursor-pointer">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
