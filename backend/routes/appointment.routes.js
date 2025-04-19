// import Razorpay from 'razorpay';
import express from 'express';
import Appointment from '../models/appointment.model.js';
import { BookAppointment, submitQuestionAnswers } from '../controllers/appointment.controller.js';

const router = express.Router();

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

router.post('/payment', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount, 
    currency: 'INR',
    receipt: 'receipt_order_74394',
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Payment order creation failed' });
  }
});


router.post('/question/:appointmentId', submitQuestionAnswers)

router.post('/book', BookAppointment )

export default router;