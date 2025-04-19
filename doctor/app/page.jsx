'use client'

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import Navbar from "../components/Navbar"

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [appointments, setAppointments] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`http://localhost:4000/doctorD/getAppointments?doctorId=${user.id}`)
        const data = await res.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto p-4 mt-6 space-y-6">
        {isAuthenticated && user ? (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-blue-600">
              Welcome, {user.name || "User"} 👋
            </h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Verified:</strong> {user.verified ? "Yes" : "No"}</p>
            <p><strong>Specialization:</strong> {user.specialization}</p>
            <p><strong>Location:</strong> {user.location}</p>
          </div>
        ) : (
          <p className="text-gray-600">User not logged in or session expired.</p>
        )}

        {appointments.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-blue-500">Your Appointments</h3>
            <ul className="space-y-3">
              {appointments.map((appt) => (
                <li key={appt._id} className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                  <p><strong>Patient Name:</strong> {appt.patientId?.name}</p>
                  <p><strong>Patient Email:</strong> {appt.patientId?.email}</p>
                  <p><strong>Date:</strong> {appt.date || "Not set"}</p>
                  <p><strong>Time:</strong> {appt.time || "Not set"}</p>
                  <button
                    onClick={() => router.push(`/appointment?id=${appt._id}`)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    See Appointment
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
