import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  agents: [],
  currentAgent: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    totalPages: 1,
    totalAgents: 0,
  },
};

const agentSlice = createSlice({
  name: "agent",
  initialState,
  reducers: {
    setAgents: (state, action) => {
      state.agents = action.payload.agents || action.payload;
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    setCurrentAgent: (state, action) => {
      state.currentAgent = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    resetStats: (state) => {
      state.stats = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateAgentInList: (state, action) => {
      const index = state.agents.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.agents[index] = { ...state.agents[index], ...action.payload };
      }
      if (state.currentAgent?._id === action.payload._id) {
        state.currentAgent = { ...state.currentAgent, ...action.payload };
      }
    },
    // Insert-or-update — used by live socket events (agent:created / agent:updated).
    upsertAgent: (state, action) => {
      const index = state.agents.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) {
        state.agents[index] = { ...state.agents[index], ...action.payload };
      } else {
        state.agents.unshift(action.payload);
      }
    },
    removeAgentFromList: (state, action) => {
      state.agents = state.agents.filter((a) => a._id !== action.payload);
      if (state.currentAgent?._id === action.payload) {
        state.currentAgent = null;
      }
    },
  },
});

export const {
  setAgents,
  setCurrentAgent,
  setStats,
  resetStats,
  setLoading,
  setError,
  updateAgentInList,
  upsertAgent,
  removeAgentFromList,
} = agentSlice.actions;

export default agentSlice.reducer;
