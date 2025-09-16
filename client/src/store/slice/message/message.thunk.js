import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../../components/utilities/axiosInstance";

export const sendMessageThunk = createAsyncThunk(
  "message/send/:recieverId",
  async ({ recieverId, message }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`message/send/${recieverId}`, {
        message
      });
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);

export const getMessageThunk = createAsyncThunk(
  "message/get",
  async ({ recieverId}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`message/get-messages/${recieverId}`);
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      toast.error(errorOutput );
      return rejectWithValue(errorOutput);
    }
  }
);

