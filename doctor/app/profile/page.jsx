'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch('http://localhost:4000/doctor/me', {
          credentials: 'include',
        })

        const data = await res.json()
        setDoctor(data.doctor)
        console.log(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error)
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">Doctor profile not found or unauthorized.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-600">
            {doctor.name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-blue-500 text-sm mt-1">Doctor Profile</p>
          </div>
        </div>

        <hr className="my-6" />

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="font-medium">{doctor.email}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Verified</p>
            <p className="font-medium">{doctor.verified ? 'Yes ✅' : 'No ❌'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Specialization</p>
            <p className="font-medium">{doctor.specialization}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Location</p>
            <p className="font-medium">{doctor.location}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Experience</p>
            <p className="font-medium">{doctor.experience || 'N/A'} years</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Availability</p>
            <p className="font-medium">{doctor.availability || 'Flexible'}</p>
          </div>
        </section>

        <hr className="my-6" />

        <section>
          <p className="text-gray-600 text-sm mb-1">About</p>
          <p className="text-gray-800">
            {doctor.bio || 'No bio added yet. You can update your profile to add one.'}
          </p>
        </section>
      </main>
    </div>
  )
}
