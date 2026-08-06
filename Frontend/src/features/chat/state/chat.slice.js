import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  // Customers with at least one ticket — the chat page's first column.
  customers: [],
  customersLoading: false,
  currentChat: null,
  stats: null,
  loading: false,
  error: null,
  ticketDraft: null, // { chatId, title, description, priority, ... } from copilot escalation
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalChats: 0,
  },
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload.chats || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    setChatCustomers: (state, action) => {
      state.customers = action.payload || [];
    },
    setChatCustomersLoading: (state, action) => {
      state.customersLoading = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
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
    updateChatInList: (state, action) => {
      const index = state.chats.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.chats[index] = { ...state.chats[index], ...action.payload };
      }
      if (state.currentChat?._id === action.payload._id) {
        state.currentChat = { ...state.currentChat, ...action.payload };
      }
    },
    addChatToList: (state, action) => {
      state.chats.unshift(action.payload);
    },
    setTicketDraft: (state, action) => {
      state.ticketDraft = action.payload;
    },
    clearTicketDraft: (state) => {
      state.ticketDraft = null;
    },
  },
});

export const {
  setChats,
  setChatCustomers,
  setChatCustomersLoading,
  setCurrentChat,
  setStats,
  setLoading,
  setError,
  updateChatInList,
  addChatToList,
  setTicketDraft,
  clearTicketDraft,
} = chatSlice.actions;

export default chatSlice.reducer;
