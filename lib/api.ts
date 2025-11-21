// Fake API Service for Medical Clinic App

export type UserRole = "patient" | "doctor" | "admin";
export type DoctorStatus = "pending" | "approved" | "rejected";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  doctorStatus?: DoctorStatus;
  specialization?: string;
  phone?: string;
  bio?: string;
  clinicLocation?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  reason?: string;
}

// In-memory storage
let users: User[] = [
  {
    id: "admin1",
    email: "admin@clinic.com",
    password: "123456",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "doctor1",
    email: "john@clinic.com",
    password: "john123",
    name: "Dr. John Smith",
    role: "doctor",
    doctorStatus: "approved",
    specialization: "Cardiology",
    phone: "123-456-7890",
    bio: "Experienced cardiologist with over 15 years of practice. Specialized in heart disease prevention and treatment. Board certified in cardiovascular medicine.",
    clinicLocation: "Building A, Floor 2, Room 201 - Main Clinic",
  },
  {
    id: "doctor2",
    email: "sarah@clinic.com",
    password: "sarah123",
    name: "Dr. Sarah Johnson",
    role: "doctor",
    doctorStatus: "approved",
    specialization: "Pediatrics",
    phone: "234-567-8901",
    bio: "Dedicated pediatrician with a passion for children's health. Over 12 years of experience in treating infants, children, and adolescents. Specializes in preventive care and developmental issues.",
    clinicLocation: "Building B, Floor 1, Room 105 - Children's Wing",
  },
  {
    id: "doctor3",
    email: "michael@clinic.com",
    password: "michael123",
    name: "Dr. Michael Brown",
    role: "doctor",
    doctorStatus: "approved",
    specialization: "Neurology",
    phone: "345-678-9012",
    bio: "Board-certified neurologist specializing in brain and nervous system disorders. Expert in treating migraines, epilepsy, and neurological conditions. 18 years of clinical experience.",
    clinicLocation: "Building A, Floor 3, Room 305 - Neurology Department",
  },
  {
    id: "doctor4",
    email: "emily@clinic.com",
    password: "emily123",
    name: "Dr. Emily Davis",
    role: "doctor",
    doctorStatus: "approved",
    specialization: "Dermatology",
    phone: "456-789-0123",
    bio: "Expert dermatologist with focus on skin health, cosmetic dermatology, and treatment of skin conditions. Certified in advanced dermatological procedures. 10 years of practice.",
    clinicLocation: "Building C, Floor 1, Room 110 - Dermatology Clinic",
  },
  {
    id: "doctor5",
    email: "robert@clinic.com",
    password: "robert123",
    name: "Dr. Robert Wilson",
    role: "doctor",
    doctorStatus: "approved",
    specialization: "Surgery",
    phone: "567-890-1234",
    bio: "Renowned surgeon with expertise in general and minimally invasive surgery. Over 20 years of surgical experience. Performed thousands of successful procedures.",
    clinicLocation: "Building A, Floor 4, Room 401 - Surgical Wing",
  },
  {
    id: "patient1",
    email: "jane@email.com",
    password: "jane123",
    name: "Jane Doe",
    role: "patient",
    phone: "987-654-3210",
  },
  {
    id: "patient2",
    email: "robert@email.com",
    password: "robert456",
    name: "Robert Wilson",
    role: "patient",
    phone: "876-543-2109",
  },
  {
    id: "patient3",
    email: "maria@email.com",
    password: "maria123",
    name: "Maria Garcia",
    role: "patient",
    phone: "765-432-1098",
  },
  {
    id: "patient4",
    email: "david@email.com",
    password: "david123",
    name: "David Lee",
    role: "patient",
    phone: "654-321-0987",
  },
  {
    id: "patient5",
    email: "lisa@email.com",
    password: "lisa123",
    name: "Lisa Anderson",
    role: "patient",
    phone: "543-210-9876",
  },
  {
    id: "patient6",
    email: "james@email.com",
    password: "james123",
    name: "James Miller",
    role: "patient",
    phone: "432-109-8765",
  },
  {
    id: "patient7",
    email: "susan@email.com",
    password: "susan123",
    name: "Susan Taylor",
    role: "patient",
    phone: "321-098-7654",
  },
  {
    id: "patient8",
    email: "thomas@email.com",
    password: "thomas123",
    name: "Thomas Moore",
    role: "patient",
    phone: "210-987-6543",
  },
];
// // In-memory storage
// let users: User[] = [
//   {
//     id: "admin1",
//     email: "admin@clinic.com",
//     password: "admin123",
//     name: "Admin User",
//     role: "admin",
//   },
//   {
//     id: "doctor1",
//     email: "doctor@clinic.com",
//     password: "doctor123",
//     name: "Dr. John Smith",
//     role: "doctor",
//     doctorStatus: "approved",
//     specialization: "Cardiology",
//     phone: "123-456-7890",
//   },
//   {
//     id: "doctor2",
//     email: "sarah@clinic.com",
//     password: "doctor123",
//     name: "Dr. Sarah Johnson",
//     role: "doctor",
//     doctorStatus: "approved",
//     specialization: "Pediatrics",
//     phone: "234-567-8901",
//   },
//   {
//     id: "doctor3",
//     email: "michael@clinic.com",
//     password: "doctor123",
//     name: "Dr. Michael Brown",
//     role: "doctor",
//     doctorStatus: "approved",
//     specialization: "Neurology",
//     phone: "345-678-9012",
//   },
//   {
//     id: "doctor4",
//     email: "emily@clinic.com",
//     password: "doctor123",
//     name: "Dr. Emily Davis",
//     role: "doctor",
//     doctorStatus: "approved",
//     specialization: "Dermatology",
//     phone: "456-789-0123",
//   },
//   {
//     id: "patient1",
//     email: "patient@clinic.com",
//     password: "patient123",
//     name: "Jane Doe",
//     role: "patient",
//     phone: "987-654-3210",
//   },
//   {
//     id: "patient2",
//     email: "patient2@clinic.com",
//     password: "patient123",
//     name: "Robert Wilson",
//     role: "patient",
//     phone: "876-543-2109",
//   },
//   {
//     id: "patient3",
//     email: "patient3@clinic.com",
//     password: "patient123",
//     name: "Maria Garcia",
//     role: "patient",
//     phone: "765-432-1098",
//   },
//   {
//     id: "patient4",
//     email: "patient4@clinic.com",
//     password: "patient123",
//     name: "David Lee",
//     role: "patient",
//     phone: "654-321-0987",
//   },
//   {
//     id: "patient5",
//     email: "patient5@clinic.com",
//     password: "patient123",
//     name: "Lisa Anderson",
//     role: "patient",
//     phone: "543-210-9876",
//   },
// ];

