import Tooltip from "../../../components/ui/Tooltip";
import ComingSoonOverlay from "../../../components/ui/ComingSoonOverlay";
import EmptyState from "../../../components/ui/EmptyState";

const SecuritySection = () => {
  return (
    <section className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      <div className="px-[24px] py-[16px] border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
        <h3 className="text-[18px] font-semibold text-black dark:text-white">
          Security & Access
        </h3>
        <span className="px-2 py-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">
          Secure
        </span>
      </div>
      <div className="p-[24px] space-y-[32px]">
        {/* 2FA — not implemented yet */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
              Two-Factor Authentication
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                Coming soon
              </span>
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Add an extra layer of security to your account.
            </p>
          </div>
          <Tooltip text="Coming soon">
            <button
              disabled
              aria-disabled="true"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 opacity-50 cursor-not-allowed"
            >
              <span className="inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 translate-x-0.5" />
            </button>
          </Tooltip>
        </div>

        {/* Sessions — no session tracking exists yet.

            This block used to render two hardcoded devices, "MacBook Pro 16"
            • San Francisco, USA" and "iPhone 15 Pro • London, UK", complete
            with a Revoke button. Nothing about it came from the API, and
            nothing on screen said so: an admin auditing their account was
            reading invented data about invented logins. */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-[24px]">
          <h4 className="text-sm font-semibold text-black dark:text-white mb-[16px]">
            Active Sessions
          </h4>
          <div className="relative rounded-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="pointer-events-none select-none">
              <EmptyState
                icon="devices"
                title="Session tracking isn't available yet"
                body="When it ships you'll see every device signed in to this account, and be able to sign them out from here."
              />
            </div>
            <ComingSoonOverlay
              label="Coming Soon"
              sub="Sessions aren't tracked yet, so we can't show you a list we'd have to invent."
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
