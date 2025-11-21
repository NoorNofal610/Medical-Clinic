"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingDoctors,
  updateDoctorStatus,
  getAppointments,
  getStatistics,
  getUsers,
  updateDoctor,
  deleteDoctor,
  createDoctor,
  User,
  Appointment,
} from "@/lib/api";
import { getStoredUser, logout } from "@/lib/auth";
import { toast } from "react-toastify";
import {
  FaHome,
  FaUserMd,
  FaUserInjured,
  FaCog,
  FaBell,
  FaSignOutAlt,
  FaCalendarCheck,
  FaUsers,
  FaStethoscope,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaBars,
  FaMoon,
  FaSun,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type MenuItem = "dashboard" | "doctors" | "patients" | "settings" | "notifications";
type SettingsTab = "profile" | "notifications" | "general";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const router = useRouter();
  const [pendingDoctors, setPendingDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allDoctors, setAllDoctors] = useState<User[]>([]);
  const [allPatients, setAllPatients] = useState<User[]>([]);
  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<MenuItem>("dashboard");
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: "never",
    newsUpdates: true,
    promotions: true,
    research: true,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
  });
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingDocs, apts, stats, allDocs] = await Promise.all([
        getPendingDoctors(),
        getAppointments("", "admin"),
        getStatistics(),
        getUsers(),
      ]);
      setPendingDoctors(pendingDocs);
      setAppointments(apts);
      setStatistics(stats);
      setAllDoctors(allDocs.filter((u) => u.role === "doctor" && u.doctorStatus === "approved"));
      setAllPatients(allDocs.filter((u) => u.role === "patient"));
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUser = getStoredUser();
    setUser(currentUser);

    if (!currentUser || currentUser.role !== "admin") {
      router.push("/login");
      return;
    }

    setProfileSettings({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || "",
    });

    fetchData();
  }, [router, fetchData]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleDoctorApproval = async (
    doctorId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateDoctorStatus(doctorId, status);
      toast.success(`Doctor ${status === "approved" ? "approved" : "rejected"}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update doctor status");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleEditDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setEditFormData({
      name: doctor.name,
      email: doctor.email,
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      await updateDoctor(selectedDoctor.id, editFormData);
      toast.success("Doctor updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update doctor");
    }
  };

  const handleDeleteClick = (doctorId: string) => {
    setDoctorToDelete(doctorId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctor(doctorToDelete);
      toast.success("Doctor deleted successfully");
      setShowDeleteConfirm(false);
      setDoctorToDelete(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete doctor");
    }
  };

  const handleAddDoctor = async () => {
    try {
      await createDoctor(
        addFormData.email,
        addFormData.password,
        addFormData.name,
        addFormData.specialization,
        addFormData.phone || undefined
      );
      toast.success("Doctor added successfully");
      setShowAddModal(false);
      setAddFormData({
        name: "",
        email: "",
        password: "",
        specialization: "",
        phone: "",
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to add doctor");
    }
  };

  const handleProfileClick = () => {
    setActiveMenu("settings");
    setSettingsTab("profile");
    setSidebarOpen(false);
  };

  const getAvatarUrl = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=128`;
  };

  // Calculate revenue and salary data
  const totalRevenue = statistics.totalAppointments * 150; // Average appointment fee
  const totalSalaries = statistics.totalDoctors * 5000; // Average monthly salary
  const netProfit = totalRevenue - totalSalaries;

  // Weekly data for charts
  const weeklyData = [
    { day: "Sun", appointments: 12, revenue: 1800 },
    { day: "Mon", appointments: 19, revenue: 2850 },
    { day: "Tue", appointments: 15, revenue: 2250 },
    { day: "Wed", appointments: 22, revenue: 3300 },
    { day: "Thu", appointments: 18, revenue: 2700 },
    { day: "Fri", appointments: 16, revenue: 2400 },
    { day: "Sat", appointments: 10, revenue: 1500 },
  ];

  const monthlyData = [
    { name: "Patients", value: statistics.totalPatients, fill: "#10b981" },
    { name: "Doctors", value: statistics.totalDoctors, fill: "#3b82f6" },
    { name: "Appointments", value: statistics.totalAppointments, fill: "#8b5cf6" },
  ];

  const menuItems = [
    { id: "dashboard" as MenuItem, label: "Dashboard", icon: FaHome },
    { id: "doctors" as MenuItem, label: "Doctors", icon: FaUserMd },
    { id: "patients" as MenuItem, label: "Patients", icon: FaUserInjured },
    { id: "settings" as MenuItem, label: "Settings", icon: FaCog },
    { id: "notifications" as MenuItem, label: "Notifications", icon: FaBell },
  ];

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white animate-fade-in">
              <h2 className="text-2xl font-bold mb-2">Good Morning, {user.name}</h2>
              <p className="text-blue-100">Your admin dashboard overview</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.totalPatients}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUserInjured className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Doctors</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.totalDoctors}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUserMd className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Appointments</p>
                    <p className="text-2xl font-bold text-gray-800">{statistics.totalAppointments}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaCalendarCheck className="text-purple-600 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Pending Doctors</p>
                    <p className="text-2xl font-bold text-gray-800">{pendingDoctors.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaStethoscope className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue & Salary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-xl font-bold">$</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Salaries</p>
                    <p className="text-2xl font-bold text-gray-800">${totalSalaries.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Monthly expenses</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xl font-bold">💰</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-800">${netProfit.toLocaleString()}</p>
                    <p className="text-xs text-teal-600 mt-1">After expenses</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 text-xl font-bold">📈</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Appointments Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Appointments</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="appointments" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Revenue Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up" style={{ animationDelay: '0.9s' }}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Statistics Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up" style={{ animationDelay: '1s' }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={monthlyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {monthlyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-4">
                  {monthlyData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.value} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Doctors */}
            {pendingDoctors.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 animate-slide-up" style={{ animationDelay: '1.1s' }}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Doctor Approvals</h3>
                <div className="space-y-3">
                  {pendingDoctors.slice(0, 3).map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDoctorApproval(doctor.id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => handleDoctorApproval(doctor.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "doctors":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Doctors</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaPlus />
                  <span>Add Doctor</span>
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allDoctors.map((doctor, index) => (
                    <div
                      key={doctor.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleEditDoctor(doctor)}
                    >
                      <div className="flex flex-col items-center text-center mb-4">
                        <img
                          src={getAvatarUrl(doctor.name)}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full mb-3 border-4 border-blue-100"
                        />
                        <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-blue-600 font-semibold">{doctor.specialization}</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Email:</span>
                          <span className="truncate">{doctor.email}</span>
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">Phone:</span>
                            <span>{doctor.phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-gray-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDoctor(doctor);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(doctor.id);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "patients":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">All Patients</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allPatients.map((patient, index) => (
                    <div
                      key={patient.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col items-center text-center mb-4">
                        <img
                          src={getAvatarUrl(patient.name)}
                          alt={patient.name}
                          className="w-20 h-20 rounded-full mb-3 border-4 border-green-100"
                        />
                        <h3 className="text-lg font-bold text-gray-800">{patient.name}</h3>
                        <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium mt-1">
                          Patient
                        </span>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                          <FaEnvelope className="text-gray-400 mt-1" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-800 break-all">{patient.email}</p>
                          </div>
                        </div>
                        {patient.phone && (
                          <div className="flex items-start gap-3">
                            <FaPhone className="text-gray-400 mt-1" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="text-sm font-medium text-gray-800">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
              
              {/* Settings Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setSettingsTab("profile")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    settingsTab === "profile"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Profile Settings
                </button>
                <button
                  onClick={() => setSettingsTab("notifications")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    settingsTab === "notifications"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setSettingsTab("general")}
                  className={`px-4 py-2 font-medium transition-colors ${
                    settingsTab === "general"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  General
                </button>
              </div>

              {/* Profile Settings */}
              {settingsTab === "profile" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileSettings.name}
                          onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={profileSettings.email}
                          onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={profileSettings.phone}
                          onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {settingsTab === "notifications" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Email Notifications</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      When you're busy or not online, we can send you email notifications for any new doctor registrations or important updates.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="emailNotifications"
                          value="hourly"
                          checked={notificationSettings.emailNotifications === "hourly"}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">Once an hour at most</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="emailNotifications"
                          value="never"
                          checked={notificationSettings.emailNotifications === "never"}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.value })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">Never</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Email News & Updates</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      From time to time, we'd like to send you emails with interesting news about the clinic and updates.
                    </p>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.newsUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newsUpdates: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">Tips and Tricks</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.promotions}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">Offers and Promotions</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.research}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, research: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">Research Opportunities</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {settingsTab === "general" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Dark Mode</p>
                        <p className="text-sm text-gray-600">Switch between light and dark theme</p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${
                          darkMode ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                            darkMode ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                        {darkMode ? (
                          <FaMoon className="absolute top-1.5 right-1.5 text-white text-xs" />
                        ) : (
                          <FaSun className="absolute top-1.5 left-1.5 text-gray-600 text-xs" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800 mb-1">Language</p>
                        <p className="text-sm text-gray-600">English (US)</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-800 mb-1">Timezone</p>
                        <p className="text-sm text-gray-600">UTC+0</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h2>
              <div className="space-y-3">
                {/* Sample Notifications */}
                {[
                  {
                    id: "notif_sample_1",
                    title: "New Doctor Registration",
                    message: "Dr. Michael Brown is waiting for approval",
                    type: "doctor_registration",
                    timestamp: "2024-11-14T10:00:00.000Z",
                  },
                  {
                    id: "notif_sample_2",
                    title: "New Doctor Registration",
                    message: "Dr. Emily Davis is waiting for approval",
                    type: "doctor_registration",
                    timestamp: "2024-11-11T14:30:00.000Z",
                  },
                  {
                    id: "notif_sample_3",
                    title: "System Update",
                    message: "New features have been added to the dashboard",
                    type: "system",
                    timestamp: "2024-11-09T08:15:00.000Z",
                  },
                  {
                    id: "notif_sample_4",
                    title: "Appointment Alert",
                    message: "High number of appointments scheduled for tomorrow",
                    type: "appointment",
                    timestamp: "2024-11-15T12:00:00.000Z",
                  },
                ].map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-l-4 rounded-lg ${
                      notif.type === "doctor_registration"
                        ? "bg-yellow-50 border-yellow-500"
                        : notif.type === "system"
                        ? "bg-blue-50 border-blue-500"
                        : "bg-green-50 border-green-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingDoctors.length > 0 && (
                  <>
                    {pendingDoctors.map((doctor) => (
                      <div key={doctor.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                        <p className="font-semibold text-gray-800">New doctor registration</p>
                        <p className="text-sm text-gray-600">{doctor.name} is waiting for approval</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 ${darkMode ? "dark" : ""}`}>
      {/* Mobile Burger Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100 transition"
      >
        <FaBars className="text-xl" />
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-white shadow-lg fixed h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Medical Clinic</h1>
              <p className="text-sm text-gray-600 mt-1">Admin Panel</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div
          className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition"
          onClick={handleProfileClick}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveMenu(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={isActive ? "text-white" : "text-gray-600"} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        {loading && activeMenu === "dashboard" ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {/* Edit Doctor Modal */}
      {showEditModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Doctor</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={editFormData.specialization}
                  onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleUpdateDoctor}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Doctor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="doctor@clinic.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  value={addFormData.specialization}
                  onChange={(e) => setAddFormData({ ...addFormData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Cardiology, Pediatrics, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123-456-7890"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleAddDoctor}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Doctor
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Doctor?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this doctor? This action cannot be undone and will also delete all associated appointments.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDoctorToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
