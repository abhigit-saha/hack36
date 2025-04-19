import mongoose from "mongoose";

const preDiagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }],
  report: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'prescribed'],
    default: 'pending'
  },
  doctorNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

preDiagnosisSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

const PreDiagnosis = mongoose.model("PreDiagnosis", preDiagnosisSchema);

export default PreDiagnosis; 