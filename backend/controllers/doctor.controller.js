import Doctor from "../models/doctor.model.js";

export const DoctorRegister = async (req, res) => {
  const { email, name, password, liscence, specialization } = req.body;
  const existingDoctor = await Doctor.findOne({ email });

  if (existingDoctor) {
    return res.status(400).json({ message: "Doctor already exists" });
  }

  const newDoctor = new Doctor({ email, password, liscence, specialization });
  await newDoctor.save();

  res.status(200).json({ message: "Registered" });
};
