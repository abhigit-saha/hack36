'use client';

import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSearchParams } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { RepeatIcon } from 'lucide-react';

const questions = [
  "What symptoms are you currently experiencing?",
  "How long have you had these symptoms?",
  "Do you have any existing medical conditions?",
  "Are you currently taking any medications?",
  "Have you experienced similar symptoms in the past?"
];

export default function QuestionPage() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (!appointmentId) {
      alert("Appointment ID missing in URL");
      return;
    }

    setSubmitting(true);

    const questionAnswerPairs = questions.map((question, index) => ({
      question,
      answer: answers[index] || "",
    }));

    try {
      const response = await fetch(`http://localhost:4000/appointment/question/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responses: questionAnswerPairs })
      });

      if (response.ok) {
        alert("Answers submitted successfully! Proceeding to report/summary.");
        // redirect to summary or payment page if needed
      } else {
        alert("Something went wrong during submission.");
      }
    } catch (error) {
      alert("Submission failed: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-red-500 text-center">Speech recognition not supported in this browser.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {current < questions.length ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Question {current + 1}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={speakQuestion}
              className="flex gap-2 text-blue-600"
            >
              <RepeatIcon className="w-4 h-4" />
              Repeat
            </Button>
          </div>

          <p className="text-gray-700">{questions[current]}</p>

          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
            <p className="min-h-[60px] bg-white p-2 rounded border">
              {transcript || "Start speaking to answer..."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={listening ? stopListening : startListening}>
              {listening ? "Stop Recording" : "Start Answering"}
            </Button>

            {transcript && (
              <Button variant="secondary" onClick={handleRecordAgain}>
                Record Again
              </Button>
            )}

            {current === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={listening || submitting || transcript.trim().length < 5}
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={listening || transcript.trim().length < 5}
              >
                Next
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Thank you for answering!</h2>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Answers"}
          </Button>
        </div>
      )}
    </div>
  );
}
