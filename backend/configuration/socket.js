import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

//! Emit an event to all admins in the "admin_room" for a specific company
const emitToAdmins = (event, data, companyId, socketId = null) => {
  io.to(`admin_room_${companyId}`).emit(event, {
    ...data,
    socketId: socketId,
    timestamp: new Date(),
  });
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ userId, token, isAdmin, companyId }) => {
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.userId;
          socket.companyId = decoded.companyId;
        } catch {
          throw new Error("Invalid jwt token");
        }
      } else {
        socket.userId = userId;
        socket.companyId = companyId;
      }

      if (socket.userId && socket.companyId) {
        socket.join(`user_${socket.companyId}_${socket.userId}`);
        socket.join(`company_${socket.companyId}`);
        if (isAdmin) socket.join(`admin_room_${socket.companyId}`);
        emitToAdmins(
          "user_online",
          { userId: socket.userId },
          socket.companyId,
          socket.id
        );
      }
    });

    //! ATTENDANCE EVENTS
    socket.on("attendance_update", (data) => {
      if (socket.companyId) {
        emitToAdmins("attendance_update", data, socket.companyId, socket.id);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId && socket.companyId) {
        emitToAdmins(
          "user_offline",
          { userId: socket.userId },
          socket.companyId,
          socket.id
        );
      }
    });
  });

  return io;
};

export const getSocket = () => io;
