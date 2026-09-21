import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import TicketTabs from "../components/TicketTabs";
import TicketTable from "../components/TicketTable";
import CreateTicketModal from "../components/CreateTicketModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import Button from "../../../components/ui/Button";
import Tooltip from "../../../components/ui/Tooltip";
import { useTicket } from "../hooks/useTicket";
import { ticketViewsFor, openTicketCount } from "../lib/ticketViews";
import { selectIsReadOnly } from "../../auth/state/auth.slice";

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: [0.2, 0.8, 0.2, 1] },
});

const Tickets = () => {
  const [showModal, setShowModal] = useState(false);
  const [total, setTotal] = useState(null);
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";
  const isStaff = role === "admin" || role === "agent";
  // Suspended accounts keep full read access but cannot raise anything new.
  const isReadOnly = useSelector(selectIsReadOnly);
  const activeWorkspaceId = useSelector((s) => s.company.activeWorkspaceId);
  const userWorkspaceId = useSelector((s) => s.auth.user?.workspaceId);
  const workspaceId = activeWorkspaceId || userWorkspaceId;

  const { stats, getTicketStats } = useTicket();
  const views = ticketViewsFor(role);
  const [viewId, setViewId] = useState(views[0].id);
  const view = views.find((v) => v.id === viewId) || views[0];

  const loadStats = useCallback(() => {
    if (isStaff) getTicketStats().catch(() => {});
  }, [getTicketStats, isStaff]);

  useEffect(() => {
    loadStats();
  }, [loadStats, workspaceId]);

  const open = isStaff && stats ? openTicketCount(stats) : null;

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#051f20] text-on-surface min-h-screen font-sans">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />
          <main className="px-6 md:px-8 py-6 flex flex-col gap-4">
            <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-on-surface">
                {isCustomer ? "My tickets" : "Tickets"}
              </h1>
              {open != null && (
                <span className="h-[26px] px-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[13px] font-semibold inline-flex items-center">
                  {open.toLocaleString()} open
                </span>
              )}
              <div className="flex-1" />
              <Tooltip
                text={
                  isReadOnly
                    ? "Your account is suspended — you can view your history but not raise new tickets."
                    : ""
                }
              >
                <Button icon="add" onClick={() => setShowModal(true)} disabled={isReadOnly}>
                  New ticket
                </Button>
              </Tooltip>
            </motion.div>

            <motion.div {...fadeUp(0.06)}>
              <TicketTabs views={views} active={view.id} onChange={setViewId} stats={isStaff ? stats : null} activeTotal={total} />
            </motion.div>

            <motion.div {...fadeUp(0.12)}>
              <TicketTable view={view} onTotal={setTotal} onChanged={loadStats} />
            </motion.div>
          </main>
        </div>
        {showModal && <CreateTicketModal onClose={() => setShowModal(false)} />}
      </div>
    </PageWrapper>
  );
};

export default Tickets;
