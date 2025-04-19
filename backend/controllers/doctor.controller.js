import Doctor from "../models/doctor.model.js";

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
