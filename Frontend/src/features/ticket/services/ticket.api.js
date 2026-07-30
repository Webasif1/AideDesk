import apiClient from "../../../lib/axios";

const PREFIX = "/tickets";

export const getTicketStats = async () => {
  const response = await apiClient.get(`${PREFIX}/stats`);
  return response.data;
};

export const getTicketVolume = async (params) => {
  const response = await apiClient.get(`${PREFIX}/analytics/volume`, { params });
  return response.data;
};

export const getTicketCsat = async () => {
  const response = await apiClient.get(`${PREFIX}/analytics/csat`);
  return response.data;
};

export const createTicket = async (ticketData) => {
  const response = await apiClient.post(`${PREFIX}/`, ticketData);
  return response.data;
};

// Customer ticket creation — multipart (subject/description + optional attachment).
// Returns { ticket, chatId } so the UI can jump straight into the copilot chat.
export const createCustomerTicket = async ({ title, description, attachment }) => {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description);
  if (attachment) form.append("attachment", attachment);

  const response = await apiClient.post(`${PREFIX}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getTickets = async (params) => {
  const response = await apiClient.get(`${PREFIX}/`, { params });
  return response.data;
};

export const getTicket = async (id) => {
  const response = await apiClient.get(`${PREFIX}/${id}`);
  return response.data;
};

export const updateTicket = async ({ id, ...updateData }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}`, updateData);
  return response.data;
};

export const assignAgent = async ({ id, agentId }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/assign`, { agentId });
  return response.data;
};

export const updateTicketStatus = async ({ id, status }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/status`, { status });
  return response.data;
};

export const escalateTicket = async (id) => {
  const response = await apiClient.post(`${PREFIX}/${id}/escalate`);
  return response.data;
};

export const deleteTicket = async (id) => {
  const response = await apiClient.delete(`${PREFIX}/${id}`);
  return response.data;
};
