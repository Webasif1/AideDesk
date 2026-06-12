import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import CustomerMetrics from "../components/CustomerMetrics";
import CustomerTabs from "../components/CustomerTabs";
import CustomerTable from "../components/CustomerTable";
import CreateCustomerModal from "../components/CreateCustomerModal";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import Tooltip from "../../../components/ui/Tooltip";

const Customers = () => {
  const [activeTab, setActiveTab] = useState("All Customers");
  const [showModal, setShowModal] = useState(false);

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
              className="flex flex-col md:flex-row md:items-end justify-between gap-[16px]"
            >
              <div>
                <nav className="flex items-center gap-[8px] mb-[8px]">
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    Enterprise
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">/</span>
                  <span className="text-[10px] font-mono text-black dark:text-white font-semibold uppercase tracking-widest">
                    Management
                  </span>
                </nav>
                <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight">
                  Customers
                </h2>
              </div>
              <div className="flex items-center gap-[12px]">
                <Tooltip text="Coming soon">
                  <button
                    disabled
                    aria-disabled="true"
                    className="flex items-center gap-[8px] px-[16px] py-[8px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-black dark:text-white text-[13px] font-medium rounded-xl opacity-40 cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      file_download
                    </span>
                    Bulk Import
                  </button>
                </Tooltip>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-[8px] px-[16px] py-[8px] bg-black dark:bg-white text-white dark:text-black text-[13px] font-medium rounded-xl hover:opacity-90 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add
                  </span>
                  Add Customer
                </button>
              </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
            >
              <CustomerMetrics />
            </motion.div>

            {/* Tabs + Table */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="flex flex-col gap-[24px]"
            >
              <CustomerTabs active={activeTab} onChange={setActiveTab} />
              <CustomerTable activeTab={activeTab} />
            </motion.div>
          </main>
        </div>

        {showModal && (
          <CreateCustomerModal onClose={() => setShowModal(false)} />
        )}
      </div>
    </PageWrapper>
  );
};

export default Customers;
