import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import SettingsTabs from "../components/SettingsTabs";
import GeneralSection from "../components/GeneralSection";
import SecuritySection from "../components/SecuritySection";
import BillingSection from "../components/BillingSection";
import DangerZone from "../components/DangerZone";
import CustomerProfileSection from "../components/CustomerProfileSection";
import PageWrapper from "../../../App/Components/ui/PageWrapper";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("General");
  const role = useSelector((s) => s.auth.role);
  const isCustomer = role === "customer";

  return (
    <PageWrapper>
      <div className="bg-neutral-50 dark:bg-[#111] text-on-surface min-h-screen font-['Poppins']">
        <Sidebar />

        <div className="ml-64 min-h-screen flex flex-col">
          <TopBar />

          {/* 🔥 FIX: removed max-w-5xl and added full-width layout */}
          <main className="p-[32px] flex flex-col gap-[32px] flex-1 w-full">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="mb-[8px]"
            >
              <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight">
                {isCustomer ? "My Profile" : "Settings"}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-[14px] mt-1">
                {isCustomer
                  ? "Manage your personal details and password."
                  : "Manage your workspace configuration, security, and billing preferences."}
              </p>
            </motion.div>

            {/* Tabs — workspace admins only */}
            {!isCustomer && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
              >
                <SettingsTabs active={activeTab} onChange={setActiveTab} />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
              className="space-y-[32px]"
            >
              {isCustomer ? (
                <CustomerProfileSection />
              ) : (
                <>
                  {activeTab === "General" && (
                    <>
                      <GeneralSection />
                      <DangerZone />
                    </>
                  )}
                  {activeTab === "Security" && <SecuritySection />}
                  {activeTab === "Billing" && <BillingSection />}
                  {activeTab === "API & Integrations" && (
                    <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px] text-center py-[64px]">
                      <span className="material-symbols-outlined text-neutral-300 dark:text-neutral-700 text-[48px] block mb-[16px]">
                        api
                      </span>
                      <h3 className="text-[18px] font-semibold text-black dark:text-white mb-[8px]">
                        API & Integrations
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Coming soon — manage your API keys and third-party
                        integrations.
                      </p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
