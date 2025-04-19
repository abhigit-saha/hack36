import LiveDemo from "../../components/liveVideo"; // Relative path to component
import VideoDemo from "../../components/recordedVideo"; // Relative path to component

import React from 'react';

const page = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LiveDemo />
      <VideoDemo />
    </div>
  );
};

export default page;