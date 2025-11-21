"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user) {
        setStoredUser(user);
        toast.success("Login successful!");
        
        // Redirect based on role
        if (user.role === "patient") {
          router.push("/patient-dashboard");
        } else if (user.role === "doctor") {
          router.push("/doctor-dashboard");
        } else if (user.role === "admin") {
          router.push("/admin-dashboard");
        }
      } else {
        toast.error("Invalid credentials or doctor account pending approval");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navbar />
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-gradient-xy">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
      </div>
      
      <main className="flex-grow flex items-center justify-center py-12 relative z-10">
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 animate-fade-in">
          <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
            Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/30 backdrop-blur-sm text-white py-3 rounded-xl font-semibold hover:bg-white/40 hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/30"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : "Login"}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-white/90 drop-shadow animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white font-semibold hover:underline hover:text-white/80 transition">
              Register here
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

