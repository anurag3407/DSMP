import { Server } from "socket.io";
import http from "http";

import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

export const getRecieverSocketId = (recieverId) => {
  return userSocketMap[recieverId];
}


const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  const userid = socket.handshake.query.userId;

  if(userid != "undefined") userSocketMap[userid] = socket.id;

  io.emit("getOnlineUser", Object.keys(userSocketMap)); 

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
    delete userSocketMap[userid];
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});


export { server, io , app };  