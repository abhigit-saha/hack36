'use client'
import React, { useState, useEffect } from 'react';
import LiveDemo from '../../../components/liveVideo';
import VideoDemo from '../../../components/recordedVideo';
import AngleDisplay from '../../../components/AngleDisplay';
import axios from 'axios';

export default function SensorPage() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Fetch videos when user clicks Physio
  const handleFetchVideos = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/prescribed-videos'); // adjust route
      setVideos(res.data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    }
  };

  // When video is selected, create a new session
  const handleVideoClick = async (video) => {
    try {
      const res = await axios.post('http://localhost:4000/api/sessions', {
        videoUrl: video.videoUrl,
      });
      setSessionId(res.data.sessionId);
      setSelectedVideo(video.videoUrl);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col gap-6 w-full max-w-6xl">
        <div className="flex gap-6 w-full justify-center">
        
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2">How to use sensor-based exercise:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                  <li>Connect your motion sensor device</li>
                  <li>Position the sensor according to the exercise requirements</li>
                  <li>Follow the on-screen instructions for proper form</li>
                  <li>The system will compare your movements with the reference angles</li>
                  <li>Receive real-time feedback on your form</li>
                </ol>
              </div>
              </div>
          <VideoDemo  />
        </div>
        
        <AngleDisplay />
      </div>
    </div>
  )}