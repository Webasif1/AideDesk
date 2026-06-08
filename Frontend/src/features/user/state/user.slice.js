import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  currentUserProfile: null, // Specific user viewed by Admin
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalUsers: 0,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload.users || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    setCurrentUserProfile: (state, action) => {
      state.currentUserProfile = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateUserInList: (state, action) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
      if (state.currentUserProfile?._id === action.payload._id) {
        state.currentUserProfile = { ...state.currentUserProfile, ...action.payload };
      }
    },
    // Insert-or-update — used by live socket events (customer:created).
    upsertUser: (state, action) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      } else {
        state.users.unshift(action.payload);
      }
    },
    removeUserFromList: (state, action) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
      if (state.currentUserProfile?._id === action.payload) {
        state.currentUserProfile = null;
      }
    },
  },
});

export const {
  setUsers,
  setCurrentUserProfile,
  setStats,
  setLoading,
  setError,
  updateUserInList,
  upsertUser,
  removeUserFromList,
} = userSlice.actions;

export default userSlice.reducer;
