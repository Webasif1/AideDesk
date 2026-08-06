import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toggleTheme } from "../../features/theme/state/theme.slice";

// Icon-only theme switch that sits in the TopBar's right-hand cluster, next to
// notifications. Replaces the floating pill that used to sit bottom-left and
// cover the sidebar's system-status panel.
const ThemeToggleButton = ({ className = "" }) => {
  const dispatch = useDispatch();
  const isDark = useSelector((s) => s.theme.mode) === "dark";

  return (
    <motion.button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      className={`p-[8px] text-neutral-500 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center justify-center ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="material-symbols-outlined"
        >
          {isDark ? "dark_mode" : "light_mode"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggleButton;
