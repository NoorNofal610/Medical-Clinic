# Medical Clinic Web Application

A comprehensive medical clinic management system built with React and Next.js, featuring role-based access for Patients, Doctors, and Admins.

## Features

### Landing Page
- Clinic overview and information
- Service listings
- Call-to-action sections

### Authentication
- User registration (Patient, Doctor, Admin)
- Login system with role-based routing
- Doctor registration requires admin approval

### Patient Dashboard
- View upcoming and past appointments
- Book new appointments with available doctors
- View appointment details and doctor notes

### Doctor Dashboard
- View scheduled appointments
- Update appointment status (scheduled, completed, cancelled)
- Add and edit notes for patient appointments

### Admin Dashboard
- Review pending doctor registration requests
- Approve or reject doctor accounts
- View all appointments overview

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Notifications**: React Toastify
- **Data Storage**: In-memory Fake API

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Credentials

### Admin
- Email: `admin@clinic.com`
- Password: `admin123`

### Doctor
- Email: `doctor@clinic.com`
- Password: `doctor123`

### Patient
- Email: `patient@clinic.com`
- Password: `patient123`

## Project Structure

```
├── app/
│   ├── login/
│   ├── register/
│   ├── patient-dashboard/
│   ├── doctor-dashboard/
│   ├── admin-dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── LandingPage.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── PatientDashboard.tsx
│   ├── DoctorDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── AppointmentForm.tsx
│   ├── Navbar.tsx
│   └── Footer.tsx
├── lib/
│   ├── api.ts (Fake API service)
│   └── auth.ts (Authentication helpers)
└── package.json
```

## Key Features

### Doctor Registration Workflow
1. Doctor registers with specialization
2. Account status is set to "pending"
3. Admin reviews and approves/rejects
4. Approved doctors can login and access dashboard

### Appointment Management
- Patients can book appointments with approved doctors
- Doctors can update appointment status and add notes
- All appointments are stored in-memory (Fake API)

### Role-Based Access
- Each role has a dedicated dashboard
- Protected routes redirect to login if not authenticated
- Role-specific functionality and views

## Notes

- Data is stored in-memory and will reset on page refresh
- This is a frontend-only application with a fake API
- For production use, integrate with a real backend API

## License

MIT

