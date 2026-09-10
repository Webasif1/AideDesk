import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  login as loginAPI,
  register as registerAPI,
  logout as logoutAPI,
  getMe as getMeAPI,
  forgotPassword as forgotPasswordAPI,
  resetPassword as resetPasswordAPI,
  resendVerification as resendVerificationAPI,
  verifyEmail as verifyEmailAPI,
} from "../services/auth.api";
import {
  setUser,
  setLoading,
  setRole,
  setError,
  clearAuth,
} from "../state/auth.slice";

export const useAuth = () => {
  const dispatch = useDispatch();

  async function handleRegister(userData) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const res = await registerAPI(userData);
      // Deliberately NOT setUser/setRole: registration no longer returns a
      // session, because it used to log people in before they had verified
      // their email. Marking the store authenticated here would leave the UI
      // believing it is signed in while every request 401s.
      return res;
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
      // Rethrown so the caller can branch on failure. Swallowing it meant
      // Signup read a stale `apiError` from its closure and navigated on to the
      // verify screen even when registration had failed.
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin(userData) {
    try {
      dispatch(setLoading(true));
      const res = await loginAPI(userData);
      dispatch(setUser(res.data));
      dispatch(setRole(res.data.role));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await logoutAPI();
      dispatch(clearAuth());
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Logout failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function getMe({ silent = false } = {}) {
    try {
      dispatch(setLoading(true));
      const res = await getMeAPI();
      dispatch(setUser(res.data));
      return res.data;
    } catch (error) {
      if (!silent) {
        dispatch(
          setError(error.response?.data?.message || "Failed to fetch user"),
        );
      } else {
        dispatch(clearAuth());
      }
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function forgotPassword(email) {
    try {
      dispatch(setLoading(true));
      await forgotPasswordAPI({ email });
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to reset password"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function resetPassword(token, passwordData) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      return await resetPasswordAPI({ token, ...passwordData });
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to reset password"),
      );
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function resendVerification(email) {
    try {
      dispatch(setLoading(true));
      await resendVerificationAPI({ email });
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to resend verification",
        ),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function verifyEmail(token) {
    try {
      dispatch(setLoading(true));
      await verifyEmailAPI(token);
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Failed to verify email"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    getMe,
    forgotPassword,
    resetPassword,
    resendVerification,
    verifyEmail,
  };
};
