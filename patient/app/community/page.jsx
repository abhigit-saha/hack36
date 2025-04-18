"use client";

import { useState } from "react";
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
import { ThumbsUp, ThumbsDown, Share2, MessageSquare } from "lucide-react";

const VideoCard = ({ video, onLike, onDislike }) => {
  return (
    <Card className="mb-6 overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="bg-muted/30 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{video.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {video.author} • {video.date}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {video.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Video thumbnail placeholder */}
        <div className="bg-muted w-full h-48 rounded-md mb-4 flex items-center justify-center">
          <div className="text-muted-foreground">Video Thumbnail</div>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {video.description}
        </p>

        <div className="flex gap-2 mt-4">
          {video.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex justify-between py-3 bg-muted/10">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className="flex items-center gap-1"
          >
            <ThumbsUp size={16} className={video.liked ? "text-primary" : ""} />
            <span>{video.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDislike}
            className="flex items-center gap-1"
          >
            <ThumbsDown
              size={16}
              className={video.disliked ? "text-primary" : ""}
            />
            <span>{video.dislikes}</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <MessageSquare size={16} />
            <span>Comment</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Share2 size={16} />
            <span>Share</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function Community() {
  const [videos, setVideos] = useState([
    {
      id: 1,
      title: "Getting Started with React Hooks",
      description:
        "Learn the fundamentals of React Hooks and how to use them effectively in your projects.",
      author: "Jane Cooper",
      date: "Apr 15, 2025",
      category: "Tutorial",
      tags: ["react", "hooks", "frontend"],
      likes: 24,
      dislikes: 2,
      liked: false,
      disliked: false,
    },
    {
      id: 2,
      title: "Building a Dark Mode Toggle",
      description:
        "In this video, I'll show you how to implement a dark mode toggle using Tailwind CSS and React.",
      author: "Devon Lane",
      date: "Apr 12, 2025",
      category: "Code Along",
      tags: ["tailwind", "darkmode", "ui"],
      likes: 18,
      dislikes: 0,
      liked: false,
      disliked: false,
    },
    {
      id: 3,
      title: "Responsive Design Best Practices",
      description:
        "Tips and tricks for creating truly responsive interfaces that work across all device sizes.",
      author: "Robert Fox",
      date: "Apr 8, 2025",
      category: "Design",
      tags: ["responsive", "css", "design"],
      likes: 32,
      dislikes: 3,
      liked: false,
      disliked: false,
    },
  ]);

  const handleLike = (id) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id
          ? {
              ...video,
              likes: video.liked ? video.likes - 1 : video.likes + 1,
              liked: !video.liked,
              disliked: false,
              dislikes: video.disliked ? video.dislikes - 1 : video.dislikes,
            }
          : video
      )
    );
  };

  const handleDislike = (id) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id
          ? {
              ...video,
              dislikes: video.disliked
                ? video.dislikes - 1
                : video.dislikes + 1,
              disliked: !video.disliked,
              liked: false,
              likes: video.liked ? video.likes - 1 : video.likes,
            }
          : video
      )
    );
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
        <Button className="gap-2">
          <span>Upload Video</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onLike={() => handleLike(video.id)}
            onDislike={() => handleDislike(video.id)}
          />
        ))}
      </div>
    </div>
  );
}
