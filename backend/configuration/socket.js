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
      let uid = userId,
        cid = companyId;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          uid = decoded.userId;
          cid = decoded.companyId;
        } catch {
          return; // Invalid token, do not join rooms
        }
      }
      if (uid && cid) {
        socket.userId = uid;
        socket.companyId = cid;
        socket.join(`user_${cid}_${uid}`);
        socket.join(`company_${cid}`);
        if (isAdmin) socket.join(`admin_room_${cid}`);
        emitToAdmins("user_online", { userId: uid }, cid, socket.id);
      }
    });

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
