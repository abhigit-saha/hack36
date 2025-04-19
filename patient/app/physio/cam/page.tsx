'use client'
import React, { useState, useEffect } from 'react';
import LiveDemo from '../../../components/liveVideo';
import VideoDemo from '../../../components/recordedVideo';
import AngleDisplay from '../../../components/AngleDisplay';
import axios from 'axios';

const PhysioPage = () => {
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

  // Render videos or live/video stream
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex flex-col gap-6 w-full max-w-6xl">
        <div className="flex gap-6 w-full justify-center">
          <LiveDemo/>
          <VideoDemo  />
        </div>
        
        <AngleDisplay />
      </div>
    </div>
  );
};

export default PhysioPage;