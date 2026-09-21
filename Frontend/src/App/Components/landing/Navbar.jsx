import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "../../../components/ui/Logo";

const LINKS = [
  { label: "Platform", to: "/platform" },
  { label: "Product", to: "/product" },
  { label: "Solutions", to: "/solutions" },
  { label: "Integrations", to: "/integrations" },
  { label: "Pricing", to: "/pricing" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 w-full border-b border-neutral-200/70 dark:border-neutral-900 bg-surface/85 backdrop-blur-md z-50"
    >
      <div className="flex items-center gap-8 px-6 h-[72px] max-w-[1280px] mx-auto">
        <Logo size="md" linkTo="/" />

        <div className="hidden md:flex items-center gap-1 flex-1 text-[14px]">
          {LINKS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `h-9 px-3 rounded-full flex items-center transition-colors ${
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-900 text-on-surface font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-on-surface hover:bg-neutral-100/70 dark:hover:bg-neutral-900/70"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          <Link
            to="/login"
            className="hidden md:block text-[14px] font-medium text-on-surface hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="h-10 px-[18px] rounded-full bg-brand text-white dark:text-black text-[14px] font-semibold flex items-center hover:bg-brand-hover transition-colors active:scale-[0.98]"
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">{open ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:hidden overflow-hidden border-t border-neutral-200/70 dark:border-neutral-900 bg-surface"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={close}
                  className={({ isActive }) =>
                    `h-12 px-4 rounded-xl flex items-center text-[15px] ${
                      isActive ? "bg-neutral-100 dark:bg-neutral-900 font-semibold text-on-surface" : "text-neutral-700 dark:text-neutral-300"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link to="/login" onClick={close} className="h-12 px-4 rounded-xl flex items-center text-[15px] text-neutral-700 dark:text-neutral-300">
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
