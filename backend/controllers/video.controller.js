import Video from '../models/video.model.js';
import Session from '../models/session.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get prescribed videos for a user
export const getPrescribedVideos = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const videos = await Video.find({
      isPrescribed: true,
      prescribedTo: userId
    }).select('title description url thumbnail duration difficulty');

    return res.status(200).json(
      new ApiResponse(200, videos, "Prescribed videos fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching prescribed videos");
  }
};

// Create a new video session
export const createSession = async (req, res) => {
  try {
    const { videoId } = req.body;
    const userId = req.user._id;

    // Check if video exists and is prescribed to user
    const video = await Video.findOne({
      _id: videoId,
      isPrescribed: true,
      prescribedTo: userId
    });

    if (!video) {
      throw new ApiError(404, "Video not found or not prescribed to user");
    }

    // Create new session
    const session = await Session.create({
      userId,
      videoId,
      status: 'in-progress'
    });

    return res.status(201).json(
      new ApiResponse(201, { sessionId: session._id }, "Session created successfully")
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
        ...(status === 'completed' && { endTime: Date.now() })
      },
      { new: true }
    );

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    return res.status(200).json(
      new ApiResponse(200, session, "Session updated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error updating session");
  }
}; 