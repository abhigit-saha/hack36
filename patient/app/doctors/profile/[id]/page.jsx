"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Mail, Award, MapPin, Clock, User, Stethoscope, Calendar } from 'lucide-react';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.id;
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        return resolve(true); // already loaded
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject("Razorpay SDK failed to load");
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/doctor/profile/${doctorId}`
        );
        const data = await res.json();
        if (res.ok) {
          setDoctor(data);
        } else {
          console.error("Doctor not found");
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      }
    };

    const fetchPatient = async () => {
      try {
        const res = await fetch("http://localhost:4000/user/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        const data = await res.json();
        if (res.ok) {
          setPatient(data);
          console.log("Patient data:", data);
        } else {
          console.error("Patient not found");
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
    fetchPatient();
  }, [doctorId]);

  const handleBook = async () => {
    if (!patient) return;

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Please try again.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/appointment/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50000, doctorId }),
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // put in .env.local
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: "CareConnect AI",
        description: "Doctor Appointment Fees",
        handler: async (response) => {
          const test = await fetch("http://localhost:4000/appointment/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              doctorId,
              patientId: patient.user.id,
              paymentId: response.razorpay_payment_id,
            }),
          });

          const data = await test.json();

          router.push(`/doctors/questions?appointmentId=${data._id}`);
        },
        prefill: {
          name: patient.name,
          email: patient.email,
        },
        theme: { color: "#1a73e8" },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl text-teal-400">Loading doctor profile...</span>
        </div>
      </div>
    );
  }

  if (!doctor || !patient) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="bg-[#161B22] p-8 rounded-xl border border-red-800 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Doctor or Patient not found</h2>
          <p className="text-gray-400">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-gray-200">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center gap-3 mb-8">
          <Stethoscope className="h-8 w-8 text-teal-400" />
          <h1 className="text-3xl font-bold text-teal-400">Doctor Profile</h1>
        </div>

        <Card className="bg-[#161B22] border-gray-800 shadow-xl shadow-teal-900/10">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#21262D] flex items-center justify-center">
                <User className="w-10 h-10 text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-teal-400">Dr. {doctor.name}</CardTitle>
                <p className="text-gray-400 mt-1">{doctor.specialization}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-teal-400" />
                <span>{doctor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Award className="h-5 w-5 text-teal-400" />
                <span>License: {doctor.liscence}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-teal-400" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Clock className="h-5 w-5 text-teal-400" />
                <span>Experience: {doctor.experience || 'Not specified'}</span>
              </div>
            </div>

            {doctor.bio && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-teal-400 mb-3">About</h3>
                <p className="text-gray-300 bg-[#21262D] p-4 rounded-lg border border-gray-700">
                  {doctor.bio}
                </p>
              </div>
            )}

            <div className="pt-6">
              <Button
                onClick={handleBook}
                className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Book Appointment (₹500)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
