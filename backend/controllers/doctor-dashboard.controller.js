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
