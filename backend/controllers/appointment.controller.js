import Appointment from "../models/appointment.model.js";

export const submitQuestionAnswers = async (req, res) => {
    const { appointmentId } = req.params;
    const { responses } = req.body;

    console.log("Received responses:", responses, "for appointment ID:", appointmentId);
  
    try {
      // Save in DB – e.g., add it to the existing appointment
      await Appointment.findByIdAndUpdate(appointmentId, {
        preReport: JSON.stringify(responses)
      });
  
      console.log("Responses saved successfully for appointment ID:", appointmentId);
  
      res.status(200).json({ ok:true, message: "Answers saved successfully" });
      console.log("Response sent to client");
    } catch (error) {
      console.error("Error saving answers:", error);
      res.status(500).json({ message: "Error saving answers" });
    }
  };


  export const BookAppointment = async (req, res) => {
    try {
        const { doctorId, patientId, paymentId } = req.body;
    
        console.log('Received booking request:', req.body);
    
        if (!doctorId || !patientId || !paymentId) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const appointment = new Appointment({
          doctorId,
          patientId,
          paymentId,
          appointmentDate: new Date('2025-04-21T10:00:00Z'),
          preReport: '',
          prescription: '',
        });
    
        await appointment.save();
    
        console.log('Appointment saved:', appointment);
        res.status(201).json(appointment);
      } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Server error' });
      }
}