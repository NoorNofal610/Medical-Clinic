"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  getAppointments, 
  getDoctors, 
  createAppointment, 
  updateAppointment,
  updateUser,
  getMessages,
  sendMessage,
  getConversations,
  markMessagesAsRead,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDiagnoses,
  User, 
  Appointment,
  Message,
  Notification,
  Diagnosis,
} from "@/lib/api";
import { getStoredUser, setStoredUser, logout } from "@/lib/auth";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import {
  FaCalendarCheck,
  FaUserMd,
  FaClock,
  FaStethoscope,
  FaTimes,
  FaCheck,
  FaUser,
  FaBars,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaBell,
  FaComments,
  FaFileMedical,
  FaSignOutAlt,
  FaPaperPlane,
} from "react-icons/fa";

type BookingStep = "specialization" | "doctor" | "date" | "time" | "confirm";
type ActiveMenu = "appointments" | "browse-doctors" | "profile" | "notifications" | "messages" | "diagnosis";

export default function PatientDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("appointments");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Booking state
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("specialization");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  // Browse Doctors state
  const [browseSpecialization, setBrowseSpecialization] = useState<string>("");
  const [selectedDoctorForView, setSelectedDoctorForView] = useState<User | null>(null);
  
  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");

  // Messages state
  const [conversations, setConversations] = useState<Array<{ user: User; lastMessage: Message; unreadCount: number }>>([]);
  const [selectedConversation, setSelectedConversation] = useState<User | null>(null);
  const [showConversationView, setShowConversationView] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Diagnosis state
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editReason, setEditReason] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [apts, docs, notifs, diags] = await Promise.all([
        getAppointments(user.id, "patient"),
        getDoctors(),
        getNotifications(user.id),
        getDiagnoses(user.id, "patient"),
      ]);
      setAppointments(apts);
      setDoctors(docs);
      setNotifications(notifs);
      setUnreadNotificationsCount(notifs.filter(n => !n.read).length);
      setDiagnoses(diags);
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
    if (user.role !== "patient") {
      router.push("/login");
      return;
    }
    fetchData();
    fetchConversations();
  }, [user, router, fetchData, fetchConversations]);

  useEffect(() => {
    if (selectedConversation && user) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, user, fetchMessages]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Get unique specializations
  const specializations = Array.from(
    new Set(doctors.map((d) => d.specialization).filter((s): s is string => Boolean(s)))
  );

  // Get doctors by specialization
  const doctorsBySpecialization = doctors.filter(
    (d) => d.specialization === browseSpecialization
  );

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getBookedSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];
    return appointments
      .filter(
        (apt) =>
          apt.doctorId === selectedDoctor.id &&
          apt.date === selectedDate &&
          apt.status === "scheduled"
      )
      .map((apt) => apt.time);
  };

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      const allSlots = generateTimeSlots();
      const bookedSlots = getBookedSlots();
      const available = allSlots.filter((slot) => !bookedSlots.includes(slot));
      setAvailableTimeSlots(available);
    }
  }, [selectedDoctor, selectedDate, appointments]);

  // Handle booking from Browse Doctors
  const handleBookFromDoctor = (doctor: User) => {
    setSelectedDoctor(doctor);
    setSelectedSpecialization(doctor.specialization || "");
    setShowBooking(true);
    setBookingStep("date");
    setActiveMenu("appointments");
    setSidebarOpen(false);
  };

  const handleSpecializationSelect = (spec: string) => {
    setSelectedSpecialization(spec);
    setBookingStep("doctor");
  };

  const handleDoctorSelect = (doctor: User) => {
    setSelectedDoctor(doctor);
    setBookingStep("date");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setBookingStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep("confirm");
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedDoctor) return;

    try {
      await createAppointment(
        user.id,
        user.name,
        selectedDoctor.id,
        selectedDoctor.name,
        selectedDate,
        selectedTime,
        reason
      );
      toast.success("Appointment booked successfully!");
      resetBooking();
      fetchData();
    } catch (error) {
      toast.error("Failed to book appointment");
    }
  };

  const resetBooking = () => {
    setShowBooking(false);
    setBookingStep("specialization");
    setSelectedSpecialization("");
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setReason("");
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const updatedUser = await updateUser(user.id, {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
      });
      setUser(updatedUser);
      setStoredUser(updatedUser);
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
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

  const handleOpenMessages = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedConversation(doctor);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAvatarUrl = (name: string) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=128`;
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "scheduled"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status !== "scheduled"
  );

  const minDate = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const handleAppointmentClick = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setEditDate(apt.date);
    setEditTime(apt.time);
    setEditReason(apt.reason || "");
    setShowModal(true);
  };

  const handleUpdateAppointmentClick = async () => {
    if (!selectedAppointment) return;
    try {
      await updateAppointment(selectedAppointment.id, {
        date: editDate,
        time: editTime,
        reason: editReason,
      });
      toast.success("Appointment updated successfully!");
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  if (!user || user.role !== "patient") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  <p className="text-xs text-gray-500">Patient</p>
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
                <FaCalendarCheck />
                <span>Appointments</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu("browse-doctors");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === "browse-doctors"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaUserMd />
                <span>Browse Doctors</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu("diagnosis");
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeMenu === "diagnosis"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaFileMedical />
                <span>My Diagnosis</span>
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.name}!</p>
          </div>

          {/* Appointments Page */}
          {activeMenu === "appointments" && (
            <div>
              {/* Booking Section */}
              {!showBooking ? (
                <button
                  onClick={() => setShowBooking(true)}
                  className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaCalendarCheck />
                  <span>Book New Appointment</span>
                </button>
              ) : (
                <div className="mb-6 bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
                    <button
                      onClick={resetBooking}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-8 overflow-x-hidden">
                    {[
                      { step: "specialization", label: "Specialization" },
                      { step: "doctor", label: "Doctor" },
                      { step: "date", label: "Date" },
                      { step: "time", label: "Time" },
                      { step: "confirm", label: "Confirm" },
                    ].map((item, index) => {
                      const stepIndex = [
                        "specialization",
                        "doctor",
                        "date",
                        "time",
                        "confirm",
                      ].indexOf(bookingStep);
                      const isActive = index <= stepIndex;
                      return (
                        <div key={item.step} className="flex items-center flex-1 min-w-[80px]">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {isActive ? <FaCheck /> : index + 1}
                            </div>
                            <p
                              className={`text-xs mt-2 text-center ${
                                isActive ? "text-blue-600 font-semibold" : "text-gray-500"
                              }`}
                            >
                              {item.label}
                            </p>
                          </div>
                          {index < 4 && (
                            <div
                              className={`h-1 flex-1 mx-2 ${
                                isActive ? "bg-blue-600" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step 1: Select Specialization */}
                  {bookingStep === "specialization" && (
                    <div className="animate-fade-in">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Select Medical Specialization
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {specializations.map((spec, index) => (
                          <button
                            key={spec}
                            onClick={() => handleSpecializationSelect(spec)}
                            className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <FaStethoscope className="text-blue-600 text-2xl mx-auto mb-2" />
                            <p className="font-semibold text-gray-800">{spec}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Select Doctor */}
                  {bookingStep === "doctor" && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => setBookingStep("specialization")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          ← Back
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Select Doctor - {selectedSpecialization}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {doctors
                          .filter((d) => d.specialization === selectedSpecialization)
                          .map((doctor, index) => (
                            <button
                              key={doctor.id}
                              onClick={() => handleDoctorSelect(doctor)}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all text-left animate-slide-up"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <img
                                  src={getAvatarUrl(doctor.name)}
                                  alt={doctor.name}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">{doctor.name}</p>
                                  <p className="text-sm text-blue-600">{doctor.specialization}</p>
                                </div>
                              </div>
                              {doctor.phone && (
                                <p className="text-xs text-gray-600">{doctor.phone}</p>
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Select Date */}
                  {bookingStep === "date" && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => setBookingStep("doctor")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          ← Back
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Select Date - {selectedDoctor?.name}
                        </h3>
                      </div>
                      <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose a date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => handleDateSelect(e.target.value)}
                          min={minDate}
                          max={maxDate}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        />
                        {selectedDate && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {formatDate(selectedDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Select Time */}
                  {bookingStep === "time" && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => setBookingStep("date")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          ← Back
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Select Time - {formatDate(selectedDate)}
                        </h3>
                      </div>
                      {availableTimeSlots.length === 0 ? (
                        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800">
                            No available time slots for this date. Please select another date.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-600 mb-4">
                            Available time slots for {selectedDoctor?.name}
                          </p>
                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {availableTimeSlots.map((time) => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedTime === time
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white border-gray-200 hover:border-blue-400"
                                }`}
                              >
                                <FaClock className="mx-auto mb-1" />
                                <p className="text-sm font-medium">{time}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Confirm */}
                  {bookingStep === "confirm" && (
                    <div className="animate-fade-in">
                      <div className="flex items-center gap-4 mb-6">
                        <button
                          onClick={() => setBookingStep("time")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          ← Back
                        </button>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Confirm Appointment
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <FaUserMd className="text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Doctor</p>
                              <p className="font-semibold text-gray-800">
                                {selectedDoctor?.name}
                              </p>
                              <p className="text-sm text-blue-600">
                                {selectedDoctor?.specialization}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaCalendarCheck className="text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold text-gray-800">
                                {formatDate(selectedDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaClock className="text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Time</p>
                              <p className="font-semibold text-gray-800">{selectedTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for Visit (Optional)
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe the reason for your visit..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleConfirmBooking}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Confirm & Book
                        </button>
                        <button
                          onClick={resetBooking}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming Appointments */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Appointments</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-600">
                    No upcoming appointments
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingAppointments.map((apt, index) => (
                      <div
                        key={apt.id}
                        onClick={() => handleAppointmentClick(apt)}
                        className="cursor-pointer bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUserMd className="text-blue-600 text-2xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">{apt.doctorName}</h3>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCalendarCheck />
                                <span>{formatDate(apt.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaClock />
                                <span>{apt.time}</span>
                              </div>
                            </div>
                            {apt.reason && (
                              <p className="text-gray-600 mt-2">
                                <span className="font-medium">Reason:</span> {apt.reason}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-3">
                              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {apt.status}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenMessages(apt.doctorId);
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                              >
                                <FaComments />
                                <span>Message</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Appointments */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Appointments</h2>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : pastAppointments.length === 0 ? (
                  <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-600">
                    No past appointments
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pastAppointments.map((apt, index) => (
                      <div
                        key={apt.id}
                        className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400 hover:shadow-lg transition-all animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <FaUserMd className="text-gray-600 text-2xl" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {apt.doctorName}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaCalendarCheck />
                                <span>{formatDate(apt.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaClock />
                                <span>{apt.time}</span>
                              </div>
                            </div>
                            {apt.reason && (
                              <p className="text-gray-600 mt-2">
                                <span className="font-medium">Reason:</span> {apt.reason}
                              </p>
                            )}
                            {apt.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Doctor Notes:
                                </p>
                                <p className="text-gray-600">{apt.notes}</p>
                              </div>
                            )}
                            <span
                              className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                                apt.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Browse Doctors Page */}
          {activeMenu === "browse-doctors" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse Doctors</h2>
              
              {!browseSpecialization ? (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Select Medical Specialization
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {specializations.map((spec, index) => (
                      <button
                        key={spec}
                        onClick={() => setBrowseSpecialization(spec)}
                        className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <FaStethoscope className="text-blue-600 text-3xl mx-auto mb-3" />
                        <p className="font-semibold text-gray-800 text-lg">{spec}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : !selectedDoctorForView ? (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setBrowseSpecialization("")}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <FaArrowLeft />
                      Back to Specializations
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Doctors - {browseSpecialization}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {doctorsBySpecialization.map((doctor, index) => (
                      <div
                        key={doctor.id}
                        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all cursor-pointer animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => setSelectedDoctorForView(doctor)}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <img
                            src={getAvatarUrl(doctor.name)}
                            alt={doctor.name}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <h4 className="font-bold text-gray-800 text-lg">{doctor.name}</h4>
                            <p className="text-sm text-blue-600">{doctor.specialization}</p>
                          </div>
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <FaPhone className="text-sm" />
                            <span className="text-sm">{doctor.phone}</span>
                          </div>
                        )}
                        <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setSelectedDoctorForView(null)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <FaArrowLeft />
                      Back to Doctors
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <img
                        src={getAvatarUrl(selectedDoctorForView.name)}
                        alt={selectedDoctorForView.name}
                        className="w-32 h-32 rounded-full mx-auto md:mx-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">
                          {selectedDoctorForView.name}
                        </h3>
                        <p className="text-xl text-blue-600 mb-4">
                          {selectedDoctorForView.specialization}
                        </p>
                        {selectedDoctorForView.bio && (
                          <p className="text-gray-600 leading-relaxed">{selectedDoctorForView.bio}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {selectedDoctorForView.phone && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaPhone className="text-blue-600 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-semibold text-gray-800">{selectedDoctorForView.phone}</p>
                          </div>
                        </div>
                      )}
                      {selectedDoctorForView.email && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <FaEnvelope className="text-blue-600 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-800">{selectedDoctorForView.email}</p>
                          </div>
                        </div>
                      )}
                      {selectedDoctorForView.clinicLocation && (
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                          <FaMapMarkerAlt className="text-blue-600 text-xl mt-1" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Clinic Location</p>
                            <p className="font-semibold text-gray-800">{selectedDoctorForView.clinicLocation}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookFromDoctor(selectedDoctorForView)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <FaCalendarCheck />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diagnosis Page */}
          {activeMenu === "diagnosis" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Diagnosis</h2>
              
              <div className="space-y-6">
                {/* Sample Diagnosis Data */}
                {[
                  {
                    id: "diag_sample_1",
                    doctorName: "Dr. John Smith",
                    specialization: "Cardiology",
                    diagnosis: "Mild hypertension with elevated blood pressure readings. Patient shows signs of stress-related cardiovascular response.",
                    disease: "Hypertension (Stage 1)",
                    testResults: "Blood Pressure: 145/95 mmHg\nHeart Rate: 78 bpm\nECG: Normal sinus rhythm\nBlood Tests: All within normal range",
                    notes: "Patient should monitor blood pressure daily. Recommended lifestyle changes including reduced sodium intake and regular exercise. Follow-up appointment scheduled in 2 weeks.",
                    prescription: "1. Lisinopril 10mg - Take once daily in the morning\n2. Aspirin 81mg - Take once daily with food\n3. Follow up in 2 weeks for blood pressure check",
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                  },
                  {
                    id: "diag_sample_2",
                    doctorName: "Dr. Sarah Johnson",
                    specialization: "Pediatrics",
                    diagnosis: "Common cold with mild fever. No signs of complications.",
                    disease: "Upper Respiratory Infection",
                    testResults: "Temperature: 37.8°C\nThroat Culture: Negative for strep\nChest X-ray: Clear",
                    notes: "Patient should rest and stay hydrated. Symptoms should improve within 5-7 days.",
                    prescription: "1. Acetaminophen 500mg - Take as needed for fever\n2. Rest and plenty of fluids\n3. Return if symptoms worsen",
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                  },
                ].map((diag, index) => (
                    <div
                      key={diag.id}
                      className="bg-white rounded-lg shadow-lg p-6 animate-slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{diag.doctorName}</h3>
                          <p className="text-sm text-blue-600">{diag.specialization || "General Medicine"}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(diag.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {diag.diagnosis && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Diagnosis</h4>
                            <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{diag.diagnosis}</p>
                          </div>
                        )}

                        {diag.disease && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Disease</h4>
                            <p className="text-gray-800 bg-yellow-50 p-3 rounded-lg">{diag.disease}</p>
                          </div>
                        )}

                        {diag.testResults && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Test Results</h4>
                            <p className="text-gray-800 bg-green-50 p-3 rounded-lg whitespace-pre-wrap">{diag.testResults}</p>
                          </div>
                        )}

                        {diag.notes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Doctor Notes</h4>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{diag.notes}</p>
                          </div>
                        )}

                        {diag.prescription && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Prescription</h4>
                            <p className="text-gray-800 bg-purple-50 p-3 rounded-lg whitespace-pre-wrap">{diag.prescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                ))}
              </div>
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
                        user: { id: "doctor1", name: "Dr. John Smith", email: "john@clinic.com", role: "doctor" as const, specialization: "Cardiology", password: "" },
                        lastMessage: { id: "msg_1", senderId: "doctor1", senderName: "Dr. John Smith", receiverId: "patient1", receiverName: "Jane Doe", content: "That's great to hear! Please continue taking your medication as prescribed.", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), read: false },
                        unreadCount: 1,
                      },
                      {
                        user: { id: "doctor2", name: "Dr. Sarah Johnson", email: "sarah@clinic.com", role: "doctor" as const, specialization: "Pediatrics", password: "" },
                        lastMessage: { id: "msg_2", senderId: "doctor2", senderName: "Dr. Sarah Johnson", receiverId: "patient1", receiverName: "Jane Doe", content: "Your test results are ready. Please schedule a follow-up appointment.", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
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
                          <p className="text-sm text-gray-600">{selectedConversation.specialization || "Doctor"}</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
                        {/* Sample Messages */}
                        {selectedConversation?.id === "doctor1" && [
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
                    userId: "patient1",
                    title: "Appointment Reminder",
                    message: "You have an appointment with Dr. John Smith tomorrow at 10:00 AM",
                    type: "appointment" as const,
                    read: false,
                    timestamp: "2024-11-15T10:30:00.000Z",
                    link: "/patient-dashboard?tab=appointments",
                  },
                  {
                    id: "notif_sample_2",
                    userId: "patient1",
                    title: "New Message",
                    message: "You have a new message from Dr. John Smith",
                    type: "message" as const,
                    read: false,
                    timestamp: "2024-11-16T08:15:00.000Z",
                    link: "/patient-dashboard?tab=messages",
                  },
                  {
                    id: "notif_sample_3",
                    userId: "patient1",
                    title: "Diagnosis Updated",
                    message: "Dr. John Smith has updated your diagnosis",
                    type: "diagnosis" as const,
                    read: true,
                    timestamp: "2024-11-13T14:20:00.000Z",
                    link: "/patient-dashboard?tab=diagnosis",
                  },
                  {
                    id: "notif_sample_4",
                    userId: "patient1",
                    title: "Test Results Ready",
                    message: "Your recent test results are now available. Please check your diagnosis page.",
                    type: "diagnosis" as const,
                    read: false,
                    timestamp: "2024-11-11T16:45:00.000Z",
                    link: "/patient-dashboard?tab=diagnosis",
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

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Account Type</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Patient
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Appointment Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 md:w-1/2 p-6 relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              <FaTimes className="text-xl" />
            </button>
            <h2 className="text-2xl font-bold mb-4">Edit Appointment</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <p className="font-semibold text-gray-800">{selectedAppointment.doctorName}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={editDate}
                min={minDate}
                max={maxDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAppointmentClick}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
