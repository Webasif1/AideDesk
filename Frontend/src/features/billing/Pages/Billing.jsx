import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import PageWrapper from "../../../App/Components/ui/PageWrapper";
import { useCompany } from "../../company/hooks/useCompany";
import { toast } from "../../../components/ui/toast";

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

const onlyDigits = (s) => s.replace(/\D/g, "");

const Billing = () => {
  const navigate = useNavigate();
  const { currentCompany, getCompany, updateCompany } = useCompany();
  const companyId = useSelector((s) => s.auth.user?.companyId);

  const currentPlan = currentCompany?.plan || "free";
  const [selected, setSelected] = useState("pro");
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvc: "" });

  // Hydrate company so we can show/compare the current plan.
  useEffect(() => {
    if (companyId && !currentCompany) getCompany(companyId).catch(() => {});
  }, [companyId, currentCompany, getCompany]);

  // Default the selection to the first plan above the current one.
  useEffect(() => {
    if (currentPlan === "free") setSelected("pro");
    else if (currentPlan === "pro") setSelected("enterprise");
    else setSelected("enterprise");
  }, [currentPlan]);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === selected) || PLANS[1],
    [selected]
  );
  const isCurrent = selected === currentPlan;

  const setField = (f) => (e) => {
    let v = e.target.value;
    if (f === "number") v = onlyDigits(v).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (f === "expiry") {
      v = onlyDigits(v).slice(0, 4);
      if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    if (f === "cvc") v = onlyDigits(v).slice(0, 4);
    setCard((c) => ({ ...c, [f]: v }));
  };

  const cardValid =
    card.name.trim() &&
    onlyDigits(card.number).length >= 15 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3;

  const handlePay = async () => {
    if (isCurrent) {
      toast("You're already on this plan.", { type: "info" });
      return;
    }
    if (!cardValid) {
      toast("Please complete the card details.", { type: "error" });
      return;
    }
    setProcessing(true);
    // Demo checkout — simulate a payment processor round-trip, then persist the plan.
    await new Promise((r) => setTimeout(r, 1400));
    try {
      if (companyId) await updateCompany({ id: companyId, plan: selected });
      toast(`Upgraded to ${selectedPlan.name}. Welcome aboard!`, { type: "success" });
      setCard({ name: "", number: "", expiry: "", cvc: "" });
    } catch {
      toast("Payment captured, but plan update failed. Contact support.", {
        type: "error",
      });
    } finally {
      setProcessing(false);
    }
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
                      onClick={() => setSelected(p.id)}
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
                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      Name on Card
                    </label>
                    <input
                      value={card.name}
                      onChange={setField("name")}
                      placeholder="Jane Doe"
                      className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-[6px]">
                    <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        value={card.number}
                        onChange={setField("number")}
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        className="w-full h-11 pl-10 pr-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[20px]">
                        credit_card
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[12px]">
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        Expiry
                      </label>
                      <input
                        value={card.expiry}
                        onChange={setField("expiry")}
                        inputMode="numeric"
                        placeholder="MM/YY"
                        className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        CVC
                      </label>
                      <input
                        value={card.cvc}
                        onChange={setField("cvc")}
                        inputMode="numeric"
                        placeholder="123"
                        className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex items-center justify-between pt-[16px] border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[13px] text-neutral-500 dark:text-neutral-400">
                      {selectedPlan.name} plan
                    </span>
                    <span className="text-[18px] font-bold text-black dark:text-white">
                      ${selectedPlan.price}
                      <span className="text-[12px] font-normal text-neutral-400">/mo</span>
                    </span>
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={processing || isCurrent}
                    className="w-full h-11 rounded-lg bg-black dark:bg-white text-white dark:text-black text-[13px] font-semibold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">
                          progress_activity
                        </span>
                        Processing…
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : (
                      <>
                        Pay &amp; Upgrade
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Demo checkout — no real card is charged.
                  </p>
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
