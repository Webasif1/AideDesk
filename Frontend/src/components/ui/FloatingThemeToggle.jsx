import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toggleTheme } from "../../features/theme/state/theme.slice";

const FloatingThemeToggle = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const mode = useSelector((s) => s.theme.mode);
  const isDark = mode === "dark";

  const path = location.pathname;

  // The customer portal sign-in commits to its own dark aurora look, so a
  // light/dark switch there would only break the page.
  if (path.startsWith("/customer/")) return null;

  // Dashboard pages carry the toggle in their TopBar cluster instead — the
  // floating pill used to sit bottom-left over the sidebar's status panel and
  // the conversation list. This is now only the fallback for pages with no
  // TopBar: marketing, auth, onboarding and the company portal.
  if (path.startsWith("/dashboard")) return null;

  return (
    <motion.button
      onClick={() => dispatch(toggleTheme())}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`fixed top-5 right-5 z-[9999] group flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border backdrop-blur-xl shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] transition-colors ${
        isDark
          ? "border-white/10 bg-neutral-900/80 hover:bg-neutral-800/90 text-neutral-100"
          : "border-black/5 bg-white/85 hover:bg-white text-neutral-900"
      }`}
    >
      <span
        className={`relative flex items-center justify-center w-7 h-7 rounded-full overflow-hidden ${
          isDark ? "bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30" : "bg-gradient-to-br from-amber-200 to-orange-300"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="material-symbols-outlined text-[16px] text-indigo-100"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}
            >
              dark_mode
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="material-symbols-outlined text-[16px] text-orange-900"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}
            >
              light_mode
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
        {isDark ? "Dark" : "Light"}
      </span>
    </motion.button>
  );
};

export default FloatingThemeToggle;
