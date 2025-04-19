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
  preDiagnosisId: {
    type: Schema.Types.ObjectId,
    ref: 'PreDiagnosis'
  },
  prescription: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);
export default Appointment;
