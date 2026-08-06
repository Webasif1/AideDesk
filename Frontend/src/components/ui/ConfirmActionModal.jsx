import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Shared confirmation for destructive/serious admin actions — suspending or
// removing a customer or an agent. The reason box is deliberately optional:
// leaving it blank performs the action silently, filling it in emails the
// person the reason.
//
// Callers own the API call; this component only collects the confirmation and
// the reason, then hands the trimmed reason to onConfirm.

const TONES = {
  danger: {
    icon: "delete_forever",
    iconWrap: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400",
    confirm:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  },
  warning: {
    icon: "pause_circle",
    iconWrap: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    confirm:
      "bg-amber-500 text-white hover:bg-amber-600 focus-visible:outline-amber-500",
  },
  neutral: {
    icon: "check_circle",
    iconWrap: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    confirm:
      "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100",
  },
};

const ConfirmActionModal = ({
  open,
  title,
  description,
  entityName,
  confirmLabel = "Confirm",
  tone = "danger",
  showReason = true,
  reasonLabel = "Reason (optional)",
  reasonPlaceholder = "Leave empty to apply this silently.",
  reasonHelp = "If you enter a reason it will be emailed to them. Leave it empty and no email is sent.",
  onConfirm,
  onCancel,
  loading = false,
  error = "",
}) => {
  const [reason, setReason] = useState("");
  const t = TONES[tone] || TONES.danger;

  // Never carry a reason over from a previous, unrelated confirmation. Adjusted
  // during render rather than in an effect so the cleared value is what the
  // first paint of the reopened modal shows.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setReason("");
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  const submit = (e) => {
    e?.preventDefault();
    if (loading) return;
    onConfirm?.(reason.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !loading) onCancel?.();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-[32px] bg-black/40 backdrop-blur-sm"
        >
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-[520px] w-full bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden shadow-xl dark:shadow-none"
          >
            {/* Header */}
            <div className="px-[32px] pt-[28px] pb-[20px] flex items-start gap-[16px]">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${t.iconWrap}`}
              >
                <span className="material-symbols-outlined text-[22px]">{t.icon}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-[19px] font-semibold text-black dark:text-white tracking-tight">
                  {title}
                </h2>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-[6px] leading-relaxed">
                  {description}
                </p>
                {entityName && (
                  <p className="text-[13px] font-semibold text-black dark:text-white mt-[10px] px-[10px] py-[6px] bg-neutral-100 dark:bg-neutral-800 rounded-lg inline-block">
                    {entityName}
                  </p>
                )}
              </div>
            </div>

            {/* Reason */}
            {showReason && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.22 }}
                className="px-[32px] pb-[24px]"
              >
                <label className="text-[12px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block mb-[8px]">
                  {reasonLabel}
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={reasonPlaceholder}
                  autoFocus
                  className="w-full px-[14px] py-[10px] bg-neutral-50 dark:bg-[#111] border border-neutral-200 dark:border-neutral-600 text-black dark:text-white rounded-lg text-[14px] leading-relaxed placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                />
                <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-[8px] leading-relaxed">
                  {reasonHelp}
                </p>
              </motion.div>
            )}

            {error && (
              <div className="mx-[32px] mb-[20px] p-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex gap-[8px]">
                <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                  error
                </span>
                <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-[32px] py-[20px] bg-neutral-50 dark:bg-[#111] border-t border-neutral-200 dark:border-neutral-700 flex justify-end items-center gap-[12px]">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-[20px] py-[11px] text-[12px] font-semibold uppercase tracking-widest text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-[24px] py-[11px] text-[12px] font-semibold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${t.confirm}`}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      progress_activity
                    </span>
                    Working…
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;
