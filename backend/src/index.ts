import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose, { Schema, Document } from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust this to your frontend URL
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/notifications")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Define Notification Schema and Interface
interface INotification extends Document {
  department: string;
  message: string;
  timestamp: Date;
}

const notificationSchema: Schema = new Schema({
  department: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room based on department
  socket.on("joinDepartment", (department: string) => {
    socket.join(department);
    console.log(`User joined department: ${department}`);
  });

  // Leave a room based on department
  socket.on("leaveDepartment", (department: string) => {
    socket.leave(department);
    console.log(`User left department: ${department}`);
  });

  // Send notification to a specific department
  socket.on(
    "sendNotification",
    async (data: { department: string; message: string }) => {
      const notification = new Notification(data);
      await notification.save();
      io.to(data.department).emit("receiveNotification", data);
    }
  );

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
