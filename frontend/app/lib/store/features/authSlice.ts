import { AuthState } from "@/app/types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/app/types/auth";
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    //when login is successful
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    //to clear everything on logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
