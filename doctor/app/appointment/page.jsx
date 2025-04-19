'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../../components/Navbar'

export default function AppointmentDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")
  const [appointment, setAppointment] = useState(null)

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!id) return

      try {
        const res = await fetch(`http://localhost:4000/doctorD/getAppointment/${id}`)
        const data = await res.json()
        setAppointment(data)
      } catch (error) {
        console.error("Error fetching appointment:", error)
      }
    }

    fetchAppointmentDetails()
  }, [id])

  if (!appointment) {
    return <div className="text-center mt-10 text-gray-500">Loading appointment details...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-md rounded-xl space-y-6">
        <h2 className="text-2xl font-bold text-blue-600">Appointment Details</h2>

        <section className="space-y-2">
          <p><strong>Status:</strong> <span className="capitalize">{appointment.status}</span></p>
          <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}</p>
        </section>

        <hr />

        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">Patient Info</h3>
          <p><strong>Name:</strong> {appointment.patientId?.name}</p>
          <p><strong>Email:</strong> {appointment.patientId?.email}</p>
        </section>

        <hr />

        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">Doctor Info</h3>
          <p><strong>Name:</strong> {appointment.doctorId?.name}</p>
          <p><strong>Specialization:</strong> {appointment.doctorId?.specialization}</p>
          <p><strong>Email:</strong> {appointment.doctorId?.email}</p>
        </section>

        <hr />

        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-700">Prescription</h3>
          <p>{appointment.prescription || "No prescription provided yet."}</p>
        </section>
      </main>
    </div>
  )
}
