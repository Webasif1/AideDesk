import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useCompany } from "../hooks/useCompany";
import { SkeletonCard } from "../../../components/ui/Skeleton";

/**
 * A tile that refuses to present a failure as a number.
 *
 * Every call site used to coerce with `?? 0`, so when the request 500'd the
 * portal reported "0 Agents" and "0 Open tickets" — indistinguishable from a
 * genuinely empty tenant, and the only screen an admin uses to judge whether
 * anything is wrong.
 */
const StatCard = ({ icon, label, value, sub, delay = 0, onClick, error, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    onClick={error ? undefined : onClick}
    className={`bg-white dark:bg-[#1a1a1a] border rounded-2xl p-5 ${
      error
        ? "border-red-200 dark:border-red-900/50"
        : "border-neutral-100 dark:border-neutral-700"
    } ${onClick && !error ? "cursor-pointer hover:shadow-sm transition-shadow" : ""}`}
  >
    <div className="flex items-center justify-between mb-3">
      <span
        className={`material-symbols-outlined text-[22px] ${
          error ? "text-red-400" : "text-neutral-400"
        }`}
        aria-hidden="true"
      >
        {error ? "error_outline" : icon}
      </span>
    </div>

    {error ? (
      <>
        <p className="text-[28px] font-bold text-neutral-300 dark:text-neutral-600 leading-none">
          —
        </p>
        <p className="text-[13px] font-semibold text-black dark:text-white mt-1">{label}</p>
        <button
          type="button"
          onClick={onRetry}
          className="text-[11px] text-red-600 dark:text-red-400 mt-0.5 hover:underline"
        >
          Couldn't load · Retry
        </button>
      </>
    ) : (
      <>
        <p className="text-[28px] font-bold text-black dark:text-white leading-none">
          {value ?? "—"}
        </p>
        <p className="text-[13px] font-semibold text-black dark:text-white mt-1">{label}</p>
        {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
      </>
    )}
  </motion.div>
);

const CompanyPortalHome = () => {
  const navigate = useNavigate();
  // One useCompany, not two. The second instance mounted another full set of
  // selectors and was the reason workspaces/getAll fired three times per load.
  const {
    currentCompany,
    workspaces,
    companyAgents,
    companyTickets,
    loading,
    getCompany,
    getWorkspaces,
    getCompanyAgents,
    getCompanyTickets,
  } = useCompany();
  const { user } = useSelector((s) => s.auth);

  // Which resources failed, tracked per-request: the slice carries a single
  // shared `error`, which cannot say *what* failed when three calls run
  // together.
  const [failed, setFailed] = useState({});

  // Marks the resource failed only when it actually does. Nothing is written
  // synchronously, so this is safe to call straight from the effect below.
  const load = useCallback(
    (key, fn) => fn().catch(() => setFailed((f) => ({ ...f, [key]: true }))),
    [],
  );

  // Retry clears the flag first — an event handler, so a synchronous write is
  // fine here and the tile stops showing an error the moment you click it.
  const retry = useCallback(
    (key, fn) => {
      setFailed((f) => ({ ...f, [key]: false }));
      return load(key, fn);
    },
    [load],
  );

  useEffect(() => {
    load("company", getCompany);
    load("workspaces", getWorkspaces);
    load("agents", getCompanyAgents);
    load("tickets", getCompanyTickets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTickets = Array.isArray(companyTickets)
    ? companyTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length
    : null;

  const workspaceCount = Array.isArray(workspaces) ? workspaces.length : null;
  const activeWorkspaces = Array.isArray(workspaces)
    ? workspaces.filter((w) => w.status === "active").length
    : null;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[24px] font-bold text-black dark:text-white"
        >
          {currentCompany?.name || (failed.company ? "Company Portal" : "—")}
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
            value={workspaceCount}
            sub="Active environments"
            delay={0}
            onClick={() => navigate("/company-portal/workspaces")}
            error={failed.workspaces}
            onRetry={() => retry("workspaces", getWorkspaces)}
          />
          <StatCard
            icon="group"
            label="Agents"
            value={Array.isArray(companyAgents) ? companyAgents.length : null}
            sub="Across workspaces"
            delay={0.05}
            error={failed.agents}
            onRetry={() => retry("agents", getCompanyAgents)}
          />
          <StatCard
            icon="confirmation_number"
            label="Open tickets"
            value={openTickets}
            sub="Awaiting resolution"
            delay={0.1}
            error={failed.tickets}
            onRetry={() => retry("tickets", getCompanyTickets)}
          />
          <StatCard
            icon="chat"
            label="Workspaces active"
            value={activeWorkspaces}
            sub="Running today"
            delay={0.15}
            error={failed.workspaces}
            onRetry={() => retry("workspaces", getWorkspaces)}
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
      {!loading && !failed.workspaces && (!Array.isArray(workspaces) || workspaces.length === 0) && (
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