let appointments: Appointment[] = [
  {
    id: "apt1",
    patientId: "patient1",
    patientName: "Jane Doe",
    doctorId: "doctor1",
    doctorName: "Dr. John Smith",
    date: "2025-12-20",
    time: "10:00",
    status: "scheduled",
    reason: "Regular checkup",
  },
  {
    id: "apt2",
    patientId: "patient2",
    patientName: "Robert Wilson",
    doctorId: "doctor1",
    doctorName: "Dr. John Smith",
    date: "2025-12-18",
    time: "14:00",
    status: "completed",
    reason: "Heart examination",
    notes: "Patient is in good condition",
  },
  {
    id: "apt3",
    patientId: "patient3",
    patientName: "Maria Garcia",
    doctorId: "doctor2",
    doctorName: "Dr. Sarah Johnson",
    date: "2025-12-19",
    time: "11:00",
    status: "completed",
    reason: "Child checkup",
  },
  {
    id: "apt4",
    patientId: "patient1",
    patientName: "Jane Doe",
    doctorId: "doctor2",
    doctorName: "Dr. Sarah Johnson",
    date: "2025-12-22",
    time: "09:00",
    status: "scheduled",
    reason: "Pediatric consultation",
  },
  {
    id: "apt5",
    patientId: "patient2",
    patientName: "Robert Wilson",
    doctorId: "doctor3",
    doctorName: "Dr. Michael Brown",
    date: "2025-12-21",
    time: "15:00",
    status: "scheduled",
    reason: "Neurological consultation",
  },
  {
    id: "apt6",
    patientId: "patient4",
    patientName: "David Lee",
    doctorId: "doctor1",
    doctorName: "Dr. John Smith",
    date: "2025-12-17",
    time: "16:00",
    status: "completed",
    reason: "Cardiac checkup",
  },
  {
    id: "apt7",
    patientId: "patient5",
    patientName: "Lisa Anderson",
    doctorId: "doctor4",
    doctorName: "Dr. Emily Davis",
    date: "2025-12-23",
    time: "10:00",
    status: "scheduled",
    reason: "Skin consultation",
  },
  {
    id: "apt8",
    patientId: "patient3",
    patientName: "Maria Garcia",
    doctorId: "doctor3",
    doctorName: "Dr. Michael Brown",
    date: "2025-12-24",
    time: "14:00",
    status: "scheduled",
    reason: "Neurological follow-up",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Authentication
export const login = async (email: string, password: string): Promise<User | null> => {
  await delay(500);
  const user = users.find((u) => u.email === email && u.password === password);
  if (user && user.role === "doctor" && user.doctorStatus !== "approved") {
    return null; // Doctors must be approved to login
  }
  return user ? { ...user, password: "" } : null;
};

export const register = async (
  email: string,
  password: string,
  name: string,
  role: UserRole,
  specialization?: string,
  phone?: string
): Promise<User> => {
  await delay(500);
  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    password,
    name,
    role,
    specialization,
    phone,
    doctorStatus: role === "doctor" ? "pending" : undefined,
  };
  users.push(newUser);
  return { ...newUser, password: "" };
};

// Users
export const getUsers = async (): Promise<User[]> => {
  await delay(300);
  return users.map((u) => ({ ...u, password: "" }));
};

export const getPendingDoctors = async (): Promise<User[]> => {
  await delay(300);
  return users
    .filter((u) => u.role === "doctor" && u.doctorStatus === "pending")
    .map((u) => ({ ...u, password: "" }));
};

export const updateDoctorStatus = async (
  doctorId: string,
  status: DoctorStatus
): Promise<User> => {
  await delay(500);
  const user = users.find((u) => u.id === doctorId);
  if (user && user.role === "doctor") {
    user.doctorStatus = status;
    return { ...user, password: "" };
  }
  throw new Error("Doctor not found");
};

// Appointments
export const getAppointments = async (userId: string, role: UserRole): Promise<Appointment[]> => {
  await delay(300);
  if (role === "admin") {
    return [...appointments];
  } else if (role === "doctor") {
    return appointments.filter((apt) => apt.doctorId === userId);
  } else {
    return appointments.filter((apt) => apt.patientId === userId);
  }
};

export const createAppointment = async (
  patientId: string,
  patientName: string,
  doctorId: string,
  doctorName: string,
  date: string,
  time: string,
  reason?: string
): Promise<Appointment> => {
  await delay(500);
  const newAppointment: Appointment = {
    id: `apt_${Date.now()}`,
    patientId,
    patientName,
    doctorId,
    doctorName,
    date,
    time,
    status: "scheduled",
    reason,
  };
  appointments.push(newAppointment);
  return newAppointment;
};

export const updateAppointment = async (
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<Appointment> => {
  await delay(500);
  const appointment = appointments.find((apt) => apt.id === appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }
  Object.assign(appointment, updates);
  return { ...appointment };
};

export const getDoctors = async (): Promise<User[]> => {
  await delay(300);
  return users
    .filter((u) => u.role === "doctor" && u.doctorStatus === "approved")
    .map((u) => ({ ...u, password: "" }));
};

// Get Patient by ID
export const getPatientById = async (patientId: string): Promise<User | null> => {
  await delay(300);
  const patient = users.find((u) => u.id === patientId && u.role === "patient");
  return patient ? { ...patient, password: "" } : null;
};

// Statistics
export interface Statistics {
  totalAppointments: number;
  totalDoctors: number;
  totalPatients: number;
}

export const getStatistics = async (): Promise<Statistics> => {
  await delay(300);
  return {
    totalAppointments: appointments.length,
    totalDoctors: users.filter((u) => u.role === "doctor" && u.doctorStatus === "approved").length,
    totalPatients: users.filter((u) => u.role === "patient").length,
  };
};

// Popular Doctors (based on number of appointments)
export interface PopularDoctor extends User {
  appointmentCount: number;
}

export const getPopularDoctors = async (limit: number = 4): Promise<PopularDoctor[]> => {
  await delay(300);
  const approvedDoctors = users.filter(
    (u) => u.role === "doctor" && u.doctorStatus === "approved"
  );
  
  const doctorsWithCounts = approvedDoctors.map((doctor) => {
    const appointmentCount = appointments.filter((apt) => apt.doctorId === doctor.id).length;
    return {
      ...doctor,
      password: "",
      appointmentCount,
    };
  });

  // Sort by appointment count and return top doctors
  return doctorsWithCounts
    .sort((a, b) => b.appointmentCount - a.appointmentCount)
    .slice(0, limit);
};

// Update Doctor
export const updateDoctor = async (
  doctorId: string,
  updates: Partial<User>
): Promise<User> => {
  await delay(500);
  const user = users.find((u) => u.id === doctorId);
  if (!user || user.role !== "doctor") {
    throw new Error("Doctor not found");
  }
  Object.assign(user, updates);
  return { ...user, password: "" };
};

// Delete Doctor
export const deleteDoctor = async (doctorId: string): Promise<void> => {
  await delay(500);
  const index = users.findIndex((u) => u.id === doctorId && u.role === "doctor");
  if (index === -1) {
    throw new Error("Doctor not found");
  }
  users.splice(index, 1);
  // Also remove appointments for this doctor
  const doctorAppointments = appointments.filter((apt) => apt.doctorId === doctorId);
  doctorAppointments.forEach((apt) => {
    const aptIndex = appointments.findIndex((a) => a.id === apt.id);
    if (aptIndex !== -1) {
      appointments.splice(aptIndex, 1);
    }
  });
};

// Create Doctor (Admin can create doctors directly)
export const createDoctor = async (
  email: string,
  password: string,
  name: string,
  specialization: string,
  phone?: string
): Promise<User> => {
  await delay(500);
  const newDoctor: User = {
    id: `doctor_${Date.now()}`,
    email,
    password,
    name,
    role: "doctor",
    doctorStatus: "approved",
    specialization,
    phone,
  };
  users.push(newDoctor);
  return { ...newDoctor, password: "" };
};

// Update User (for patients to update their profile)
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  await delay(500);
  const user = users.find((u) => u.id === userId);
  if (!user) {
    throw new Error("User not found");
  }
  Object.assign(user, updates);
  return { ...user, password: "" };
};

// Message interface
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Notification interface
export type NotificationType = "appointment" | "message" | "diagnosis" | "system";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  link?: string;
}

