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
  hasOpened: {},
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      localStorage.setItem("selectedUser", JSON.stringify(action.payload));
      state.selectedUser = action.payload;
    },

    setHasOpened: (state, action) => {
      state.hasOpened = action.payload || {};
    },

    updateOtherUsers: (state, action) => {
      let payload = action.payload;

      // If I am sender, update receiver
      let userIdx = state.otherUsers.findIndex(
        (user) => user._id === payload.recieverId
      );

      // If I am receiver, update sender
      if (userIdx === -1) {
        userIdx = state.otherUsers.findIndex(
          (user) => user._id === payload.senderId
        );
      }

      console.log(userIdx); // userIdx found

      if (userIdx === -1) return

      let [user] = state.otherUsers.splice(userIdx, 1);
      console.log(user);

      user.lastUpdated = payload.lastUpdated;
      user.lastMessage = payload.savedMessage;
      user.lastMessageSenderId = payload.senderId;

      state.otherUsers.unshift(user);

      if (
        !(payload.recieverId in state.hasOpened) ||
        (state.hasOpened[payload.recieverId] === true &&
          payload.recieverId !== state.selectedUser?._id)
      ) {
        // if i am sender i wnt receiverId in hasOpened
        state.hasOpened[payload.recieverId] = false;
        console.log("in reciever", state.hasOpened);
      }

      if (
        !(payload.senderId in state.hasOpened) ||
        (state.hasOpened[payload.senderId] === true &&
          payload.senderId !== state.selectedUser?._id)
      ) {
        // if i am receiver i wnt senderId in hasOpened
        state.hasOpened[payload.senderId] = false;
        console.log("in sender", state.hasOpened);
      }

      if (state.selectedUser) {
        // If I’m actively chatting with the sender (new msg from them)
        if (state.selectedUser._id === payload.senderId) {
          state.hasOpened[payload.senderId] = true;
          state.hasOpened[payload.recieverId] = true;
        }

        // If I’m actively chatting with the receiver (I just sent msg to them)
        if (state.selectedUser._id === payload.recieverId) {
          state.hasOpened[payload.senderId] = true;
          state.hasOpened[payload.recieverId] = true;
        }
      }

      console.log(state.otherUsers);
    },

    markAsOpened: (state, action) => {
      let selectedId = action.payload._id;
      if (
        selectedId in state.hasOpened &&
        state.hasOpened[selectedId] === false
      ) {
        state.hasOpened[selectedId] = true;
      }
    },



    updateUserProfile: (state, action) => {
      let updatedUser = action.payload;
      if (updatedUser._id === state.userProfile._id) {
        //update my own profile
        state.userProfile = updatedUser;
      } else {
        //this is SOMEONE ELSE → update them in my otherUsers list
        state.otherUsers = state.otherUsers.map((u) =>
          u._id === updatedUser._id
            ? {
                ...u,
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                avatar: updatedUser.avatar,
              }
            : u
        );
      }

      if (state.selectedUser._id === updatedUser._id) {
        state.selectedUser.username = updatedUser.username;
        state.selectedUser.fullName = updatedUser.fullName;
        state.selectedUser.avatar = updatedUser.avatar;
      }
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
        state.hasOpened = {};
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
           // ✅ REFRESH MODE: Replace entire list with fresh data
          state.otherUsers = incoming;
          state.skip = incoming.length;
          state.hasMore = incoming.length >= state.limit;
        } else {
           // ✅ PAGINATION MODE: Append new users to existing list
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

export const {
  setSelectedUser,
  updateOtherUsers,
  updateUserProfile,
  markAsOpened,
  setHasOpened,
} = userSlice.actions;

export const userInitialState = initialState;
export default userSlice.reducer;
