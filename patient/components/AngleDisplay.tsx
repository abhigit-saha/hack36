'use client';
import { useState, useEffect } from 'react';
import { getAllAngles } from '../utils/angleStore';

export default function AngleDisplay() {
  const [angles, setAngles] = useState({
    live: {} as Record<string, number | null>,
    recorded: {} as Record<string, number | null>,
    lastUpdated: {
      live: 0,
      recorded: 0
    }
  });

  const [errors, setErrors] = useState<Record<string, { difference: number, percentage: number }>>({});
  const [hasSignificantErrors, setHasSignificantErrors] = useState(false);

  // Update angles every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const allAngles = getAllAngles();
      setAngles(allAngles);
      
      // Calculate differences and errors
      calculateErrors(allAngles.live, allAngles.recorded);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Calculate differences between live and recorded angles
  const calculateErrors = (
    liveAngles: Record<string, number | null>, 
    recordedAngles: Record<string, number | null>
  ) => {
    const newErrors: Record<string, { difference: number, percentage: number }> = {};
    let hasErrors = false;
    
    // Get all unique joint names
    const allJoints = new Set([
      ...Object.keys(liveAngles),
      ...Object.keys(recordedAngles)
    ]);
    
    allJoints.forEach(joint => {
      const liveAngle = liveAngles[joint];
      const recordedAngle = recordedAngles[joint];
      
      // Only calculate if both angles are available
      if (liveAngle !== null && recordedAngle !== null) {
        const difference = Math.abs(liveAngle - recordedAngle);
        const percentage = (difference / recordedAngle) * 100;
        
        newErrors[joint] = { difference, percentage };
        
        // Check if error is significant (>10%)
        if (percentage > 10) {
          hasErrors = true;
        }
      }
    });
    
    setErrors(newErrors);
    setHasSignificantErrors(hasErrors);
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Get direction to move based on angle difference
  const getDirectionHint = (joint: string) => {
    const liveAngle = angles.live[joint];
    const recordedAngle = angles.recorded[joint];
    
    if (liveAngle === null || recordedAngle === null) return '';
    
    if (liveAngle < recordedAngle) {
      return 'Increase';
    } else if (liveAngle > recordedAngle) {
      return 'Decrease';
    }
    
    return '';
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">

            {/* Error Alerts */}
            {hasSignificantErrors && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h3 className="font-bold mb-2">⚠️ Correction Needed</h3>
          <p className="mb-2">The following joints need adjustment:</p>
          <div className="max-h-40 overflow-y-auto">
            {Object.entries(errors)
              .filter(([_, error]) => error.percentage > 10)
              .map(([joint, error]) => (
                <div key={`error-${joint}`} className="mb-2 p-2 bg-white rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{joint}:</span>
                    <span className="text-red-600">{error.percentage.toFixed(1)}% error</span>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Action: </span>
                    <span className="text-blue-600">{getDirectionHint(joint)} the angle</span>
                    <span className="ml-2">
                      (Difference: {error.difference.toFixed(1)}°)
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-4">Angle Comparison</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Live Angles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Live Angles</h3>
          <p className="text-sm text-gray-500 mb-2">Last updated: {formatTime(angles.lastUpdated.live)}</p>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(angles.live).map(([joint, angle]) => (
              <div key={`live-${joint}`} className="flex justify-between py-1 border-b">
                <span className="font-medium">{joint}:</span>
                <span>{angle !== null ? `${(angle as number).toFixed(1)}°` : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recorded Angles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Recorded Angles</h3>
          <p className="text-sm text-gray-500 mb-2">Last updated: {formatTime(angles.lastUpdated.recorded)}</p>
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(angles.recorded).map(([joint, angle]) => (
              <div key={`recorded-${joint}`} className="flex justify-between py-1 border-b">
                <span className="font-medium">{joint}:</span>
                <span>{angle !== null ? `${(angle as number).toFixed(1)}°` : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      

    </div>
  );
} 