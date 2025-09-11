import { createSlice } from "@reduxjs/toolkit";
import io from "socket.io-client";

const initialState = {
  socket: null,
  onlineUsers: [],
};

const socketSlice = createSlice({
  name: "socket",
  initialState,

  reducers: {
    initializeSocket: (state, action) => {
      // Prevent duplicate
      if (state.socket) {
        console.log("Socket already exists, disconnecting old one");
        state.socket.disconnect();
      }

      const socket = io(import.meta.env.VITE_DB_ORIGIN, {
        query: { userId: action.payload },
        reconnection: true, // allow reconnects while logged in
        autoConnect: true,
      });

      state.socket = socket;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      console.log("online users in slice:", state.onlineUsers);
    },

    closeSocket: (state, action) => {
      if (state.socket) {
        const userId = action.payload;
        console.log("🔥 Closing socket for userId:", userId, state.socket?.id);

        // 1️⃣ Tell server we’re logging out
        if (userId) {
          state.socket.emit("user:logout", userId);
        }

        // 2️⃣ Stop reconnection / auto-connect
        state.socket.io.opts.reconnection = false;
        state.socket.io.opts.autoConnect = false;

        // 3️⃣ Remove all event listeners
        state.socket.off();

        // 4️⃣ Disconnect and clear Redux state
        state.socket.disconnect();
        state.socket = null;
        state.onlineUsers = [];
      }
    },
  },
});

export const { initializeSocket, setOnlineUsers, closeSocket } =
  socketSlice.actions;

export default socketSlice.reducer;
