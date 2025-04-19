import mongoose, { Schema } from 'mongoose';

const AppointmentSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentDate: {
    type: Date,
    default: () => new Date('2025-04-21T10:00:00Z') // hardcoded
  },
  preReport: {
    type: String,
    default: ""
  },
  prescription: {
    type: String,
    default: ""
  }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
