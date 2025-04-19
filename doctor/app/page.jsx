'use client'

import { useSelector } from "react-redux"
import Navbar from "../components/Navbar"
import { Leaf, MapPin, Mail, CheckCircle, Award } from "lucide-react"

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  console.log("User data from Redux:", user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F2] to-[#F0F9F5]">
      <Navbar user={user} />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F8B195] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-20 left-0 w-80 h-80 bg-[#96E6B3] opacity-10 rounded-full blur-3xl -translate-x-1/3"></div>

      <main className="max-w-5xl mx-auto p-6 mt-10 relative z-10">
        {isAuthenticated && user ? (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-[#F8B195]/20 overflow-hidden relative">

            {/* Decorative circle accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#96E6B3]/10 rounded-full -translate-y-1/3 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F8B195]/10 rounded-full translate-y-1/3 -translate-x-1/3"></div>

            {/* Subtle leaf pattern */}
            <div className="absolute top-12 right-12 text-[#96E6B3]/10 rotate-45">
              <Leaf size={120} />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-[#3A4F41] mb-6">
                <span className="bg-gradient-to-r from-[#F67280] to-[#F8B195] bg-clip-text text-transparent">
                  Welcome, {user.name || "User"}
                </span>
                <span className="ml-2">👋</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-b from-[#FFF5F2] to-white p-6 rounded-2xl border border-[#F8B195]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#F8B195]/20 flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4 text-[#F67280]" />
                    </div>
                    <h3 className="text-[#3A4F41] font-medium">Email</h3>
                  </div>
                  <p className="text-[#5D7A64] pl-11">{user.email}</p>
                </div>

                <div className="bg-gradient-to-b from-[#F0F9F5] to-white p-6 rounded-2xl border border-[#96E6B3]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#96E6B3]/20 flex items-center justify-center mr-3">
                      <CheckCircle className="h-4 w-4 text-[#4FB286]" />
                    </div>
                    <h3 className="text-[#3A4F41] font-medium">Verification Status</h3>
                  </div>
                  <div className="pl-11">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${user.verified ? 'bg-[#96E6B3]/20 text-[#4FB286]' : 'bg-[#F8B195]/20 text-[#F67280]'}`}>
                      {user.verified ? "Verified Account" : "Not Verified"}
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-[#F0F9F5] to-white p-6 rounded-2xl border border-[#96E6B3]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#96E6B3]/20 flex items-center justify-center mr-3">
                      <Award className="h-4 w-4 text-[#4FB286]" />
                    </div>
                    <h3 className="text-[#3A4F41] font-medium">Specialization</h3>
                  </div>
                  <p className="text-[#5D7A64] pl-11">{user.specialization || "Not specified"}</p>
                </div>

                <div className="bg-gradient-to-b from-[#FFF5F2] to-white p-6 rounded-2xl border border-[#F8B195]/20 transition-all duration-300 hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#F8B195]/20 flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-[#F67280]" />
                    </div>
                    <h3 className="text-[#3A4F41] font-medium">Location</h3>
                  </div>
                  <p className="text-[#5D7A64] pl-11">{user.location || "Not specified"}</p>
                </div>
              </div>

              <div className="mt-8 p-5 bg-[#F0F9F5] rounded-2xl border border-[#96E6B3]/30">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#96E6B3]/30 flex items-center justify-center mr-3">
                    <Leaf className="h-5 w-5 text-[#4FB286]" />
                  </div>
                  <div>
                    <h3 className="text-[#3A4F41] font-medium">Health Tip of the Day</h3>
                    <p className="text-[#5D7A64] text-sm mt-1">
                      "A balanced diet and regular exercise are essential for maintaining good health and wellbeing."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-[#F8B195]/20 text-center">
            <p className="text-[#5D7A64] text-lg">User not logged in or session expired.</p>
            <button className="mt-4 bg-gradient-to-r from-[#F8B195] to-[#F67280] text-white px-6 py-2 rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-300">
              Sign In
            </button>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 text-center text-[#5D7A64] text-sm">
        <p>© {new Date().getFullYear()} Healthcare Platform. Healing through compassion and care.</p>
      </footer>
    </div>
  )
}