import apiClient from "../../../lib/axios";

const PREFIX = "/company";

export const registerCompany = async (companyData) => {
  const response = await apiClient.post(`${PREFIX}/register`, companyData);
  return response.data;
};

// The company is resolved from the session, not the URL. These take no id at
// all — the previous signatures let a caller pass one (and CompanyPortalHome
// passed `undefined`, producing /api/company/undefined/agents and two 500s per
// page load, which the UI then rendered as a confident "0").
export const getCompany = async () => {
  const response = await apiClient.get(`${PREFIX}/me`);
  return response.data;
};

// `id` is accepted and ignored so existing callers keep working — the company
// is resolved from the session now.
export const updateCompany = async ({ id, ...updateData }) => {
  void id;
  const response = await apiClient.put(`${PREFIX}/me`, updateData);
  return response.data;
};

export const deleteCompany = async (confirmSlug) => {
  // The server requires the slug in the body — deleting a company destroys a
  // whole tenant, so it must not be possible from a stray request.
  const response = await apiClient.delete(`${PREFIX}/me`, { data: { confirmSlug } });
  return response.data;
};

export const getCompanyUsers = async () => {
  const response = await apiClient.get(`${PREFIX}/me/users`);
  return response.data;
};

export const getCompanyAgents = async () => {
  const response = await apiClient.get(`${PREFIX}/me/agents`);
  return response.data;
};

export const getCompanyTickets = async () => {
  const response = await apiClient.get(`${PREFIX}/me/tickets`);
  return response.data;
};

export const getCompanyMessages = async () => {
  const response = await apiClient.get(`${PREFIX}/me/messages`);
  return response.data;
};

// Workspaces (admin)
export const createWorkspace = async (data) => {
  const response = await apiClient.post(`/workspaces/create`, data);
  return response.data;
};

export const getWorkspaces = async () => {
  const response = await apiClient.get(`/workspaces/getAll`);
  return response.data;
};

export const getWorkspace = async (id) => {
  const response = await apiClient.get(`/workspaces/${id}`);
  return response.data;
};

export const updateWorkspace = async ({ id, ...data }) => {
  const response = await apiClient.patch(`/workspaces/${id}`, data);
  return response.data;
};

export const deleteWorkspace = async (id) => {
  const response = await apiClient.delete(`/workspaces/${id}`);
  return response.data;
};
