"use client";

import { useState, useEffect } from "react";
import { createAppointment, getDoctors, User } from "@/lib/api";
import { toast } from "react-toastify";
import { getStoredUser } from "@/lib/auth";

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function AppointmentForm({
  onSuccess,
  onCancel,
}: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsList = await getDoctors();
      setDoctors(doctorsList);
    };
    fetchDoctors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to book an appointment");
      return;
    }

    setLoading(true);
    try {
      const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);
      if (!selectedDoctor) {
        toast.error("Please select a doctor");
        return;
      }

      await createAppointment(
        user.id,
        user.name,
        formData.doctorId,
        selectedDoctor.name,
        formData.date,
        formData.time,
        formData.reason
      );
      toast.success("Appointment booked successfully!");
      setFormData({
        doctorId: "",
        date: "",
        time: "",
        reason: "",
      });
      onSuccess();
    } catch (error) {
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book New Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Doctor
          </label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={minDate}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Visit (Optional)
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the reason for your visit..."
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

