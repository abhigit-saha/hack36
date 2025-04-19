import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import AuthRouter from "./routes/auth.routes.js";
import UserRouter from "./routes/user.routes.js";
import CommunityRouter from "./routes/community.routes.js";
import DoctorRouter from "./routes/doctor.routes.js";
import ChatRouter from "./routes/chat.routes.js";
import { connectDb } from "./utils/connectDb.js";
import { ChatSocketHandler } from "./controllers/chat.controller.js";
import multer from "multer";
import mongoose from "mongoose";
// import AppointmentRouter from "./routes/appointment.routes.js";
import PreDiagnosisRouter from "./routes/preDiagnosis.routes.js";
const upload = multer({ dest: "uploads/" });
import VideoRouter from "./routes/video.routes.js"import http from "http";
dotenv.config();
await connectDb();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const chatHandler = new ChatSocketHandler(server);
app.set("io", chatHandler.getIO());

app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/doctor", DoctorRouter);
app.use("/community", upload.single("video"), CommunityRouter);
app.use("/chat", ChatRouter);
// app.use("/appointment", AppointmentRouter);
app.use("/api", VideoRouter);
app.use("/api/pre-diagnosis", PreDiagnosisRouter);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
