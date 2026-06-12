import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Tiny dependency-free toast system.
 *
 *   import { toast } from "../../../components/ui/toast";
 *   toast("Saved!");
 *   toast.comingSoon("Bulk import");          // → "Bulk import is coming soon"
 *   toast("Failed", { type: "error" });
 *
 * <ToastHost /> is mounted once in the root layout and renders the stack.
 */

const EVENT = "aidedesk:toast";
let counter = 0;

export const toast = (message, options = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, {
      detail: { id: ++counter, message, type: options.type || "info" },
    })
  );
};

toast.comingSoon = (feature = "This feature") =>
  toast(`${feature} is coming soon`, { type: "info" });

const ICONS = {
  info: "info",
  success: "check_circle",
  error: "error",
};

export const ToastHost = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const onToast = (e) => {
      const item = e.detail;
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 3000);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-neutral-900 dark:bg-white px-4 py-3 shadow-xl border border-white/10 dark:border-black/10 max-w-[340px]"
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                t.type === "error"
                  ? "text-red-400 dark:text-red-500"
                  : t.type === "success"
                    ? "text-emerald-400 dark:text-emerald-600"
                    : "text-neutral-300 dark:text-neutral-500"
              }`}
            >
              {ICONS[t.type] || ICONS.info}
            </span>
            <p className="text-[13px] font-medium text-white dark:text-black">
              {t.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastHost;
