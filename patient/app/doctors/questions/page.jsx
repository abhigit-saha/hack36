'use client';

import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { RepeatIcon, Mic, MicOff, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDt5qh-_PnQAy6RnY0tDeXDMBlogsYVWvc');

export default function QuestionPage() {
  const user = useSelector((state) => state.auth.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');

  const [questions, setQuestions] = useState([
    "What symptoms are you currently experiencing?",
    "How long have you had these symptoms?",
    "Do you have any existing medical conditions?",
    "Are you currently taking any medications?",
    "Have you experienced similar symptoms in the past?"
  ]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [chatInitialized, setChatInitialized] = useState(false);
  const [chatError, setChatError] = useState(null);

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
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/user/profile', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.data) {
          // Use the profile data to potentially modify questions
          const userProfile = data.data;
          
          // Add personalized questions based on user profile
          const personalizedQuestions = [
            "What symptoms are you currently experiencing?",
            "How long have you had these symptoms?",
            userProfile.medicalHistory?.conditions?.length > 0 
              ? `How has your ${userProfile.medicalHistory.conditions[0]} been affecting you recently?`
              : "Do you have any existing medical conditions?",
            userProfile.medicalHistory?.medications?.length > 0
              ? `Are you still taking ${userProfile.medicalHistory.medications[0]}?`
              : "Are you currently taking any medications?",
            "Have you experienced similar symptoms in the past?"
          ];

          setQuestions(personalizedQuestions);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Keep the default questions if there's an error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    const generateQuestionsWithGemini = async () => {
      if (!userProfile) return;

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate 5 personalized medical questions for a patient consultation based on the following information:
        
        Patient Information:
        - Age: ${userProfile.age || 'Not specified'}
        - Gender: ${userProfile.gender || 'Not specified'}
        - Medical Conditions: ${userProfile.medicalHistory?.conditions?.join(', ') || 'None'}
        - Allergies: ${userProfile.medicalHistory?.allergies?.join(', ') || 'None'}
        - Medications: ${userProfile.medicalHistory?.medications?.join(', ') || 'None'}
        - Lifestyle: 
          * Smoking: ${userProfile.lifestyle?.smoking || 'No'}
          * Alcohol: ${userProfile.lifestyle?.alcohol || 'No'}
          * Exercise: ${userProfile.lifestyle?.exercise || 'Not specified'}
          * Sleep: ${userProfile.lifestyle?.sleepHours || 'Not specified'} hours
        
        Generate 5 relevant medical questions that would help understand the patient's current health status better.
        Format each question on a new line and number them 1-5.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract questions from the response
        const extractedQuestions = text
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 5);

        setQuestions(extractedQuestions);
      } catch (error) {
        console.error('Error generating questions:', error);
        // Fallback to default questions if Gemini API fails
        setQuestions([
          "What symptoms are you currently experiencing?",
          "How long have you had these symptoms?",
          "Do you have any existing medical conditions?",
          "Are you currently taking any medications?",
          "Have you experienced similar symptoms in the past?"
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile && doctorId) {
      generateQuestionsWithGemini();
    }
  }, [userProfile, doctorId]);

  useEffect(() => {
    if (!playedOnce && current < questions.length) {
      speakQuestion();
      setPlayedOnce(true);
    }
  }, [current, playedOnce, questions]);

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
    if (!appointmentId || !user) {
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
      const response = await fetch('http://localhost:4000/api/pre-diagnosis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          questions: questionAnswerPairs,
          appointmentId: appointmentId,
          userId: user.id
        }),
      });

      const data = await response.json();
      
      if (data && data.data) {
        setReport(data.data.report);
        alert("Pre-diagnosis report generated successfully!");
      } else {
        throw new Error("Failed to generate pre-diagnosis report");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "An error occurred during submission");
      alert(`Submission failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitializeChat = async () => {
    try {
      setChatError(null);
      console.log('Initializing chat with:', { doctorId, userId: user?.id });
      
      if (!doctorId || !user?.id) {
        throw new Error('Missing doctor ID or user ID');
      }

      const response = await fetch('http://localhost:4000/chat/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          doctor_id: doctorId,
          user_id: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize chat');
      }

      const data = await response.json();
      console.log('Chat initialization response:', data);
      
      if (data.data) {
        setChatInitialized(true);
        router.push(`/chat`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setChatError(error.message || 'Failed to initialize chat. Please try again.');
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-red-500 text-center">Speech recognition not supported in this browser.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <span className="text-xl text-teal-400">Generating questions...</span>
        </div>
      </div>
    );
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
                disabled={submitting || !appointmentId}
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
              {!appointmentId && (
                <p className="text-sm text-red-400 mt-2">Appointment ID is missing</p>
              )}
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
          <div className="mt-6 space-y-6">
            <div className="p-6 bg-[#161B22] rounded-xl border border-gray-800 shadow-lg">
              <h3 className="text-xl font-bold text-teal-400 mb-4">Pre-Diagnosis Report</h3>
              <div className="whitespace-pre-line text-gray-300 bg-[#21262D] p-4 rounded-lg border border-gray-700">
                {report}
              </div>
            </div>

            {!chatInitialized && (
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleInitializeChat}
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-all duration-300 flex items-center gap-2"
                  disabled={!doctorId || !user?.id}
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Chat with Doctor
                </Button>
                {(!doctorId || !user?.id) && (
                  <p className="text-sm text-gray-400">
                    {!doctorId ? 'Doctor ID is missing' : 'User ID is missing'}
                  </p>
                )}
              </div>
            )}

            {chatError && (
              <div className="mt-4 p-4 bg-[#1A1F2A] border border-red-800 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="font-semibold">Error</h3>
                </div>
                <p className="mt-2 text-gray-300">{chatError}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
