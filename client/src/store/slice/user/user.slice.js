import { createSlice } from "@reduxjs/toolkit";
import {
  loginUserThunk,
  SignUpUserThunk,
  logoutUserThunk,
  getprofileThunk,
  getOtherUsersThunk,
  editProfileThunk,
  verifyUserthunk,
  resendVerificationEmailThunk,
  forgetPasswordThunk,
  resetPasswordThunk,
} from "./user.thunk";

const initialState = {
  userProfile: null,
  isAuthenticated: false,
  screenLoading: true,
  buttonLoading: false,
  otherUsers: [],
  selectedUser: JSON.parse(localStorage.getItem("selectedUser")),
  otherUsersLoading: false,
  limit: 10,
  skip: 0,
  hasMore: true,
  isVerified: false,
  Error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      localStorage.setItem("selectedUser", JSON.stringify(action.payload));
      state.selectedUser = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.userProfile = action.payload?.data?.user;
        state.buttonLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        console.error("Failed to fetch user data:", action.error);
        state.buttonLoading = false;
      });

    builder
      .addCase(SignUpUserThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(SignUpUserThunk.fulfilled, (state, action) => {
        console.log("inside signup:", action.payload);
        // Don't set userProfile or isAuthenticated on signup
        // User needs to verify email first
        state.buttonLoading = false;
        console.log("signup successfull");
      })
      .addCase(SignUpUserThunk.rejected, (state, action) => {
        console.error("Failed to fetch user data:", action.error);
        state.buttonLoading = false;
      });

    builder
      .addCase(verifyUserthunk.pending, (state) => {
        state.screenLoading = true;
      })
      .addCase(verifyUserthunk.fulfilled, (state, action) => {
        state.isVerified = true;
        state.screenLoading = false;
        state.Error = null; // Clear any previous errors
      })
      .addCase(verifyUserthunk.rejected, (state, action) => {
        console.error("Failed to verify user:", action.payload); // Use action.payload
        state.screenLoading = false;
        state.Error = action.payload || "Verification failed";
        console.log(state.Error);
        state.isVerified = false;
      });

    builder
      .addCase(forgetPasswordThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(forgetPasswordThunk.fulfilled, (state, action) => {
        state.buttonLoading = false;
      })
      .addCase(forgetPasswordThunk.rejected, (state, action) => {
        console.error("Failed to send reset link:", action.payload);
        state.buttonLoading = false;
      });

    builder
      .addCase(resetPasswordThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(resetPasswordThunk.fulfilled, (state, action) => {
        state.buttonLoading = false;
        state.Error = null; // Clear any previous errors
        // state.buttonLoading
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        console.error("Failed to update password:", action.payload);
        state.Error = action.payload || "Password reset failed";
        console.log(state.Error);
        state.buttonLoading = false;
      });

    builder
      .addCase(resendVerificationEmailThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(resendVerificationEmailThunk.fulfilled, (state, action) => {
        state.buttonLoading = false;
      })
      .addCase(resendVerificationEmailThunk.rejected, (state, action) => {
        console.error("Failed to send verification email:", action.error);
        state.buttonLoading = false;
      });

    builder
      .addCase(logoutUserThunk.pending, (state) => {
        state.screenLoading = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state, action) => {
        localStorage.removeItem("selectedUser");
        state.userProfile = null;
        state.otherUsers = [];
        state.skip = 0;
        state.hasMore = true;
        state.selectedUser = null;
        state.screenLoading = false;
        state.isAuthenticated = false;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        console.error("Failed to fetch user data:", action.error);
        state.screenLoading = false;
        state.Error = action.error;
      });

    builder
      .addCase(getprofileThunk.pending, (state) => {
        state.screenLoading = true;
      })
      .addCase(getprofileThunk.fulfilled, (state, action) => {
        console.log(" get-profile successfull ");
        state.screenLoading = false;
        state.isAuthenticated = true;
        console.log(action.payload);
        state.otherUsers = [];
        state.skip = 0;
        state.hasMore = true;
        state.userProfile = action.payload?.data;
        console.log(state.userProfile);
      })
      .addCase(getprofileThunk.rejected, (state, action) => {
        console.log(" get-profile failed ");
        state.screenLoading = false;
      });

    builder
      .addCase(getOtherUsersThunk.pending, (state) => {
        state.otherUsersLoading = true;
      })
      .addCase(getOtherUsersThunk.fulfilled, (state, action) => {
        const incoming = action.payload?.data || [];
        const isRefresh = action.meta.arg.refresh; // Check for refresh flag

        if (isRefresh) {
          state.otherUsers = incoming;
          state.skip = incoming.length;
          state.hasMore = incoming.length >= state.limit;
        } else {
          // Build a Set of existing IDs for fast duplicate detection
          const existingIds = new Set(state.otherUsers.map((u) => u._id));

          // Filter out duplicates (and current logged-in user just in case backend missed it)
          const uniqueIncoming = incoming.filter(
            (u) => u._id !== state.userProfile?._id && !existingIds.has(u._id)
          );

          if (state.skip === 0) {
            // First (fresh) load
            state.otherUsers = uniqueIncoming;
          } else {
            // Append only unique users
            state.otherUsers = [...state.otherUsers, ...uniqueIncoming];
          }

          if (incoming.length < state.limit) {
            state.hasMore = false;
          } else {
            state.hasMore = true;
            state.skip += state.limit; // advance window
          }
          console.log(
            "[otherUsers] total:",
            state.otherUsers.length,
            "skip:",
            state.skip,
            "added unique:",
            uniqueIncoming.length
          );
        }
        state.otherUsersLoading = false;
      })
      .addCase(getOtherUsersThunk.rejected, (state, action) => {
        console.error("Failed to fetch other users:", action.error);
        state.otherUsersLoading = false;
      });

    builder
      .addCase(editProfileThunk.pending, (state) => {
        state.buttonLoading = true;
      })
      .addCase(editProfileThunk.fulfilled, (state, action) => {
        console.log("inside edit:", action.payload);
        state.userProfile = action.payload?.data;
        state.buttonLoading = false;
        state.isAuthenticated = true;
        state.otherUsers = [];
        state.skip = 0;
        state.hasMore = true;
      })
      .addCase(editProfileThunk.rejected, (state, action) => {
        console.error("Failed to upload user data:", action.error);
        state.buttonLoading = false;
      });
  },
});

export const { setSelectedUser, resetOtherUsers } = userSlice.actions;

export default userSlice.reducer;
