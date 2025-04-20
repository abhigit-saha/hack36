import Doctor from "../models/doctor.model.js";
import Video from "../models/video.model.js";
import Appointment from "../models/appointment.model.js";
import PreDiagnosis from "../models/preDiagnosis.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { setCookie } from "../helper/cookieHelper.js";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Register a doctor
export const DoctorRegister = async (req, res) => {
  const { email, name, password, liscence, specialization, location } =
    req.body;

  try {
    if (
      !email ||
      !name ||
      !password ||
      !liscence ||
      !specialization ||
      !location
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const newDoctor = new Doctor({
      email,
      name,
      password,
      liscence,
      specialization,
      location,
    });

    await newDoctor.save();

    return res.status(200).json({ message: "Registered", doctor: newDoctor });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export const SuggestDoctor = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text input is required." });
  }

  try {
    const prompt = `
      You are a smart medical AI assistant. Based on the user's condition described below,
      decide whether they should consult a "Mental" doctor or a "Physiotherapist".

      Respond with only one word: "Mental" or "Physiotherapist".

      Patient Condition:
      ${text}
    `;

    // Assuming genAI is already initialized globally
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    // Clean and validate response
    const cleanedAnswer = answer.toLowerCase().includes("mental")
      ? "Mental Doctor"
      : "Physiotherapist";

    console.log("AI Recommendation:", cleanedAnswer);

    return res.status(200).json({ recommendation: cleanedAnswer });
  } catch (error) {
    console.error("Error suggesting doctor:", error);
    return res.status(500).json({
      message: "Failed to generate recommendation.",
      error: error.message,
    });
  }
};

export const GetDoctor = async (req, res) => {
  try {
    const authToken = req.cookies["auth_token"];
    // console.log(authToken);

    if (!authToken) {
      return res
        .status(401)
        .json({ message: "No token provided. Unauthorized." });
    }

    jwt.verify(authToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid or expired token." });
      }

      const doctor = await Doctor.findById(decoded.doctorId);
      if (!doctor) {
        return res.status(404).json({ message: "doctor not found." });
      }

      res.status(200).json({
        message: "doctor details retrieved successfully.",
        doctor,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const LoginDoctor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { doctorId: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set JWT in HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role
      }
    });
  } catch (error) {
    console.error('LoginDoctor error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    return res.status(200).json(doctors);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: err.message });
  }
};

// Get doctors by filter
export const getFilteredDoctors = async (req, res) => {
  try {
    const { specialization, location, minRating, maxFee, availability } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (location) {
      query['address.city'] = { $regex: location, $options: 'i' };
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      query.consultationFee = { $lte: parseFloat(maxFee) };
    }

    if (availability === 'true') {
      query['availability.isAvailable'] = true;
    }

    const doctors = await Doctor.find(query)
      .select('-password -medicalHistory -lifestyle')
      .sort({ rating: -1, experience: -1 });

    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Error filtering doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to filter doctors'
    });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findById(id);
    console.log(doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching doctor", error: err.message });
  }
};

// Prescribe exercise videos to a patient
export const prescribeExerciseVideos = async (req, res) => {
  try {
    const { appointmentId, videoIds, notes } = req.body;
    const doctorId = req.user._id;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    const preDiagnosis = await PreDiagnosis.findOne({ appointmentId });

    if (!preDiagnosis) {
      throw new ApiError(404, "Pre-diagnosis report not found");
    }

    await Video.updateMany(
      { _id: { $in: videoIds } },
      {
        $set: {
          isPrescribed: true,
        },
        $addToSet: {
          prescribedTo: appointment.patientId,
        },
      }
    );

    preDiagnosis.status = "prescribed";
    preDiagnosis.doctorNotes = notes;
    await preDiagnosis.save();

    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Exercise videos prescribed successfully",
        preDiagnosisId: preDiagnosis._id,
      })
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error prescribing exercise videos",
    });
  }
};

// Get patient's pre-diagnosis reports
export const getPatientPreDiagnosisReports = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const appointments = await Appointment.find({ doctorId })
      .populate({
        path: "preDiagnosisId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("patientId", "name email");

    const reports = appointments
      .filter((app) => app.preDiagnosisId)
      .map((app) => ({
        appointmentId: app._id,
        appointmentDate: app.appointmentDate,
        patient: app.patientId,
        preDiagnosis: app.preDiagnosisId,
      }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          reports,
          "Pre-diagnosis reports fetched successfully"
        )
      );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error fetching pre-diagnosis reports",
    });
  }
};

export const GetDoctorProfile = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    
    if (!decoded.doctorId) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const doctor = await Doctor.findById(decoded.doctorId).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Doctor profile retrieved successfully.',
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        dateOfBirth: doctor.dateOfBirth,
        gender: doctor.gender,
        address: doctor.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        profilePicture: doctor.profilePicture || '',
        license: doctor.license,
        specialization: doctor.specialization || '',
        qualifications: doctor.qualifications || [],
        experience: doctor.experience || {
          years: 0,
          previousHospitals: []
        },
        availability: doctor.availability || {
          days: [],
          isAvailable: true
        },
        consultationFee: doctor.consultationFee || 0,
        languages: doctor.languages || [],
        verified: doctor.verified,
        role: doctor.role,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt
      }
    });
  } catch (error) {
    console.error('GetDoctorProfile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateBasicInfo = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { name, phone, dateOfBirth, gender, address } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      {
        name,
        phone,
        dateOfBirth,
        gender,
        address
      },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Basic information updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateProfessionalInfo = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { specialization, qualifications, experience, consultationFee, languages } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      {
        specialization,
        qualifications,
        experience,
        consultationFee,
        languages
      },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Professional information updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateAvailability = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { availability } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      { availability },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Availability updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateMedicalHistory = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { medicalHistory } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      { medicalHistory },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Medical history updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateLifestyle = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { lifestyle } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      { lifestyle },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Lifestyle information updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateEmergencyContact = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { emergencyContact } = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      decoded.doctorId,
      { emergencyContact },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    res.status(200).json({
      message: 'Emergency contact updated successfully.',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getDoctorListings = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .select('-password -medicalHistory -lifestyle')
      .sort({ rating: -1, experience: -1 });

    res.status(200).json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error('Error fetching doctor listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor listings'
    });
  }
};
