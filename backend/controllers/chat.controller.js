const mongoose = require("mongoose");
const { Server } = require("socket.io");
const DoctorUserChat = require("../models/doctoruserchat.model.js");
const User = require("../models/user.model.js");
const Doctor = require("../models/doctor.model.js");
class ChatSocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      pingTimeout: 10000,
      pingInterval: 5000,
    });

    this.initializeSocketEvents();
    this.startStaleConnectionsCleanup();
  }

  initializeSocketEvents() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // Heartbeat mechanism
      let heartbeatInterval = setInterval(() => {
        socket.emit("ping");
      }, 5000);

      socket.on("pong", async () => {
        if (socket.currentChatId) {
          try {
            await DoctorUserChat.findByIdAndUpdate(socket.currentChatId, {
              last_activity: Date.now(),
              connection_status: "connected",
            });
          } catch (error) {
            console.error("Error updating heartbeat:", error);
          }
        }
      });
      // Inside initializeSocketEvents method, add these events:

      socket.on("schedule_meeting", async (data) => {
        try {
          const { chat_id, doctor_id, user_id } = data;

          // Make HTTP request to create meeting
          const response = await fetch(
            `${process.env.BASE_URL}/v1/api/chat/meeting/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ chat_id, doctor_id, user_id }),
            }
          );

          const result = await response.json();

          if (result.success) {
            socket.to(chat_id).emit("meeting_scheduled", result.data);
          } else {
            socket.emit("error", { message: "Failed to schedule meeting" });
          }
        } catch (error) {
          console.error("Error scheduling meeting:", error);
          socket.emit("error", { message: "Failed to schedule meeting" });
        }
      });

      socket.on("join_chat", async ({ chat_id, user_id, user_type }) => {
        try {
          socket.currentChatId = chat_id;
          socket.join(chat_id);

          await DoctorUserChat.findByIdAndUpdate(chat_id, {
            connection_status: "connected",
            last_activity: Date.now(),
          });

          socket.to(chat_id).emit("user_joined", {
            chat_id,
            user_id,
            user_type,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Error joining chat:", error);
          socket.emit("error", { message: "Failed to join chat" });
        }
      });

      socket.on("leave_chat", async ({ chat_id, user_id, user_type }) => {
        try {
          socket.leave(chat_id);
          clearInterval(heartbeatInterval);

          await DoctorUserChat.findByIdAndUpdate(chat_id, {
            connection_status: "disconnected",
            last_activity: Date.now(),
          });

          socket.to(chat_id).emit("user_left", {
            chat_id,
            user_id,
            user_type,
            timestamp: Date.now(),
          });
        } catch (error) {
          console.error("Error leaving chat:", error);
        }
      });

      socket.on("send_message", async (messageData) => {
        try {
          const { chat_id, sender_id, sender_type, content } = messageData;

          const chat = await DoctorUserChat.findById(chat_id);
          if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
          }

          const newMessage = {
            content,
            sender_id: new mongoose.Types.ObjectId(sender_id),
            sender_type,
            read: false,
            delivery_status: "sent",
          };

          chat.messages.push(newMessage);
          chat.last_message_at = Date.now();
          await chat.save();

          this.io.to(chat_id).emit("new_message", {
            chat_id,
            message: chat.messages[chat.messages.length - 1],
          });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      socket.on("mark_read", async ({ chat_id, reader_type }) => {
        try {
          const chat = await DoctorUserChat.findById(chat_id);
          if (!chat) {
            socket.emit("error", { message: "Chat not found" });
            return;
          }

          const senderTypeToMark = reader_type === "doctor" ? "user" : "doctor";
          let updated = false;

          chat.messages.forEach((message) => {
            if (message.sender_type === senderTypeToMark && !message.read) {
              message.read = true;
              updated = true;
            }
          });

          if (updated) {
            await chat.save();
            this.io.to(chat_id).emit("messages_read", {
              chat_id,
              reader_type,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error marking messages as read:", error);
          socket.emit("error", { message: "Failed to mark messages as read" });
        }
      });

      socket.on("typing_start", ({ chat_id, user_id, user_type }) => {
        socket
          .to(chat_id)
          .emit("typing_start", { chat_id, user_id, user_type });
      });

      socket.on("typing_stop", ({ chat_id, user_id, user_type }) => {
        socket.to(chat_id).emit("typing_stop", { chat_id, user_id, user_type });
      });

      socket.on("disconnect", async () => {
        clearInterval(heartbeatInterval);

        if (socket.currentChatId) {
          try {
            await DoctorUserChat.findByIdAndUpdate(socket.currentChatId, {
              connection_status: "disconnected",
              last_activity: Date.now(),
            });
          } catch (error) {
            console.error("Error updating disconnect status:", error);
          }
        }

        console.log("User disconnected:", socket.id);
      });
    });
  }

  startStaleConnectionsCleanup() {
    setInterval(async () => {
      try {
        const staleTimeout = 1800000; // 30 minutes
        const staleTimestamp = new Date(Date.now() - staleTimeout);

        await DoctorUserChat.updateMany(
          {
            last_activity: { $lt: staleTimestamp },
            connection_status: { $ne: "disconnected" },
          },
          {
            connection_status: "disconnected",
          }
        );
      } catch (error) {
        console.error("Error cleaning up stale connections:", error);
      }
    }, 900000); // Run every 15 minutes
  }

  getIO() {
    return this.io;
  }
}

// Initialize or get chat between doctor and user
// Initialize or get chat between doctor and user
const initializeChat = async (req, res) => {
  try {
    const { doctor_id, user_id } = req.body;

    if (!doctor_id || !user_id) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // Find existing chat or create a new one
    let chat = await DoctorUserChat.findOne({
      doctor_id: new mongoose.Types.ObjectId(doctor_id),
      user_id: new mongoose.Types.ObjectId(user_id),
    });

    if (!chat) {
      chat = new DoctorUserChat({
        doctor_id: new mongoose.Types.ObjectId(doctor_id),
        user_id: new mongoose.Types.ObjectId(user_id),
        messages: [],
      });
      await chat.save();
    }

    return res.status(200).json({
      data: {
        chat_id: chat._id,
        doctor_id: chat.doctor_id,
        user_id: chat.user_id,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.error("Error initializing chat:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Send message in chat (HTTP fallback)
const sendMessage = async (req, res) => {
  try {
    const { chat_id, sender_id, sender_type, content } = req.body;

    if (!chat_id || !sender_id || !sender_type || !content) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    if (sender_type !== "doctor" && sender_type !== "user") {
      return res.status(400).json({
        message: "Invalid sender type. Must be 'doctor' or 'user'",
      });
    }

    const chat = await DoctorUserChat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    const newMessage = {
      content,
      sender_id: new mongoose.Types.ObjectId(sender_id),
      sender_type,
      read: false,
    };

    chat.messages.push(newMessage);
    chat.last_message_at = Date.now();
    await chat.save();

    // Emit via WebSocket if available
    const socketIOInstance = req.app.get("io");
    if (socketIOInstance) {
      socketIOInstance.to(chat_id).emit("new_message", {
        chat_id,
        message: chat.messages[chat.messages.length - 1],
      });
    }

    return res.status(200).json({
      message: "Message sent successfully",
      data: {
        chat_id: chat._id,
        new_message: chat.messages[chat.messages.length - 1],
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { chat_id } = req.params;

    if (!chat_id) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const chat = await DoctorUserChat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      data: {
        chat_id: chat._id,
        doctor_id: chat.doctor_id,
        user_id: chat.user_id,
        messages: chat.messages,
      },
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get all chats for a doctor
const getDoctorChats = async (req, res) => {
  try {
    const { doctor_id } = req.params;

    if (!doctor_id) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const chats = await DoctorUserChat.find({
      doctor_id: new mongoose.Types.ObjectId(doctor_id),
    }).sort({ last_message_at: -1 });

    return res.status(200).json({
      chats: chats.map((chat) => ({
        chat_id: chat._id,
        user_id: chat.user_id,
        last_message:
          chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1]
            : null,
        unread_count: chat.messages.filter(
          (m) => !m.read && m.sender_type === "user"
        ).length,
      })),
    });
  } catch (error) {
    console.error("Error getting doctor chats:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Get all chats for a user
const getUserChats = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const chats = await DoctorUserChat.find({
      user_id: new mongoose.Types.ObjectId(user_id),
    }).sort({ last_message_at: -1 });

    return res.status(200).json({
      chats: chats.map((chat) => ({
        chat_id: chat._id,
        doctor_id: chat.doctor_id,
        last_message:
          chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1]
            : null,
        unread_count: chat.messages.filter(
          (m) => !m.read && m.sender_type === "doctor"
        ).length,
      })),
    });
  } catch (error) {
    console.error("Error getting user chats:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Mark messages as read (HTTP fallback)
const markMessagesAsRead = async (req, res) => {
  try {
    const { chat_id, reader_type } = req.body;

    if (!chat_id || !reader_type) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const chat = await DoctorUserChat.findById(chat_id);
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    // Mark messages from the opposite type as read
    const senderTypeToMark = reader_type === "doctor" ? "user" : "doctor";

    let updated = false;
    chat.messages.forEach((message) => {
      if (message.sender_type === senderTypeToMark && !message.read) {
        message.read = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
      // Emit via WebSocket if available
      const socketIOInstance = req.app.get("io");
      if (socketIOInstance) {
        socketIOInstance.to(chat_id).emit("messages_read", {
          chat_id,
          reader_type,
          timestamp: Date.now(),
        });
      }
    }

    return res.status(200).json({
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  ChatSocketHandler,
  initializeChat,
  sendMessage,
  getChatHistory,
  getDoctorChats,
  getUserChats,
  markMessagesAsRead,
};
