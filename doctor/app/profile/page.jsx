'use client'

import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { Leaf, Mail, MapPin, Award, Clock, Calendar, CheckCircle, User, FileText, Edit2, Plus, X, Save, DollarSign, Phone, GraduationCap, Briefcase, Languages, Star } from 'lucide-react'

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    specialization: '',
    qualifications: [],
    experience: {
      years: 0,
      previousHospitals: []
    },
    consultationFee: 0,
    languages: [],
    availability: {
      days: [],
      isAvailable: true
    },
    rating: 0,
    totalReviews: 0,
    license: '',
    education: [],
    achievements: [],
    services: []
  })

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:4000/doctor/profile', {
          credentials: 'include',
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch doctor profile');
        }

        const data = await res.json();
        if (data.doctor) {
          setDoctor(data.doctor);
          setFormData({
            name: data.doctor.name || '',
            email: data.doctor.email || '',
            phone: data.doctor.phone || '',
            dateOfBirth: data.doctor.dateOfBirth || '',
            gender: data.doctor.gender || '',
            address: data.doctor.address || {
              street: '',
              city: '',
              state: '',
              zipCode: ''
            },
            specialization: data.doctor.specialization || '',
            qualifications: data.doctor.qualifications || [],
            experience: data.doctor.experience || {
              years: 0,
              previousHospitals: []
            },
            consultationFee: data.doctor.consultationFee || 0,
            languages: data.doctor.languages || [],
            availability: data.doctor.availability || {
              days: [],
              isAvailable: true
            },
            rating: data.doctor.rating || 0,
            totalReviews: data.doctor.totalReviews || 0,
            license: data.doctor.license || '',
            education: data.doctor.education || [],
            achievements: data.doctor.achievements || [],
            services: data.doctor.services || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch doctor profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, []);

  const handleUpdate = async (section) => {
    try {
      let endpoint = '';
      let updateData = {};

      switch (section) {
        case 'basic':
          endpoint = '/doctor/basic-info';
          updateData = {
            name: formData.name,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address
          };
          break;
        case 'professional':
          endpoint = '/doctor/professional-info';
          updateData = {
            specialization: formData.specialization,
            qualifications: formData.qualifications,
            experience: formData.experience,
            consultationFee: formData.consultationFee,
            languages: formData.languages,
            license: formData.license,
            education: formData.education,
            achievements: formData.achievements,
            services: formData.services
          };
          break;
        case 'availability':
          endpoint = '/doctor/availability';
          updateData = { availability: formData.availability };
          break;
      }

      const res = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await res.json();
      if (data.doctor) {
        setDoctor(data.doctor);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.message);
    }
  };

  const addItem = (section, field) => {
    setFormData(prev => {
      if (field) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: [...(prev[section]?.[field] || []), '']
          }
        };
      }
      return {
        ...prev,
        [section]: [...(prev[section] || []), '']
      };
    });
  };

  const removeItem = (section, field, index) => {
    setFormData(prev => {
      if (field) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: prev[section][field].filter((_, i) => i !== index)
          }
        };
      }
      return {
        ...prev,
        [section]: prev[section].filter((_, i) => i !== index)
      };
    });
  };

  const updateItem = (section, field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => i === index ? value : item)
      }
    }));
  };

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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1D2A]">
        <div className="bg-[#22253A]/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-[#F67280]/20 text-center max-w-md">
          <User className="h-10 w-10 text-[#F67280] mx-auto mb-4" />
          <p className="text-[#F67280]">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-full"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1D2A]">
        <div className="bg-[#22253A]/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-[#F67280]/20 text-center max-w-md">
          <User className="h-10 w-10 text-[#F67280] mx-auto mb-4" />
          <p className="text-[#F67280]">Doctor profile not found or unauthorized.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-full"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1D2A] text-[#B8BCCF] relative overflow-hidden">
      <Navbar user={doctor} />

      <main className="max-w-6xl mx-auto mt-10 p-6 relative z-10">
        {/* Profile Header */}
        <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853] mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="p-1 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full relative">
                  <div className="bg-[#22253A] p-[2px] rounded-full">
                    <div className="w-28 h-28 bg-gradient-to-r from-[#F67280] to-[#96E6B3] rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                      {doctor.name?.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#F67280] to-[#F8B195] bg-clip-text text-transparent">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                    />
                  ) : (
                    doctor.name
                  )}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Award className="h-4 w-4 text-[#96E6B3]" />
                  <p className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                      />
                    ) : (
                      doctor.specialization
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <p className="text-[#B8BCCF]">
                    {doctor.rating?.toFixed(1)} ({doctor.totalReviews} reviews)
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#F67280]/10 text-[#F67280] border border-[#F67280]/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                {doctor.verified ? 'Verified Account' : 'Not Verified'}
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="p-2 rounded-full bg-[#2A2E45] hover:bg-[#333853] transition-colors"
              >
                <Edit2 className="h-5 w-5 text-[#B8BCCF]" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Contact Information</h3>
                {editMode && (
                  <button
                    onClick={() => handleUpdate('basic')}
                    className="flex items-center px-3 py-1 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-[#F67280] mr-2" />
                  <span className="text-[#B8BCCF]">{doctor.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-[#F67280] mr-2" />
                  <span className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                      />
                    ) : (
                      doctor.phone || 'Not provided'
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-[#F67280] mr-2" />
                  <span className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.address?.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                        placeholder="Street Address"
                      />
                    ) : (
                      doctor.address?.street || 'Not provided'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Professional Details</h3>
                {editMode && (
                  <button
                    onClick={() => handleUpdate('professional')}
                    className="flex items-center px-3 py-1 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-[#96E6B3] mr-2" />
                  <span className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.experience.years || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          experience: { ...formData.experience, years: parseInt(e.target.value) || 0 }
                        })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white w-20"
                        min="0"
                      />
                    ) : (
                      `${doctor.experience?.years || 0} years of experience`
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-[#96E6B3] mr-2" />
                  <span className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="number"
                        value={formData.consultationFee || 0}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          consultationFee: parseInt(e.target.value) || 0 
                        })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white w-32"
                        min="0"
                      />
                    ) : (
                      `Consultation Fee: $${doctor.consultationFee || 0}`
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-[#96E6B3] mr-2" />
                  <span className="text-[#B8BCCF]">
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.license}
                        onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                      />
                    ) : (
                      `License: ${doctor.license || 'Not provided'}`
                    )}
                  </span>
                </div>
                {editMode && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[#B8BCCF] text-sm">Languages:</label>
                      {formData.languages.map((lang, index) => (
                        <div key={index} className="flex items-center mt-1">
                          <input
                            type="text"
                            value={lang}
                            onChange={(e) => updateItem('languages', '', index, e.target.value)}
                            className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white flex-1 mr-2"
                          />
                          <button
                            onClick={() => removeItem('languages', '', index)}
                            className="p-1 text-[#F67280] hover:text-[#F8B195]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem('languages', '')}
                        className="flex items-center text-[#96E6B3] hover:text-[#B8BCCF] mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Language
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Availability</h3>
                {editMode && (
                  <button
                    onClick={() => handleUpdate('availability')}
                    className="flex items-center px-3 py-1 bg-gradient-to-r from-[#F67280] to-[#F8B195] text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                )}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-[#96E6B3] mr-2" />
                <span className="text-[#B8BCCF]">
                  {editMode ? (
                    <select
                      value={formData.availability.isAvailable}
                      onChange={(e) => setFormData({
                        ...formData,
                        availability: { ...formData.availability, isAvailable: e.target.value === 'true' }
                      })}
                      className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  ) : (
                    doctor.availability?.isAvailable ? 'Available' : 'Not Available'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Education */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Education</h3>
                {editMode && (
                  <button
                    onClick={() => addItem('education', '')}
                    className="flex items-center text-[#96E6B3] hover:text-[#B8BCCF]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {editMode ? (
                  formData.education.map((edu, index) => (
                    <div key={index} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree || ''}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index] = {
                            ...newEducation[index],
                            degree: e.target.value
                          };
                          setFormData({ ...formData, education: newEducation });
                        }}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white w-full"
                      />
                      <input
                        type="text"
                        placeholder="Institution"
                        value={edu.institution || ''}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index] = {
                            ...newEducation[index],
                            institution: e.target.value
                          };
                          setFormData({ ...formData, education: newEducation });
                        }}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white w-full"
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={edu.year || ''}
                        onChange={(e) => {
                          const newEducation = [...formData.education];
                          newEducation[index] = {
                            ...newEducation[index],
                            year: parseInt(e.target.value) || 0
                          };
                          setFormData({ ...formData, education: newEducation });
                        }}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white w-full"
                      />
                      <button
                        onClick={() => removeItem('education', '', index)}
                        className="flex items-center text-[#F67280] hover:text-[#F8B195]"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  doctor.education?.map((edu, index) => (
                    <div key={index} className="space-y-1">
                      <p className="text-[#B8BCCF] font-medium">{edu.degree}</p>
                      <p className="text-[#B8BCCF] text-sm">{edu.institution}</p>
                      <p className="text-[#B8BCCF] text-sm">{edu.year}</p>
                    </div>
                  )) || <p className="text-[#B8BCCF]">No education added</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Previous Hospitals</h3>
                {editMode && (
                  <button
                    onClick={() => addItem('experience', 'previousHospitals')}
                    className="flex items-center text-[#96E6B3] hover:text-[#B8BCCF]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Hospital
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {editMode ? (
                  formData.experience.previousHospitals.map((hospital, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={hospital}
                        onChange={(e) => {
                          const newHospitals = [...formData.experience.previousHospitals];
                          newHospitals[index] = e.target.value;
                          setFormData({
                            ...formData,
                            experience: {
                              ...formData.experience,
                              previousHospitals: newHospitals
                            }
                          });
                        }}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeItem('experience', 'previousHospitals', index)}
                        className="p-1 text-[#F67280] hover:text-[#F8B195]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  doctor.experience?.previousHospitals?.map((hospital, index) => (
                    <p key={index} className="text-[#B8BCCF]">{hospital}</p>
                  )) || <p className="text-[#B8BCCF]">No previous hospitals added</p>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="bg-[#22253A]/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-[#333853]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#E2E4EE] font-medium">Services</h3>
                {editMode && (
                  <button
                    onClick={() => addItem('services', '')}
                    className="flex items-center text-[#96E6B3] hover:text-[#B8BCCF]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Service
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {editMode ? (
                  formData.services.map((service, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => {
                          const newServices = [...formData.services];
                          newServices[index] = e.target.value;
                          setFormData({ ...formData, services: newServices });
                        }}
                        className="bg-[#2A2E45] border border-[#333853] rounded-lg px-3 py-1 text-white flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeItem('services', '', index)}
                        className="p-1 text-[#F67280] hover:text-[#F8B195]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  doctor.services?.map((service, index) => (
                    <p key={index} className="text-[#B8BCCF]">{service}</p>
                  )) || <p className="text-[#B8BCCF]">No services added</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-[#2A2E45] text-[#B8BCCF] rounded-lg hover:bg-[#333853] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </main>
    </div>
  );
}