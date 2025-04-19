'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';

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
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => reject('Razorpay SDK failed to load');
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`http://localhost:4000/doctor/profile/${doctorId}`);
        const data = await res.json();
        if (res.ok) {
          setDoctor(data);
        } else {
          console.error('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
      }
    };

    const fetchPatient = async () => {
      try {
        const res = await fetch('http://localhost:4000/user/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await res.json();
        if (res.ok) {
          setPatient(data);
          console.log('Patient data:', data);
        } else {
          console.error('Patient not found');
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
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
      alert('Failed to load Razorpay SDK. Please try again.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/appointment/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50000, doctorId }),
      });

      const data = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // put in .env.local
        amount: data.amount,
        currency: data.currency,
        order_id: data.id,
        name: 'CareConnect AI',
        description: 'Doctor Appointment Fees',
        handler: async (response) => {
          const test = await fetch('http://localhost:4000/appointment/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              doctorId,
              patientId: patient.user.id,
              paymentId: response.razorpay_payment_id,
            }),
          });

          console.log(test);

          router.push(`/doctors/questions?appointmentId=${test._id}`);
        },
        prefill: {
          name: patient.name,
          email: patient.email,
        },
        theme: { color: '#1a73e8' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!doctor || !patient) return <div className="p-6 text-red-500">Doctor or Patient not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Dr. {doctor.name}</CardTitle>
          <p className="text-muted-foreground">{doctor.specialization}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>License:</strong> {doctor.liscence}</p>
          <p><strong>Location:</strong> {doctor.location}</p>
          <p><strong>Experience:</strong> {doctor.experience || 'Not specified'}</p>
          <p><strong>About:</strong> {doctor.bio || 'No bio provided'}</p>
          <Button className="mt-4" onClick={handleBook}>
            Book Appointment (₹500)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
