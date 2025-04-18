const communityRouter = express.Router();
import express from "express";
import Video from "../models/video.model.js";
import cloudinary from "../config/cloudinary.js";
//helper functions (to be put in some other file )
import { upload, postVideo } from "../controllers/community.controller.js";
communityRouter.get("/video", upload);

//TODO
// communityRouter.delete("/video");

communityRouter.post("/video", postVideo);

// communityRouter.put("/:id", (req, res) => {
//   res.json({
//     message: `Update community with ID: ${req.params.id}`,
//     data: req.body,
//   });
// });

// communityRouter.delete("/:id", (req, res) => {
//   res.json({ message: `Delete community with ID: ${req.params.id}` });
// });

export default communityRouter;
