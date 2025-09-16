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

      if (userIdx === -1) return

      let [user] = state.otherUsers.splice(userIdx, 1);

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
      }

      if (
        !(payload.senderId in state.hasOpened) ||
        (state.hasOpened[payload.senderId] === true &&
          payload.senderId !== state.selectedUser?._id)
      ) {
        // if i am receiver i wnt senderId in hasOpened
        state.hasOpened[payload.senderId] = false;
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
        state.userProfile = updatedUser;
      } else {
        //SOMEONE ELSE so  update them in my otherUsers list
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
        state.buttonLoading = false;
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
        state.Error = null; 
      })
      .addCase(verifyUserthunk.rejected, (state, action) => {
        console.error("Failed to verify user:", action.payload); 
        state.screenLoading = false;
        state.Error = action.payload || "Verification failed";
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
        state.Error = null; 
      })
      .addCase(resetPasswordThunk.rejected, (state, action) => {
        console.error("Failed to update password:", action.payload);
        state.Error = action.payload || "Password reset failed";
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
        state.screenLoading = false;
        state.isAuthenticated = true;
        state.otherUsers = [];
        state.skip = 0;
        state.hasMore = true;
        state.userProfile = action.payload?.data;
      })
      .addCase(getprofileThunk.rejected, (state, action) => {
        state.screenLoading = false;
      });

    builder
      .addCase(getOtherUsersThunk.pending, (state) => {
        state.otherUsersLoading = true;
      })
      .addCase(getOtherUsersThunk.fulfilled, (state, action) => {
        const incoming = action.payload?.data || [];
        const isRefresh = action.meta.arg.refresh;

        if (isRefresh) {
          state.otherUsers = incoming;
          state.skip = incoming.length;
          state.hasMore = incoming.length >= state.limit;
        } else {
          const existingIds = new Set(state.otherUsers.map((u) => u._id));

          const uniqueIncoming = incoming.filter(
            (u) => u._id !== state.userProfile?._id && !existingIds.has(u._id)
          );

          if (state.skip === 0) {
            state.otherUsers = uniqueIncoming;
          } else {
            state.otherUsers = [...state.otherUsers, ...uniqueIncoming];
          }

          if (incoming.length < state.limit) {
            state.hasMore = false;
          } else {
            state.hasMore = true;
            state.skip += state.limit; 
          }
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
