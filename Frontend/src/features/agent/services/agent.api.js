import apiClient from "../../../lib/axios";

const PREFIX = "/agents";

// Own-presence lives in auth.api (PATCH /api/auth/me/status) — it serves every
// role and maintains the manual-override field alongside the effective status.

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

// Soft removal — the agent's handled tickets keep a real name on them, and any
// live tickets they hold are handed to other active agents.
export const deleteAgent = async ({ id, reason = "" }) => {
  const response = await apiClient.delete(`${PREFIX}/${id}`, { data: { reason } });
  return response.data;
};

// Suspend, restore, or remove an agent. Suspending/removing triggers ticket
// reassignment server-side; the response carries { reassigned, unassigned }.
export const updateAgentAccountStatus = async ({ id, accountStatus, reason = "" }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/account-status`, {
    accountStatus,
    reason,
  });
  return response.data;
};
