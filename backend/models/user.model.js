import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Session subdocument schema
const SessionSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    report: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    schedule: {
        type: Date,
        required: true
    }
});

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    profilePicture: {
        type: String,
        default: ''
    },
    medicalHistory: {
        allergies: [String],
        currentMedications: [String],
        pastSurgeries: [String],
        chronicConditions: [String]
    },
    lifestyle: {
        smoking: {
            type: String,
            enum: ['Never', 'Former', 'Current'],
            default: 'Never'
        },
        alcohol: {
            type: String,
            enum: ['Never', 'Occasional', 'Regular'],
            default: 'Never'
        },
        exercise: {
            type: String,
            enum: ['None', '1-2 times/week', '3-4 times/week', '5+ times/week'],
            default: 'None'
        },
        sleepHours: {
            type: Number,
            min: 0,
            max: 24,
            default: 8
        }
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['Patient', 'Doctor', 'Hospital'],
        default: 'Patient'
    },
    sessions: {
        type: [SessionSchema],
        default: [],
    }
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
