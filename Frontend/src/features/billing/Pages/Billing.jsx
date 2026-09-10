import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useCompany } from "../../company/hooks/useCompany";

// Plan values map 1:1 to the company model enum: free | pro | enterprise
const PLANS = [
  {
    id: "free",
    name: "Starter",
    price: 0,
    tagline: "For small teams getting started.",
    features: ["1 workspace", "Up to 3 agents", "Email support", "Core ticketing"],
  },
  {
    id: "pro",
    name: "Growth",
    price: 49,
    tagline: "For growing support teams.",
    features: [
      "Unlimited workspaces",
      "Up to 25 agents",
      "Priority support",
      "AI copilot & analytics",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plus",
    price: 199,
    tagline: "For large organizations at scale.",
    features: [
      "Unlimited agents",
      "Custom branding",
      "24/7 dedicated support",
      "SSO & advanced security",
    ],
  },
];


const Billing = () => {
  const navigate = useNavigate();
  const { currentCompany, getCompany } = useCompany();
  const companyId = useSelector((s) => s.auth.user?.companyId);

  const currentPlan = currentCompany?.plan || "free";
  // null = "follow the current plan", so the default tracks the company as soon
  // as it loads without an effect writing state on every render pass.
  const [picked, setPicked] = useState(null);

  // Hydrate company so we can show/compare the current plan.
  useEffect(() => {
    if (companyId && !currentCompany) getCompany(companyId).catch(() => {});
  }, [companyId, currentCompany, getCompany]);

  // The first plan above the current one, derived rather than synchronised by
  // an effect — an effect here re-rendered on every company hydration.
  const suggested = currentPlan === "free" ? "pro" : "enterprise";
  const selected = picked ?? suggested;

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selected) || PLANS[1],
    [selected]
  );
  const isCurrent = selected === currentPlan;

  // Plan changes are deliberately NOT made from here.
  //
  // This used to validate a card, wait 1400ms to look like a processor
  // round-trip, then genuinely persist the new plan via updateCompany — so any
  // admin could put themselves on the top tier for free, and the failure toast
  // read "Payment captured, but plan update failed", which was never true
  // because nothing was ever captured. The plan field is now rejected by the
  // company update endpoint; upgrades go through sales.
  const handleContactSales = () => {
    const subject = encodeURIComponent(`Upgrade to ${selectedPlan.name}`);
    const body = encodeURIComponent(
      `Hi,

We'd like to upgrade ${currentCompany?.name || "our workspace"} to the ${selectedPlan.name} plan.

Thanks`,
    );
    window.location.href = `mailto:sales@aidedesk.app?subject=${subject}&body=${body}`;
  };

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
              className="flex items-end justify-between"
            >
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1 text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-2"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  Back
                </button>
                <h2 className="text-[32px] font-bold text-black dark:text-white tracking-tight">
                  Upgrade Plan
                </h2>
                <p className="text-[14px] text-neutral-500 dark:text-neutral-400">
                  Choose a plan and complete payment to upgrade your workspace.
                </p>
              </div>
              <span className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white text-[11px] font-bold rounded-full uppercase tracking-wider">
                Current: {PLANS.find((p) => p.id === currentPlan)?.name || "Starter"}
              </span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] items-start">
              {/* Plan tiers */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
                className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-[16px]"
              >
                {PLANS.map((p) => {
                  const active = selected === p.id;
                  const current = currentPlan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPicked(p.id)}
                      className={`text-left p-[20px] rounded-xl border transition-all flex flex-col ${
                        active
                          ? "border-black dark:border-white bg-white dark:bg-[#1a1a1a] ring-2 ring-black dark:ring-white"
                          : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] hover:border-black dark:hover:border-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[15px] font-bold text-black dark:text-white">
                          {p.name}
                        </h3>
                        {current && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                            Current
                          </span>
                        )}
                        {p.highlight && !current && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-[28px] font-bold text-black dark:text-white">
                          ${p.price}
                        </span>
                        <span className="text-[12px] text-neutral-400 dark:text-neutral-500 mb-1.5">
                          /mo
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-4">
                        {p.tagline}
                      </p>
                      <ul className="space-y-2 mt-auto">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-[12px] text-neutral-600 dark:text-neutral-300"
                          >
                            <span className="material-symbols-outlined text-[16px] text-black dark:text-white shrink-0">
                              check
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </motion.div>

              {/* Payment panel */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.16, ease: "easeOut" }}
                className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden sticky top-[24px]"
              >
                <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-[16px] font-semibold text-black dark:text-white">
                    Payment Details
                  </h3>
                </div>

                <div className="p-[24px] space-y-[16px]">
                  {/* The card fields that stood here collected a raw PAN and
                      CVC into React state. Card data must never touch
                      application state — when real billing ships it belongs in
                      a processor-hosted field (Stripe Elements or equivalent),
                      which keeps the number out of this origin entirely. */}
                  <div className="flex items-center justify-between pb-[16px] border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                      {selectedPlan.name} plan
                    </span>
                    <span className="text-[18px] font-bold text-black dark:text-white">
                      ${selectedPlan.price}
                      <span className="text-[12px] font-normal text-neutral-400">/mo</span>
                    </span>
                  </div>

                  <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {isCurrent
                      ? "This is your current plan."
                      : "Self-serve checkout isn't available yet. Get in touch and we'll move your account over and set up billing."}
                  </p>

                  <button
                    onClick={handleContactSales}
                    disabled={isCurrent}
                    className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isCurrent ? (
                      "Current Plan"
                    ) : (
                      <>
                        Contact Sales
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Billing;
