import Doctor from "../models/doctor.model.js";
import Video from "../models/video.model.js";
import Appointment from "../models/appointment.model.js";
import PreDiagnosis from "../models/preDiagnosis.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a doctor
// Register a doctor
export const DoctorRegister = async (req, res) => {
  const { email, name, password, liscence, specialization, location } =
    req.body;

  try {
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

    res.status(200).json({ message: "Registered", doctor: newDoctor });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).json(doctors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch doctors", error: err.message });
  }
};

// Get doctors by filter
export const getFilteredDoctors = async (req, res) => {
  const { specialization, location } = req.query;

  const filter = {};
  if (specialization) filter.specialization = specialization;
  if (location) filter.location = location;

  try {
    const doctors = await Doctor.find(filter);
    res.status(200).json(doctors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  const { id } = req.params;
  // console.log(id);

  try {
    const doctor = await Doctor.findById(id);
    // console.log(doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctor", error: err.message });
  }
};

// Prescribe exercise videos to a patient
export const prescribeExerciseVideos = async (req, res) => {
  try {
    const { appointmentId, videoIds, notes } = req.body;
    const doctorId = req.user._id;

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Get pre-diagnosis report
    const preDiagnosis = await PreDiagnosis.findOne({ appointmentId });
    if (!preDiagnosis) {
      throw new ApiError(404, "Pre-diagnosis report not found");
    }

    // Update videos with prescription information
    await Video.updateMany(
      { _id: { $in: videoIds } },
      {
        $set: {
          isPrescribed: true,
          prescribedBy: doctorId,
        },
        $addToSet: {
          prescribedTo: appointment.patientId,
        },
      }
    );

    // Update pre-diagnosis status
    preDiagnosis.status = "prescribed";
    preDiagnosis.doctorNotes = notes;
    await preDiagnosis.save();

    // Update appointment status
    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Exercise videos prescribed successfully",
        preDiagnosisId: preDiagnosis._id,
      })
    );
  } catch (error) {
    throw new ApiError(500, "Error prescribing exercise videos");
  }
};

// Get patient's pre-diagnosis reports
export const getPatientPreDiagnosisReports = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId }).populate({
      path: "preDiagnosisId",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

    // Filter appointments with pre-diagnosis reports
    const reports = appointments
      .filter((app) => app.preDiagnosisId)
      .map((app) => ({
        appointmentId: app._id,
        appointmentDate: app.appointmentDate,
        patient: app.preDiagnosisId.userId,
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
    throw new ApiError(500, "Error fetching pre-diagnosis reports");
  }
};

// Prescribe exercise videos to a patient
export const prescribeExerciseVideos = async (req, res) => {
  try {
    const { appointmentId, videoIds, notes } = req.body;
    const doctorId = req.user._id;

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
    });

    if (!appointment) {
      throw new ApiError(404, "Appointment not found");
    }

    // Get pre-diagnosis report
    const preDiagnosis = await PreDiagnosis.findOne({ appointmentId });
    if (!preDiagnosis) {
      throw new ApiError(404, "Pre-diagnosis report not found");
    }

    // Update videos with prescription information
    await Video.updateMany(
      { _id: { $in: videoIds } },
      {
        $set: {
          isPrescribed: true,
          prescribedBy: doctorId,
        },
        $addToSet: {
          prescribedTo: appointment.patientId,
        },
      }
    );

    // Update pre-diagnosis status
    preDiagnosis.status = "prescribed";
    preDiagnosis.doctorNotes = notes;
    await preDiagnosis.save();

    // Update appointment status
    appointment.status = "completed";
    await appointment.save();

    return res.status(200).json(
      new ApiResponse(200, {
        message: "Exercise videos prescribed successfully",
        preDiagnosisId: preDiagnosis._id,
      })
    );
  } catch (error) {
    throw new ApiError(500, "Error prescribing exercise videos");
  }
};

// Get patient's pre-diagnosis reports
export const getPatientPreDiagnosisReports = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctorId }).populate({
      path: "preDiagnosisId",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

    // Filter appointments with pre-diagnosis reports
    const reports = appointments
      .filter((app) => app.preDiagnosisId)
      .map((app) => ({
        appointmentId: app._id,
        appointmentDate: app.appointmentDate,
        patient: app.preDiagnosisId.userId,
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
    throw new ApiError(500, "Error fetching pre-diagnosis reports");
  }
};
