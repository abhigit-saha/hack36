'use client';
import React from 'react';
import Link from 'next/link';

export default function ExercisePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Choose Exercise Mode</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Home
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/physio/cam" className="block">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Exercise with Webcam</h2>
              <p className="text-gray-700 mb-4">
                Use your computer's webcam to track your movements and receive real-time feedback on your form.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                <li>No additional equipment needed</li>
                <li>Real-time pose detection</li>
                <li>Angle comparison with reference</li>
                <li>Immediate feedback on form</li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Webcam Exercise
              </button>
            </div>
          </Link>
          
          <Link href="/physio/sensor" className="block">
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
              <h2 className="text-xl font-semibold text-green-800 mb-4">Exercise with Sensor</h2>
              <p className="text-gray-700 mb-4">
                Connect a motion sensor device for precise tracking of your movements during exercise.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
                <li>Higher precision measurements</li>
                <li>Works in any lighting condition</li>
                <li>Compatible with various sensors</li>
                <li>Detailed movement analysis</li>
              </ul>
              <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Start Sensor Exercise
              </button>
            </div>
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Which mode should I choose?</h3>
          <p className="text-gray-600">
            If you have a motion sensor device, we recommend using the sensor-based exercise for more accurate tracking.
            Otherwise, the webcam-based exercise is a great alternative that requires no additional equipment.
          </p>
        </div>
      </div>
    </div>
  );
} 