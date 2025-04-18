'use client'

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"

export default function HomePage() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:4000/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      } else {
        setError("Failed to fetch user data.")
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />
      <main className="max-w-5xl mx-auto p-4 mt-6">
        {loading ? (
          <p className="text-gray-600">Loading user info...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : userData ? (
          <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-blue-600">Welcome, Ayush 👋</h2>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Verified:</strong> {Yes}</p>
            {/* <p><strong>Role:</strong> {userData.role || "Patient"}</p> */}
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </main>
    </div>
  )
}
