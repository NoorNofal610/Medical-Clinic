"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  getAppointments, 
  updateAppointment, 
  getPatientById, 
  getPatientsForDoctor,
  getMessages,
  sendMessage,
  getConversations,
  markMessagesAsRead,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDiagnoses,
  getDiagnosisByPatient,
  createDiagnosis,
  updateDiagnosis,
  updateUser,
  Appointment, 
  User,
  Message,
  Notification,
  NotificationType,
  Diagnosis,
} from "@/lib/api";
import { getStoredUser, setStoredUser, logout } from "@/lib/auth";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import {
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaStethoscope,
  FaCheck,
  FaTimes,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendar,
  FaBars,
  FaComments,
  FaUsers,
  FaSignOutAlt,
  FaPaperPlane,
  FaSave,
  FaFileMedical,
  FaArrowLeft,
  FaCalendarCheck,
} from "react-icons/fa";

type ActiveMenu = "appointments" | "patients" | "notifications" | "messages" | "profile";

export default function DoctorDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "year">("month");
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Patients state
  const [patients, setPatients] = useState<User[]>([]);
  const [selectedPatientForView, setSelectedPatientForView] = useState<User | null>(null);
  const [patientDiagnosis, setPatientDiagnosis] = useState<Diagnosis | null>(null);
  const [isEditingDiagnosis, setIsEditingDiagnosis] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: "",
    disease: "",
    notes: "",
    testResults: "",
    prescription: "",
  });

  // Messages state
  const [conversations, setConversations] = useState<Array<{ user: User; lastMessage: Message; unreadCount: number }>>([]);
  const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
  const [showConversationView, setShowConversationView] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileClinicLocation, setProfileClinicLocation] = useState("");

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAppointments(user.id, "doctor");
      setAppointments(data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apts, pats, notifs, convs] = await Promise.all([
        getAppointments(user.id, "doctor"),
        getPatientsForDoctor(user.id),
        getNotifications(user.id),
        getConversations(user.id),
      ]);
      setAppointments(apts);
      setPatients(pats);
      setNotifications(notifs);
      setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
      setConversations(convs);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const convs = await getConversations(user.id);
      setConversations(convs);
    } catch (error) {
      toast.error("Failed to load conversations");
    }
  }, [user]);

  const fetchMessages = useCallback(async (otherUserId: string) => {
    if (!user) return;
    try {
      const msgs = await getMessages(user.id, otherUserId);
      setMessages(msgs);
      await markMessagesAsRead(user.id, otherUserId);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "doctor") {
      router.push("/login");
      return;
    }
    fetchData();
    fetchConversations();
  }, [user, router, fetchData, fetchConversations]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfilePhone(user.phone || "");
      setProfileBio(user.bio || "");
      setProfileClinicLocation(user.clinicLocation || "");
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, user, fetchMessages]);

  useEffect(() => {
    const loadPatientDiagnosis = async () => {
      if (selectedPatientForView && user) {
        try {
          const diag = await getDiagnosisByPatient(user.id, selectedPatientForView.id);
          setPatientDiagnosis(diag);
          if (diag) {
            setDiagnosisForm({
              diagnosis: diag.diagnosis || "",
              disease: diag.disease || "",
              notes: diag.notes || "",
              testResults: diag.testResults || "",
              prescription: diag.prescription || "",
            });
          } else {
            setDiagnosisForm({
              diagnosis: "",
              disease: "",
              notes: "",
              testResults: "",
              prescription: "",
            });
          }
        } catch (error) {
          toast.error("Failed to load diagnosis");
        }
      }
    };
    loadPatientDiagnosis();
  }, [selectedPatientForView, user]);

  // Fetch patient info when appointment is selected
  useEffect(() => {
    const fetchPatientInfo = async () => {
      if (selectedAppointment) {
        try {
          const patient = await getPatientById(selectedAppointment.patientId);
          setSelectedPatient(patient);
        } catch (error) {
          toast.error("Failed to load patient information");
        }
      }
    };
    fetchPatientInfo();
  }, [selectedAppointment]);

  const handleStatusUpdate = async (
    appointmentId: string,
    status: "scheduled" | "completed" | "cancelled"
  ) => {
    try {
      await updateAppointment(appointmentId, { status });
      toast.success("Appointment status updated");
      fetchData();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status });
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleNotesUpdate = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { notes });
      toast.success("Notes updated");
      setEditingId(null);
      setNotes("");
      fetchData();
      if (selectedAppointment?.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, notes });
      }
    } catch (error) {
      toast.error("Failed to update notes");
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !messageContent.trim()) return;
    try {
      await sendMessage(user.id, selectedConversation.id, messageContent);
      setMessageContent("");
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleOpenMessages = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedConversation(patient);
      setActiveMenu("messages");
      setSidebarOpen(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchData();
      await fetchConversations();
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      await fetchData();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleSaveDiagnosis = async () => {
    if (!user || !selectedPatientForView) return;
    try {
      if (patientDiagnosis) {
        await updateDiagnosis(patientDiagnosis.id, diagnosisForm);
        toast.success("Diagnosis updated successfully!");
      } else {
        await createDiagnosis(
          selectedPatientForView.id,
          user.id,
          diagnosisForm.diagnosis,
          diagnosisForm.disease,
          diagnosisForm.notes,
          diagnosisForm.testResults,
          diagnosisForm.prescription
        );
        toast.success("Diagnosis created successfully!");
      }
      setIsEditingDiagnosis(false);
      const diag = await getDiagnosisByPatient(user.id, selectedPatientForView.id);
      setPatientDiagnosis(diag);
    } catch (error) {
      toast.error("Failed to save diagnosis");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateUser(user.id, {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        bio: profileBio,
        clinicLocation: profileClinicLocation,
      });
      setUser(updatedUser);
      setStoredUser(updatedUser);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Navigation functions
  const navigateDate = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      switch (viewMode) {
        case "day":
          newDate.setDate(prev.getDate() + (direction === "prev" ? -1 : 1));
          break;
        case "week":
          newDate.setDate(prev.getDate() + (direction === "prev" ? -7 : 7));
          break;
        case "month":
          newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
          break;
        case "year":
          newDate.setFullYear(prev.getFullYear() + (direction === "prev" ? -1 : 1));
          break;
      }
      return newDate;
    });
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.date === dateString);
  };

  // Generate calendar days for month view
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startDay = firstDay.getDay();
    const startDayAdjusted = startDay === 0 ? 6 : startDay - 1;

    const days = [];

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayAdjusted - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date,
        dateString,
        appointments: appointments.filter((apt) => apt.date === dateString),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Add days of current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateString = date.toISOString().split("T")[0];
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      days.push({
        date,
        dateString,
        appointments: appointments.filter((apt) => apt.date === dateString),
        isCurrentMonth: true,
        isToday,
      });
    }

    // Add days from next month to fill the grid
    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      const dateString = date.toISOString().split("T")[0];
      days.push({
        date,
        dateString,
        appointments: appointments.filter((apt) => apt.date === dateString),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  // Generate week days
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      days.push({
        date,
        dateString,
        appointments: appointments.filter((apt) => apt.date === dateString),
        isToday,
      });
    }
    return days;
  };

  // Generate year months
  const getYearMonths = () => {
    const year = currentDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd;
      });

      months.push({
        date: monthStart,
        monthName: monthStart.toLocaleDateString("en-US", { month: "long" }),
        appointments: monthAppointments,
        scheduledCount: monthAppointments.filter(apt => apt.status === "scheduled").length,
        completedCount: monthAppointments.filter(apt => apt.status === "completed").length,
      });
    }
    
    return months;
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPatientModal(true);
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvatarUrl = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=128`;
  };

  const getHeaderText = () => {
    switch (viewMode) {
      case "day":
        return currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "week":
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
      case "month":
        return currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "year":
        return currentDate.getFullYear().toString();
    }
  };

  const monthDays = getMonthDays();
  const weekDays = getWeekDays();
  const yearMonths = getYearMonths();
  const scheduledCount = appointments.filter((apt) => apt.status === "scheduled").length;

  if (!user || user.role !== "doctor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderCalendar = () => {
    switch (viewMode) {
      case "day":
        return (
          <div className="bg-white rounded-lg p-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </h3>
              <p className="text-gray-600">
                {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            
            <div className="space-y-3">
              {getAppointmentsForDate(currentDate).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments for this day
                </div>
              ) : (
                getAppointmentsForDate(currentDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleAppointmentClick(apt)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{apt.patientName}</h4>
                        <p className="text-sm text-gray-600">{formatTime(apt.time)}</p>
                        {apt.reason && (
                          <p className="text-sm text-gray-600 mt-1">{apt.reason}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "week":
        return (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[150px] p-3 border rounded-lg ${
                  day.isToday ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                }`}
              >
                <div className="text-center mb-2">
                  <div className="text-sm font-semibold text-gray-600">
                    {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`text-lg font-bold ${
                    day.isToday ? "text-blue-600" : "text-gray-800"
                  }`}>
                    {day.date.getDate()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {day.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="text-xs p-2 bg-pink-100 text-pink-800 rounded border border-pink-200 cursor-pointer hover:bg-pink-200 transition-colors"
                      onClick={() => handleAppointmentClick(apt)}
                    >
                      <div className="font-medium truncate">{apt.patientName}</div>
                      <div>{formatTime(apt.time)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

        case "month":
          return (
            <div className="grid grid-cols-7 gap-1">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 py-3 text-sm"
                >
                  {day}
                </div>
              ))}
        
              {monthDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border border-gray-200 rounded-lg ${
                    !day.isCurrentMonth ? "bg-gray-50 opacity-50" : "bg-white"
                  } ${day.isToday ? "bg-blue-50 border-blue-300" : ""} transition-all`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      day.isToday
                        ? "text-blue-600 font-bold"
                        : day.isCurrentMonth
                        ? "text-gray-800"
                        : "text-gray-400"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
        
                  <div className="space-y-1">
                    {day.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`text-xs px-2 py-1 rounded border font-medium cursor-pointer transition-colors ${
                          apt.status === "scheduled"
                            ? "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200"
                            : apt.status === "completed"
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                            : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                        }`}
                        onClick={() => handleAppointmentClick(apt)}
                      >
                        {apt.patientName.split(" ")[0]} ({formatTime(apt.time)})
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        

      case "year":
        return (
          <div className="grid grid-cols-3 gap-6">
            {yearMonths.map((month, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setCurrentDate(month.date);
                  setViewMode("month");
                }}
              >
                <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">
                  {month.monthName}
                </h4>
                
                <div className="space-y-2">
                  {month.scheduledCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium">
                        {month.scheduledCount}
                      </span>
                    </div>
                  )}
                  
                  {month.completedCount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {month.completedCount}
                      </span>
                    </div>
                  )}

                  {month.appointments.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-2">
                      No appointments
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* Mobile Burger Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-gray-700 hover:bg-gray-100 transition"
      >
        <FaBars className="text-xl" />
      </button>
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white shadow-lg fixed h-screen z-40 transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(user.name)}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.specialization || "Doctor"}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
              <button
                onClick={() => {
                  setActiveMenu("appointments");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === "appointments"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaCalendarAlt />
                <span>Appointments</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu("patients");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === "patients"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaUsers />
                <span>Patients</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu("messages");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                  activeMenu === "messages"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaComments />
                <span>Messages</span>
                {conversations.some(c => c.unreadCount > 0) && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveMenu("notifications");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                  activeMenu === "notifications"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaBell />
                <span>Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setActiveMenu("profile");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === "profile"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaUser />
                <span>Profile</span>
              </button>
            </nav>
            
            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 hover:bg-red-50"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">

          {/* Dashboard Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Doctor Dashboard</h1>
            <p className="text-gray-600">
              Welcome, {user.name} - {user.specialization}
            </p>
          </div>

          {/* Appointments Page */}
          {activeMenu === "appointments" && (
            <div>
              {/* Calendar View */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                {/* Calendar Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  {/* View Mode Tabs */}
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {[
                      { mode: "day" as const, label: "Day", icon: FaCalendarDay },
                      { mode: "week" as const, label: "Week", icon: FaCalendarWeek },
                      { mode: "month" as const, label: "Month", icon: FaCalendar },
                      { mode: "year" as const, label: "Year", icon: FaCalendarAlt },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.mode}
                          onClick={() => setViewMode(item.mode)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium ${
                            viewMode === item.mode
                              ? "bg-pink-500 text-white shadow-md"
                              : "text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <Icon className="text-sm" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Date Navigation */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigateDate("prev")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <FaChevronLeft className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 min-w-[200px] text-center">
                      {getHeaderText()}
                    </h2>
                    <button
                      onClick={() => navigateDate("next")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <FaChevronRight className="text-gray-600" />
                    </button>
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                      <FaBell className="text-gray-600 text-xl" />
                      {scheduledCount > 0 && (
                        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {scheduledCount}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Today
                    </button>
                  </div>
                </div>

                {/* Calendar Content */}
                {renderCalendar()}
              </div>

              {/* Patient Information Modal */}
              {showPatientModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                      <h3 className="text-2xl font-bold text-gray-800">Patient Information</h3>
                      <button
                        onClick={() => {
                          setShowPatientModal(false);
                          setSelectedAppointment(null);
                          setSelectedPatient(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="text-xl" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : (
                        <>
                          {/* Patient Profile */}
                          {selectedPatient && (
                            <div className="bg-blue-50 rounded-lg p-6">
                              <div className="flex items-center gap-4 mb-4">
                                <img
                                  src={getAvatarUrl(selectedPatient.name)}
                                  alt={selectedPatient.name}
                                  className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                                />
                                <div>
                                  <h4 className="text-2xl font-bold text-gray-800">
                                    {selectedPatient.name}
                                  </h4>
                                  <p className="text-blue-600 font-semibold">Patient</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-3 text-gray-700">
                                  <FaEnvelope className="text-blue-500" />
                                  <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium">{selectedPatient.email}</p>
                                  </div>
                                </div>
                                {selectedPatient.phone && (
                                  <div className="flex items-center gap-3 text-gray-700">
                                    <FaPhone className="text-blue-500" />
                                    <div>
                                      <p className="text-xs text-gray-500">Phone</p>
                                      <p className="font-medium">{selectedPatient.phone}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Appointment Details */}
                          <div className="bg-gray-50 rounded-lg p-6">
                            <h5 className="text-lg font-bold text-gray-800 mb-4">Appointment Details</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Date</p>
                                  <p className="font-medium text-gray-800">
                                    {formatDate(selectedAppointment.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <FaClock className="text-blue-500" />
                                <div>
                                  <p className="text-xs text-gray-500">Time</p>
                                  <p className="font-medium text-gray-800">
                                    {formatTime(selectedAppointment.time)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {selectedAppointment.reason && (
                              <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                                <p className="text-gray-800 bg-white p-3 rounded-lg">
                                  {selectedAppointment.reason}
                                </p>
                              </div>
                            )}

                            <div className="mt-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAppointmentStatusColor(
                                  selectedAppointment.status
                                )}`}
                              >
                                {selectedAppointment.status}
                              </span>
                            </div>
                          </div>

                          {/* Medical Notes */}
                          <div>
                            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <FaNotesMedical className="text-purple-500" />
                              Medical Notes
                            </h5>
                            {editingId === selectedAppointment.id ? (
                              <div>
                                <textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  rows={4}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Add medical notes..."
                                />
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => handleNotesUpdate(selectedAppointment.id)}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                  >
                                    Save Notes
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setNotes("");
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {selectedAppointment.notes ? (
                                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mb-3">
                                    {selectedAppointment.notes}
                                  </p>
                                ) : (
                                  <p className="text-gray-400 italic p-4 rounded-lg border border-dashed border-gray-300 mb-3">
                                    No notes added yet
                                  </p>
                                )}
                                <button
                                  onClick={() => {
                                    setEditingId(selectedAppointment.id);
                                    setNotes(selectedAppointment.notes || "");
                                  }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                >
                                  {selectedAppointment.notes ? "Edit Notes" : "Add Notes"}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {selectedAppointment.status === "scheduled" && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => {
                                  handleStatusUpdate(selectedAppointment.id, "completed");
                                  setShowPatientModal(false);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                              >
                                <FaCheck />
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(selectedAppointment.id, "cancelled");
                                  setShowPatientModal(false);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                              >
                                <FaTimes />
                                Cancel Appointment
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Patients Page */}
          {activeMenu === "patients" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Patients</h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : patients.length === 0 ? (
                <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-600">
                  No patients found
                </div>
              ) : !selectedPatientForView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patients.map((patient, index) => (
                    <div
                      key={patient.id}
                      className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => setSelectedPatientForView(patient)}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={getAvatarUrl(patient.name)}
                          alt={patient.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg">{patient.name}</h4>
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        </div>
                      </div>
                      {patient.phone && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <FaPhone className="text-sm" />
                          <span className="text-sm">{patient.phone}</span>
                        </div>
                      )}
                      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedPatientForView(null)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <FaArrowLeft />
                      Back to Patients
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <img
                        src={getAvatarUrl(selectedPatientForView.name)}
                        alt={selectedPatientForView.name}
                        className="w-32 h-32 rounded-full mx-auto md:mx-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">
                          {selectedPatientForView.name}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <FaEnvelope className="text-blue-600" />
                            <p className="text-gray-800">{selectedPatientForView.email}</p>
                          </div>
                          {selectedPatientForView.phone && (
                            <div className="flex items-center gap-3">
                              <FaPhone className="text-blue-600" />
                              <p className="text-gray-800">{selectedPatientForView.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Diagnosis Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold text-gray-800">Diagnosis</h4>
                        {!isEditingDiagnosis ? (
                          <button
                            onClick={() => setIsEditingDiagnosis(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <FaEdit />
                            <span>{patientDiagnosis ? "Edit" : "Add"} Diagnosis</span>
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsEditingDiagnosis(false);
                                if (patientDiagnosis) {
                                  setDiagnosisForm({
                                    diagnosis: patientDiagnosis.diagnosis || "",
                                    disease: patientDiagnosis.disease || "",
                                    notes: patientDiagnosis.notes || "",
                                    testResults: patientDiagnosis.testResults || "",
                                    prescription: patientDiagnosis.prescription || "",
                                  });
                                }
                              }}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveDiagnosis}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                              <FaSave />
                              <span>Save</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditingDiagnosis ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                            <textarea
                              value={diagnosisForm.diagnosis}
                              onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosis: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter diagnosis..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Disease</label>
                            <input
                              type="text"
                              value={diagnosisForm.disease}
                              onChange={(e) => setDiagnosisForm({ ...diagnosisForm, disease: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter disease name..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Test Results</label>
                            <textarea
                              value={diagnosisForm.testResults}
                              onChange={(e) => setDiagnosisForm({ ...diagnosisForm, testResults: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter test results..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                              value={diagnosisForm.notes}
                              onChange={(e) => setDiagnosisForm({ ...diagnosisForm, notes: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter notes..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                            <textarea
                              value={diagnosisForm.prescription}
                              onChange={(e) => setDiagnosisForm({ ...diagnosisForm, prescription: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Enter prescription..."
                            />
                          </div>
                        </div>
                      ) : patientDiagnosis ? (
                        <div className="space-y-4">
                          {patientDiagnosis.diagnosis && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Diagnosis</h5>
                              <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{patientDiagnosis.diagnosis}</p>
                            </div>
                          )}
                          {patientDiagnosis.disease && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Disease</h5>
                              <p className="text-gray-800 bg-yellow-50 p-3 rounded-lg">{patientDiagnosis.disease}</p>
                            </div>
                          )}
                          {patientDiagnosis.testResults && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Test Results</h5>
                              <p className="text-gray-800 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">{patientDiagnosis.testResults}</p>
                            </div>
                          )}
                          {patientDiagnosis.notes && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Notes</h5>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{patientDiagnosis.notes}</p>
                            </div>
                          )}
                          {patientDiagnosis.prescription && (
                            <div>
                              <h5 className="font-semibold text-gray-700 mb-2">Prescription</h5>
                              <p className="text-gray-800 bg-purple-50 p-3 rounded-lg whitespace-pre-wrap">{patientDiagnosis.prescription}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No diagnosis recorded yet
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenMessages(selectedPatientForView.id)}
                      className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      <FaComments />
                      <span>Message Patient</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages Page */}
          {activeMenu === "messages" && (
            <div className="w-full overflow-x-hidden">
              <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${showConversationView ? "hidden lg:block" : ""}`}>Messages</h2>
              
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-300px)] lg:h-[calc(100vh-300px)] overflow-x-hidden w-full max-w-full">
                {/* Conversations List */}
                <div className={`${showConversationView ? "hidden" : "block"} lg:block lg:w-1/3 bg-white rounded-lg shadow-lg p-4 overflow-y-auto overflow-x-hidden h-full`}>
                  <h3 className="font-semibold text-gray-800 mb-4">Conversations</h3>
                  <div className="space-y-2">
                    {/* Sample Conversations */}
                    {[
                      {
                        user: { id: "patient1", name: "Jane Doe", email: "jane@email.com", role: "patient" as const, password: "" },
                        lastMessage: { id: "msg_1", senderId: "patient1", senderName: "Jane Doe", receiverId: "doctor1", receiverName: "Dr. John Smith", content: "Thank you for checking in! I'm feeling much better now.", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), read: true },
                        unreadCount: 0,
                      },
                      {
                        user: { id: "patient2", name: "Robert Wilson", email: "robert@email.com", role: "patient" as const, password: "" },
                        lastMessage: { id: "msg_2", senderId: "patient2", senderName: "Robert Wilson", receiverId: "doctor1", receiverName: "Dr. John Smith", content: "I have a question about my medication.", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: false },
                        unreadCount: 1,
                      },
                      {
                        user: { id: "patient3", name: "Maria Garcia", email: "maria@email.com", role: "patient" as const, password: "" },
                        lastMessage: { id: "msg_3", senderId: "doctor1", senderName: "Dr. John Smith", receiverId: "patient3", receiverName: "Maria Garcia", content: "Your test results look good. We can discuss them in your next appointment.", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read: true },
                        unreadCount: 0,
                      },
                    ].map((conv) => (
                      <button
                        key={conv.user.id}
                        onClick={() => {
                          setSelectedConversation(conv.user);
                          setShowConversationView(true);
                        }}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          selectedConversation?.id === conv.user.id
                            ? "bg-blue-100 border-2 border-blue-500"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(conv.user.name)}
                            alt={conv.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-800 truncate">{conv.user.name}</p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {conversations.map((conv) => (
                        <button
                          key={conv.user.id}
                          onClick={() => {
                            setSelectedConversation(conv.user);
                            setShowConversationView(true);
                          }}
                          className={`w-full p-4 rounded-lg text-left transition-all ${
                            selectedConversation?.id === conv.user.id
                              ? "bg-blue-100 border-2 border-blue-500"
                              : "bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getAvatarUrl(conv.user.name)}
                              alt={conv.user.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800 truncate">{conv.user.name}</p>
                                {conv.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                    ))}
                  </div>
                </div>

                {/* Messages View */}
                <div className={`${!showConversationView ? "hidden" : "flex"} lg:flex lg:w-2/3 bg-white rounded-lg shadow-lg flex-col h-full lg:h-auto overflow-x-hidden w-full max-w-full`}>
                  {selectedConversation ? (
                    <>
                      <div className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => setShowConversationView(false)}
                          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <FaArrowLeft className="text-gray-600" />
                        </button>
                        <img
                          src={getAvatarUrl(selectedConversation.name)}
                          alt={selectedConversation.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{selectedConversation.name}</p>
                          <p className="text-sm text-gray-600">Patient</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
                        {/* Sample Messages */}
                        {selectedConversation?.id === "patient1" && [
                          {
                            id: "msg_sample_1",
                            senderId: "doctor1",
                            senderName: "Dr. John Smith",
                            receiverId: "patient1",
                            receiverName: "Jane Doe",
                            content: "Hello, I wanted to follow up on your recent appointment. How are you feeling?",
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            read: true,
                          },
                          {
                            id: "msg_sample_2",
                            senderId: "patient1",
                            senderName: "Jane Doe",
                            receiverId: "doctor1",
                            receiverName: "Dr. John Smith",
                            content: "Thank you for checking in! I'm feeling much better now.",
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                            read: true,
                          },
                          {
                            id: "msg_sample_3",
                            senderId: "doctor1",
                            senderName: "Dr. John Smith",
                            receiverId: "patient1",
                            receiverName: "Jane Doe",
                            content: "That's great to hear! Please continue taking your medication as prescribed.",
                            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                            read: false,
                          },
                        ].map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.senderId === user?.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                msg.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.senderId === user?.id
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                msg.senderId === user?.id ? "text-blue-100" : "text-gray-500"
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 border-t border-gray-200 flex-shrink-0">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            <FaPaperPlane />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                      Select a conversation to start messaging
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Page */}
          {activeMenu === "notifications" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Sample Notifications */}
                {[
                  {
                    id: "notif_sample_1",
                    userId: "doctor1",
                    title: "New Appointment",
                    message: "Jane Doe has booked a new appointment for tomorrow at 10:00 AM",
                    type: "appointment" as const,
                    read: false,
                    timestamp: "2024-11-14T09:00:00.000Z",
                    link: "/doctor-dashboard?tab=appointments",
                  },
                  {
                    id: "notif_sample_2",
                    userId: "doctor1",
                    title: "New Message",
                    message: "You have a new message from Jane Doe",
                    type: "message" as const,
                    read: true,
                    timestamp: "2024-11-15T11:30:00.000Z",
                    link: "/doctor-dashboard?tab=messages",
                  },
                  {
                    id: "notif_sample_3",
                    userId: "doctor1",
                    title: "Appointment Cancelled",
                    message: "Robert Wilson has cancelled his appointment scheduled for next week",
                    type: "appointment" as const,
                    read: false,
                    timestamp: "2024-11-13T15:45:00.000Z",
                    link: "/doctor-dashboard?tab=appointments",
                  },
                  {
                    id: "notif_sample_4",
                    userId: "doctor1",
                    title: "Patient Follow-up Required",
                    message: "Maria Garcia's test results are ready for review",
                    type: "diagnosis" as NotificationType,
                    read: false,
                    timestamp: "2024-11-11T13:20:00.000Z",
                    link: "/doctor-dashboard?tab=patients",
                  },
                ].map((notif, index) => (
                  <div
                    key={notif.id}
                    className={`bg-white p-6 rounded-lg shadow-md border-l-4 transition-all animate-slide-up cursor-pointer ${
                      notif.read
                        ? "border-gray-300 opacity-75"
                        : "border-blue-500 bg-blue-50"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => !notif.read && handleMarkNotificationAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notif.type === "appointment" ? "bg-blue-100 text-blue-600" :
                        notif.type === "message" ? "bg-green-100 text-green-600" :
                        notif.type === "diagnosis" ? "bg-purple-100 text-purple-600" :
                        notif.type === "system" ? "bg-orange-100 text-orange-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {notif.type === "appointment" ? <FaCalendarCheck /> :
                         notif.type === "message" ? <FaComments /> :
                         notif.type === "diagnosis" ? <FaFileMedical /> :
                         notif.type === "system" ? <FaBell /> :
                         <FaBell />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{notif.title}</h3>
                        <p className="text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.map((notif, index) => (
                    <div
                      key={notif.id}
                      className={`bg-white p-6 rounded-lg shadow-md border-l-4 transition-all animate-slide-up ${
                        notif.read
                          ? "border-gray-300 opacity-75"
                          : "border-blue-500 bg-blue-50"
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => !notif.read && handleMarkNotificationAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          notif.type === "appointment" ? "bg-blue-100 text-blue-600" :
                          notif.type === "message" ? "bg-green-100 text-green-600" :
                          notif.type === "diagnosis" ? "bg-purple-100 text-purple-600" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {notif.type === "appointment" ? <FaCalendarCheck /> :
                           notif.type === "message" ? <FaComments /> :
                           notif.type === "diagnosis" ? <FaFileMedical /> :
                           <FaBell />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-1">{notif.title}</h3>
                          <p className="text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Page */}
          {activeMenu === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
              
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaEdit />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileName(user.name);
                          setProfileEmail(user.email);
                          setProfilePhone(user.phone || "");
                          setProfileBio(user.bio || "");
                          setProfileClinicLocation(user.clinicLocation || "");
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <FaSave />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-6 mb-6">
                    <img
                      src={getAvatarUrl(profileName)}
                      alt={profileName}
                      className="w-24 h-24 rounded-full"
                    />
                    <div>
                      <p className="text-sm text-gray-600">Profile Picture</p>
                      <p className="text-xs text-gray-500">Generated from your name</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">{user.phone || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    {isEditingProfile ? (
                      <textarea
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your bio..."
                      />
                    ) : (
                      <p className="text-gray-800">{user.bio || "Not provided"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Location</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileClinicLocation}
                        onChange={(e) => setProfileClinicLocation(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter clinic location..."
                      />
                    ) : (
                      <p className="text-gray-800">{user.clinicLocation || "Not provided"}</p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Specialization</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {user.specialization || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}