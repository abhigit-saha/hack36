import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate pre-diagnosis report using Gemini AI
export const generatePreDiagnosisReport = async (req, res) => {
  try {
    const { appointmentId, questions, userId } = req.body;

    // Validate required fields
    if (!userId || !appointmentId) {
      throw new ApiError(400, "User ID and Appointment ID are required");
    }

    // First create or update the appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        userId,
        status: 'scheduled' // Set initial status
      },
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );

    if (!appointment) {
      throw new ApiError(404, "Failed to create/update appointment");
    }

    // Validate and clean questions array
    const validatedQuestions = questions.map(q => ({
      question: q.question,
      answer: q.answer || "No answer provided"
    }));

    // Format questions for Gemini prompt
    const formattedQuestions = validatedQuestions.map(q => 
      `Question: ${q.question}\nAnswer: ${q.answer}`
    ).join('\n\n');

    // Create Gemini prompt
    const prompt = `
      You are a medical AI assistant. Based on the following patient responses, 
      generate a concise pre-diagnosis report that would be helpful for a physiotherapist 
      to understand the patient's condition and prescribe appropriate exercises.
      
      Focus on:
      1. Main symptoms and their severity
      2. Duration of the condition
      3. Factors that aggravate or alleviate symptoms
      4. Impact on daily activities
      5. Relevant medical history
      
      Patient Responses:
      ${formattedQuestions}
      
      Please provide a structured report that highlights key information a physiotherapist 
      would need to prescribe appropriate exercise videos.
    `;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Generate report
    const result = await model.generateContent(prompt);
    const report = result.response.text();

    // Create pre-diagnosis record
    const preDiagnosis = await PreDiagnosis.create({
      userId,
      appointmentId: appointment._id,
      questions: validatedQuestions,
      report,
      status: 'pending'
    });

    // Update appointment with pre-diagnosis reference
    await Appointment.findByIdAndUpdate(appointment._id, {
      preDiagnosisId: preDiagnosis._id,
      status: 'pre-diagnosis-completed'
    });

    return res.status(201).json(
      new ApiResponse(201, { 
        appointmentId: appointment._id,
        preDiagnosisId: preDiagnosis._id,
        report 
      }, "Pre-diagnosis report generated successfully")
    );

  } catch (error) {
    console.error("Error generating pre-diagnosis report:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error generating pre-diagnosis report"
    });
  }
};