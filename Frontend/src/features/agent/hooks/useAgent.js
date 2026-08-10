import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateOwnStatus as updateOwnStatusAPI,
  changePassword as changePasswordAPI,
  createAgent as createAgentAPI,
  getAgents as getAgentsAPI,
  getAgentStats as getAgentStatsAPI,
  getAgent as getAgentAPI,
  updateAgent as updateAgentAPI,
  deleteAgent as deleteAgentAPI,
  updateAgentAccountStatus as updateAgentAccountStatusAPI,
} from "../services/agent.api";
import {
  setAgents,
  setCurrentAgent,
  setStats,
  resetStats,
  setLoading,
  setError,
  updateAgentInList,
  removeAgentFromList,
} from "../state/agent.slice";

export const useAgent = () => {
  const dispatch = useDispatch();
  const { agents, currentAgent, stats, loading, error, pagination } = useSelector(
    (state) => state.agent
  );

  const handleRequest = async (apiFunc, data = null, onSuccess = null) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await (data ? apiFunc(data) : apiFunc());
      if (onSuccess) onSuccess(response);
      return response;
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        )
      );
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateOwnStatus = useCallback(
    async (statusData) => {
      return handleRequest(updateOwnStatusAPI, statusData, (res) => {
        // You might want to update the current auth user here if status is stored there
        dispatch(updateAgentInList(res.data));
      });
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (data) => {
      return handleRequest(changePasswordAPI, data);
    },
    [dispatch]
  );

  const createAgent = useCallback(
    async (agentData) => {
      return handleRequest(createAgentAPI, agentData, (res) => {
        // Optionally fetch agents again or just rely on the response
      });
    },
    [dispatch]
  );

  const getAgents = useCallback(
    async (params) => {
      return handleRequest(getAgentsAPI, params, (res) => {
        dispatch(setAgents({ agents: res.data, pagination: res.pagination }));
      });
    },
    [dispatch]
  );

  const getAgentStats = useCallback(async () => {
    return handleRequest(getAgentStatsAPI, null, (res) => {
      dispatch(setStats(res.data));
    });
  }, [dispatch]);

  const resetAgentStats = useCallback(() => {
    dispatch(resetStats());
  }, [dispatch]);

  const getAgent = useCallback(
    async (id) => {
      return handleRequest(getAgentAPI, id, (res) => {
        dispatch(setCurrentAgent(res.data));
      });
    },
    [dispatch]
  );

  const updateAgent = useCallback(
    async (updateData) => {
      return handleRequest(updateAgentAPI, updateData, (res) => {
        dispatch(updateAgentInList(res.data));
      });
    },
    [dispatch]
  );

  const deleteAgent = useCallback(
    async ({ id, reason = "" }) => {
      return handleRequest(deleteAgentAPI, { id, reason }, () => {
        dispatch(removeAgentFromList(id));
      });
    },
    [dispatch]
  );

  // Suspend / restore / remove. A removed agent drops out of the list; a
  // suspended or restored one is updated in place.
  const updateAgentAccountStatus = useCallback(
    async ({ id, accountStatus, reason = "" }) => {
      return handleRequest(
        updateAgentAccountStatusAPI,
        { id, accountStatus, reason },
        (res) => {
          if (accountStatus === "deleted") dispatch(removeAgentFromList(id));
          else if (res?.data) dispatch(updateAgentInList(res.data));
        }
      );
    },
    [dispatch]
  );

  return {
    agents,
    currentAgent,
    stats,
    loading,
    error,
    pagination,
    updateOwnStatus,
    changePassword,
    createAgent,
    getAgents,
    getAgentStats,
    resetAgentStats,
    getAgent,
    updateAgent,
    deleteAgent,
    updateAgentAccountStatus,
  };
};
