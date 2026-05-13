import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import KpiCard from "../components/KpiCard";
import TicketVolumeChart from "../components/TicketVolumeChart";
import CsatBreakdown from "../components/CsatBreakdown";
import RecentTicketsTable from "../components/RecentTicketsTable";
import QuickActions from "../components/QuickActions";
import GenerateReportModal from "../components/GenerateReportModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const kpis = [
  {
    icon: "confirmation_number",
    label: "Total Tickets",
    value: "1,284",
    badge: "+12%",
    badgeType: "success",
  },
  {
    icon: "psychology",
    label: "AI Resolution Rate",
    value: "94.2%",
    badge: "+1.2%",
    badgeType: "success",
  },
  {
    icon: "timer",
    label: "Avg. Response Time",
    value: "14m",
    badge: "-8%",
    badgeType: "success",
  },
  {
    icon: "support_agent",
    label: "Active Agents",
    value: "24/42",
    badge: "Live",
    badgeType: "neutral",
  },
];

const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);
  const companyLoading = useSelector((s) => s.company.loading);

  return (
    <PageWrapper>
      <div className="bg-surface dark:bg-[#111] text-on-surface min-h-screen font-['Poppins']">
        <Sidebar />

        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />

          <main className="p-[32px] flex flex-col gap-[32px] flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex justify-between items-end"
            >
              <div>
                <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight">
                  Dashboard
                </h2>
                <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                  Welcome back, here's what's happening today.
                </p>
              </div>
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center gap-[8px] bg-black dark:bg-white text-white dark:text-black px-[20px] py-[10px] rounded-xl font-medium text-[13px] transition-transform active:scale-95 hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Create Report
              </button>
            </motion.div>

            {/* KPIs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]"
            >
              {companyLoading
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : kpis.map((k) => <KpiCard key={k.label} {...k} />)}
            </motion.div>

            {/* Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]"
            >
              <TicketVolumeChart />
              <CsatBreakdown />
            </motion.div>

            {/* Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]"
            >
              <RecentTicketsTable />
              <QuickActions />
            </motion.div>
          </main>
        </div>

        {showReport && (
          <GenerateReportModal onClose={() => setShowReport(false)} />
        )}
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
