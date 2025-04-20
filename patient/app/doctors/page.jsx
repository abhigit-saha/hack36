'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Input } from '../../components/ui/input'
import { Filter, MapPin, Mail, Award, Calendar, Stethoscope, Search } from 'lucide-react'

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([])
  const [filterType, setFilterType] = useState('specialization')
  const [filterValue, setFilterValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const searchParams = useSearchParams()
  const specializationFromQuery = searchParams.get('specialization')

  const fetchDoctors = async (filterType = '', value = '') => {
    setIsLoading(true)
    let url = 'http://localhost:4000/doctor/filter'
    if (filterType && value) {
      url += `?${filterType}=${encodeURIComponent(value)}`
    }

    console.log('Fetching doctors from:', url)
    console.log('Current filter type:', filterType)
    console.log('Current filter value:', value)

    try {
      const res = await fetch(url)
      console.log('API Response status:', res.status)
      
      if (!res.ok) {
        console.error('API Error:', res.status, res.statusText)
        throw new Error(`Failed to fetch doctors: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      console.log('API Response data:', data)

      // Handle the nested doctors array in the response
      let doctorsArray = []
      if (data && data.doctors && Array.isArray(data.doctors)) {
        doctorsArray = data.doctors
      } else if (Array.isArray(data)) {
        doctorsArray = data
      } else if (data && typeof data === 'object') {
        doctorsArray = [data]
      }

      console.log('Processed doctors array:', doctorsArray)
      setDoctors(doctorsArray)
    } catch (err) {
      console.error('Error in fetchDoctors:', err)
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (specializationFromQuery) {
      setFilterType('specialization')
      setFilterValue(specializationFromQuery)
      fetchDoctors('specialization', specializationFromQuery)
    } else {
      fetchDoctors()
    }
  }, [specializationFromQuery])

  const handleFilter = () => {
    fetchDoctors(filterType, filterValue)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-gray-200">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-teal-400">Find Doctors</h1>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-gray-700 hover:border-teal-500 bg-[#161B22] hover:bg-[#1A1F2A] text-gray-300 hover:text-teal-300 transition-all duration-300"
              >
                <Filter className="mr-2 h-4 w-4 text-gray-400 group-hover:text-teal-400" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#161B22] border border-gray-800 shadow-xl shadow-teal-900/10">
              <div className="space-y-4 p-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Filter by</label>
                  <select
                    className="w-full bg-[#21262D] border border-gray-800 rounded-md p-2.5 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="specialization">Specialization</option>
                    <option value="location">Location</option>
                  </select>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder={`Enter ${filterType}`}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full pl-10 bg-[#21262D] border-gray-800 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <Button
                  onClick={handleFilter}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300"
                >
                  Apply Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-[#21262D] h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-[#21262D] rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#21262D] rounded"></div>
                  <div className="h-4 bg-[#21262D] rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : !Array.isArray(doctors) || doctors.length === 0 ? (
          <div className="text-center py-16 bg-[#161B22] rounded-xl border border-gray-800 shadow-lg">
            <p className="text-xl text-gray-400">No doctors found matching your criteria.</p>
            <Button
              onClick={() => fetchDoctors()}
              className="mt-6 bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300"
            >
              View All Doctors
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor._id}
                className="bg-[#161B22] border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(45,212,191,0.1)] hover:border-teal-500/40 group"
              >
                <CardHeader className="pb-2">
                  <h2 className="text-xl font-bold text-teal-400 group-hover:text-teal-300 transition-colors duration-300">
                    Dr. {doctor.name}
                  </h2>
                  <p className="text-sm text-gray-400">{doctor.specialization}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-2 text-teal-400" />
                    <span>{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Award className="h-4 w-4 mr-2 text-teal-400" />
                    <span>License: {doctor.liscence}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-teal-400" />
                    <span>{doctor.location}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-teal-400" />
                    <span>Experience: {doctor.experience?.years || 0} years</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Award className="h-4 w-4 mr-2 text-teal-400" />
                    <span>Fee: ₹{doctor.consultationFee || 0}</span>
                  </div>
                  {doctor.qualifications && doctor.qualifications.length > 0 && (
                    <div className="flex items-center text-gray-300">
                      <Award className="h-4 w-4 mr-2 text-teal-400" />
                      <span>{doctor.qualifications[0].degree} - {doctor.qualifications[0].institution}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-teal-400" />
                    <span>Availability: {doctor.availability?.isAvailable ? 'Available' : 'Not Available'}</span>
                  </div>
                  <div className="pt-4">
                    <a
                      href={`/doctors/profile/${doctor._id}`}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-all duration-300 shadow-lg hover:shadow-teal-700/30"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorsPage
