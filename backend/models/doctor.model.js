import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const DoctorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  }, 
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  license: {
    type: String,
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  experience: {
    years: Number,
    previousHospitals: [String],
  },
  availability: {
    days: [{
      day: String,
      startTime: String,
      endTime: String,
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  consultationFee: {
    type: Number,
    default: 0,
  },
  languages: [String],
  verified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['Doctor'],
    default: 'Doctor',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

DoctorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.updatedAt = Date.now();
  next();
});

DoctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Doctor = mongoose.model('Doctor', DoctorSchema);


export default Doctor;
