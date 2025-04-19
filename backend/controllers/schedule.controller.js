import User from "../models/user.model.js";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const scheduleExerciseVideo = async (req, res) => {
    try {
        const { videoId, scheduleDate, report } = req.body;
        const userId = req.user._id; // Assuming you have authentication middleware

        // Validate if video exists and is prescribed to the user
        const video = await Video.findOne({
            _id: videoId,
            isPrescribed: true,
            prescribedTo: userId
        });

        if (!video) {
            throw new ApiError(404, "Video not found or not prescribed to you");
        }

        // Create new session
        const newSession = {
            video: videoId,
            report: report || "Session scheduled",
            schedule: new Date(scheduleDate),
            date: new Date()
        };

        // Add session to user's sessions array
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $push: { sessions: newSession }
            },
            { new: true }
        ).populate('sessions.video');

        if (!updatedUser) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    session: updatedUser.sessions[updatedUser.sessions.length - 1]
                },
                "Exercise video scheduled successfully"
            )
        );

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Error scheduling exercise video"
        });
    }
};

// Get all scheduled sessions for a user
export const getUserScheduledSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('sessions.video')
            .select('sessions');

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                user.sessions,
                "Scheduled sessions fetched successfully"
            )
        );

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            message: error.message || "Error fetching scheduled sessions"
        });
    }
}; 