"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, MapPin, Clock, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    minRating: "",
    maxFee: "",
    availability: false
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/doctor");
      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }
      const data = await response.json();
      // Ensure data is an array
      const doctorsArray = Array.isArray(data) ? data : [];
      setDoctors(doctorsArray);
    } catch (err) {
      setError("Error fetching doctors");
      console.error(err);
      setDoctors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:4000/doctor/filter?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to filter doctors');
      }
      const data = await response.json();
      // Ensure data.doctors is an array
      const doctorsArray = Array.isArray(data.doctors) ? data.doctors : [];
      setDoctors(doctorsArray);
    } catch (err) {
      setError("Error filtering doctors");
      console.error(err);
      setDoctors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900 p-6 rounded-lg space-y-4">
                  <div className="h-40 bg-gray-800 rounded"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
        
        {/* Search and Filters */}
        <div className="bg-gray-900 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="specialization"
                value={filters.specialization}
                onChange={handleFilterChange}
                placeholder="Search by specialization"
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Search by location"
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <input
                type="number"
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                placeholder="Min Rating"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="maxFee"
                value={filters.maxFee}
                onChange={handleFilterChange}
                placeholder="Max Fee"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                checked={filters.availability}
                onChange={handleFilterChange}
                className="mr-2"
              />
              <label>Available Now</label>
            </div>
            
            <div className="col-span-2">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        {!doctors || doctors.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-lg">
            <p className="text-xl text-gray-400">No doctors found matching your criteria.</p>
            <button
              onClick={fetchDoctors}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Link href={`/doctors/${doctor._id}`} key={doctor._id}>
                <div className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                      {doctor.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{doctor.name || 'Unknown Doctor'}</h3>
                      <p className="text-gray-400">{doctor.specialization || 'General Practitioner'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="text-yellow-500" />
                      <span>{doctor.rating || "No ratings yet"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="text-gray-400" />
                      <span>{doctor.address?.city || "Location not specified"}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <IndianRupee className="text-gray-400" />
                      <span>{doctor.consultationFee || 0} per consultation</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="text-gray-400" />
                      <span>{doctor.experience?.years || 0} years of experience</span>
                    </div>
                  </div>
                  
                  {doctor.availability?.isAvailable && (
                    <div className="mt-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                        Available Now
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {error && (
          <div className="text-red-500 text-center mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 