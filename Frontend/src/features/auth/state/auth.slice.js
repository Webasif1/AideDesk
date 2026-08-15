import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null, // 'admin', 'agent', 'customer'
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.role = action.payload?.role || null;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    // Merge, not a wholesale setUser — presence changes on its own and should not
    // require a full getMe round trip before the header reflects the click.
    setAuthStatus: (state, action) => {
      if (state.user) state.user.status = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      state.error = null;
    },
  },
});

export const {
  setUser,
  setRole,
  setAuthStatus,
  setLoading,
  setError,
  clearAuth,
} = authSlice.actions;

// A suspended account can still sign in and read its history, but every write
// is rejected server-side. Screens use this to disable their actions up front
// instead of letting the user click into a 403.
export const selectIsReadOnly = (state) =>
  state.auth.user?.accountStatus === "suspended";

export const selectSuspensionReason = (state) =>
  state.auth.user?.accountStatus === "suspended"
    ? state.auth.user?.statusReason || ""
    : "";

export default authSlice.reducer;
