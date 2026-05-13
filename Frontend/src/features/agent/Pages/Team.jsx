import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import TeamMetrics from "../components/TeamMetrics";
import TeamTable from "../components/TeamTable";
import TeamCapacity from "../components/TeamCapacity";
import AddAgentModal from "../components/AddAgentModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";

const Team = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <PageWrapper>
      <div className="bg-white dark:bg-[#111] text-on-surface min-h-screen font-['Poppins']">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />
          <main className="pt-8 px-8 pb-12 max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-end justify-between mb-8"
            >
              <div>
                <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight mb-1">
                  Team
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-[14px]">
                  Manage agents in this workspace.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Agent
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
            >
              <TeamMetrics />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
            >
              <TeamTable />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.24, ease: "easeOut" }}
            >
              <TeamCapacity />
            </motion.div>
          </main>
        </div>
        {showModal && <AddAgentModal onClose={() => setShowModal(false)} />}
      </div>
    </PageWrapper>
  );
};

export default Team;
