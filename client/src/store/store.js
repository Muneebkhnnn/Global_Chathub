import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/user/user.slice";
import messageReducer from "./slice/message/message.slice";
import socketReducer from "./slice/socket/socket.slice";
import { userInitialState } from "./slice/user/user.slice";



export const store = configureStore({
  reducer: {
    user: userReducer,
    message: messageReducer,
    socketReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["socketReducer.socket"],
      },
    }
  ),

  preloadedState:{ //Hey Redux, instead of starting fresh with the slice’s initialState, use this state when booting up
    user:{
      ...userInitialState,
      hasOpened:{}
    }
  }

});
