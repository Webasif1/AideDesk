import apiClient from "../../../lib/axios";

const PREFIX = "/agents";

export const updateOwnStatus = async (statusData) => {
  const response = await apiClient.patch(`${PREFIX}/status`, statusData);
  return response.data;
};

export const changePassword = async ({ id, ...passwordData }) => {
  const response = await apiClient.patch(
    `${PREFIX}/${id}/password`,
    passwordData
  );
  return response.data;
};

export const createAgent = async (agentData) => {
  const response = await apiClient.post(`${PREFIX}/register`, agentData);
  return response.data;
};

export const getAgents = async (params) => {
  const response = await apiClient.get(`${PREFIX}/getAll`, { params });
  return response.data;
};

export const getAgentStats = async () => {
  const response = await apiClient.get(`${PREFIX}/stats`);
  return response.data;
};

export const getAgent = async (id) => {
  const response = await apiClient.get(`${PREFIX}/${id}`);
  return response.data;
};

export const updateAgent = async ({ id, ...updateData }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}`, updateData);
  return response.data;
};

export const deleteAgent = async (id) => {
  const response = await apiClient.delete(`${PREFIX}/${id}`);
  return response.data;
};
