'use client'

import { useSelector } from "react-redux"
import Navbar from "../components/Navbar"

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  console.log("User data from Redux:", user);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="max-w-5xl mx-auto p-4 mt-6">
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
      </main>
    </div>
  )
}
