import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getChatStats as getChatStatsAPI,
  createChat as createChatAPI,
  getChats as getChatsAPI,
  getChat as getChatAPI,
  assignAgent as assignAgentAPI,
  updateChatStatus as updateChatStatusAPI,
  sendCopilotMessage as sendCopilotMessageAPI,
  confirmTicket as confirmTicketAPI,
} from "../services/chat.api";
import {
  setChats,
  setCurrentChat,
  setStats,
  setLoading,
  setError,
  updateChatInList,
  addChatToList,
  setTicketDraft,
  clearTicketDraft,
} from "../state/chat.slice";
import { addMessage, setMessages } from "../../message/state/message.slice";

export const useChat = () => {
  const dispatch = useDispatch();
  const { chats, currentChat, stats, loading, error, ticketDraft, pagination } =
    useSelector((state) => state.chat);

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

<<<<<<< HEAD
  // Copilot pipeline: send message + handle resolved/escalate response.
  // The AI's reply is added in both branches — on escalation it is the
  // human-handoff message, which the customer still needs to see.
  const sendCopilotMessage = useCallback(
    async ({ chatId, content }) => {
      return handleRequest(sendCopilotMessageAPI, { chatId, content }, (res) => {
        if (res?.message) dispatch(addMessage(res.message));
        if (res?.escalate && res?.ticketDraft) {
          dispatch(setTicketDraft({ chatId, ...res.ticketDraft }));
=======
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
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
        }
      });
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

  return {
    chats,
    currentChat,
    stats,
    loading,
    error,
    ticketDraft,
    pagination,
    getChatStats,
    createChat,
    getChats,
    getChat,
    assignAgent,
    updateChatStatus,
    sendCopilotMessage,
    confirmTicket,
    cancelTicketDraft,
  };
};
