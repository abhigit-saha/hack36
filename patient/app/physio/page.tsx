import LiveDemo from "@/components/liveVideo";
import VideoDemo from "@/components/recordedVideo";

import React from 'react'

const page = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LiveDemo/>
      <VideoDemo/>
    </div>
  )
}

export default page
