import { createSlice } from "@reduxjs/toolkit";
import {
  activateAccountByOTP,
  activateAccountByURL,
  createUser,
  getLoggedInUser,
  loginUser,
  logoutUser,
  resendActivation,
  resetPassword,
  resetPasswordAction,
  uploadUserPhoto,
} from "./authApiSlice";

// create auth slice
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null,
    message: null,
    error: null,
    loader: false,
  },
  reducers: {
    setMessageEmpty: (state) => {
      state.message = null;
      state.error = null;
    },

    setLogout: (state) => {
      state.message = null;
      state.error = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // create user
      .addCase(createUser.pending, (state) => {
        state.loader = true;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
      })
      // activateAccountByOTP
      .addCase(activateAccountByOTP.pending, (state) => {
        state.loader = true;
      })
      .addCase(activateAccountByOTP.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(activateAccountByOTP.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
        state.user = action.payload.user;
      })
      // activateAccountByURL
      .addCase(activateAccountByURL.pending, (state) => {
        state.loader = true;
      })
      .addCase(activateAccountByURL.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(activateAccountByURL.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
      })
      // activateAccountByURL
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.user = action.payload.user;
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.user = null;
        localStorage.removeItem("user");
      })
      .addCase(getLoggedInUser.rejected, (state, action) => {
        state.error = action.error.message;
        state.user = null;
      })
      .addCase(getLoggedInUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // resend activation
      .addCase(resendActivation.pending, (state) => {
        state.loader = true;
      })
      .addCase(resendActivation.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(resendActivation.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
      })
      // reset pass
      .addCase(resetPassword.pending, (state) => {
        state.loader = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
      })

      // reset pass action
      .addCase(resetPasswordAction.pending, (state) => {
        state.loader = true;
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(resetPasswordAction.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
      })
      // user photo uplaod
      .addCase(uploadUserPhoto.pending, (state) => {
        state.loader = true;
      })
      .addCase(uploadUserPhoto.rejected, (state, action) => {
        state.error = action.error.message;
        state.loader = false;
      })
      .addCase(uploadUserPhoto.fulfilled, (state, action) => {
        state.message = action.payload.message;
        state.loader = false;
        state.user = action.payload.user;
      });
  },
});

// selectors
export const getAuthData = (state) => state.auth;
// actions
export const { setMessageEmpty, setLogout } = authSlice.actions;

// export
export default authSlice.reducer;
