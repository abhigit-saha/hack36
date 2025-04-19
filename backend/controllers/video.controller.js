import Video from "../models/video.model.js";
import Session from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
// Get prescribed videos for a user
export const getPrescribedVideos = async (req, res) => {
  try {
    const userId = req.body.user._id;

    const videos = await Video.find({
      isPrescribed: true,
      prescribedTo: userId,
    }).select("title description url thumbnail duration difficulty");

    return res
      .status(200)
      .json(
        new ApiResponse(200, videos, "Prescribed videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching prescribed videos");
  }
};

// Create a new video session
export const createSession = async (req, res) => {
  try {
    const { videoId, userId } = req.body;
    console.log("VideoId: ", videoId, "UserId: ", userId);
    // Check if video exists and is prescribed to user
    const video = await Video.findOne({
      _id: videoId,
      isPrescribed: true,
      prescribedTo: userId,
    });

    if (!video) {
      throw new ApiError(404, "Video not found or not prescribed to user");
    }
    console.log("userId: ", userId, "videoId: ", videoId);
    // Create new session
    const session = await Session.create({
      userId,
      videoId,
      status: "in-progress",
    });

    // Add this session to the user's sessions array
    await User.findByIdAndUpdate(
      userId,
      {
        $push: { sessions: session._id },
      },
      { new: true }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { sessionId: session._id },
          "Session created successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error creating session");
  }
};

// Update session progress
export const updateSessionProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { progress, status } = req.body;
    const userId = req.user._id;

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        progress,
        status,
        ...(status === "completed" && { endTime: Date.now() }),
      },
      { new: true }
    );

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, session, "Session updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Error updating session");
  }
};

export const prescribeVideo = async (req, res) => {
  try {
    const { videoId, userId } = req.body;

    if (!videoId || !userId) {
      return res
        .status(400)
        .json(new ApiError(400, "Video ID and User ID are required"));
    }

    // Update the video - set isPrescribed to true and add userId to prescribedTo array
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        isPrescribed: true,
        $addToSet: { prescribedTo: userId }, // Uses $addToSet to avoid duplicates
      },
      { new: true } // Return the updated document
    );

    if (!updatedVideo) {
      return res.status(404).json(new ApiError(404, "Video not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, "Video prescribed successfully")
      );
  } catch (error) {
    console.error("Error prescribing video:", error);
    return res.status(500).json(new ApiError(500, "Error prescribing video"));
  }
};

// recommend video
// export const recommendVideo = async (req, res) => {
//   try {
//     const { videoId, userId, doctorId, chatId } = req.body;

//     if (!videoId || !userId) {
//       return res
//         .status(400)
//         .json(new ApiError(400, "Video ID and User ID are required"));
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json(new ApiError(404, "User not found"));
//     }
//     // Update the video - set isRecommended to true and add userId to recommendedTo array
//     const updatedVideo = await Video.findByIdAndUpdate(
//       videoId,
//       {
//         isRecommended: true,
//         $addToSet: { recommendedTo: userId }, // Uses $addToSet to avoid duplicates
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedVideo) {
//       return res.status(404).json(new ApiError(404, "Video not found"));
//     }

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, updatedVideo, "Video recommended successfully")
//       );
//   } catch (error) {
//     console.error("Error recommending video:", error);
//     return res.status(500).json(new ApiError(500, "Error recommending video"));
//   }
// };
