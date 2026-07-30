import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTicketStats as getTicketStatsAPI,
  getTicketVolume as getTicketVolumeAPI,
  getTicketCsat as getTicketCsatAPI,
  createTicket as createTicketAPI,
  createCustomerTicket as createCustomerTicketAPI,
  getTickets as getTicketsAPI,
  getTicket as getTicketAPI,
  updateTicket as updateTicketAPI,
  assignAgent as assignAgentAPI,
  updateTicketStatus as updateTicketStatusAPI,
  escalateTicket as escalateTicketAPI,
  deleteTicket as deleteTicketAPI,
} from "../services/ticket.api";
import {
  setTickets,
  setCurrentTicket,
  setStats,
  setVolume,
  setCsat,
  setLoading,
  setError,
  updateTicketInList,
  removeTicketFromList,
} from "../state/ticket.slice";

export const useTicket = () => {
  const dispatch = useDispatch();
  const { tickets, currentTicket, stats, volume, csat, loading, error, pagination } =
    useSelector((state) => state.ticket);

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

  const getTicketStats = useCallback(async () => {
    return handleRequest(getTicketStatsAPI, null, (res) => {
      dispatch(setStats(res.data));
    });
  }, [dispatch]);

  const getTicketVolume = useCallback(
    async (params) => {
      return handleRequest(getTicketVolumeAPI, params, (res) => {
        dispatch(setVolume(res.data));
      });
    },
    [dispatch]
  );

  const getTicketCsat = useCallback(async () => {
    return handleRequest(getTicketCsatAPI, null, (res) => {
      dispatch(setCsat(res.data));
    });
  }, [dispatch]);

  const createTicket = useCallback(
    async (ticketData) => {
      return handleRequest(createTicketAPI, ticketData, (res) => {
        // Option to prepend ticket or just fetch tickets again
      });
    },
    [dispatch]
  );

  const createCustomerTicket = useCallback(
    async (data) => {
      return handleRequest(createCustomerTicketAPI, data);
    },
    [dispatch]
  );

  const getTickets = useCallback(
    async (params) => {
      return handleRequest(getTicketsAPI, params, (res) => {
        dispatch(setTickets({ tickets: res.data, pagination: res.pagination }));
      });
    },
    [dispatch]
  );

  const getTicket = useCallback(
    async (id) => {
      return handleRequest(getTicketAPI, id, (res) => {
        dispatch(setCurrentTicket(res.data));
      });
    },
    [dispatch]
  );

  const updateTicket = useCallback(
    async (updateData) => {
      return handleRequest(updateTicketAPI, updateData, (res) => {
        dispatch(updateTicketInList(res.data));
      });
    },
    [dispatch]
  );

  const assignAgent = useCallback(
    async (data) => {
      return handleRequest(assignAgentAPI, data, (res) => {
        dispatch(updateTicketInList(res.data));
      });
    },
    [dispatch]
  );

  const updateTicketStatus = useCallback(
    async (data) => {
      return handleRequest(updateTicketStatusAPI, data, (res) => {
        dispatch(updateTicketInList(res.data));
      });
    },
    [dispatch]
  );

  const escalateTicket = useCallback(
    async (id) => {
      return handleRequest(escalateTicketAPI, id, (res) => {
        dispatch(updateTicketInList(res.data));
      });
    },
    [dispatch]
  );

  const deleteTicket = useCallback(
    async (id) => {
      return handleRequest(deleteTicketAPI, id, () => {
        dispatch(removeTicketFromList(id));
      });
    },
    [dispatch]
  );

  return {
    tickets,
    currentTicket,
    stats,
    volume,
    csat,
    loading,
    error,
    pagination,
    getTicketStats,
    getTicketVolume,
    getTicketCsat,
    createTicket,
    createCustomerTicket,
    getTickets,
    getTicket,
    updateTicket,
    assignAgent,
    updateTicketStatus,
    escalateTicket,
    deleteTicket,
  };
};
