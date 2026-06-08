import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tickets: [],
  currentTicket: null,
  stats: null,
  volume: [],
  csat: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalTickets: 0,
  },
};

const ticketSlice = createSlice({
  name: "ticket",
  initialState,
  reducers: {
    setTickets: (state, action) => {
      state.tickets = action.payload.tickets || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setVolume: (state, action) => {
      state.volume = action.payload || [];
    },
    setCsat: (state, action) => {
      state.csat = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateTicketInList: (state, action) => {
      const index = state.tickets.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...action.payload };
      }
      if (state.currentTicket?._id === action.payload._id) {
        state.currentTicket = { ...state.currentTicket, ...action.payload };
      }
    },
    // Insert-or-update — used by live socket events (ticket:created / ticket:updated).
    upsertTicket: (state, action) => {
      const index = state.tickets.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...action.payload };
      } else {
        state.tickets.unshift(action.payload);
      }
    },
    removeTicketFromList: (state, action) => {
      state.tickets = state.tickets.filter((t) => t._id !== action.payload);
      if (state.currentTicket?._id === action.payload) {
        state.currentTicket = null;
      }
    },
  },
});

export const {
  setTickets,
  setCurrentTicket,
  setStats,
  setVolume,
  setCsat,
  setLoading,
  setError,
  updateTicketInList,
  upsertTicket,
  removeTicketFromList,
} = ticketSlice.actions;

export default ticketSlice.reducer;
