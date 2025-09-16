import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../../components/utilities/axiosInstance";

export const loginUserThunk = createAsyncThunk(
  "users/login",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/login", {
        identifier,
        password,      
      });
      console.log(response);
      toast.success("login success");
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(errorOutput || "An error occurred while logging in.");
      return rejectWithValue(errorOutput);
    }
  }
);

export const SignUpUserThunk = createAsyncThunk(
  "users/SignUp",
  async (
    { fullName, username, password, gender, confirmPassword, email },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/users/SignUp", {
        fullName,
        username,
        email,
        password,
        confirmPassword,
        gender,
      });
      console.log(response);
      toast.success(
        "Account created successfully! Please check your email to verify your account."
      );
      return response.data;
    } catch (error) {
      console.log(error);
      const errorOutput = error?.response?.data;
      console.error(errorOutput);
      toast.error(
        error?.response?.data?.message || "An error occurred while Signing in."
      );
      return rejectWithValue(errorOutput);
    }
  }
);

export const verifyUserthunk = createAsyncThunk(
  "users/verify-email",
  async ({ verificationToken }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/users/verify-email/${verificationToken}`
      );
      console.log(response.data);
      toast.success("Email verified successfully");
      return response.data;
    } catch (error) {
      console.log(error);
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(
        errorOutput || "An error occurred while verifying your email."
      );
      return rejectWithValue(errorOutput);
    }
  }
);

export const forgetPasswordThunk = createAsyncThunk(
  "users/forget-password",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/forget-password", {
        email,
      });
      console.log(response.data);
      toast.success(response.data?.message);
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(
        errorOutput || "An error occurred while sending  resent link."
      );
      return rejectWithValue(errorOutput);
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "users/reset-password",
  async ({ password, confirmPassword , resetPasswordToken }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/users/reset-password/${resetPasswordToken}`, {
        password,
        confirmPassword,
      });
      console.log(response.data);
      toast.success("passsword reset successfully");
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(
        errorOutput || "An error occurred while updating your password."
      );
      return rejectWithValue(errorOutput);
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "users/logout",
  async (_, { rejectWithValue }) => {
    // _ is used to ignore the first argument
    try {
      const response = await axiosInstance.post("/users/logout");
      console.log(response);
      toast.success("logout  successfully");
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(errorOutput || "An error occurred during logout.");
      return rejectWithValue(errorOutput);
    }
  }
);

export const getprofileThunk = createAsyncThunk(
  "users/get-profile",
  async (_, { rejectWithValue }) => {
    // _ is used to ignore the first argument
    try {
      const response = await axiosInstance.get("/users/get-profile");
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      return rejectWithValue(errorOutput);
    }
  }
);

export const getOtherUsersThunk = createAsyncThunk(
  "users/other-users",
  async ({ limit, skip, refresh=false }, { rejectWithValue }) => {
    console.log(`📡 Fetching users: limit=${limit}, skip=${skip}, refresh=${refresh}`);
    try {
      const response = await axiosInstance.get(
        `/users/other-users?limit=${limit}&skip=${skip}`
      );
      console.log(response);
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      return rejectWithValue(errorOutput);
    }
  }
);

export const resendVerificationEmailThunk = createAsyncThunk(
  "users/resend-verification-email",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/users/resend-verification-email",
        {
          email,
        }
      );
      console.log(response);
      toast.success(
        "Verification email sent successfully! Please check your email."
      );
      return response.data;
    } catch (error) {
      console.log(error);
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(
        errorOutput || "An error occurred while sending verification email."
      );
      return rejectWithValue(errorOutput);
    }
  }
);

export const editProfileThunk = createAsyncThunk(
  "users/edit-profile",
  async ({ username, fullName, avatar }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("fullName", fullName);
      if (avatar) {
        formData.append("avatar", avatar); // File object
      }

      const response = await axiosInstance.patch(
        "/users/edit-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);
      toast.success("Profile Updated Successfully");
      console.log(response.data)
      return response.data;
    } catch (error) {
      const errorOutput = error?.response?.data?.message;
      console.error(errorOutput);
      toast.error(errorOutput);
      return rejectWithValue(errorOutput);
    }
  }
);
