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
      if (state.socket) {
        console.log("Socket already exists, disconnecting old one");
        state.socket.disconnect();
      }

      const socket = io(import.meta.env.VITE_DB_ORIGIN, {
        query: { userId: action.payload },
        reconnection: true,
        autoConnect: true,
      });

      state.socket = socket;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    closeSocket: (state, action) => {
      if (state.socket) {
        const userId = action.payload;

        if (userId) {
          state.socket.emit("user:logout", userId);
        }

        state.socket.io.opts.reconnection = false;
        state.socket.io.opts.autoConnect = false;

        state.socket.off();

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
