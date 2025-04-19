'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { Leaf, Mail, MapPin, Award, Clock, Calendar, CheckCircle, User, FileText } from 'lucide-react'

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
      <div className="min-h-screen flex items-center justify-center bg-[#1A1D2A]">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-2 border-[#F67280] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-[#B8BCCF]">
            <Leaf className="h-5 w-5 text-[#96E6B3] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1D2A]">
        <div className="bg-[#22253A]/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-[#F67280]/20 text-center max-w-md">
          <User className="h-10 w-10 text-[#F67280] mx-auto mb-4" />
          <p className="text-[#F67280]">Doctor profile not found or unauthorized.</p>
          <button className="mt-6 px-6 py-2 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-full">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1D2A] text-[#B8BCCF] relative overflow-hidden">
      <Navbar user={doctor} />

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F67280] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#96E6B3] opacity-5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      {/* Cherry blossom petals floating (subtle decoration) */}
      <div className="absolute top-20 left-1/4 w-1 h-1 bg-[#F67280] opacity-20 rounded-full blur-sm"></div>
      <div className="absolute top-40 left-1/3 w-2 h-2 bg-[#F67280] opacity-15 rounded-full blur-sm"></div>
      <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-[#F67280] opacity-20 rounded-full blur-sm"></div>
      <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-[#F67280] opacity-15 rounded-full blur-sm"></div>

      <main className="max-w-4xl mx-auto mt-10 p-6 relative z-10">
        <div className="bg-[#22253A]/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-[#333853] overflow-hidden relative">
          {/* Decorative circle accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#96E6B3] opacity-5 rounded-full -translate-y-1/3 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F67280] opacity-5 rounded-full translate-y-1/3 -translate-x-1/3"></div>

          {/* Subtle leaf pattern */}
          <div className="absolute top-12 right-12 text-[#96E6B3]/10 rotate-45">
            <Leaf size={120} />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="p-1 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full relative">
                <div className="bg-[#22253A] p-[2px] rounded-full">
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                    {doctor.name?.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 text-center md:text-left">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#F67280] to-[#F8B195] bg-clip-text text-transparent">
                {doctor.name}
              </h2>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-1">
                <Award className="h-4 w-4 text-[#96E6B3]" />
                <p className="text-[#B8BCCF]">{doctor.specialization}</p>
              </div>

              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#F67280]/10 text-[#F67280] border border-[#F67280]/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {doctor.verified ? 'Verified Account' : 'Not Verified'}
              </div>
            </div>
          </div>

          {/* Decorative divider */}
          <div className="my-8 flex justify-center">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#333853] to-transparent"></div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="bg-[#2A2E45]/80 p-5 rounded-2xl border border-[#333853] transition-all duration-300 hover:shadow-lg hover:shadow-[#F67280]/5">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-[#F67280]/10 flex items-center justify-center mr-3">
                  <Mail className="h-4 w-4 text-[#F67280]" />
                </div>
                <h3 className="text-[#E2E4EE] font-medium">Email</h3>
              </div>
              <p className="text-[#B8BCCF] pl-11">{doctor.email}</p>
            </div>

            <div className="bg-[#2A2E45]/80 p-5 rounded-2xl border border-[#333853] transition-all duration-300 hover:shadow-lg hover:shadow-[#96E6B3]/5">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-[#96E6B3]/10 flex items-center justify-center mr-3">
                  <MapPin className="h-4 w-4 text-[#96E6B3]" />
                </div>
                <h3 className="text-[#E2E4EE] font-medium">Location</h3>
              </div>
              <p className="text-[#B8BCCF] pl-11">{doctor.location}</p>
            </div>

            <div className="bg-[#2A2E45]/80 p-5 rounded-2xl border border-[#333853] transition-all duration-300 hover:shadow-lg hover:shadow-[#F67280]/5">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-[#F67280]/10 flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4 text-[#F67280]" />
                </div>
                <h3 className="text-[#E2E4EE] font-medium">Experience</h3>
              </div>
              <p className="text-[#B8BCCF] pl-11">{doctor.experience || 'N/A'} years</p>
            </div>

            <div className="bg-[#2A2E45]/80 p-5 rounded-2xl border border-[#333853] transition-all duration-300 hover:shadow-lg hover:shadow-[#96E6B3]/5">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-[#96E6B3]/10 flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-[#96E6B3]" />
                </div>
                <h3 className="text-[#E2E4EE] font-medium">Availability</h3>
              </div>
              <p className="text-[#B8BCCF] pl-11">{doctor.availability || 'Flexible'}</p>
            </div>
          </section>

          {/* Decorative divider */}
          <div className="my-8 flex justify-center">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#333853] to-transparent"></div>
          </div>

          <section className="bg-[#2A2E45]/80 p-6 rounded-2xl border border-[#333853]">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-[#96E6B3]/10 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-[#96E6B3]" />
              </div>
              <h3 className="text-[#E2E4EE] font-medium">About</h3>
            </div>
            <p className="text-[#B8BCCF] pl-11">
              {doctor.bio || 'No bio added yet. You can update your profile to add one.'}
            </p>
          </section>

          <div className="mt-8 flex justify-end">
            <button className="group relative px-6 py-2.5 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-full font-medium shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#F8B195] to-[#F67280] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                Edit Profile
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  <path d="m15 5 4 4"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-6 text-center text-[#686E8A] text-sm">
        <div className="flex items-center justify-center mb-2">
          <Leaf className="h-3 w-3 text-[#96E6B3]/40 mr-2" />
          <span className="text-xs bg-gradient-to-r from-[#F67280] to-[#96E6B3] bg-clip-text text-transparent">
            CareConnect
          </span>
        </div>
        <p>© {new Date().getFullYear()} Healing through compassion and care.</p>
      </footer>
    </div>
  )
}