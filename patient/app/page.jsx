"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import {
  Calendar,
  Activity,
  Users,
  Award,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Video,
  MessageSquare,
  BookOpen,
} from "lucide-react"
import Image from "next/image"

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
    { title: "Sessions Completed", value: "24", icon: <Activity className="w-8 h-8 text-teal-500" /> },
    { title: "Streak", value: "7 days", icon: <Award className="w-8 h-8 text-violet-500" /> },
    { title: "Goals Achieved", value: "12", icon: <CheckCircle className="w-8 h-8 text-emerald-500" /> },
  ]

  // Example data for upcoming sessions
  const upcomingSessions = [
    {
      title: "Physical Therapy",
      date: "April 21, 2025",
      time: "10:00 AM",
      with: "Dr. Sarah Johnson",
      type: "Video Call",
      icon: <Video className="w-4 h-4" />,
    },
    {
      title: "Progress Review",
      date: "April 23, 2025",
      time: "2:30 PM",
      with: "Rehab Team",
      type: "In Person",
      icon: <Users className="w-4 h-4" />,
    },
  ]

  // Example rehab exercises for today
  const todaysExercises = [
    { name: "Shoulder Stretches", duration: "10 mins", completed: true },
    { name: "Leg Strengthening", duration: "15 mins", completed: false },
    { name: "Balance Training", duration: "8 mins", completed: false },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={userData} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto p-4 mt-6">
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchUserData}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : userData ? (
        <main>
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-16">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-3/5 mb-8 md:mb-0">
                  <h1 className="text-4xl font-bold mb-3">Welcome back, {userData.name || "User"}!</h1>
                  <p className="text-xl opacity-90">Your rehabilitation journey continues today.</p>
                  <div className="mt-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-white">Keep up the great progress! You're on track with your recovery goals.</p>
                  </div>
                  <button className="mt-6 bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center shadow-md">
                    View Your Recovery Plan <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
                <div className="md:w-2/5">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-white/30 rounded-lg blur-md"></div>
                    <div className="relative">
                      <Image
                        src="/placeholder.svg?height=300&width=400"
                        width={400}
                        height={300}
                        alt="Recovery journey"
                        className="rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {progressStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="mr-4 bg-slate-50 p-3 rounded-full">{stat.icon}</div>
                    <div>
                      <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Upcoming Sessions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                      <Calendar className="mr-2 text-teal-500 w-5 h-5" /> Upcoming Sessions
                    </h2>
                    <a href="#" className="text-teal-500 hover:text-teal-600 text-sm flex items-center group">
                      View All <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>

                  {upcomingSessions.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingSessions.map((session, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-teal-500 pl-4 py-3 bg-slate-50 rounded-r-lg hover:bg-slate-100 transition-colors"
                        >
                          <h3 className="font-medium text-lg text-slate-800">{session.title}</h3>
                          <div className="flex items-center text-slate-600 mt-1">
                            <Clock className="w-4 h-4 mr-1 text-slate-400" />
                            <p>
                              {session.date} at {session.time}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <p className="text-sm text-slate-500 flex items-center">
                              <Users className="w-4 h-4 mr-1 text-slate-400" /> {session.with}
                            </p>
                            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs rounded-full flex items-center">
                              {session.icon}
                              <span className="ml-1">{session.type}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">No upcoming sessions scheduled.</p>
                  )}
                </div>

                {/* User Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <FileText className="mr-2 text-teal-500 w-5 h-5" /> Your Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full w-16 h-16 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-lg text-slate-800">{userData.name || "User"}</p>
                        <p className="text-slate-500">{userData.email}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="flex justify-between py-2">
                        <span className="text-slate-500">Account Status:</span>
                        <span
                          className={`font-medium ${userData.verified ? "text-emerald-500" : "text-amber-500"} flex items-center`}
                        >
                          {userData.verified ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Verified
                            </>
                          ) : (
                            "Pending Verification"
                          )}
                        </span>
                      </p>
                      <p className="flex justify-between py-2">
                        <span className="text-slate-500">Member Since:</span>
                        <span className="font-medium text-slate-700">March 2025</span>
                      </p>
                    </div>
                    <button className="w-full mt-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Today's Exercises */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                      <Activity className="mr-2 text-emerald-500 w-5 h-5" /> Today's Exercises
                    </h2>
                    <button className="text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      Start Session
                    </button>
                  </div>

                  <div className="space-y-3">
                    {todaysExercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="mr-3">
                          <input
                            type="checkbox"
                            checked={exercise.completed}
                            className="w-5 h-5 text-teal-500 rounded focus:ring-teal-500"
                            readOnly
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-medium text-slate-800 ${exercise.completed ? "line-through text-slate-400" : ""}`}
                          >
                            {exercise.name}
                          </p>
                          <p className="text-sm text-slate-500 flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" /> {exercise.duration}
                          </p>
                        </div>
                        <button className="text-teal-500 hover:text-teal-700 p-2 rounded-full hover:bg-teal-50 transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-slate-800">Your Progress</h3>
                      <span className="text-emerald-500 font-medium">65%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">65% of weekly goal completed</p>
                  </div>
                </div>

                {/* Support Resources */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <Users className="mr-2 text-violet-500 w-5 h-5" /> Support Resources
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-teal-50 rounded-lg flex items-center hover:bg-teal-100 transition-colors cursor-pointer">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <Video className="w-8 h-8 text-teal-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">Contact Your Therapist</h3>
                        <p className="text-sm text-slate-600">Schedule a video call or send a message</p>
                      </div>
                    </div>

                    <div className="p-4 bg-violet-50 rounded-lg flex items-center hover:bg-violet-100 transition-colors cursor-pointer">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <MessageSquare className="w-8 h-8 text-violet-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">Recovery Community</h3>
                        <p className="text-sm text-slate-600">Connect with others on similar journeys</p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-lg flex items-center hover:bg-emerald-100 transition-colors cursor-pointer">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4">
                        <BookOpen className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">Educational Resources</h3>
                        <p className="text-sm text-slate-600">Articles and videos about your condition</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Banner */}
            <div className="mt-12 bg-gradient-to-r from-violet-500 to-purple-600 p-8 rounded-xl text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Keep Going Strong!</h2>
                  <p className="text-violet-100">
                    Every small step counts. Your consistency and dedication make all the difference.
                  </p>
                </div>
                <button className="mt-6 md:mt-0 bg-white text-violet-600 px-6 py-3 rounded-lg font-medium hover:bg-violet-50 transition-colors shadow-md">
                  Set New Goals
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="max-w-6xl mx-auto p-4 mt-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to MediRehab</h2>
            <p className="text-slate-600 mb-6">Please log in to access your personalized rehabilitation dashboard.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm font-medium">
                Log In
              </button>
              <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Activity className="mr-2 text-teal-400" /> MediRehab
              </h3>
              <p className="text-slate-300 max-w-md">
                Supporting your journey to recovery with personalized care, evidence-based treatments, and continuous
                guidance from medical professionals.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-teal-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-teal-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="bg-slate-700 p-2 rounded-full hover:bg-teal-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-slate-300">
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Exercises
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Sessions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Progress Tracker
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-teal-400 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Support</h3>
              <p className="text-slate-300 mb-4">Need help? Our support team is available 24/7.</p>
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg transition-colors font-medium shadow-sm">
                Contact Us
              </button>
              <div className="mt-4 text-slate-300">
                <p className="flex items-center mt-2">
                  <MessageSquare className="w-4 h-4 mr-2 text-teal-400" /> support@medirehab.com
                </p>
                <p className="flex items-center mt-2">
                  <Clock className="w-4 h-4 mr-2 text-teal-400" /> 24/7 Support
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-10 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} MediRehab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
