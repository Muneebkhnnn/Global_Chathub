import { createSlice } from "@reduxjs/toolkit";
import { getMessageThunk, sendMessageThunk } from "./message.thunk";

const initialState = {
  messagesLoading: false,
  buttonLoading: false,
  messages: null,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setNewMessage: (state, action) => {
      const oldMessages = state.messages ?? [];
      state.messages = [...oldMessages, action.payload];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendMessageThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const oldMessages = state.messages ?? [];
        state.messages = [...oldMessages, action.payload?.data];
        state.buttonLoading = false;
      })
      .addCase(sendMessageThunk.rejected, (state) => {
        state.buttonLoading = false;
      });

    builder
      .addCase(getMessageThunk.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(getMessageThunk.fulfilled, (state, action) => {
        state.messages = action.payload?.data?.messages;
        state.messagesLoading = false;
      })
      .addCase(getMessageThunk.rejected, (state, action) => {
        state.messagesLoading = false;
      });
  },
});

export const { setNewMessage } = messageSlice.actions;

export default messageSlice.reducer;
