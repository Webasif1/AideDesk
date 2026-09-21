import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCompany } from "../../company/hooks/useCompany";
import EmptyState from "../../../components/ui/EmptyState";

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
      <div className="col-span-12 md:col-span-8 bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-700 rounded-xl p-[24px]">
        <div className="flex justify-between items-start mb-[24px]">
          <div>
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-1">
              Current Plan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage your subscription and billing details.
            </p>
          </div>
          <span className="px-[8px] py-1 bg-brand text-white dark:text-black text-[10px] font-bold rounded-full uppercase">
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
            className="bg-brand text-white dark:text-black px-[24px] py-[8px] rounded-lg text-sm font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors active:scale-95"
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

      {/* Payment method — no processor is connected yet.

          This panel used to state "Visa •••• 4242, Expires 12/26" as fact. No
          card has ever been stored: there is no payment processor, and the
          number is the well-known Stripe test card. */}
      <div className="col-span-12 md:col-span-4 bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden flex flex-col">
        <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[14px] font-semibold text-black dark:text-white">
            Payment Method
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            compact
            icon="credit_card"
            title="No payment method on file"
            body="You're on a free plan, so there's nothing to charge. Talk to us when you're ready to upgrade."
          />
        </div>
      </div>

      {/* Billing history — invoices are produced by a billing processor, and
          there isn't one. The two "$499.00 PAID" rows here were invented, and
          contradicted the plan card directly above them, which reads $0/month. */}
      <div className="col-span-12 bg-white dark:bg-[#0b2b26] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-[18px] font-semibold text-black dark:text-white">
            Billing History
          </h3>
        </div>
        <EmptyState
          icon="receipt_long"
          title="No invoices yet"
          body="Invoices will appear here once you move to a paid plan."
        />
      </div>
    </section>
  );
};

export default BillingSection;
