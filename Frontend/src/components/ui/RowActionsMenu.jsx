import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Dropdown behind the "…" button on table rows. Shared by the Customers and
// Team tables so both action menus behave identically.
//
// items: [{ label, icon, tone?: "default" | "danger", onSelect, disabled? }]

const RowActionsMenu = ({ items = [], icon = "more_horiz", label = "Row actions" }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!items.length) return null;

  return (
    <div className="relative inline-block" ref={wrapRef}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`p-[4px] rounded-lg transition-colors ${
          open
            ? "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
            : "text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"
        }`}
      >
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-[196px] bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl dark:shadow-none overflow-hidden py-[4px]"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
                className={`w-full text-left px-[14px] py-[10px] text-[13px] font-medium flex items-center gap-[10px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  item.tone === "danger"
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                {item.icon && (
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                )}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RowActionsMenu;
