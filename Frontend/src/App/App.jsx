import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import AppRoutes from "./app.route";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useCompany } from "../features/company/hooks/useCompany";
import { useSocket } from "../features/socket/hooks/useSocket";
import "./App.css";

const App = () => {
  const { getMe } = useAuth();
  const { getWorkspaces } = useCompany();
  const role = useSelector((s) => s.auth.role);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const themeMode = useSelector((s) => s.theme.mode);

  // Hydrate session from cookie on app mount
  useEffect(() => {
    getMe({ silent: true }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // An admin's JWT carries no workspace — the x-workspace-id header is driven
  // entirely by company.activeWorkspaceId, which nothing persists across a
  // reload. Hydrating it here means every admin page sees the same workspace
  // regardless of navigation order, instead of only after a visit to the
  // company portal.
  useEffect(() => {
    if (role === "admin" && !activeWorkspaceId) {
      getWorkspaces().catch(() => {});
    }
  }, [role, activeWorkspaceId, getWorkspaces]);

  // Apply dark class to <html> for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  // Manage socket lifecycle based on auth state
  useSocket();

  return (
    <AnimatePresence mode="wait">
      <RouterProvider
        router={AppRoutes}
        future={{ v7_startTransition: true }}
      />
    </AnimatePresence>
  );
};

export default App;
