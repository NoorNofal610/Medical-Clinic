"use client";

import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import { 
  FaUserMd, 
  FaCalendarCheck, 
  FaHeartbeat,
  FaStethoscope,
  FaHeart,
  FaBaby,
  FaBone,
  FaBrain,
  FaVenus,
  FaHeadSideVirus,
  FaHandSparkles,
  FaUsers,
  FaUserInjured,
  FaStar
} from "react-icons/fa";
import { getStatistics, getPopularDoctors, PopularDoctor } from "@/lib/api";

export default function LandingPage() {
  const [statistics, setStatistics] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [popularDoctors, setPopularDoctors] = useState<PopularDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, doctors] = await Promise.all([
          getStatistics(),
          getPopularDoctors(4),
        ]);
        setStatistics(stats);
        setPopularDoctors(doctors);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const services = [
    { name: "General Medicine", icon: FaStethoscope, color: "text-blue-600" },
    { name: "Cardiology", icon: FaHeart, color: "text-red-600" },
    { name: "Pediatrics", icon: FaBaby, color: "text-pink-600" },
    { name: "Dermatology", icon: FaHandSparkles, color: "text-purple-600" },
    { name: "Orthopedics", icon: FaBone, color: "text-gray-700" },
    { name: "Neurology", icon: FaBrain, color: "text-indigo-600" },
    { name: "Gynecology", icon: FaVenus, color: "text-rose-600" },
    { name: "Psychiatry", icon: FaHeadSideVirus, color: "text-teal-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Medical Clinic
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Your trusted healthcare partner. Book appointments, manage your
              health records, and connect with experienced doctors.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition transform hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Our Clinic?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-500 border-2 border-transparent group">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-600 transition-colors duration-300">
                    <FaUserMd className="text-4xl text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                  Expert Doctors
                </h3>
                <p className="text-gray-600">
                  Our team of certified and experienced doctors is here to
                  provide you with the best care.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-green-500 border-2 border-transparent group">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-600 transition-colors duration-300">
                    <FaCalendarCheck className="text-4xl text-green-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors duration-300">
                  Easy Booking
                </h3>
                <p className="text-gray-600">
                  Book your appointments online with just a few clicks. Manage
                  your schedule effortlessly.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-purple-500 border-2 border-transparent group">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full group-hover:bg-purple-600 transition-colors duration-300">
                    <FaHeartbeat className="text-4xl text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  Comprehensive Care
                </h3>
                <p className="text-gray-600">
                  From routine checkups to specialized treatments, we cover all
                  your healthcare needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-4 rounded-full">
                    <FaCalendarCheck className="text-5xl" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {loading ? "..." : statistics.totalAppointments}
                </h3>
                <p className="text-xl text-white/90">Total Appointments</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-4 rounded-full">
                    <FaUserMd className="text-5xl" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {loading ? "..." : statistics.totalDoctors}
                </h3>
                <p className="text-xl text-white/90">Expert Doctors</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 p-4 rounded-full">
                    <FaUsers className="text-5xl" />
                  </div>
                </div>
                <h3 className="text-4xl font-bold mb-2">
                  {loading ? "..." : statistics.totalPatients}
                </h3>
                <p className="text-xl text-white/90">Happy Patients</p>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Doctors Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Top Doctors
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Meet our most experienced and trusted healthcare professionals
            </p>
            {loading ? (
              <div className="text-center text-gray-600">Loading...</div>
            ) : popularDoctors.length === 0 ? (
              <div className="text-center text-gray-600">No doctors available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-blue-400 group"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
                        {doctor.name.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-2">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center justify-center gap-1 text-yellow-500 mb-2">
                      <FaStar />
                      <span className="text-sm text-gray-600">
                        {doctor.appointmentCount} Appointments
                      </span>
                    </div>
                    {doctor.phone && (
                      <p className="text-sm text-gray-600">{doctor.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Our Services
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              We offer a wide range of medical specialties to meet all your healthcare needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.name}
                    className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border-2 border-gray-200 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:border-blue-400 group cursor-pointer"
                  >
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300`}>
                        <IconComponent className={`text-3xl ${service.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                      {service.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-xl mb-6">
              Join thousands of satisfied patients who trust us with their
              healthcare.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
            >
              Register Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

