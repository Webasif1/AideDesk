import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCompany } from "../../company/hooks/useCompany";
import { toast } from "../../../components/ui/toast";

const PLAN_INFO = {
  free: { name: "Starter", price: 0, features: ["1 workspace", "Up to 3 agents", "Core ticketing"] },
  pro: {
    name: "Growth",
    price: 49,
    features: ["Unlimited workspaces", "Up to 25 agents", "AI copilot & analytics"],
  },
  enterprise: {
    name: "Enterprise Plus",
    price: 199,
    features: ["Unlimited agents", "Custom branding", "24/7 dedicated support"],
  },
};

const invoices = [
  { date: "Sep 01, 2023", amount: "$499.00" },
  { date: "Aug 01, 2023", amount: "$499.00" },
];

const BillingSection = () => {
  const navigate = useNavigate();
  const { currentCompany, getCompany } = useCompany();
  const companyId = useSelector((s) => s.auth.user?.companyId);

  useEffect(() => {
    if (companyId && !currentCompany) getCompany(companyId).catch(() => {});
  }, [companyId, currentCompany, getCompany]);

  const planKey = currentCompany?.plan || "free";
  const plan = PLAN_INFO[planKey] || PLAN_INFO.free;

  return (
    <section className="grid grid-cols-12 gap-[24px]">
      {/* Current plan */}
      <div className="col-span-12 md:col-span-8 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px]">
        <div className="flex justify-between items-start mb-[24px]">
          <div>
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-1">
              Current Plan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage your subscription and billing details.
            </p>
          </div>
          <span className="px-[8px] py-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full uppercase">
            {plan.name}
          </span>
        </div>
        <div className="flex items-end gap-[4px] mb-[24px]">
          <span className="text-[36px] font-bold text-black dark:text-white">
            ${plan.price}
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 mb-1 text-sm">
            /per month
          </span>
        </div>
        <div className="space-y-[8px] mb-[24px]">
          {plan.features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-[8px] text-sm text-black dark:text-white"
            >
              <span className="material-symbols-outlined text-neutral-400 dark:text-neutral-500 text-[18px]">
                check_circle
              </span>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="pt-[24px] border-t border-neutral-100 dark:border-neutral-800 flex gap-[16px]">
          <button
            onClick={() => navigate("/dashboard/billing")}
            className="bg-black dark:bg-white text-white dark:text-black px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors active:scale-95"
          >
            Change Plan
          </button>
          <button
            onClick={() => navigate("/dashboard/billing")}
            className="border border-neutral-200 dark:border-neutral-700 text-black dark:text-white px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Manage Billing
          </button>
        </div>
      </div>

      {/* Payment card */}
      <div className="col-span-12 md:col-span-4 bg-black text-white rounded-xl p-[24px] flex flex-col justify-between overflow-hidden relative">
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-widest opacity-60 font-semibold mb-[24px]">
            Default Payment Method
          </p>
          <div className="flex items-center gap-[16px]">
            <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white">credit_card</span>
            </div>
            <div>
              <p className="text-sm font-medium">Visa •••• 4242</p>
              <p className="text-xs opacity-60">Expires 12/26</p>
            </div>
          </div>
        </div>
        <div className="mt-[32px] relative z-10">
          <button
            onClick={() => navigate("/dashboard/billing")}
            className="w-full py-[8px] bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold transition-colors"
          >
            Update Card
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Billing history */}
      <div className="col-span-12 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-black dark:text-white">
            Billing History
          </h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-neutral-50 dark:bg-[#222] text-neutral-500 dark:text-neutral-400 font-medium">
              {["Date", "Amount", "Status", "Invoice"].map((h) => (
                <th
                  key={h}
                  className={`px-[24px] py-[8px] text-[11px] font-bold uppercase tracking-wider ${h === "Invoice" ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {invoices.map((inv) => (
              <tr
                key={inv.date}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <td className="px-[24px] py-[16px] font-medium text-black dark:text-white">
                  {inv.date}
                </td>
                <td className="px-[24px] py-[16px] text-neutral-700 dark:text-neutral-300">
                  {inv.amount}
                </td>
                <td className="px-[24px] py-[16px]">
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                    Paid
                  </span>
                </td>
                <td className="px-[24px] py-[16px] text-right">
                  <button
                    onClick={() => toast.comingSoon("Invoice download")}
                    className="text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default BillingSection;
