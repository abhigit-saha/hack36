"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { format } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  SendHorizontal,
  Phone,
  Video as VideoIcon,
  MoreVertical,
  Paperclip,
  Mic,
  Calendar,
  Search,
  PlayCircle,
  Settings,
  Image,
  AtSign,
  Smile,
  User,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ChatPage = () => {
  // Keep all the state and functions the same
  const [doctor, setDoctor] = useState(null);
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const router = useRouter();

  // Video recommendation states
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingVideos, setLoadingVideos] = useState(false);

  // Keep all the existing useEffects and functions the same

  // Connect to socket server and load initial data
  useEffect(() => {
    // ... existing code ...
  }, []);

  // Fetch community videos for recommendation
  const fetchCommunityVideos = async () => {
    // ... existing code ...
  };

  // Open recommend modal
  const openRecommendModal = () => {
    fetchCommunityVideos();
    setIsRecommendModalOpen(true);
  };

  // Recommend video to patient
  const recommendVideo = async (videoId) => {
    if (!socket || !currentChat || !doctor) return;

    try {
      // Send video recommendation to backend
      const response = await fetch("http://localhost:4000/video/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          userId: currentChat.user_id,
        }),
        credentials: "include",
      });
      console.log("RESPONSE GOTTEN: ", await response.json())
      if (!response.ok) {
        throw new Error("Failed to recommend video");
      }

      // Send notification through socket
      socket.emit("send_message", {
        chat_id: currentChat.chat_id,
        sender_id: doctor.doctor.id,
        sender_type: "doctor",
        content: `I've recommended a video for you to watch. Check your exercises section!`,
      });

      // Close the modal
      setIsRecommendModalOpen(false);
      setSearchQuery("");

      alert("Video recommended successfully!");
    } catch (error) {
      console.error("Error recommending video:", error);
      alert("Failed to recommend video. Please try again.");
    }
  };

  // Get filtered videos based on search query
  const getFilteredVideos = () => {
    if (!searchQuery.trim()) return videos;

    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Keep all the other functions the same

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#2f3136] text-white">
      {/* Left sidebar - Chat list */}
      <div className="w-1/4 bg-[#2f3136] flex flex-col border-r border-[#40444b]">
        <div className="p-4 shadow-sm border-b border-[#40444b]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Patient Chats</h2>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#40444b]">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-2 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#b9bbbe]" />
            <Input
              placeholder="Search conversations"
              className="pl-9 bg-[#202225] border-none rounded-md text-sm py-2 focus-visible:ring-1 focus-visible:ring-[#5865f2]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-[#40444b] rounded-full mb-2"></div>
                <div className="h-4 w-24 bg-[#40444b] rounded"></div>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#b9bbbe]">No patient conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.chat_id}
                  className={cn(
                    "flex items-start py-2 px-3 cursor-pointer transition-all duration-200 rounded-md",
                    currentChat?.chat_id === chat.chat_id
                      ? "bg-[#393c43]"
                      : "hover:bg-[#36393f]"
                  )}
                  onClick={() => handleChatSelect(chat)}
                >
                  <Avatar className="h-10 w-10 mr-3 rounded-full">
                    <AvatarImage src={chat.patient_avatar || ""} alt="Patient" />
                    <AvatarFallback className="bg-[#5865f2] text-white">{chat.patient_name?.charAt(0) || "P"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium truncate text-[#ffffff]">
                        {chat.patient_name || "Patient"}
                      </h3>
                      <span className="text-xs text-[#b9bbbe]">
                        {chat.last_message
                          ? formatMessageTime(chat.last_message.createdAt)
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-[#b9bbbe] truncate">
                      {chat.last_message
                        ? chat.last_message.content
                        : "No messages yet"}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <Badge
                      className="ml-2 bg-[#5865f2] text-white border-none py-0.5 px-1.5 rounded-full text-xs font-semibold"
                    >
                      {chat.unread_count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#40444b] bg-[#292b2f]">
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src={doctor?.doctor?.avatar || ""} alt="Doctor" />
              <AvatarFallback className="bg-[#5865f2]">DR</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                Dr. {doctor?.doctor?.name || "Doctor"}
              </p>
              <p className="text-xs text-[#b9bbbe]">Online</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#40444b]">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right content area - Chat messages */}
      <div className="flex-1 flex flex-col h-full bg-[#36393f]">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 shadow-sm border-b border-[#40444b] bg-[#36393f] flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage
                    src={currentChat.patient_avatar || ""}
                    alt="Patient"
                  />
                  <AvatarFallback className="bg-[#5865f2] text-white">{currentChat.patient_name?.charAt(0) || "P"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {currentChat.patient_name || "Patient"}
                  </h3>
                  {typing && (
                    <p className="text-xs text-[#57f287] animate-pulse">Typing...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#40444b]"
                  onClick={openRecommendModal}
                  title="Recommend Exercise Video"
                >
                  <PlayCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#40444b]"
                  onClick={scheduleMeeting}
                  title="Schedule Video Consultation"
                >
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#40444b]"
                  title="Voice Call"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#40444b]"
                  title="Video Call"
                >
                  <VideoIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#40444b]"
                  title="More Options"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-[#40444b] rounded-full mb-2"></div>
                    <div className="h-4 w-24 bg-[#40444b] rounded"></div>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="h-16 w-16 bg-[#5865f2] rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm text-[#b9bbbe]">
                    Start the conversation with your patient
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isFirstInGroup = index === 0 ||
                      messages[index - 1].sender_type !== msg.sender_type;

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex",
                          msg.sender_type === "doctor" ? "justify-end" : "justify-start",
                          !isFirstInGroup && msg.sender_type !== "doctor" && "pl-12",
                          !isFirstInGroup && msg.sender_type === "doctor" && "pr-12",
                        )}
                      >
                        {isFirstInGroup && msg.sender_type !== "doctor" && (
                          <Avatar className="h-10 w-10 mr-3 mt-0.5">
                            <AvatarImage src={currentChat.patient_avatar || ""} alt="Patient" />
                            <AvatarFallback className="bg-[#5865f2] text-white">
                              {currentChat.patient_name?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] px-4 py-2 rounded-2xl",
                            msg.sender_type === "doctor"
                              ? "bg-[#5865f2] text-white"
                              : "bg-[#40444b] text-white",
                            isFirstInGroup && msg.sender_type !== "doctor" && "rounded-tl-none",
                            isFirstInGroup && msg.sender_type === "doctor" && "rounded-tr-none",
                          )}
                        >
                          {isFirstInGroup && (
                            <div className="flex justify-between items-center mb-1">
                              <span className={cn(
                                "font-medium text-sm",
                                msg.sender_type === "doctor" ? "text-[#ffffff]" : "text-[#57f287]"
                              )}>
                                {msg.sender_type === "doctor" ? "You" : currentChat.patient_name}
                              </span>
                              <span className="text-xs opacity-70 ml-2">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                          {msg.sender_type === "doctor" && (
                            <div className="text-xs mt-1 opacity-70 text-right">
                              {msg.read ? "Read" : "Sent"}
                            </div>
                          )}
                        </div>
                        {isFirstInGroup && msg.sender_type === "doctor" && (
                          <Avatar className="h-10 w-10 ml-3 mt-0.5">
                            <AvatarImage src={doctor?.doctor?.avatar || ""} alt="Doctor" />
                            <AvatarFallback className="bg-[#5865f2] text-white">DR</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="p-3 bg-[#36393f]">
              <div className="flex items-center bg-[#40444b] rounded-lg px-4 py-0">
                <Button variant="ghost" size="icon" className="text-[#b9bbbe] hover:text-white h-8 w-8 rounded-full" title="Attach file">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  placeholder={`Message ${currentChat.patient_name || "Patient"}`}
                  className="flex-1 mx-2 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-[#b9bbbe] py-6"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button variant="ghost" size="icon" className="text-[#b9bbbe] hover:text-white h-8 w-8 rounded-full mr-1" title="Attach image">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#b9bbbe] hover:text-white h-8 w-8 rounded-full mr-1" title="Add emoji">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#b9bbbe] hover:text-white h-8 w-8 rounded-full mr-1" title="Voice message">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  size="icon"
                  className="bg-[#5865f2] hover:bg-[#4752c4] h-8 w-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-[#36393f]">
            <div className="text-center max-w-md p-8 rounded-lg">
              <div className="h-24 w-24 bg-[#5865f2] rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-medium mb-3">
                Welcome to your patient chats
              </h3>
              <p className="text-[#b9bbbe] mb-6">
                Select a conversation from the list to start providing care to your patients
              </p>
              <Button
                className="bg-[#5865f2] hover:bg-[#4752c4] text-white border-none"
                onClick={() => document.querySelector('.custom-scrollbar').scrollTop = 0}
              >
                Browse conversations
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Video Recommendation Modal */}
      <Dialog open={isRecommendModalOpen} onOpenChange={setIsRecommendModalOpen}>
        <DialogContent className="bg-[#36393f] text-white border-[#40444b] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Recommend Exercise Videos</DialogTitle>
            <DialogDescription className="text-[#b9bbbe]">
              Search and recommend exercise videos to your patient.
            </DialogDescription>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#b9bbbe]" />
            <Input
              placeholder="Search videos by title or description..."
              className="pl-10 bg-[#202225] border-[#40444b] text-white placeholder-[#b9bbbe] focus-visible:ring-[#5865f2] focus-visible:border-[#5865f2]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 mt-2">
            {loadingVideos ? (
              <div className="flex justify-center py-8">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-[#40444b] rounded-full mb-2"></div>
                  <div className="h-4 w-24 bg-[#40444b] rounded"></div>
                </div>
              </div>
            ) : getFilteredVideos().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#b9bbbe]">No videos found matching your search</p>
              </div>
            ) : (
              getFilteredVideos().map((video) => (
                <Card key={video._id} className="overflow-hidden bg-[#2f3136] border-[#40444b] text-white">
                  <div className="flex">
                    <div className="w-1/3 bg-[#202225] flex items-center justify-center">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <VideoIcon className="h-12 w-12 text-[#b9bbbe]" />
                      )}
                    </div>
                    <div className="w-2/3 p-4">
                      <h4 className="font-semibold text-sm text-white">{video.title}</h4>
                      <p className="text-xs text-[#b9bbbe] line-clamp-2 mt-1">
                        {video.description}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => recommendVideo(video._id)}
                          className="bg-[#5865f2] hover:bg-[#4752c4] text-white border-none"
                        >
                          Recommend
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRecommendModalOpen(false)}
              className="bg-transparent border-[#b9bbbe] text-white hover:bg-[#40444b] hover:text-white"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;