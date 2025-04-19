"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageSquare,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

const VideoCard = ({ video, onLike, onDislike }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
        <CardDescription>
          {new Date(video.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-muted rounded-md overflow-hidden">
          <video
            src={video.url}
            controls
            poster={video.thumbnail}
            className="w-full h-full object-cover"
          ></video>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {video.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {video.tags &&
            video.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">
                {tag.trim()}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center"
            onClick={onLike}
          >
            <ThumbsUp size={16} className="mr-1" />
            <span>{video.likes || 0}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center"
            onClick={onDislike}
          >
            <ThumbsDown size={16} className="mr-1" />
            <span>{video.dislikes || 0}</span>
          </Button>
          <Button size="sm" variant="ghost" className="flex items-center">
            <MessageSquare size={16} className="mr-1" />
            <span>{video.comments || 0}</span>
          </Button>
        </div>
        <Button size="sm" variant="ghost" className="flex items-center">
          <Share2 size={16} className="mr-1" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

const UploadVideoModal = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [videoInfo, setVideoInfo] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!file || !videoInfo.title) return;

    try {
      // Create FormData object to send the file and other data
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", videoInfo.title);
      formData.append("description", videoInfo.description);
      formData.append("tags", videoInfo.tags);

      // Send the data to the backend API
      const response = await fetch("http://localhost:4000/community/video", {
        method: "POST",
        body: formData,
      });
      console.log("Response after uploading the video: ", response);
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      // Reset form and close modal
      setFile(null);
      setVideoInfo({
        title: "",
        description: "",
        tags: "",
      });
      onClose();
    } catch (error) {
      console.error("Error uploading video:", error);
      // You could add an error state and display it to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload a Video</DialogTitle>
          <DialogDescription>
            Share your knowledge with the community
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("video-file").click()}
          >
            <input
              type="file"
              id="video-file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              {file
                ? file.name
                : "Drag and drop your video file here or click to browse"}
            </p>
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={videoInfo.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={videoInfo.description}
              onChange={handleInputChange}
              placeholder="Describe your video"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={videoInfo.tags}
                onChange={handleInputChange}
                placeholder="e.g. react,hooks (comma separated)"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!file || !videoInfo.title}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Community() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("http://localhost:4000/community/video", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const resobj = await response.json();
        console.log("DATA!!!!: ", resobj.data);
        setVideos(resobj.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        // Keep the sample videos as fallback
      }
    };

    fetchVideos();
  }, []);

  const handleLike = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/community/video/${id}/like`,
        {
          method: "POST",
        }
      );

      console.log("RESPONSE AFTER LIKE: ", response);

      if (!response.ok) {
        throw new Error("Failed to like video");
      }

      // Update the videos state with the updated like count
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === id ? { ...video, likes: (video.likes || 0) + 1 } : video
        )
      );
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleDislike = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/community/video/${id}/dislike`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to dislike video");
      }

      // Update the videos state with the updated dislike count
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === id
            ? { ...video, dislikes: (video.dislikes || 0) + 1 }
            : video
        )
      );
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community Videos</h1>
          <p className="text-muted-foreground mt-1">
            Check out the latest videos from our community
          </p>
          
        </div>
        <Button className="gap-2" onClick={() => setIsUploadModalOpen(true)}>
          <Upload size={16} />
          <span>Upload Video</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onLike={() => handleLike(video._id)}
            onDislike={() => handleDislike(video._id)}
          />
        ))}
      </div>

      <UploadVideoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}
