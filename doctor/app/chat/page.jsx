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
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Calendar,
} from "lucide-react";

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

  // Connect to socket server and load initial data
  useEffect(() => {
    const fetchData = async () => {
      // Get current doctor from session/localStorage
      const currentDoctor = await fetch("http://localhost:4000/doctor/me", {
        method: "GET",
        credentials: "include",
      });

      console.log("Current Doctor: ", currentDoctor);
      if (!currentD+-octor.ok) {
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
      if (doctorData._id) {
        fetchDoctorChats(doctorData._id);
      }

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
    };

    fetchData();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Handle socket events for the current chat
  useEffect(() => {
    if (!socket || !currentChat || !doctor) return;

    // Join the current chat room
    socket.emit("join_chat", {
      chat_id: currentChat.chat_id,
      user_id: doctor._id,
      user_type: "doctor",
    });

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.chat_id === currentChat.chat_id) {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.chat_id === currentChat.chat_id && data.user_type === "user") {
        setTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data.chat_id === currentChat.chat_id && data.user_type === "user") {
        setTyping(false);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);

    // Mark messages as read
    socket.emit("mark_read", {
      chat_id: currentChat.chat_id,
      reader_type: "doctor",
    });

    return () => {
      // Leave the chat room when component unmounts or chat changes
      socket.emit("leave_chat", {
        chat_id: currentChat.chat_id,
        user_id: doctor._id,
        user_type: "doctor",
      });

      socket.off("new_message", handleNewMessage);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
    };
  }, [socket, currentChat, doctor]);

  // Fetch doctor's chats
  const fetchDoctorChats = async (doctorId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/chat/doctor/${doctorId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();
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

    if (socket && currentChat) {
      if (e.target.value) {
        socket.emit("typing_start", {
          chat_id: currentChat.chat_id,
          user_id: doctor._id,
          user_type: "doctor",
        });
      } else {
        socket.emit("typing_stop", {
          chat_id: currentChat.chat_id,
          user_id: doctor._id,
          user_type: "doctor",
        });
      }
    }
  };

  // Schedule a video consultation
  const scheduleMeeting = () => {
    if (!socket || !currentChat || !doctor) return;

    socket.emit("schedule_meeting", {
      chat_id: currentChat.chat_id,
      doctor_id: doctor._id,
      user_id: currentChat.user_id,
    });

    // You might want to add some UI feedback here
  };

  // Send a message
  const sendMessage = () => {
    if (!message.trim() || !socket || !currentChat || !doctor) return;

    const messageData = {
      chat_id: currentChat.chat_id,
      sender_id: doctor._id,
      sender_type: "doctor",
      content: message,
    };

    socket.emit("send_message", messageData);
    setMessage("");

    // Stop typing indicator
    socket.emit("typing_stop", {
      chat_id: currentChat.chat_id,
      user_id: doctor._id,
      user_type: "doctor",
    });
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
          <h2 className="text-xl font-bold">Patient Conversations</h2>
          <p className="text-muted-foreground text-sm">
            Your patient consultations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading conversations...</p>
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
                    <AvatarFallback>PT</AvatarFallback>
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
                    <Badge variant="secondary" className="ml-2">
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
                  <AvatarFallback>PT</AvatarFallback>
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
                  variant="ghost"
                  size="icon"
                  onClick={scheduleMeeting}
                  title="Schedule Video Consultation"
                >
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
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
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-lg ${
                          msg.sender_type === "doctor"
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-800 border"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div
                          className={`text-xs mt-1 ${
                            msg.sender_type === "doctor"
                              ? "text-green-100"
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
                  size="icon"
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
                Choose a patient conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
