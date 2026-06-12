import { useState } from "react";
import { motion } from "framer-motion";
import { useAgent } from "../hooks/useAgent";
import ComingSoonOverlay from "../../../components/ui/ComingSoonOverlay";
import { toast } from "../../../components/ui/toast";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Authorization isn't implemented yet — shown disabled behind a "Coming Soon" overlay.
const permissions = [
  { id: "delete_tickets", label: "Can delete tickets", desc: "Allows permanent removal of support tickets." },
  { id: "manage_kb", label: "Can manage KB", desc: "Create, edit, and publish knowledge base articles." },
  { id: "billing_reports", label: "View billing reports", desc: "Access subscription and transaction history." },
  { id: "direct_chat", label: "Direct customer chat", desc: "Live interaction with customers via the widget." },
];

const AddAgentModal = ({ onClose }) => {
  const { createAgent, getAgents } = useAgent();
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2)
      return "Please enter the agent's full name.";
    if (!emailRe.test(form.email.trim()))
      return "Please enter a valid work email.";
    return "";
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await createAgent({ name: form.name.trim(), email: form.email.trim() });
      getAgents({ page: 1, limit: 20 }).catch(() => {});
      toast("Agent invited — credentials emailed.", { type: "success" });
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to invite agent."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-[32px] bg-black/40 backdrop-blur-sm"
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="max-w-[640px] w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none"
      >
        {/* Header */}
        <div className="px-[32px] py-[24px] border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <div>
            <h1 className="text-[24px] font-semibold text-black dark:text-white tracking-tight">
              Add New Agent
            </h1>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1">
              Invite a new team member to this workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-neutral-500 dark:text-neutral-400">
              close
            </span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
          className="p-[32px] space-y-[32px]"
        >
          {/* Fields — only what the agent model actually collects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Sarah Jenkins"
                className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
            <div className="flex flex-col gap-[8px]">
              <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Work Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="sarah@company.com"
                className="w-full h-11 px-[16px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Permissions — disabled until agent authorization ships */}
          <div className="pt-[24px] border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-[18px] font-semibold text-black dark:text-white mb-[16px]">
              Access Permissions
            </h3>
            <div className="relative rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[16px] gap-x-[32px] pointer-events-none select-none blur-[2px] opacity-60">
                {permissions.map((p) => (
                  <label key={p.id} className="flex items-start gap-[16px]">
                    <input
                      type="checkbox"
                      disabled
                      className="mt-1 h-4 w-4 rounded border-neutral-300 accent-black"
                    />
                    <div>
                      <p className="text-[14px] font-semibold text-black dark:text-white">
                        {p.label}
                      </p>
                      <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                        {p.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              <ComingSoonOverlay label="Coming Soon" />
            </div>
          </div>

          {error && (
            <div className="p-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex gap-[8px]">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                error
              </span>
              <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Info notice */}
          <div className="p-[16px] bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex gap-[8px]">
            <span className="material-symbols-outlined text-neutral-400 text-[20px] shrink-0">
              info
            </span>
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
              An invitation email with login credentials is sent to the address
              provided. The verification link expires in 7 days.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="px-[32px] py-[24px] bg-neutral-50 dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-[16px]">
          <button
            type="button"
            onClick={onClose}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-[24px] py-[12px] text-[12px] font-semibold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
                Inviting…
              </>
            ) : (
              <>
                Invite Agent
                <span className="material-symbols-outlined text-sm">send</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default AddAgentModal;
