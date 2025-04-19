import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("ESP8266 connected");

  ws.on("message", (data) => {
    console.log("Received from ESP:", data.toString());
    // You can parse JSON and handle it here if needed
  });
});

console.log("✅ WebSocket Server running on ws://localhost:3001");
