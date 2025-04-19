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
