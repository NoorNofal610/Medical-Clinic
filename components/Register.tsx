"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient" as "patient" | "doctor" | "admin",
    specialization: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.role === "doctor" ? formData.specialization : undefined,
        formData.phone || undefined
      );
      
      setStoredUser(user);
      
      if (user.role === "doctor" && user.doctorStatus === "pending") {
        toast.info("Registration successful! Your account is pending admin approval.");
        router.push("/");
      } else {
        toast.success("Registration successful!");
        if (user.role === "patient") {
          router.push("/patient-dashboard");
        } else if (user.role === "admin") {
          router.push("/admin-dashboard");
        }
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
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
        <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30 animate-fade-in overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
            Register
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your full name"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your password (min 6 characters)"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                placeholder="Enter your phone number"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
              >
                <option value="patient" className="bg-gray-800">Patient</option>
                <option value="doctor" className="bg-gray-800">Doctor</option>
              </select>
            </div>
            {formData.role === "doctor" && (
              <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <label className="block text-sm font-medium text-white mb-1 drop-shadow">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  required={formData.role === "doctor"}
                  className="w-full px-4 py-3 border border-white/30 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all duration-300"
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            )}
            <div className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
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
                    Registering...
                  </span>
                ) : "Register"}
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm text-white/90 drop-shadow animate-slide-up" style={{ animationDelay: '0.8s' }}>
            Already have an account?{" "}
            <Link href="/login" className="text-white font-semibold hover:underline hover:text-white/80 transition">
              Login here
            </Link>
          </p>
          {formData.role === "doctor" && (
            <div className="mt-4 p-3 bg-yellow-500/20 backdrop-blur-sm rounded-xl border border-yellow-400/30 animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <p className="text-xs text-yellow-100 drop-shadow">
                ⚠️ Doctor accounts require admin approval before you can login.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

