import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useCompany } from "../hooks/useCompany";
import { SkeletonCard } from "../../../components/ui/Skeleton";

const StatCard = ({ icon, label, value, sub, delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    onClick={onClick}
    className={`bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-neutral-700 rounded-2xl p-5 ${
      onClick ? "cursor-pointer hover:shadow-sm transition-shadow" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="material-symbols-outlined text-[22px] text-neutral-400">{icon}</span>
    </div>
    <p className="text-[28px] font-bold text-black dark:text-white leading-none">{value ?? "—"}</p>
    <p className="text-[13px] font-semibold text-black dark:text-white mt-1">{label}</p>
    {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
  </motion.div>
);

const CompanyPortalHome = () => {
  const navigate = useNavigate();
  const {
    workspaces,
    companyAgents,
    companyTickets,
    loading,
    getWorkspaces,
    getCompanyAgents,
    getCompanyTickets,
  } = useCompany();
  const { user } = useSelector((s) => s.auth);
  const { currentCompany } = useCompany();

  useEffect(() => {
    getWorkspaces();
    getCompanyAgents();
    getCompanyTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTickets = Array.isArray(companyTickets)
    ? companyTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length
    : 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[24px] font-bold text-black dark:text-white"
        >
          {currentCompany?.name || "Company Portal"}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-1"
        >
          Welcome back, {user?.fullName}
        </motion.p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="workspaces"
            label="Workspaces"
            value={workspaces?.length ?? 0}
            sub="Active environments"
            delay={0}
            onClick={() => navigate("/company-portal/workspaces")}
          />
          <StatCard
            icon="group"
            label="Agents"
            value={companyAgents?.length ?? 0}
            sub="Across workspaces"
            delay={0.05}
          />
          <StatCard
            icon="confirmation_number"
            label="Open tickets"
            value={openTickets}
            sub="Awaiting resolution"
            delay={0.1}
          />
          <StatCard
            icon="chat"
            label="Workspaces active"
            value={Array.isArray(workspaces) ? workspaces.filter((w) => w.status === "active").length : 0}
            sub="Running today"
            delay={0.15}
          />
        </div>
      )}

      {/* Workspaces quick list */}
      {!loading && Array.isArray(workspaces) && workspaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-8"
        >
          <h2 className="text-[15px] font-bold text-black dark:text-white mb-4">Your Workspaces</h2>
          <div className="space-y-2">
            {workspaces?.map((ws, i) => (
              <motion.div
                key={ws._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.04 }}
                className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-neutral-500">workspaces</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-black dark:text-white">{ws.name}</p>
                    <p className="text-[11px] text-neutral-400">{ws.slug}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    ws.status === "active"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {ws.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && (!Array.isArray(workspaces) || workspaces.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl"
        >
          <span className="material-symbols-outlined text-[40px] text-neutral-300 mb-3 block">workspaces</span>
          <p className="text-[14px] font-semibold text-black dark:text-white mb-1">No workspaces yet</p>
          <p className="text-[13px] text-neutral-500 mb-4">Create your first workspace to get started.</p>
          <button
            onClick={() => navigate("/company-portal/workspaces")}
            className="bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Create workspace
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CompanyPortalHome;
