import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GenerateQuestions = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      throw new ApiError(400, "Patient ID and Doctor ID are required");
    }

    // Get patient and doctor data
    const [patient, doctor] = await Promise.all([
      User.findById(patientId).select('-password'),
      Doctor.findById(doctorId).select('-password')
    ]);

    if (!patient || !doctor) {
      throw new ApiError(404, "Patient or doctor not found");
    }

    // Prepare context for Gemini
    const context = {
      patient: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        medicalHistory: patient.medicalHistory || [],
        lifestyle: patient.lifestyle || {}
      },
      doctor: {
        specialization: doctor.specialization,
        name: doctor.name
      }
    };

    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Based on the following patient and doctor information, generate 5 relevant medical questions that will help in diagnosis. 
    Make the questions specific to the patient's medical history and the doctor's specialization.
    Return only the questions in a JSON array format, without any additional text or explanation.

    Patient Information:
    - Name: ${context.patient.name}
    - Age: ${context.patient.age}
    - Gender: ${context.patient.gender}
    - Medical History: ${JSON.stringify(context.patient.medicalHistory)}
    - Lifestyle: ${JSON.stringify(context.patient.lifestyle)}

    Doctor Information:
    - Name: Dr. ${context.doctor.name}
    - Specialization: ${context.doctor.specialization}

    Generate 5 specific questions that would be relevant for this consultation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response and ensure it's a valid array
    let questions;
    try {
      questions = JSON.parse(text);
      if (!Array.isArray(questions)) {
        questions = text.split('\n').filter(q => q.trim());
      }
    } catch (e) {
      questions = text.split('\n').filter(q => q.trim());
    }

    // Ensure we have exactly 5 questions
    if (questions.length > 5) {
      questions = questions.slice(0, 5);
    } else if (questions.length < 5) {
      const defaultQuestions = [
        "What symptoms are you currently experiencing?",
        "How long have you had these symptoms?",
        "Have you experienced similar symptoms before?",
        "Are you currently taking any medications?",
        "Do you have any allergies?"
      ];
      questions = [...questions, ...defaultQuestions.slice(questions.length)];
    }

    return res.status(200).json(
      new ApiResponse(200, { questions }, "Questions generated successfully")
    );

  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(error.statusCode || 500).json(
      new ApiResponse(
        error.statusCode || 500,
        null,
        error.message || "Error generating questions"
      )
    );
  }
}; 