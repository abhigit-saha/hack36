'use client'

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import { Calendar, Activity, Users, Award, ArrowRight } from "lucide-react"

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

  // Example data for progress stats
  const progressStats = [
    { title: "Sessions Completed", value: "24", icon: <Activity className="w-8 h-8 text-blue-500" /> },
    { title: "Streak", value: "7 days", icon: <Award className="w-8 h-8 text-purple-500" /> },
    { title: "Goals Achieved", value: "12", icon: <Award className="w-8 h-8 text-green-500" /> },
  ]

  // Example data for upcoming sessions
  const upcomingSessions = [
    { 
      title: "Physical Therapy", 
      date: "April 21, 2025", 
      time: "10:00 AM", 
      with: "Dr. Sarah Johnson",
      type: "Video Call"
    },
    { 
      title: "Progress Review", 
      date: "April 23, 2025", 
      time: "2:30 PM", 
      with: "Rehab Team",
      type: "In Person"
    },
  ]

  // Example rehab exercises for today
  const todaysExercises = [
    { name: "Shoulder Stretches", duration: "10 mins", completed: true },
    { name: "Leg Strengthening", duration: "15 mins", completed: false },
    { name: "Balance Training", duration: "8 mins", completed: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userData} />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="max-w-5xl mx-auto p-4 mt-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              onClick={fetchUserData} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : userData ? (
        <main>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-2/3 mb-8 md:mb-0">
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {userData.name || "User"}!</h1>
                  <p className="text-xl opacity-90">Your rehabilitation journey continues today.</p>
                  <p className="mt-4 text-blue-100">Keep up the great progress! You're on track with your recovery goals.</p>
                  <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition flex items-center">
                    View Your Recovery Plan <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
                <div className="md:w-1/3">
                  <img 
                    src="/api/placeholder/300/200" 
                    alt="Recovery journey"
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {progressStats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md flex items-center">
                  <div className="mr-4 bg-blue-50 p-3 rounded-full">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Upcoming Sessions */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Calendar className="mr-2 text-blue-500 w-5 h-5" /> Upcoming Sessions
                    </h2>
                    <a href="#" className="text-blue-500 hover:underline text-sm flex items-center">
                      View All <ArrowRight className="ml-1 w-4 h-4" />
                    </a>
                  </div>
                  
                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <h3 className="font-medium text-lg">{session.title}</h3>
                          <p className="text-gray-600">{session.date} at {session.time}</p>
                          <div className="flex justify-between mt-2">
                            <p className="text-sm text-gray-500">With: {session.with}</p>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {session.type}
                            </span>
                          </div>
                        </div>  
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No upcoming sessions scheduled.</p>
                  )}
                </div>

                {/* User Information */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Your Profile</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center text-blue-600 text-xl font-bold">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-lg">{userData.name || "User"}</p>
                        <p className="text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="flex justify-between py-2">
                        <span className="text-gray-500">Account Status:</span>
                        <span className={`font-medium ${userData.verified ? "text-green-500" : "text-yellow-500"}`}>
                          {userData.verified ? "Verified" : "Pending Verification"}
                        </span>
                      </p>
                      <p className="flex justify-between py-2">
                        <span className="text-gray-500">Member Since:</span>
                        <span className="font-medium">March 2025</span>
                      </p>
                    </div>
                    <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Today's Exercises */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <Activity className="mr-2 text-green-500 w-5 h-5" /> Today's Exercises
                    </h2>
                    <a href="#" className="text-blue-500 hover:underline text-sm">Start Session</a>
                  </div>
                  
                  <div className="space-y-3">
                    {todaysExercises.map((exercise, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="mr-3">
                          <input 
                            type="checkbox" 
                            checked={exercise.completed}
                            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${exercise.completed ? "line-through text-gray-400" : ""}`}>
                            {exercise.name}
                          </p>
                          <p className="text-sm text-gray-500">{exercise.duration}</p>
                        </div>
                        <button className="text-blue-500 hover:text-blue-700">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-medium mb-4">Your Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">65% of weekly goal completed</p>
                  </div>
                </div>

                {/* Support Resources */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Users className="mr-2 text-purple-500 w-5 h-5" /> Support Resources
                  </h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg flex items-center">
                      <img 
                        src="/api/placeholder/60/60" 
                        alt="Video call"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-medium">Contact Your Therapist</h3>
                        <p className="text-sm text-gray-600">Schedule a video call or send a message</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg flex items-center">
                      <img 
                        src="/api/placeholder/60/60" 
                        alt="Community"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-medium">Recovery Community</h3>
                        <p className="text-sm text-gray-600">Connect with others on similar journeys</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg flex items-center">
                      <img 
                        src="/api/placeholder/60/60" 
                        alt="Resources"
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-medium">Educational Resources</h3>
                        <p className="text-sm text-gray-600">Articles and videos about your condition</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Motivational Banner */}
            <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Keep Going Strong!</h2>
                  <p>Every small step counts. Your consistency and dedication make all the difference.</p>
                </div>
                <button className="mt-4 md:mt-0 bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
                  Set New Goals
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="max-w-5xl mx-auto p-4 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <img 
              src="/api/placeholder/200/200" 
              alt="No user found"
              className="mx-auto mb-4"
            />
            <p className="text-xl text-gray-600 mb-4">No user data found or you're not logged in.</p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Log In
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Rehabilitation Platform</h3>
              <p className="text-gray-400">Supporting your journey to recovery with personalized care and guidance.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Exercises</a></li>
                <li><a href="#" className="hover:text-white">Sessions</a></li>
                <li><a href="#" className="hover:text-white">Progress Tracker</a></li>
                <li><a href="#" className="hover:text-white">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Support</h3>
              <p className="text-gray-400">Need help? Our support team is available 24/7.</p>
              <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                Contact Us
              </button>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Rehabilitation Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}