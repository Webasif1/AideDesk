import axios from "axios";
import { store } from "../App/app.store";
import { clearAuth } from "../features/auth/state/auth.slice";
import { toast } from "../components/ui/toast";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((cfg) => {
  const state = store.getState();
  const role = state?.auth?.role;
  const workspaceId =
    state?.auth?.user?.workspaceId ||
    state?.company?.activeWorkspaceId ||
    null;

  if (role === "admin" && workspaceId) {
    cfg.headers["x-workspace-id"] = workspaceId;
  }
  return cfg;
});

// Account-state responses are handled once, here, rather than in every caller.
// The server tags them with a `code` so we don't string-match messages.
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const code = error?.response?.data?.code;

    if (code === "ACCOUNT_DELETED") {
      // The account was removed while the tab was open — drop the session and
      // send them back to sign-in rather than leaving a dead UI on screen.
      // Read the role before clearing auth so customers land on their own
      // login page instead of the staff one.
      const role = store.getState()?.auth?.role;
      const loginPath = role === "customer" ? "/customer/login" : "/login";
      store.dispatch(clearAuth());
      toast("This account is no longer active.", { type: "error" });
      if (!window.location.pathname.endsWith(loginPath)) {
        window.location.assign(loginPath);
      }
    } else if (code === "ACCOUNT_SUSPENDED") {
      toast(
        error.response.data.message || "Your account is suspended.",
        { type: "error" }
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
