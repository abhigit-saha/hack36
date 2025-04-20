import Razorpay from 'razorpay';
import express from 'express';
import Appointment from '../models/appointment.model.js';
import { BookAppointment } from '../controllers/appointment.controller.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// Initialize Razorpay with proper error handling
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
  throw new Error('Razorpay initialization failed');
}

// Payment route with proper validation and error handling
router.post('/payment', async (req, res) => {
  try {
    const { amount, doctorId } = req.body;

    // Validate required fields
    if (!amount || !doctorId) {
      throw new ApiError(400, 'Amount and doctorId are required');
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive number');
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        doctorId
      }
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json(
      new ApiResponse(200, order, 'Payment order created successfully')
    );
  } catch (error) {
    console.error('Payment order creation failed:', error);
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Payment order creation failed'
    });
  }
});

// Book appointment route
router.post('/book', BookAppointment);

export default router;
