import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [], // typically loaded for a specific chat
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 30,
    totalPages: 1,
    totalMessages: 0,
  },
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      // In a real chat app, you might want to prepend or append based on pagination
      // Here we just replace or set initially
      state.messages = action.payload.messages || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    addMessage: (state, action) => {
      // Dedupe by _id — the same message can arrive via the HTTP response and the
      // socket `message:new` broadcast. Skip if we already have it.
      const incoming = action.payload;
      const id = incoming?._id;
      if (id && state.messages.some((m) => m._id === id)) return;
      state.messages.push(incoming);
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setMessages,
  addMessage,
  setUnreadCount,
  setLoading,
  setError,
  clearMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
