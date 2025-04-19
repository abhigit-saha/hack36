'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorViewReportPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  
  const [report, setReport] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) {
        setError("Appointment ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Fetch pre-diagnosis report
        const reportResponse = await axios.get(
          `http://localhost:4000/api/pre-diagnosis/appointment/${appointmentId}`,
          { withCredentials: true }
        );

        if (reportResponse.data && reportResponse.data.data) {
          setReport(reportResponse.data.data);
        } else {
          setError("Failed to fetch pre-diagnosis report");
        }

        // Fetch available videos
        const videosResponse = await axios.get(
          'http://localhost:4000/api/videos',
          { withCredentials: true }
        );

        if (videosResponse.data && videosResponse.data.data) {
          setVideos(videosResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId]);

  const handleVideoSelect = (videoId) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        return prev.filter(id => id !== videoId);
      } else {
        return [...prev, videoId];
      }
    });
  };

  const handlePrescribe = async () => {
    if (selectedVideos.length === 0) {
      alert("Please select at least one video to prescribe");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        'http://localhost:4000/doctor/prescribe',
        {
          appointmentId,
          videoIds: selectedVideos,
          notes
        },
        { withCredentials: true }
      );

      if (response.data && response.data.data) {
        setSuccess(true);
        alert("Videos prescribed successfully!");
      } else {
        throw new Error("Failed to prescribe videos");
      }
    } catch (error) {
      console.error("Error prescribing videos:", error);
      setError(error.message || "An error occurred while prescribing videos");
      alert(`Prescription failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-gray-600">Loading pre-diagnosis report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-100 text-red-700 rounded">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Button 
          className="mt-4"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-6 bg-green-50 rounded-lg text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Videos Prescribed Successfully</h2>
          <p className="text-gray-600 mb-6">
            The patient has been prescribed the selected exercise videos.
          </p>
          <Button 
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Pre-Diagnosis Report</h1>
      
      {report && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
            <div className="whitespace-pre-line text-gray-700">
              {report.report}
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Questions & Answers</h2>
            <div className="space-y-4">
              {report.questions.map((qa, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="font-medium text-gray-800">{qa.question}</p>
                  <p className="mt-1 text-gray-600">{qa.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Prescribe Exercise Videos</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Notes
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or instructions for the patient..."
              />
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Available Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map(video => (
                  <div 
                    key={video._id}
                    className={`p-4 border rounded-md cursor-pointer ${
                      selectedVideos.includes(video._id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => handleVideoSelect(video._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-gray-600">{video.description}</p>
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <span className="mr-3">Duration: {video.duration} min</span>
                          <span>Difficulty: {video.difficulty}</span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {selectedVideos.includes(video._id) ? (
                          <CheckCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handlePrescribe}
                disabled={submitting || selectedVideos.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Prescribing...
                  </>
                ) : (
                  'Prescribe Selected Videos'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 