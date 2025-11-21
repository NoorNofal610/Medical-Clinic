"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStoredUser, logout } from "@/lib/auth";
import { useEffect, useState, useRef } from "react";
import { User } from "@/lib/api";
import { FaSearch, FaUserMd, FaUser, FaSignOutAlt } from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowUserMenu(false);
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "patient":
        return "/patient-dashboard";
      case "doctor":
        return "/doctor-dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "patient":
        return "Patient";
      case "doctor":
        return "Doctor";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // يمكن إضافة وظيفة البحث لاحقاً
    console.log("Search:", searchQuery);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <FaUserMd className="text-3xl" />
            <span>Medical Clinic</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Search Icon with Expandable Input */}
            <div className="relative group">
              <button
                onMouseEnter={() => setShowSearch(true)}
                className="p-2 rounded-full hover:bg-blue-700 transition"
              >
                <FaSearch className="text-xl" />
              </button>
              <div
                className={`absolute right-0 top-full mt-2 transition-all duration-300 ease-in-out ${
                  showSearch
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
                onMouseLeave={() => setShowSearch(false)}
                onMouseEnter={() => setShowSearch(true)}
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctors, services..."
                    className="w-64 px-4 py-2 pl-10 pr-4 text-gray-800 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:bg-white transition-all duration-300"
                    autoFocus
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </form>
              </div>
            </div>

            <div suppressHydrationWarning>
              {user ? (
                <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition hover:scale-105 active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-fade-in z-50">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <FaUser className="text-gray-400 text-sm" />
                          <span className="text-sm">Role:</span>
                          <span className="text-sm font-medium text-gray-800">
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        {user.specialization && (
                          <div className="flex items-center gap-2 text-gray-600 mt-2">
                            <span className="text-xs">Specialization:</span>
                            <span className="text-xs font-medium text-gray-800">
                              {user.specialization}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Link
                          href={getDashboardPath()}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
                        >
                          <FaUser className="text-sm" />
                          <span>View Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm font-medium"
                        >
                          <FaSignOutAlt className="text-sm" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-700 rounded-full hover:bg-blue-800 transition flex items-center gap-2"
                >
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

