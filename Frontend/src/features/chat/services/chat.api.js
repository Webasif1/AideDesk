import apiClient from "../../../lib/axios";

const PREFIX = "/chats";

export const getChatStats = async () => {
  const response = await apiClient.get(`${PREFIX}/stats`);
  return response.data;
};

export const createChat = async () => {
  const response = await apiClient.post(`${PREFIX}/`);
  return response.data;
};

export const getChats = async (params) => {
  const response = await apiClient.get(`${PREFIX}/`, { params });
  return response.data;
};

export const getChat = async (id) => {
  const response = await apiClient.get(`${PREFIX}/${id}`);
  return response.data;
};

export const assignAgent = async ({ id, agentId }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/assign`, { agentId });
  return response.data;
};

export const updateChatStatus = async ({ id, status }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/status`, { status });
  return response.data;
};

// Copilot pipeline — customer message in, AI reply out.
// Attachments are not accepted yet: the backend has no multipart parser wired,
// so sending form-data here would fail before reaching the copilot.
export const sendCopilotMessage = async ({ chatId, content }) => {
  const response = await apiClient.post(`${PREFIX}/${chatId}/messages`, {
    content,
  });
  return response.data;
};

// Confirm AI escalation draft → create ticket
export const confirmTicket = async ({ chatId, ticketDraft }) => {
  const response = await apiClient.post(
    `${PREFIX}/${chatId}/confirm-ticket`,
    ticketDraft
  );
  return response.data;
};
