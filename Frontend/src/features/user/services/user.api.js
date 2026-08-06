import apiClient from "../../../lib/axios";

const PREFIX = "/users";

// Customer auth
export const loginUser = async (credentials) => {
  const response = await apiClient.post(`${PREFIX}/login`, credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post(`${PREFIX}/logout`);
  return response.data;
};

export const forgotUserPassword = async (emailData) => {
  const response = await apiClient.post(`${PREFIX}/forgot-password`, emailData);
  return response.data;
};

export const resetUserPassword = async ({ token, ...passwordData }) => {
  const response = await apiClient.post(
    `${PREFIX}/reset-password/${token}`,
    passwordData
  );
  return response.data;
};

// Customer self-service
export const getMe = async () => {
  const response = await apiClient.get(`${PREFIX}/me`);
  return response.data;
};

export const updateMe = async (updateData) => {
  const response = await apiClient.patch(`${PREFIX}/me`, updateData);
  return response.data;
};

export const changeUserPassword = async (passwordData) => {
  const response = await apiClient.patch(`${PREFIX}/me/password`, passwordData);
  return response.data;
};

// Admin → customers CRUD
export const createUser = async (userData) => {
  const response = await apiClient.post(`${PREFIX}/register`, userData);
  return response.data;
};

export const getUsers = async (params) => {
  const response = await apiClient.get(`${PREFIX}/getAll`, { params });
  return response.data;
};

export const getUserStats = async () => {
  const response = await apiClient.get(`${PREFIX}/stats`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`${PREFIX}/${id}`);
  return response.data;
};

// Soft delete — the record and their tickets/chats survive; they simply cannot
// log in until an admin restores them. A non-empty reason is emailed to them.
export const deleteUser = async ({ id, reason = "" }) => {
  const response = await apiClient.delete(`${PREFIX}/remove/${id}`, {
    data: { reason },
  });
  return response.data;
};

// Suspend, restore, or soft-delete in one call.
// accountStatus: 'active' | 'suspended' | 'deleted'
export const updateUserAccountStatus = async ({ id, accountStatus, reason = "" }) => {
  const response = await apiClient.patch(`${PREFIX}/${id}/account-status`, {
    accountStatus,
    reason,
  });
  return response.data;
};
