'use client';

import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { RepeatIcon, Mic, MicOff, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const questions = [
  "What symptoms are you currently experiencing?",
  "How long have you had these symptoms?",
  "Do you have any existing medical conditions?",
  "Are you currently taking any medications?",
  "Have you experienced similar symptoms in the past?"
];

export default function QuestionPage() {
  const userId1 = useSelector((state) => state.auth.user)
  console.log("userid ->",userId1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
console.log(userId1)
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (!playedOnce && current < questions.length) {
      speakQuestion();
      setPlayedOnce(true);
    }
  }, [current, playedOnce]);

  const speakQuestion = () => {
    SpeechRecognition.stopListening();
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(questions[current]);
    utterance.lang = 'en-IN';

    utterance.onend = () => {
      startListening();
    };

    speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    setIsRecording(true);
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setIsRecording(false);
  };

  const handleNext = () => {
    const cleaned = transcript.trim();
    if (cleaned.length < 5) {
      alert("Please provide a more detailed response.");
      return;
    }

    stopListening();
    setAnswers((prev) => [...prev, cleaned]);
    resetTranscript();
    setPlayedOnce(false);
    setCurrent((prev) => prev + 1);
  };

  const handleRecordAgain = () => {
    stopListening();
    resetTranscript();
    startListening();
  };

  const handleSubmit = async () => {
    if (!appointmentId || !userId1) {
      alert("Missing required information (appointment ID or user ID)");
      return;
    }

    setSubmitting(true);
    setError(null);

    const questionAnswerPairs = questions.map((question, index) => ({
      question,
      answer: answers[index] || "No response provided",
    }));

    try {
      const userId = userId1.id;

      const geminiResponse = await axios.post(
        'http://localhost:4000/api/pre-diagnosis/generate',
        {
          questions: questionAnswerPairs,
          appointmentId: appointmentId,
          userId: userId
        },
        { withCredentials: true }
      );

      if (geminiResponse.data && geminiResponse.data.data) {
        setReport(geminiResponse.data.data.report);
        
        // Show success message
        alert("Pre-diagnosis report generated successfully!");
        
      } else {
        throw new Error("Failed to generate pre-diagnosis report");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || error.message || "An error occurred during submission");
      alert(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-red-500 text-center">Speech recognition not supported in this browser.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-gray-200">
      <div className="max-w-2xl mx-auto p-8">
        {current < questions.length ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-teal-400">Question {current + 1}</h2>
                <span className="text-sm text-gray-400">({current + 1}/{questions.length})</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={speakQuestion}
                className="flex gap-2 text-teal-400 hover:text-teal-300 hover:bg-[#1A1F2A] transition-all duration-300"
              >
                <RepeatIcon className="w-4 h-4" />
                Repeat
              </Button>
            </div>

            <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 shadow-lg">
              <p className="text-xl text-gray-200">{questions[current]}</p>
            </div>

            <div className="bg-[#161B22] p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-gray-400">Your Answer:</p>
                {listening && (
                  <div className="flex items-center gap-1 text-teal-400">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                    <span className="text-xs">Recording...</span>
                  </div>
                )}
              </div>
              <div className="min-h-[100px] bg-[#21262D] p-4 rounded-lg border border-gray-700">
                <p className="text-gray-200">
                  {transcript || (
                    <span className="text-gray-500 italic">Start speaking to answer...</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={listening ? stopListening : startListening}
                className={`flex items-center gap-2 ${
                  listening
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                } text-white transition-all duration-300`}
              >
                {listening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Answering
                  </>
                )}
              </Button>

              {transcript && (
                <Button
                  variant="outline"
                  onClick={handleRecordAgain}
                  className="border-gray-700 hover:border-teal-500 text-gray-300 hover:text-teal-300 transition-all duration-300"
                >
                  Record Again
                </Button>
              )}

              {current === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={listening || submitting || transcript.trim().length < 5}
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Answers'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={listening || transcript.trim().length < 5}
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-[#161B22] p-8 rounded-xl border border-gray-800 shadow-lg">
              <CheckCircle2 className="w-16 h-16 text-teal-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-teal-400 mb-2">Thank you for answering!</h2>
              <p className="text-gray-400 mb-6">Your responses will help us provide better care.</p>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Answers'
                )}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-[#1A1F2A] border border-red-800 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Error</h3>
            </div>
            <p className="mt-2 text-gray-300">{error}</p>
          </div>
        )}

        {report && (
          <div className="mt-6 p-6 bg-[#161B22] rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Pre-Diagnosis Report</h3>
            <div className="whitespace-pre-line text-gray-300 bg-[#21262D] p-4 rounded-lg border border-gray-700">
              {report}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
