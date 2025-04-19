import Appointment from "../models/appointment.model.js"


export const GetAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query
    

    if (!doctorId) {
      return res.status(400).json({ error: "doctorId is required in query" })
    }

    const appointments = await Appointment.find({ doctorId }).populate("patientId", "name email")

    res.status(200).json(appointments)
  } catch (err) {
    console.error("Error fetching appointments:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}


export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params

    const appointment = await Appointment.findById(id)
      .populate("patientId", "name email")
      .populate("doctorId", "name specialization email")

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" })
    }

    res.status(200).json(appointment)
  } catch (err) {
    console.error("Error fetching appointment by ID:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}