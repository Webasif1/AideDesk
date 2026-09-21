import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import CompanySetupWizard from "../../company/components/CompanySetupWizard";

const WelcomePage = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useSelector((s) => s.auth);
  const verified = searchParams.get("verified") === "true";

  // Redirect already-setup admins straight to portal
  useEffect(() => {
    if (isAuthenticated && role === "admin" && user?.companyId) {
      navigate("/company-portal", { replace: true });
    }
  }, [isAuthenticated, user, role, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-lowest dark:bg-[#051f20] px-4">
      <AnimatePresence mode="wait">
        {!showWizard ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-md"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-white dark:text-black font-bold text-xl">A</span>
            </motion.div>

            {verified && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[12px] font-semibold px-3 py-1.5 rounded-full mb-4"
              >
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Email verified
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[28px] font-bold text-black dark:text-white mb-3"
            >
              Welcome to AideDesk
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-[14px] text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed"
            >
              Let&apos;s get your company set up. It only takes a minute.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWizard(true)}
              className="w-full bg-brand text-white dark:text-black font-semibold text-[14px] py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Set up my company
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-[12px] text-neutral-400 mt-4"
            >
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-black dark:text-white font-semibold hover:underline"
              >
                Sign in
              </button>
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <CompanySetupWizard onClose={() => setShowWizard(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;
