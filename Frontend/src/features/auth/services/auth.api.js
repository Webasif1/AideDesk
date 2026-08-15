import apiClient from "../../../lib/axios";

const PREFIX = "/auth";

export const register = async (userData) => {
  const response = await apiClient.post(`${PREFIX}/register`, userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await apiClient.post(`${PREFIX}/login`, userData);
  return response.data;
};

export const forgotPassword = async (userData) => {
  const response = await apiClient.post(`${PREFIX}/forgot-password`, userData);
  return response.data;
};

export const resetPassword = async ({ token, ...data }) => {
  const response = await apiClient.post(
    `${PREFIX}/reset-password/${token}`,
    data
  );
  return response.data;
};

export const resendVerification = async (userData) => {
  const response = await apiClient.post(
    `${PREFIX}/resend-verification`,
    userData
  );
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.get(`${PREFIX}/verify/${token}`);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post(`${PREFIX}/logout`);
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get(`${PREFIX}/get-me`);
  return response.data;
};

// Own presence, for every role. 'online' clears the manual override so presence
// follows the socket again; 'away'/'offline' stick until changed.
export const updateMyStatus = async (status) => {
  const response = await apiClient.patch(`${PREFIX}/me/status`, { status });
  return response.data;
};
