import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Lightweight hover tooltip. Wraps any element and shows a small label on hover.
 * Because it listens on the wrapper (not the child), it also works when the
 * wrapped control is `disabled` (disabled elements don't emit hover events).
 *
 * Usage:
 *   <Tooltip text="Coming soon">
 *     <button disabled>Generate & Download</button>
 *   </Tooltip>
 */
const Tooltip = ({ text, children, position = "top", className = "" }) => {
  const [show, setShow] = useState(false);

  const pos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && text && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[60] ${pos[position]} whitespace-nowrap rounded-lg bg-neutral-900 dark:bg-white px-2.5 py-1.5 text-[11px] font-semibold text-white dark:text-black shadow-lg pointer-events-none`}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

export default Tooltip;
