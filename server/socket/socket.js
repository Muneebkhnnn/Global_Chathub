import dotenv from "dotenv";
import http from "http";
import express from "express";
import { Server } from "socket.io";

dotenv.config({ path: "./server/.env" });

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("New socket connected:", socket.id, "userId:", userId);

  if (!userId) return;

  // If user is already having a connection, we will disconnect the old one
  if (userSocketMap[userId]) {
    const oldSocketId = userSocketMap[userId];
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      console.log("Disconnecting old socket for user:", userId);
      oldSocket.disconnect();
    }
  }

  userSocketMap[userId] = socket.id;

  console.log("hashMap:", userSocketMap);
  io.emit("onlineUsers", Object.keys(userSocketMap));

  // user joined socket
  socket.on("user:loggedIn", (username) => {
    socket.broadcast.emit("newUserJoined", username);
  });


  // manual logout event
  socket.on("user:logout", (userId) => {
  console.log("User manually logging out:", userId);
  if (userSocketMap[userId]) {
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
    console.log("User removed from online list:", userId);
  }

  // Force disconnect so socket cannot keep connection alive
  socket.disconnect(true);
});


  // typing logic socket
  socket.on("typing", ({ to, from }) => {
  
    if(to in userSocketMap){
      io.to(userSocketMap[to]).emit("typing", from);
    }
   
  });

  socket.on("typingStopped", ({ to, from }) => {
   
    if(to in userSocketMap){
      io.to(userSocketMap[to]).emit("typingStopped", from);
    }

  });

  socket.on("disconnect", () => {
    console.log("user disconnected",userId);
    delete userSocketMap[userId];
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

const getSocketId = (userId) => {
  return userSocketMap[userId];
};

export { io, server, app, getSocketId, userSocketMap };
