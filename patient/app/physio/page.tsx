'use client'
import React, { useState, useEffect } from 'react';
import LiveDemo from '../../components/liveVideo';
import VideoDemo from '../../components/recordedVideo';
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
      {!selectedVideo ? (
        <>
          <button
            onClick={handleFetchVideos}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg mb-4"
          >
            Start Physio
          </button>

          <div className="grid grid-cols-1 gap-4">
            {videos.map((vid, idx) => (
              <div
                key={idx}
                onClick={() => handleVideoClick(vid)}
                className="cursor-pointer border p-4 rounded-md shadow-md hover:bg-gray-100"
              >
                <p className="text-lg font-semibold">Exercise {idx + 1}</p>
                <p className="text-sm text-gray-600">{vid.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex gap-6 w-full justify-center">
          <LiveDemo sessionId={sessionId} />
          <VideoDemo videoUrl={selectedVideo} sessionId={sessionId} />
        </div>
      )}
    </div>
  );
};

export default PhysioPage;
