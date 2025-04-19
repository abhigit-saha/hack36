const communityRouter = express.Router();
import express from "express";
import Video from "../models/video.model.js";
import cloudinary from "../config/cloudinary.js";
//helper functions (to be put in some other file )
import {
  upload,
  postVideo,
  getVideos,
  likeVideo,
  dislikeVideo,
} from "../controllers/community.controller.js";

//TODO
// communityRouter.delete("/video");
communityRouter.get("/video", getVideos);

communityRouter.post("/video", postVideo);

communityRouter.post("/video/:id/like", likeVideo);
communityRouter.post("/video/:id/dislike", dislikeVideo);

export default communityRouter;
