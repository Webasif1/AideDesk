import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useCompany } from "../hooks/useCompany";
import { useAuth } from "../../auth/hooks/useAuth";

const NAV_ITEMS = [
  { to: "/company-portal", icon: "home", label: "Home", end: true },
  { to: "/company-portal/workspaces", icon: "workspaces", label: "Workspaces" },
  { to: "/company-portal/settings", icon: "settings", label: "Settings" },
];

const CompanyPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, activeWorkspaceId, getWorkspaces, switchWorkspace } = useCompany();
  const { logout } = useAuth();
  const { user } = useSelector((s) => s.auth);
  const [workspacesOpen, setWorkspacesOpen] = useState(true);

  useEffect(() => {
    getWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnterWorkspace = (ws) => {
    switchWorkspace(ws._id);
    navigate("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-surface-container-lowest dark:bg-[#111]">
      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-[13px]">A</span>
            </div>
            <span className="text-[14px] font-bold text-black dark:text-white">AideDesk</span>
          </div>
          {user?.fullName && (
            <p className="text-[11px] text-neutral-400 mt-1.5 truncate">{user.fullName}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Workspaces section */}
          <div className="pt-2">
            <button
              onClick={() => setWorkspacesOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            >
              Workspaces
              <span className="material-symbols-outlined text-[14px]">
                {workspacesOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {workspacesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {workspaces.length === 0 && (
                    <button
                      onClick={() => navigate("/company-portal/workspaces")}
                      className="w-full text-left px-3 py-2 text-[12px] text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      + Create workspace
                    </button>
                  )}
                  {workspaces.map((ws) => (
                    <button
                      key={ws._id}
                      onClick={() => handleEnterWorkspace(ws)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors ${
                        activeWorkspaceId === ws._id
                          ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{ws.name}</span>
                      <span className="material-symbols-outlined text-[14px] ml-auto text-neutral-300 dark:text-neutral-600">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Bottom: logout */}
        <div className="px-3 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CompanyPortal;
