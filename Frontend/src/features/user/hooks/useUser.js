import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser as loginUserAPI,
  logoutUser as logoutUserAPI,
  forgotUserPassword as forgotUserPasswordAPI,
  resetUserPassword as resetUserPasswordAPI,
  getMe as getMeAPI,
  updateMe as updateMeAPI,
  changeUserPassword as changeUserPasswordAPI,
  createUser as createUserAPI,
  getUsers as getUsersAPI,
  getUserStats as getUserStatsAPI,
  getUserById as getUserByIdAPI,
  deleteUser as deleteUserAPI,
  updateUserAccountStatus as updateUserAccountStatusAPI,
} from "../services/user.api";
import {
  setUsers,
  setCurrentUserProfile,
  setStats,
  setLoading,
  setError,
  updateUserInList,
  removeUserFromList,
} from "../state/user.slice";

export const useUser = () => {
  const dispatch = useDispatch();
  const { users, currentUserProfile, stats, loading, error, pagination } = useSelector(
    (state) => state.user
  );

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

  // ─── Customer Login Flow ─────────────────────────────────────────────────────

  const loginUser = useCallback(
    async (credentials) => {
      return handleRequest(loginUserAPI, credentials, (res) => {
        // Here you might want to also dispatch to authSlice depending on your app design
      });
    },
    [dispatch]
  );

  const logoutUser = useCallback(async () => {
    return handleRequest(logoutUserAPI);
  }, [dispatch]);

  const forgotUserPassword = useCallback(
    async (emailData) => {
      return handleRequest(forgotUserPasswordAPI, emailData);
    },
    [dispatch]
  );

  const resetUserPassword = useCallback(
    async (data) => {
      return handleRequest(resetUserPasswordAPI, data);
    },
    [dispatch]
  );

  // ─── Customer Self-Service ───────────────────────────────────────────────────

  const getMe = useCallback(async () => {
    return handleRequest(getMeAPI, null, (res) => {
      // Again, you could sync this with your auth user state
    });
  }, [dispatch]);

  const updateMe = useCallback(
    async (updateData) => {
      return handleRequest(updateMeAPI, updateData);
    },
    [dispatch]
  );

  const changeUserPassword = useCallback(
    async (passwordData) => {
      return handleRequest(changeUserPasswordAPI, passwordData);
    },
    [dispatch]
  );

  // ─── Admin Manages Customers ─────────────────────────────────────────────────

  const createUser = useCallback(
    async (userData) => {
      return handleRequest(createUserAPI, userData);
    },
    [dispatch]
  );

  const getUsers = useCallback(
    async (params) => {
      return handleRequest(getUsersAPI, params, (res) => {
        dispatch(setUsers({ users: res.data, pagination: res.pagination }));
      });
    },
    [dispatch]
  );

  const getUserStats = useCallback(async () => {
    return handleRequest(getUserStatsAPI, null, (res) => {
      dispatch(setStats(res.data));
    });
  }, [dispatch]);

  const getUserById = useCallback(
    async (id) => {
      return handleRequest(getUserByIdAPI, id, (res) => {
        dispatch(setCurrentUserProfile(res.data));
      });
    },
    [dispatch]
  );

  const deleteUser = useCallback(
    async ({ id, reason = "" }) => {
      return handleRequest(deleteUserAPI, { id, reason }, () => {
        dispatch(removeUserFromList(id));
      });
    },
    [dispatch]
  );

  // Suspend / restore / soft-delete. A removed customer drops out of the list
  // immediately; a suspended or restored one is updated in place.
  const updateUserAccountStatus = useCallback(
    async ({ id, accountStatus, reason = "" }) => {
      return handleRequest(
        updateUserAccountStatusAPI,
        { id, accountStatus, reason },
        (res) => {
          if (accountStatus === "deleted") dispatch(removeUserFromList(id));
          else if (res?.data) dispatch(updateUserInList(res.data));
        }
      );
    },
    [dispatch]
  );

  return {
    users,
    currentUserProfile,
    stats,
    loading,
    error,
    pagination,
    loginUser,
    logoutUser,
    forgotUserPassword,
    resetUserPassword,
    getMe,
    updateMe,
    changeUserPassword,
    createUser,
    getUsers,
    getUserStats,
    getUserById,
    deleteUser,
    updateUserAccountStatus,
  };
};
