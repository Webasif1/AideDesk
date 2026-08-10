import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getChatStats as getChatStatsAPI,
  createChat as createChatAPI,
  getChats as getChatsAPI,
  getChatCustomers as getChatCustomersAPI,
  getChat as getChatAPI,
  assignAgent as assignAgentAPI,
  updateChatStatus as updateChatStatusAPI,
  sendCopilotMessage as sendCopilotMessageAPI,
  confirmTicket as confirmTicketAPI,
} from "../services/chat.api";
import {
  setChats,
  clearChats,
  setChatCustomers,
  setChatCustomersLoading,
  setCurrentChat,
  setStats,
  setLoading,
  setError,
  updateChatInList,
  addChatToList,
  clearTicketDraft,
} from "../state/chat.slice";
import { addMessage, setMessages } from "../../message/state/message.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const {
    chats,
    customers,
    customersLoading,
    currentChat,
    stats,
    loading,
    error,
    ticketDraft,
    pagination,
  } = useSelector((state) => state.chat);

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

  const getChatStats = useCallback(async () => {
    return handleRequest(getChatStatsAPI, null, (res) => {
      dispatch(setStats(res.data));
    });
  }, [dispatch]);

  const createChat = useCallback(async () => {
    return handleRequest(createChatAPI, null, (res) => {
      dispatch(addChatToList(res.data));
      dispatch(setCurrentChat(res.data));
    });
  }, [dispatch]);

  const getChats = useCallback(
    async (params) => {
      return handleRequest(getChatsAPI, params, (res) => {
        dispatch(setChats(res.data));
      });
    },
    [dispatch]
  );

  // Deliberately outside handleRequest: the customer column loads alongside the
  // conversation list, and sharing the one `loading` flag made both columns
  // flicker whenever either refetched.
  const getChatCustomers = useCallback(
    async (params) => {
      dispatch(setChatCustomersLoading(true));
      try {
        const res = await getChatCustomersAPI(params);
        dispatch(setChatCustomers(res.data));
        return res;
      } finally {
        dispatch(setChatCustomersLoading(false));
      }
    },
    [dispatch]
  );

  const getChat = useCallback(
    async (id) => {
      return handleRequest(getChatAPI, id, (res) => {
        // Backend returns { chat, messages }
        if (res?.data?.chat) dispatch(setCurrentChat(res.data.chat));
        if (res?.data?.messages) dispatch(setMessages(res.data.messages));
      });
    },
    [dispatch]
  );

  const assignAgent = useCallback(
    async (data) => {
      return handleRequest(assignAgentAPI, data, (res) => {
        dispatch(updateChatInList(res.data));
      });
    },
    [dispatch]
  );

  const updateChatStatus = useCallback(
    async (data) => {
      return handleRequest(updateChatStatusAPI, data, (res) => {
        dispatch(updateChatInList(res.data));
      });
    },
    [dispatch]
  );

  // Copilot pipeline: send message → backend returns { userMessage, aiMessage,
  // escalated }. Add both to the thread (deduped against the socket broadcast).
  const sendCopilotMessage = useCallback(
    async ({ chatId, content, attachment }) => {
      return handleRequest(
        sendCopilotMessageAPI,
        { chatId, content, attachment },
        (res) => {
          const { userMessage, aiMessage } = res?.data || {};
          if (userMessage) dispatch(addMessage(userMessage));
          if (aiMessage) dispatch(addMessage(aiMessage));
        }
      );
    },
    [dispatch]
  );

  const confirmTicket = useCallback(
    async ({ chatId, ticketDraft: draft }) => {
      return handleRequest(
        confirmTicketAPI,
        { chatId, ticketDraft: draft },
        () => {
          dispatch(clearTicketDraft());
        }
      );
    },
    [dispatch]
  );

  const cancelTicketDraft = useCallback(() => {
    dispatch(clearTicketDraft());
  }, [dispatch]);

  const clearChatList = useCallback(() => {
    dispatch(clearChats());
  }, [dispatch]);

  return {
    chats,
    customers,
    customersLoading,
    currentChat,
    stats,
    loading,
    error,
    ticketDraft,
    pagination,
    getChatStats,
    createChat,
    getChats,
    clearChatList,
    getChatCustomers,
    getChat,
    assignAgent,
    updateChatStatus,
    sendCopilotMessage,
    confirmTicket,
    cancelTicketDraft,
  };
};
