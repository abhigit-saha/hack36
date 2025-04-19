'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const preDiagnosisId = searchParams.get('preDiagnosisId');
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!preDiagnosisId) {
        setError("Pre-diagnosis ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/api/gemini/report/${preDiagnosisId}`,
          { withCredentials: true }
        );

        if (response.data && response.data.data) {
          setReport(response.data.data);
        } else {
          setError("Failed to fetch pre-diagnosis report");
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        setError(error.message || "An error occurred while fetching the report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [preDiagnosisId]);

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

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pre-Diagnosis Report</h1>
      
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
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Status: <span className="font-medium">{report.status}</span>
            </p>
            <Button 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 