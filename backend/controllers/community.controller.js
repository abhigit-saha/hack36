import Video from "../models/video.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
const upload = async (req, res) => {
  const video = await Video.findById(req.query.id);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  res.json({
    url: video.url,
    message: `Get video for community with ID: ${req.query.id}`,
  });
};

const uploadToCloudinary = async (filePath) => {
  try {
    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      folder: "community_videos",
      // Optional: Add these parameters for video optimization
      eager: [
        {
          format: "mp4",
          transformation: [
            { width: 1280, height: 720, crop: "limit" },
            { quality: "auto" },
          ],
        },
      ],
    });

    // Remove the file from server after upload
    fs.unlinkSync(filePath);

    // Return the Cloudinary response
    return {
      url: result.secure_url,
      public_id: result.public_id,
      thumbnail:
        result.eager?.[0]?.secure_url ||
        result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
    };
  } catch (error) {
    // Remove the file from server if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

const postVideo = async (req, res) => {
  const { title, description, tags, uploadedBy } = req.body;
  //analyze the video:
  //to analyze the video :
  //1. analyze the video using blazepose
  //2. put the analyzed video in youtube as an unlisted video.
  //3. get the video url and return that
  //@vatsal: thumbnail and url would be given by the service

  //first we save that video in the database.
  // Assuming you've set up multer middleware in your application
  // If not, you'd need to add this to your imports:
  // const multer = require('multer');
  // const upload = multer({ dest: 'uploads/' });
  // And modify your route to use upload.single('video')

  // Check if video file is included in the request
  if (!req.file && !req.body.video) {
    return res.status(400).json({ message: "No video file provided" });
  }
  let url = "";
  // If the frontend passes a Cloudinary URL directly
  if (req.body.video && typeof req.body.video === "string") {
    // Frontend has already uploaded to Cloudinary and is passing the URL
    url = req.body.video;
  }
  // If the frontend uploads the file to the server first
  else if (req.file) {
    const cloudinaryResult = await uploadToCloudinary(req.file.path);
    url = cloudinaryResult.url;
  }
  console.log("uploaded the video");
  // const { thumbnail, url } = await analyzeVideo(req.body.url);
  const thumbnail =
    "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Frandom%2520object%2F&psig=AOvVaw1x_UL6hCnCWi4wNauXFM8r&ust=1745105916257000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCLi90qXg4owDFQAAAAAdAAAAABAE";
  const comments = [];
  try {
    const newVideo = new Video({
      title,
      description,
      tags,
      thumbnail,
      url,
      comments,
    });

    await newVideo.save();
    console.log("savef ");
    res
      .status(201)
      .json({ message: "Video created successfully", data: newVideo });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating video", error: error.message });
  }
};

const getVideos = async (req, res) => {
  try {
    const videos = await Video.find();
    res
      .status(200)
      .json({ message: "Videos retrieved successfully", data: videos });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving videos", error: error.message });
  }
};

const likeVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the video by ID
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment like count
    video.likes = (video.likes || 0) + 1;

    // Save the updated video
    await video.save();

    res.status(200).json({
      message: "Video liked successfully",
      data: { likes: video.likes },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error liking video",
      error: error.message,
    });
  }
};

const dislikeVideo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the video by ID
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment dislike count
    video.dislikes = (video.dislikes || 0) + 1;

    // Save the updated video
    await video.save();

    res.status(200).json({
      message: "Video disliked successfully",
      data: { dislikes: video.dislikes },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error disliking video",
      error: error.message,
    });
  }
};
export { upload, postVideo, getVideos, likeVideo, dislikeVideo };
