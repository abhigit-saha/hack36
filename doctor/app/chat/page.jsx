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

  // Connect to socket server and load initial data
  useEffect(() => {
    const fetchData = async () => {
      // Get current doctor from session/localStorage
      const currentDoctor = await fetch("http://localhost:4000/doctor/me", {
        method: "GET",
        credentials: "include",
      });

      if (!currentDoctor.ok) {
        router.push("/login");
        return;
      }
      const doctorData = await currentDoctor.json();
      console.log("DOCTOR DATA:", doctorData);
      setDoctor(doctorData);

      // Connect to socket server
      const socketInstance = io("http://localhost:4000", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      setSocket(socketInstance);

      // Fetch doctor's chats
      console.log("Doctor data from outside fetchdoctor chats:", doctorData);
      await fetchDoctorChats(doctorData.doctor._id);

      // Socket event listeners
      socketInstance.on("connect", () => {
        console.log("Connected to socket server");
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      socketInstance.on("error", (data) => {
        console.error("Socket error:", data.message);
      });

      socketInstance.on("ping", () => {
        socketInstance.emit("pong");
      });

      socketInstance.on("new_message", (data) => {
        // Update messages if in the current chat
        if (currentChat && data.chat_id === currentChat.chat_id) {
          setMessages((prev) => [...prev, data.message]);

          // Mark message as read
          if (data.message.sender_type !== "doctor") {
            socketInstance.emit("mark_read", {
              chat_id: data.chat_id,
              reader_type: "doctor",
              message_id: data.message._id,
            });
          }
        }

        // Update chat list with new message
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.chat_id === data.chat_id
              ? {
                  ...chat,
                  last_message: data.message,
                  unread_count:
                    currentChat && currentChat.chat_id === data.chat_id
                      ? 0
                      : (chat.unread_count || 0) +
                        (data.message.sender_type !== "doctor" ? 1 : 0),
                }
              : chat
          )
        );
      });

      socketInstance.on("typing_start", (data) => {
        if (
          currentChat &&
          data.chat_id === currentChat.chat_id &&
          data.user_type === "user"
        ) {
          setTyping(true);
        }
      });

      socketInstance.on("typing_stop", (data) => {
        if (
          currentChat &&
          data.chat_id === currentChat.chat_id &&
          data.user_type === "user"
        ) {
          setTyping(false);
        }
      });

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    };

    fetchData();
  }, [router]);

  // Handle socket events for the current chat
  useEffect(() => {
    if (!socket || !currentChat || !doctor) return;

    // Join the current chat room
    socket.emit("join_chat", {
      chat_id: currentChat.chat_id,
      user_id: doctor.doctor.id,
      user_type: "doctor",
    });

    // Mark messages as read
    socket.emit("mark_read", {
      chat_id: currentChat.chat_id,
      reader_type: "doctor",
    });

    // Update unread count in chat list
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.chat_id === currentChat.chat_id
          ? { ...chat, unread_count: 0 }
          : chat
      )
    );

    return () => {
      // Leave the chat room when component unmounts or chat changes
      socket.emit("leave_chat", {
        chat_id: currentChat.chat_id,
        user_id: doctor.doctor.id,
        user_type: "doctor",
      });
    };
  }, [socket, currentChat, doctor]);

  // Fetch doctor's chats
  const fetchDoctorChats = async (doctorId) => {
    try {
      setLoading(true);
      console.log("FETCHING CHATS FOR DOCTOR ID", doctorId);
      const response = await fetch(
        `http://localhost:4000/chat/doctor/${doctorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
      console.log("Doctor Chats:", data.chats);
      setChats(data.chats);

      // Select the first chat by default if available
      if (data.chats.length > 0 && !currentChat) {
        setCurrentChat(data.chats[0]);
        fetchChatHistory(data.chats[0].chat_id);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch community videos for recommendation
  const fetchCommunityVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await fetch("http://localhost:4000/community/video", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      console.log("Data video: ", data);
      setVideos(data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      alert("Failed to load videos. Please try again.");
    } finally {
      setLoadingVideos(false);
    }
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
      if (!response.ok) {
        throw new Error("Failed to recommend video");
      }

      const responseData = await response.json();
      console.log("RESPONSE GOTTEN: ", responseData);

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

  // Fetch chat history for the selected chat
  const fetchChatHistory = async (chatId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/chat/history/${chatId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      const data = await response.json();
      setMessages(data.data.messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    fetchChatHistory(chat.chat_id);
  };

  // Handle message input change with typing indicator
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    if (socket && currentChat && doctor) {
      if (e.target.value) {
        socket.emit("typing_start", {
          chat_id: currentChat.chat_id,
          user_id: doctor.doctor.id,
          user_type: "doctor",
        });
      } else {
        socket.emit("typing_stop", {
          chat_id: currentChat.chat_id,
          user_id: doctor.doctor.id,
          user_type: "doctor",
        });
      }
    }
  };

  // Send a message
  const sendMessage = () => {
    if (!message.trim() || !socket || !currentChat || !doctor) return;

    const messageData = {
      chat_id: currentChat.chat_id,
      sender_id: doctor.doctor.id,
      sender_type: "doctor",
      content: message,
    };

    socket.emit("send_message", messageData);
    setMessage("");

    // Stop typing indicator
    socket.emit("typing_stop", {
      chat_id: currentChat.chat_id,
      user_id: doctor.doctor.id,
      user_type: "doctor",
    });
  };

  // Schedule a meeting or session
  const scheduleMeeting = () => {
    if (!currentChat) return;
    router.push(`/schedule?patientId=${currentChat.user_id}`);
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format chat timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    return format(new Date(timestamp), "h:mm a");
  };

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-gray-50">
      {/* Left sidebar - Chat list */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Patient Chats</h2>
          <p className="text-muted-foreground text-sm">
            Your conversations with patients
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No patient conversations yet
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => (
                <div
                  key={chat.chat_id}
                  className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 ${
                    currentChat?.chat_id === chat.chat_id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage
                      src={chat.patient_avatar || ""}
                      alt="Patient"
                    />
                    <AvatarFallback>
                      {chat.patient_name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">
                        {chat.patient_name || "Patient"}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {chat.last_message
                          ? formatMessageTime(chat.last_message.createdAt)
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message
                        ? chat.last_message.content
                        : "No messages yet"}
                    </p>
                  </div>
                  {chat.unread_count > 0 && (
                    <Badge className="ml-2 bg-blue-500 text-white">
                      {chat.unread_count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right content area - Chat messages */}
      <div className="flex-1 flex flex-col h-full">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage
                    src={currentChat.patient_avatar || ""}
                    alt="Patient"
                  />
                  <AvatarFallback>
                    {currentChat.patient_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {currentChat.patient_name || "Patient"}
                  </h3>
                  {typing && (
                    <p className="text-xs text-green-600">Typing...</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={openRecommendModal}
                >
                  <PlayCircle className="h-4 w-4" />
                  Recommend Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={scheduleMeeting}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <VideoIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start the conversation with your patient
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender_type === "doctor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {msg.sender_type !== "doctor" && (
                        <Avatar className="h-8 w-8 mr-2 self-end">
                          <AvatarImage
                            src={currentChat.patient_avatar || ""}
                            alt="Patient"
                          />
                          <AvatarFallback>
                            {currentChat.patient_name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-lg ${
                          msg.sender_type === "doctor"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender_type === "doctor"
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {msg.sender_type === "doctor" && (
                            <span className="ml-2">
                              {msg.read ? "Read" : "Sent"}
                            </span>
                          )}
                        </div>
                      </div>
                      {msg.sender_type === "doctor" && (
                        <Avatar className="h-8 w-8 ml-2 self-end">
                          <AvatarImage
                            src={doctor?.doctor?.avatar || ""}
                            alt="Doctor"
                          />
                          <AvatarFallback>DR</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 mx-2"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button variant="ghost" size="icon" className="mr-2">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-medium mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground">
                Choose a patient conversation from the list to start providing
                care
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Recommendation Modal */}
      <Dialog
        open={isRecommendModalOpen}
        onOpenChange={setIsRecommendModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recommend Exercise Videos</DialogTitle>
            <DialogDescription>
              Search and recommend exercise videos to your patient.
            </DialogDescription>
          </DialogHeader>

          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos by title or description..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-3 mt-2 max-h-[400px] overflow-y-auto">
            {loadingVideos ? (
              <div className="flex justify-center py-8">
                <p>Loading videos...</p>
              </div>
            ) : getFilteredVideos().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No videos found matching your search
                </p>
              </div>
            ) : (
              getFilteredVideos().map((video) => (
                <Card key={video._id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-1/3 bg-gray-100 flex items-center justify-center">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <VideoIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="w-2/3 p-4">
                      <h4 className="font-semibold text-sm">{video.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {video.description}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => recommendVideo(video._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
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