// Diagnosis interface
export interface Diagnosis {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  diagnosis: string;
  disease?: string;
  notes?: string;
  testResults?: string;
  prescription?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for messages, notifications, and diagnoses
let messages: Message[] = [
  {
    id: "msg_1",
    senderId: "doctor1",
    senderName: "Dr. John Smith",
    receiverId: "patient1",
    receiverName: "Jane Doe",
    content: "Hello, I wanted to follow up on your recent appointment. How are you feeling?",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "msg_2",
    senderId: "patient1",
    senderName: "Jane Doe",
    receiverId: "doctor1",
    receiverName: "Dr. John Smith",
    content: "Thank you for checking in! I'm feeling much better now.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "msg_3",
    senderId: "doctor1",
    senderName: "Dr. John Smith",
    receiverId: "patient1",
    receiverName: "Jane Doe",
    content: "That's great to hear! Please continue taking your medication as prescribed.",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
];

let notifications: Notification[] = [
  {
    id: "notif_1",
    userId: "patient1",
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. John Smith tomorrow at 10:00 AM",
    type: "appointment",
    read: false,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/patient-dashboard?tab=appointments",
  },
  {
    id: "notif_2",
    userId: "patient1",
    title: "New Message",
    message: "You have a new message from Dr. John Smith",
    type: "message",
    read: false,
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    link: "/patient-dashboard?tab=messages",
  },
  {
    id: "notif_3",
    userId: "patient1",
    title: "Diagnosis Updated",
    message: "Dr. John Smith has updated your diagnosis",
    type: "diagnosis",
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/patient-dashboard?tab=diagnosis",
  },
  {
    id: "notif_4",
    userId: "doctor1",
    title: "New Appointment",
    message: "Jane Doe has booked a new appointment for tomorrow",
    type: "appointment",
    read: false,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/doctor-dashboard?tab=appointments",
  },
  {
    id: "notif_5",
    userId: "doctor1",
    title: "New Message",
    message: "You have a new message from Jane Doe",
    type: "message",
    read: true,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/doctor-dashboard?tab=messages",
  },
];

let diagnoses: Diagnosis[] = [
  {
    id: "diag_1",
    patientId: "patient1",
    patientName: "Jane Doe",
    doctorId: "doctor1",
    doctorName: "Dr. John Smith",
    appointmentId: "apt_1",
    diagnosis: "Mild hypertension with elevated blood pressure readings. Patient shows signs of stress-related cardiovascular response.",
    disease: "Hypertension (Stage 1)",
    notes: "Patient should monitor blood pressure daily. Recommended lifestyle changes including reduced sodium intake and regular exercise. Follow-up appointment scheduled in 2 weeks.",
    testResults: "Blood Pressure: 145/95 mmHg\nHeart Rate: 78 bpm\nECG: Normal sinus rhythm\nBlood Tests: All within normal range",
    prescription: "1. Lisinopril 10mg - Take once daily in the morning\n2. Aspirin 81mg - Take once daily with food\n3. Follow up in 2 weeks for blood pressure check",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Messages API
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> => {
  await delay(300);
  const sender = users.find((u) => u.id === senderId);
  const receiver = users.find((u) => u.id === receiverId);
  
  if (!sender || !receiver) {
    throw new Error("User not found");
  }

  const message: Message = {
    id: `msg_${Date.now()}`,
    senderId,
    senderName: sender.name,
    receiverId,
    receiverName: receiver.name,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  messages.push(message);

  // Create notification for receiver
  const notification: Notification = {
    id: `notif_${Date.now()}`,
    userId: receiverId,
    title: "New Message",
    message: `You have a new message from ${sender.name}`,
    type: "message",
    read: false,
    timestamp: new Date().toISOString(),
    link: `/messages`,
  };
  notifications.push(notification);

  return message;
};

export const getMessages = async (
  userId: string,
  otherUserId?: string
): Promise<Message[]> => {
  await delay(300);
  if (otherUserId) {
    return messages
      .filter(
        (m) =>
          (m.senderId === userId && m.receiverId === otherUserId) ||
          (m.receiverId === userId && m.senderId === otherUserId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  return messages
    .filter((m) => m.senderId === userId || m.receiverId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getConversations = async (userId: string): Promise<Array<{ user: User; lastMessage: Message; unreadCount: number }>> => {
  await delay(300);
  const userMessages = messages.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );

  const conversationMap = new Map<string, { lastMessage: Message; unreadCount: number }>();

  userMessages.forEach((msg) => {
    const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    const existing = conversationMap.get(otherUserId);

    if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
      conversationMap.set(otherUserId, {
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    if (msg.receiverId === userId && !msg.read) {
      const current = conversationMap.get(otherUserId);
      if (current) {
        current.unreadCount++;
      }
    }
  });

  const conversations = Array.from(conversationMap.entries()).map(([otherUserId, data]) => {
    const user = users.find((u) => u.id === otherUserId);
    return {
      user: user ? { ...user, password: "" } : null,
      lastMessage: data.lastMessage,
      unreadCount: data.unreadCount,
    };
  }).filter((conv) => conv.user !== null) as Array<{ user: User; lastMessage: Message; unreadCount: number }>;

  return conversations.sort(
    (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
  );
};

export const markMessagesAsRead = async (
  userId: string,
  otherUserId: string
): Promise<void> => {
  await delay(200);
  messages.forEach((msg) => {
    if (msg.receiverId === userId && msg.senderId === otherUserId && !msg.read) {
      msg.read = true;
    }
  });
};

// Notifications API
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(300);
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await delay(200);
  const notification = notifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  await delay(200);
  notifications.forEach((n) => {
    if (n.userId === userId && !n.read) {
      n.read = true;
    }
  });
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: Notification["type"],
  link?: string
): Promise<Notification> => {
  await delay(200);
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random()}`,
    userId,
    title,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString(),
    link,
  };
  notifications.push(notification);
  return notification;
};

// Diagnosis API
export const createDiagnosis = async (
  patientId: string,
  doctorId: string,
  diagnosis: string,
  disease?: string,
  notes?: string,
  testResults?: string,
  prescription?: string,
  appointmentId?: string
): Promise<Diagnosis> => {
  await delay(500);
  const patient = users.find((u) => u.id === patientId);
  const doctor = users.find((u) => u.id === doctorId);

  if (!patient || !doctor) {
    throw new Error("User not found");
  }

  const newDiagnosis: Diagnosis = {
    id: `diag_${Date.now()}`,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName: doctor.name,
    appointmentId,
    diagnosis,
    disease,
    notes,
    testResults,
    prescription,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  diagnoses.push(newDiagnosis);

  // Create notification for patient
  await createNotification(
    patientId,
    "New Diagnosis",
    `Dr. ${doctor.name} has added a new diagnosis for you`,
    "diagnosis",
    `/patient-dashboard?tab=diagnosis`
  );

  return newDiagnosis;
};

export const getDiagnoses = async (
  userId: string,
  role: "patient" | "doctor"
): Promise<Diagnosis[]> => {
  await delay(300);
  if (role === "patient") {
    return diagnoses
      .filter((d) => d.patientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    return diagnoses
      .filter((d) => d.doctorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

export const getDiagnosisByPatient = async (
  doctorId: string,
  patientId: string
): Promise<Diagnosis | null> => {
  await delay(300);
  const diagnosis = diagnoses.find(
    (d) => d.doctorId === doctorId && d.patientId === patientId
  );
  return diagnosis || null;
};

export const updateDiagnosis = async (
  diagnosisId: string,
  updates: Partial<Diagnosis>
): Promise<Diagnosis> => {
  await delay(500);
  const diagnosis = diagnoses.find((d) => d.id === diagnosisId);
  if (!diagnosis) {
    throw new Error("Diagnosis not found");
  }

  Object.assign(diagnosis, { ...updates, updatedAt: new Date().toISOString() });

  // Create notification for patient
  await createNotification(
    diagnosis.patientId,
    "Diagnosis Updated",
    `Dr. ${diagnosis.doctorName} has updated your diagnosis`,
    "diagnosis",
    `/patient-dashboard?tab=diagnosis`
  );

  return diagnosis;
};

// Get patients for a doctor
export const getPatientsForDoctor = async (doctorId: string): Promise<User[]> => {
  await delay(300);
  const doctorAppointments = appointments.filter((apt) => apt.doctorId === doctorId);
  const patientIds = Array.from(new Set(doctorAppointments.map((apt) => apt.patientId)));
  const patientUsers = users
    .filter((u) => u.role === "patient" && patientIds.includes(u.id))
    .map((u) => ({ ...u, password: "" }));
  return patientUsers;
};

