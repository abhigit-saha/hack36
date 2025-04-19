import Appointment from "../models/appointment.model.js";



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