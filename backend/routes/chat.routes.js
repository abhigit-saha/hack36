const express = require("express");
const {
  initializeChat,
  sendMessage,
  getChatHistory,
  getDoctorChats,
  getUserChats,
  markMessagesAsRead,
} = require("../controllers/chat.controller.js");
const router = express.Router();

// Existing routes
router.post("/initialize", initializeChat);
router.post("/message", sendMessage);
router.get("/history/:chat_id", getChatHistory);
router.get("/doctor/:doctor_id", getDoctorChats);
router.get("/user/:user_id", getUserChats);
router.post("/read", markMessagesAsRead);

module.exports = router;
