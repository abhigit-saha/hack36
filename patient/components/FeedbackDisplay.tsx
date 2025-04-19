import React from 'react';
import { useAngleComparison } from './AngleComparisonService';

interface FeedbackDisplayProps {
  className?: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ className = '' }) => {
  const { feedback } = useAngleComparison();

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Real-time Feedback</h3>
      {feedback ? (
        <div className="text-gray-700 whitespace-pre-line">
          {feedback}
        </div>
      ) : (
        <div className="text-gray-500 italic">
          Waiting for movement data...
        </div>
      )}
    </div>
  );
};

export default FeedbackDisplay; 